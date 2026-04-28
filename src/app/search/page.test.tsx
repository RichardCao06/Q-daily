import { render, screen } from "@testing-library/react";

import SearchRoute from "./page";

describe("SearchRoute", () => {
  it("uses the same site header and editorial list treatment as the other interior pages", async () => {
    render(await SearchRoute());

    expect(screen.getByRole("banner")).toHaveTextContent("好有趣日报");
    expect(screen.getByRole("link", { name: "搜索" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "搜索" })).toBeInTheDocument();
    expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
  });
});
