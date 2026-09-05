import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://seoresearcher.ai",
  output: "static",
  markdown: { shikiConfig: { theme: "github-light" } },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
