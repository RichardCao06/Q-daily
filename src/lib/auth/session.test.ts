import { getBearerTokenFromHeaders, requireBearerToken } from "./session";

describe("auth session helpers", () => {
  it("extracts the bearer token from request headers", () => {
    const headers = new Headers({
      Authorization: "Bearer test-token",
    });

    expect(getBearerTokenFromHeaders(headers)).toBe("test-token");
  });

  it("returns null when the authorization header is missing or malformed", () => {
    expect(getBearerTokenFromHeaders(new Headers())).toBeNull();
    expect(
      getBearerTokenFromHeaders(
        new Headers({
          Authorization: "Basic abc123",
        }),
      ),
    ).toBeNull();
  });

  it("throws when a protected endpoint is called without a bearer token", () => {
    expect(() => requireBearerToken(new Headers())).toThrow("Unauthorized");
  });
});
