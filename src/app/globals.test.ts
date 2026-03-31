import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const homePageCss = readFileSync(join(process.cwd(), "src/components/site/home-page.module.css"), "utf8");
const articlePageCss = readFileSync(join(process.cwd(), "src/components/site/article-page.module.css"), "utf8");
const collectionPageCss = readFileSync(join(process.cwd(), "src/components/site/collection-page.module.css"), "utf8");
const supportPageCss = readFileSync(join(process.cwd(), "src/components/site/support-page.module.css"), "utf8");
const siteHeaderCss = readFileSync(join(process.cwd(), "src/components/site/site-header.module.css"), "utf8");

describe("global editorial styling", () => {
  it("uses a pure white page background instead of layered gradients", () => {
    expect(globalsCss).toContain("--background: #ffffff;");
    expect(globalsCss).toContain("background: var(--background);");
    expect(globalsCss).not.toContain("radial-gradient(circle at top left");
  });

  it("uses solid white headers on both page templates", () => {
    expect(homePageCss).toContain("background: #fff;");
    expect(articlePageCss).toContain("background: #fff;");
    expect(homePageCss).not.toContain("backdrop-filter:");
    expect(articlePageCss).not.toContain("backdrop-filter:");
  });

  it("keeps navigation headers sticky so they do not cover content while scrolling", () => {
    expect(homePageCss).toContain(".header {\n  position: sticky;");
    expect(articlePageCss).toContain(".header {\n  position: sticky;");
    expect(siteHeaderCss).toContain(".header {\n  position: sticky;");
    expect(homePageCss).not.toContain(".header {\n  position: fixed;");
    expect(articlePageCss).not.toContain(".header {\n  position: fixed;");
    expect(siteHeaderCss).not.toContain(".header {\n  position: fixed;");
  });

  it("keeps collection and support templates on the same white surface system", () => {
    expect(collectionPageCss).toContain("background: #fff;");
    expect(supportPageCss).toContain("background: #fff;");
    expect(collectionPageCss).not.toContain("background: #111;");
    expect(supportPageCss).not.toContain("background: #111;");
    expect(collectionPageCss).not.toContain("radial-gradient(");
    expect(supportPageCss).not.toContain("radial-gradient(");
  });
});
