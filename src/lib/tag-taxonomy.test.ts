import { describe, expect, it } from "vitest";

import { buildNormalizedTagOptions, mapEditorTagSlugsToStored, mapStoredTagSlugsToEditor } from "./tag-taxonomy";

describe("tag taxonomy", () => {
  it("exposes the four normalized tags used by the app", () => {
    expect(buildNormalizedTagOptions()).toEqual([
      { slug: "hao-wenzhang", name: "好文章" },
      { slug: "hao-guandian", name: "好观点" },
      { slug: "hao-jiahuo", name: "好家伙" },
      { slug: "hao-lunwen", name: "好论文" },
    ]);
  });

  it("maps normalized editor tags back to stored legacy slugs", () => {
    expect(mapEditorTagSlugsToStored(["hao-wenzhang", "hao-guandian", "hao-wenzhang"])).toEqual([
      "longform",
      "product-thinking",
    ]);
  });

  it("collapses legacy bundled article tags into the single 好文章 tag", () => {
    expect(mapStoredTagSlugsToEditor(["longform", "product-thinking", "newsroom"])).toEqual(["hao-wenzhang"]);
  });

  it("maps individually stored legacy slugs to their normalized tag counterparts", () => {
    expect(mapStoredTagSlugsToEditor(["culture-shift", "product-thinking"])).toEqual([
      "hao-lunwen",
      "hao-guandian",
    ]);
  });
});
