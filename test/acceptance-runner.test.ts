import {expect,it,vi} from 'vitest';
import {runAcceptance} from '../scripts/mcp-read-only-acceptance.mjs';

it('the live runner only makes allowlisted reads and never serializes its credential or job content', async () => {
  const calls: string[]=[];
  const origin='https://mcp.seoresearcher.ai';
  const fetcher=vi.fn(async (url: string, init: RequestInit) => {
    const body=init.body ? JSON.parse(String(init.body)) : null;
    if (body) {
      calls.push(body.method==='tools/call' ? body.params.name : body.method);
      if (!['initialize','tools/list','seo_research_connection','seo_research_list'].includes(calls.at(-1)!)) throw new Error('Unexpected action');
      if (body.method==='initialize') return Response.json({result:{serverInfo:{name:'SEO Researcher'}}});
      if (body.method==='tools/list') {
        if (!new Headers(init.headers).has('authorization')) return Response.json({error:{}},{status:401,headers:{'www-authenticate':'Bearer resource_metadata="'+origin+'/.well-known/oauth-protected-resource/mcp"'}});
        return Response.json({result:{tools:['seo_research_connection','seo_research_start','seo_research_status','seo_research_get','seo_research_list'].map(name=>({name}))}});
      }
      if (body.params.name==='seo_research_connection') return Response.json({result:{structuredContent:{connected:true,product:'seo_researcher',organization_id:'org_fixture',scopes:['seo_research:read'],default_client_id:null}}});
      return Response.json({result:{structuredContent:{data:[{topic:'fixture private content'}],next_cursor:null}}});
    }
    return Response.json(url.endsWith('oauth-authorization-server') ? {issuer:origin,code_challenge_methods_supported:['S256']} : {resource:origin+'/mcp',authorization_servers:[origin]});
  });
  const result=await runAcceptance({fetcher,token:'fixture-secret-never-print'});
  expect(result.checks).toHaveLength(7); expect(result.checks.every((c: any)=>c.status==='pass')).toBe(true);
  expect(JSON.stringify(result)).not.toMatch(/fixture-secret|private content/);
  expect(calls).toEqual(['tools/list','initialize','tools/list','seo_research_connection','seo_research_list']);
});
it('invalid origin fails before transmitting credentials',async () => {
  const fetcher=vi.fn();
  await expect(runAcceptance({fetcher,origin:'http://example.test',token:'fixture'})).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
