import { fireEvent, render, screen } from "@testing-library/react";

import { LoginPanel } from "./login-panel";

describe("LoginPanel", () => {
  it("renders an email OTP form and supporting copy", () => {
    render(<LoginPanel />);

    expect(screen.getByRole("heading", { level: 1, name: "邮箱验证码登录" })).toBeInTheDocument();
    expect(screen.getByLabelText("邮箱地址")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发送验证码" })).toBeInTheDocument();
    expect(screen.getByText("我们会向你的邮箱发送一次性验证码或登录链接。")).toBeInTheDocument();
  });

  it("updates the email field as the reader types", () => {
    render(<LoginPanel />);

    const input = screen.getByLabelText("邮箱地址") as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        value: "reader@example.com",
      },
    });

    expect(input.value).toBe("reader@example.com");
  });
});
