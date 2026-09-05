// Bounded acceptance only: no research start, write, automatic retry, or load loop.
// Credentials come from the caller's environment and are never logged/persisted.
import { strict as assert } from 'node:assert';
import { pathToFileURL } from 'node:url';

/** @param {{fetcher?: (url: string, init: RequestInit) => Promise<Response>, origin?: string, token?: string}} options */
export async function runAcceptance({fetcher = fetch, origin = 'https://mcp.seoresearcher.ai', token} = {}) {
  const url = new URL(origin);
  assert.equal(url.protocol, 'https:', 'Acceptance requires HTTPS');
  assert.equal(url.origin, origin, 'Use a bare HTTPS origin');
  const checks = [];
  const request = async (path, init = {}) => {
    const started = performance.now();
    const response = await fetcher(origin + path, {...init, redirect:'error', signal:AbortSignal.timeout(35_000)});
    const text = await response.text();
    const data = text.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim());
    return {response, payload: JSON.parse(data.length ? data.at(-1) : text), duration_ms:Math.round(performance.now()-started)};
  };
  const record = async (name, fn) => {
    try { checks.push({name, status:'pass', ...await fn()}); }
    catch { checks.push({name, status:'fail'}); }
  };
  const rpc = (method, params, bearer) => request('/mcp', {method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream',...(bearer ? {authorization:`Bearer ${bearer}`} : {})},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
  await record('oauth_discovery', async () => {
    const {response,payload,duration_ms} = await request('/.well-known/oauth-authorization-server');
    assert.equal(response.status,200); assert.equal(payload.issuer,origin); assert.ok(payload.code_challenge_methods_supported.includes('S256'));
    return {duration_ms};
  });
  await record('protected_resource', async () => {
    const {response,payload,duration_ms} = await request('/.well-known/oauth-protected-resource/mcp');
    assert.equal(response.status,200); assert.equal(payload.resource,origin+'/mcp'); assert.deepEqual(payload.authorization_servers,[origin]);
    return {duration_ms};
  });
  await record('missing_credentials', async () => {
    const {response,duration_ms} = await rpc('tools/list',{});
    assert.equal(response.status,401); assert.ok(response.headers.get('www-authenticate')?.includes('oauth-protected-resource/mcp'));
    return {duration_ms};
  });
  if (!token) return {checks, authenticated:'skipped_no_credential', research_started:false};
  let identity;
  await record('initialize',async () => {
    const {response,payload,duration_ms} = await rpc('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'seo-researcher-read-only-acceptance',version:'1.0'}},token);
    assert.equal(response.status,200); assert.ok(payload.result?.serverInfo); return {duration_ms};
  });
  await record('tool_discovery',async () => {
    const {response,payload,duration_ms} = await rpc('tools/list',{},token);
    assert.equal(response.status,200);
    const names = payload.result.tools.map(tool => tool.name);
    for (const name of ['seo_research_connection','seo_research_list','seo_research_status','seo_research_get','seo_research_start']) assert.ok(names.includes(name));
    return {duration_ms};
  });
  await record('account_identity',async () => {
    const {response,payload,duration_ms} = await rpc('tools/call',{name:'seo_research_connection',arguments:{}},token);
    assert.equal(response.status,200); assert.ok(!payload.result.isError);
    identity=payload.result.structuredContent;
    assert.equal(identity.connected,true); assert.equal(identity.product,'seo_researcher'); assert.equal(typeof identity.organization_id,'string');
    return {duration_ms,organization_id:identity.organization_id,default_client_id:identity.default_client_id,scopes:identity.scopes};
  });
  await record('existing_jobs',async () => {
    const {response,payload,duration_ms} = await rpc('tools/call',{name:'seo_research_list',arguments:{limit:1}},token);
    assert.equal(response.status,200); assert.ok(!payload.result.isError);
    assert.ok(Array.isArray(payload.result.structuredContent.data));
    return {duration_ms,returned_count:payload.result.structuredContent.data.length};
  });
  return {checks,authenticated:'attempted',research_started:false};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report=await runAcceptance({token:process.env.SEO_RESEARCHER_ACCESS_TOKEN});
  console.log(JSON.stringify(report,null,2));
  if (report.checks.some(check => check.status==='fail')) process.exitCode=1;
}
