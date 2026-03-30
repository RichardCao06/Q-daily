import { SupportPage } from "@/components/site/support-page";

export default function AboutRoute() {
  return (
    <SupportPage
      eyebrow="About"
      title="关于我们"
      description="这个页面用于承接 QDaily 复刻站点的品牌说明、项目背景和后续扩展方向。"
      actions={[
        { label: "返回首页", href: "/" },
        { label: "查看长文章", href: "/tags/longform" },
      ]}
      sections={[
        { title: "项目背景", body: "当前版本以 2019 年归档站点为参考，重点复刻首页、文章页、分类页和标签页的视觉与信息架构。" },
        { title: "下一阶段", body: "后续可继续接入 CMS、搜索能力、真实图片资源，以及更完整的专题页和账户体系。" },
      ]}
    />
  );
}
