import {describe, it, expect} from "vitest";
import {oauthAuthorizationHandoff, oauthRequestBody} from "../worker/oauth-handoff";
describe("SEO Researcher browser authorization", () => {
  const resource = "https://mcp.seoresearcher.ai/mcp";
  it("preserves PKCE, state and callback on the direct identity handoff", () => {
    const input = new URL("https://mcp.seoresearcher.ai/oauth/authorize?client_id=test&state=a%2Bb&redirect_uri=https%3A%2F%2Fclaude.ai%2Fcallback&code_challenge=unchanged&scope=seo_research%3Aread");
    const res = oauthAuthorizationHandoff(input,"https://app.rankability.com",resource);
    const to = new URL(res.headers.get("location")!);
    expect(to.origin).toBe("https://app.rankability.com");
    for (const [key,value] of input.searchParams) expect(to.searchParams.get(key)).toBe(value);
    expect(to.searchParams.get("resource")).toBe(resource);
    expect(to.searchParams.get("product")).toBe("seo_researcher");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects another resource rather than rewriting its audience",()=> {
    expect(oauthAuthorizationHandoff(new URL("https://mcp.seoresearcher.ai/oauth/authorize?resource=https://evil.example/mcp"),"https://app.rankability.com",resource).status).toBe(400);
  });
});

describe("OAuth token audience", () => {
  const resource = "https://mcp.seoresearcher.ai/mcp";
  for (const type of ["application/json", "application/x-www-form-urlencoded"]) {
    it(`binds omitted ${type} resource without changing the authorization code`, async () => {
      const body = type === "application/json" ? JSON.stringify({code:"secret",grant_type:"authorization_code"}) : "code=secret&grant_type=authorization_code";
      const result = await oauthRequestBody(new Request("https://mcp.seoresearcher.ai/oauth/token",{method:"POST",headers:{"content-type":type},body}),resource,4096);
      const parsed = type === "application/json" ? JSON.parse(result) : Object.fromEntries(new URLSearchParams(result));
      expect(parsed).toEqual({code:"secret",grant_type:"authorization_code",resource});
    });
  }
  it("rejects chunked bodies beyond the limit",async()=>{
    await expect(oauthRequestBody(new Request("https://mcp.seoresearcher.ai/oauth/token",{method:"POST",body:"123456789"}),resource,4)).rejects.toThrow(RangeError);
  });
  it("refuses a Rankability token audience",async()=>{
    await expect(oauthRequestBody(new Request("https://mcp.seoresearcher.ai/oauth/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:"resource=https://app.rankability.com/mcp"}),resource,4096)).rejects.toThrow("Invalid resource");
  });
});
