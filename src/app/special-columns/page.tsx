import { SupportPage } from "@/components/site/support-page";

export default function SpecialColumnsRoute() {
  return (
    <SupportPage
      currentLabel="栏目中心"
      eyebrow="Columns"
      title="栏目中心"
      description="栏目中心用于汇总长期稳定运营的栏目、专题线和编辑系列。"
      actions={[
        { label: "商业栏目", href: "/categories/business" },
        { label: "文化栏目", href: "/categories/culture" },
      ]}
      sections={[
        { title: "栏目化组织", body: "当内容规模上来之后，栏目中心能帮助用户按主题理解站点，而不仅仅按时间浏览。" },
        { title: "当前状态", body: "当前已接好首页、文章、分类、标签四类主页面，栏目中心可在下一轮接入更丰富的专题配置。" },
      ]}
    />
  );
}
