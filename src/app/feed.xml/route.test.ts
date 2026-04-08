import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("feed.xml route", () => {
  it("uses the production domain in feed and article links", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<link>https://piggpywithpuppy.cn</link>");
    expect(xml).toContain("https://piggpywithpuppy.cn/articles/");
    expect(xml).not.toContain("https://example.com");
  });
});
