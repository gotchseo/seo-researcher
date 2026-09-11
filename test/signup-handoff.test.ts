import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import worker from "../worker/index";
const config = JSON.parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
describe("free-sample signup handoff", () => {
  it.each(["monthly", "yearly"])("opens the identity host directly and preserves %s attribution", async (interval) => {
    const env = { ...config.vars, SEO_ANALYTICS: { writeDataPoint: vi.fn() } } as unknown as Env;
    const response = await worker.fetch(new Request(`https://seoresearcher.ai/start?interval=${interval}&utm_source=launch&product=wrong`), env, {waitUntil: vi.fn()} as unknown as ExecutionContext);
    expect(response.status).toBe(302);
    const target = new URL(response.headers.get("location")!);
    expect(target.origin).toBe("https://app.rankability.com");
    expect(target.pathname).toBe("/start");
    expect(target.searchParams.get("product")).toBe("seo_researcher");
    expect(target.searchParams.get("interval")).toBe(interval);
    expect(target.searchParams.get("utm_source")).toBe("launch");
  });
});
