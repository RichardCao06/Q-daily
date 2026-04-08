import { describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots metadata route", () => {
  it("points crawlers at the production sitemap", () => {
    expect(robots()).toEqual({
      host: "piggpywithpuppy.cn",
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://piggpywithpuppy.cn/sitemap.xml",
    });
  });
});
