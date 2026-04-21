import { dynamic } from "./page";

describe("home page route", () => {
  it("forces dynamic rendering so homepage reads the latest Supabase content", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
