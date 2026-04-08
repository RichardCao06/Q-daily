import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

describe("sitemap metadata route", () => {
  it("uses the production domain for static and article urls", async () => {
    const entries = await sitemap();

    expect(entries[0]?.url).toBe("https://piggpywithpuppy.cn");
    expect(entries.some((entry) => entry.url === "https://piggpywithpuppy.cn/articles/rebuild-a-newsroom-wall")).toBe(true);
    expect(entries.every((entry) => entry.url.startsWith("https://piggpywithpuppy.cn"))).toBe(true);
  });
});
