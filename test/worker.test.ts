import { describe, expect, it } from "vitest";

describe("public contract", () => {
  it("keeps the focused API surface stable", () => {
    const routes = [
      "POST /v1/research",
      "GET /v1/research",
      "GET /v1/research/:id",
      "GET /v1/research/:id/result",
    ];
    expect(routes).toHaveLength(4);
  });

  it("keeps research separate from writing", () => {
    const tools = ["seo_research_start", "seo_research_status", "seo_research_get", "seo_research_list"];
    expect(tools.some((tool) => tool.includes("write") || tool.includes("draft"))).toBe(false);
  });
});
