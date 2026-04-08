import { describe, expect, it } from "vitest";

import { canManageArticleRecord, canManageArticleRelation } from "./article-auth";

describe("article auth", () => {
  it("allows authenticated users to manage their own articles", () => {
    expect(canManageArticleRecord("user-1", "user-1")).toBe(true);
    expect(canManageArticleRecord("user-1", "user-2")).toBe(false);
    expect(canManageArticleRecord("user-1", null)).toBe(false);
  });

  it("allows relation writes only when the parent article belongs to the same user", () => {
    expect(canManageArticleRelation("user-1", { updated_by: "user-1" })).toBe(true);
    expect(canManageArticleRelation("user-1", { updated_by: "user-2" })).toBe(false);
    expect(canManageArticleRelation("user-1", null)).toBe(false);
  });
});
