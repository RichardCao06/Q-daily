import { resolvePreferredEditorialAsset } from "./editorial-media";

describe("resolvePreferredEditorialAsset", () => {
  it("prefers matching svg assets for editorial cards when they exist", () => {
    expect(resolvePreferredEditorialAsset("/editorial/reward-hacking-gradient/cover-reward-hacking-title-card.png")).toBe(
      "/editorial/reward-hacking-gradient/cover-reward-hacking-title-card.svg",
    );
    expect(resolvePreferredEditorialAsset("/editorial/reward-hacking-gradient/process-grift-pipeline-1.png")).toBe(
      "/editorial/reward-hacking-gradient/process-grift-pipeline-1.svg",
    );
  });

  it("maps matching Supabase storage png urls back to local svg assets when available", () => {
    expect(
      resolvePreferredEditorialAsset(
        "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png",
      ),
    ).toBe("/editorial/reward-hacking-gradient/cover-reward-hacking-title-card.svg");

    expect(
      resolvePreferredEditorialAsset(
        "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/inline/process-grift-pipeline-1.png",
      ),
    ).toBe("/editorial/reward-hacking-gradient/process-grift-pipeline-1.svg");
  });

  it("keeps the original source when no svg alternative exists", () => {
    expect(resolvePreferredEditorialAsset("/editorial/zhangxue/product-500rr-1.png")).toBe(
      "/editorial/zhangxue/product-500rr-1.png",
    );
  });
});
