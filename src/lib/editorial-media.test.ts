import { beforeEach, describe, expect, it } from "vitest";

import { buildSupabaseArticleMediaUrl, normalizeArticleMediaUrl } from "./editorial-media";

describe("editorial media", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://trwasyzmcfcsjvcjndrm.supabase.co";
  });

  it("builds public Supabase storage urls for article media", () => {
    expect(buildSupabaseArticleMediaUrl("reward-hacking-gradient-feature-editorial", "hero", "cover-reward-hacking-title-card.png")).toBe(
      "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png",
    );
  });

  it("normalizes legacy local editorial paths into Supabase storage urls", () => {
    expect(
      normalizeArticleMediaUrl("/editorial/reward-hacking-gradient/cover-reward-hacking-title-card.png", {
        articleSlug: "reward-hacking-gradient-feature-editorial",
        kind: "hero",
      }),
    ).toBe(
      "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png",
    );

    expect(
      normalizeArticleMediaUrl("/editorial/reward-hacking-gradient/process-grift-pipeline-1.png", {
        articleSlug: "reward-hacking-gradient-feature-editorial",
        kind: "inline",
      }),
    ).toBe(
      "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/inline/process-grift-pipeline-1.png",
    );
  });

  it("keeps existing remote urls unchanged", () => {
    expect(
      normalizeArticleMediaUrl(
        "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/openai-enterprise-stack-feature-editorial/hero/cover-workspace-agents-slack.webp",
        {
          articleSlug: "openai-enterprise-stack-feature-editorial",
          kind: "hero",
        },
      ),
    ).toBe(
      "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/openai-enterprise-stack-feature-editorial/hero/cover-workspace-agents-slack.webp",
    );
  });
});
