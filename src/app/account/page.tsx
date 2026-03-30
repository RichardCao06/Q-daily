import { SupportPage } from "@/components/site/support-page";

export default function AccountRoute() {
  return (
    <SupportPage
      eyebrow="Account"
      title="登录 / 注册"
      description="账户体系当前仅保留页面入口，便于后续接入真实认证系统。"
      actions={[
        { label: "返回首页", href: "/" },
        { label: "关于项目", href: "/about" },
      ]}
      sections={[
        { title: "当前状态", body: "这一版复刻的重点是页面结构与内容体验，用户系统尚未接入。" },
        { title: "后续方向", body: "如果继续推进，可以接入 NextAuth 或自建认证服务，并补齐收藏、评论和用户中心。" },
      ]}
    />
  );
}
