import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const landingSource = readFileSync(
  fileURLToPath(new URL("../src/pages/index.astro", import.meta.url)),
  "utf8",
);

describe("public contract", () => {
  it("keeps the focused API surface stable", () => {
    const routes = [
      "POST /v1/research",
      "GET /v1/research",
      "GET /v1/research/:id",
      "GET /v1/research/:id/result",
      "GET /v1/usage",
    ];
    expect(routes).toHaveLength(5);
  });

  it("keeps research separate from writing", () => {
    const tools = ["seo_research_usage", "seo_research_start", "seo_research_status", "seo_research_get", "seo_research_list"];
    expect(tools.some((tool) => tool.includes("write") || tool.includes("draft"))).toBe(false);
  });

  it("sends every free-sample CTA straight into signup", () => {
    expect(landingSource).toContain('const startUrl = "/start"');
    expect(landingSource).not.toMatch(/data-event="free_sample_cta_clicked"[^>]*href="#pricing"/);
    expect(landingSource.match(/href=\{startUrl\}/g)).toHaveLength(4);
  });
});
