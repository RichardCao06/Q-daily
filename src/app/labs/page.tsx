import { SupportPage } from "@/components/site/support-page";

export default function LabsRoute() {
  return (
    <SupportPage
      currentLabel="好奇心研究所"
      eyebrow="Labs"
      title="好奇心研究所"
      description="这里用来承接实验性专题、编辑策划和更具概念性的内容集合。"
      actions={[
        { label: "查看编辑设计", href: "/tags/editorial-design" },
        { label: "返回首页", href: "/" },
      ]}
      sections={[
        { title: "专题策划", body: "研究所页面适合放更长周期的选题、实验栏目和可视化项目。" },
        { title: "实现策略", body: "当前先保留页面壳子与站内导航，后续可以继续扩展成专题落地页集合。" },
      ]}
    />
  );
}
