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
    ];
    expect(routes).toHaveLength(4);
  });

  it("keeps research separate from writing", () => {
    const tools = ["seo_research_start", "seo_research_status", "seo_research_get", "seo_research_list"];
    expect(tools.some((tool) => tool.includes("write") || tool.includes("draft"))).toBe(false);
  });

  it("sends every trial CTA straight into signup", () => {
    expect(landingSource).toContain('const trialUrl = "/start?interval=monthly"');
    expect(landingSource).not.toMatch(/data-event="trial_cta_clicked"[^>]*href="#pricing"/);
    expect(landingSource.match(/href=\{trialUrl\}/g)).toHaveLength(4);
  });
});
