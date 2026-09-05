import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));

const connection = {connected: true, product: 'seo_researcher', organization_id: 'org_fixture_a', default_client_id: null, metering_model: 'pooled_usage', scopes: ['seo_research:read']};
const env = {...config.vars, SEO_ANALYTICS: {writeDataPoint: vi.fn()}} as unknown as Env;
const ctx = {waitUntil: vi.fn()} as unknown as ExecutionContext;
function req(method: string, params = {}, token: string | null = 'fixture-token') {
  return new Request('https://mcp.seoresearcher.ai/mcp', {method: 'POST', headers: {'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(token ? {authorization: `Bearer ${token}`} : {})}, body: JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
}
async function rpc(method: string, params = {}, token?: string | null) {
  const res = await worker.fetch(req(method, params, token), env, ctx);
  const raw = await res.text();
  const payload = JSON.parse(raw.startsWith('event:') || raw.startsWith('data:') ? raw.split('\n').find(s => s.startsWith('data:'))!.slice(5) : raw);
  return {res, payload};
}
afterEach(() => vi.unstubAllGlobals());
describe('read-only MCP acceptance through the real transport', () => {
  it('challenges missing credentials without contacting the application', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const {res} = await rpc('tools/list', {}, null);
    expect(res.status).toBe(401); expect(res.headers.get('www-authenticate')).toContain('oauth-protected-resource/mcp'); expect(fetch).not.toHaveBeenCalled();
  });
  it('exposes account identity without a second lookup or a write', async () => {
    const fetch = vi.fn(async (_url: unknown, _init?: RequestInit) => Response.json(connection)); vi.stubGlobal('fetch', fetch);
    const {res,payload} = await rpc('tools/call', {name:'seo_research_connection',arguments:{}});
    expect(res.status).toBe(200); expect(payload.result.structuredContent).toEqual(connection);
    expect(fetch).toHaveBeenCalledTimes(1); expect(fetch.mock.calls[0]?.[1]?.method).toBe('GET');
  });
  it('advertises the connection tool and keeps the 180-character retry-key limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(connection)));
    const {payload} = await rpc('tools/list');
    expect(payload.result.tools.map((t: any) => t.name)).toEqual(['seo_research_connection','seo_research_start','seo_research_status','seo_research_get','seo_research_list']);
    expect(payload.result.tools[0].annotations.readOnlyHint).toBe(true);
    expect(payload.result.tools[1].inputSchema.properties.idempotency_key.maxLength).toBe(180);
  });
  it('reports service interruption as retryable 503, not a login failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {throw new DOMException('fixture timeout','TimeoutError');}));
    const {res,payload} = await rpc('tools/list');
    expect(res.status).toBe(503); expect(res.headers.has('www-authenticate')).toBe(false); expect(payload.error.retryable).toBe(true);
  });
  it.each([401,403,429,503])('preserves upstream HTTP %i at the connection boundary', async status => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({error:{code:'fixture_error',message:'Fixture failure'}},{status})));
    const {res,payload} = await rpc('tools/list');
    expect(res.status).toBe(status); expect(res.headers.has('www-authenticate')).toBe(status === 401); expect(payload.error.retryable).toBe(status >= 500 || status === 429);
  });
});

describe('read isolation and recovery', () => {
  it('rejects a malformed successful connection rather than claiming access', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({connected: true})));
    const {res,payload} = await rpc('tools/list');
    expect(res.status).toBe(502); expect(payload.error.code).toBe('invalid_upstream_response');
  });
  it('strips unexpected connection fields from the agent response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({...connection, secret_fixture:'never return this'})));
    const {payload} = await rpc('tools/call', {name:'seo_research_connection',arguments:{}});
    expect(payload.result.structuredContent).toEqual(connection);
  });
  it('preserves rate-limit retry guidance at the auth boundary', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({error:{code:'rate_limited'}},{status:429,headers:{'retry-after':'15'}})));
    const {res} = await rpc('tools/list'); expect(res.headers.get('retry-after')).toBe('15');
  });
  it('recovers the same read after a transient failure', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError('fixture network failure')).mockResolvedValueOnce(Response.json(connection));
    vi.stubGlobal('fetch', fetch);
    expect((await rpc('tools/call',{name:'seo_research_connection',arguments:{}})).res.status).toBe(503);
    const recovered = await rpc('tools/call',{name:'seo_research_connection',arguments:{}});
    expect(recovered.payload.result.structuredContent.organization_id).toBe(connection.organization_id);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('keeps identity isolated across 25 concurrent authenticated requests', async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const token = new Headers(init.headers).get('authorization')!;
      await new Promise(resolve => setTimeout(resolve, token.endsWith('1') ? 8 : 1));
      return Response.json({...connection, organization_id: token.slice(7)});
    });
    vi.stubGlobal('fetch', fetch);
    const results = await Promise.all(Array.from({length:25}, (_,i) => rpc('tools/call',{name:'seo_research_connection',arguments:{}},`org_fixture_${i}`)));
    results.forEach(({res,payload},i) => {
      expect(res.status).toBe(200); expect(res.headers.get('cache-control')).toBe('no-store');
      expect(payload.result.structuredContent.organization_id).toBe(`org_fixture_${i}`);
    });
    expect(fetch).toHaveBeenCalledTimes(25);
    expect(fetch.mock.calls.every(([,init]) => init.method === 'GET')).toBe(true);
  });
  it.each([
    ['seo_research_list',{limit:0}], ['seo_research_list',{limit:101}],
    ['seo_research_status',{job_id:'not-a-uuid'}], ['seo_research_get',{job_id:'not-a-uuid'}],
    ['seo_research_start',{topic:'fixture',idempotency_key:'x'.repeat(181)}],
  ])('rejects invalid %s inputs before any job request', async (name, args) => {
    const fetch = vi.fn(async () => Response.json(connection)); vi.stubGlobal('fetch', fetch);
    const {payload} = await rpc('tools/call',{name,arguments:args});
    expect(payload.result?.isError || payload.error).toBeTruthy(); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('preserves list pagination without creating work', async () => {
    const fetch = vi.fn(async (url: string, init: RequestInit) => {
      expect(init.method).toBe('GET');
      if (url.endsWith('/connection')) return Response.json(connection);
      const parsed = new URL(url);
      expect(parsed.searchParams.get('limit')).toBe('1');
      expect(parsed.searchParams.get('cursor')).toBe('2026-09-01T12:00:00+00:00');
      return Response.json({data:[],next_cursor:null});
    }); vi.stubGlobal('fetch', fetch);
    const {payload} = await rpc('tools/call',{name:'seo_research_list',arguments:{limit:1,cursor:'2026-09-01T12:00:00+00:00'}});
    expect(payload.result.structuredContent).toEqual({data:[],next_cursor:null,connection}); expect(fetch).toHaveBeenCalledTimes(2);
  });
  it.each([['seo_research_status',404,'not_found'],['seo_research_get',409,'not_ready'],['seo_research_list',429,'rate_limited']])('preserves %s errors and polling guidance', async (name,status,code) => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.endsWith('/connection') ? Response.json(connection) : Response.json({error:{code,message:'Fixture failure',details:{recommended_poll_seconds:5,secret_fixture:'omit'}}},{status:Number(status),headers:{'retry-after':'15'}})));
    const {payload} = await rpc('tools/call',{name,arguments:{job_id:'11111111-1111-4111-8111-111111111111'}});
    expect(payload.result.isError).toBe(true); expect(payload.result.structuredContent.error).toEqual({code,message:'Fixture failure',retryable:status !== 404,retry_after:'15',recommended_poll_seconds:5});
  });
});
