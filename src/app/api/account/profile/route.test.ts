import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthenticatedSupabase = vi.fn();
const ensureProfile = vi.fn();

vi.mock("@/lib/reader-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/reader-service")>("@/lib/reader-service");

  return {
    ...actual,
    requireAuthenticatedSupabase,
    ensureProfile,
  };
});

describe("account profile route", () => {
  beforeEach(() => {
    requireAuthenticatedSupabase.mockReset();
    ensureProfile.mockReset();
  });

  it("ensures the signed-in user has a profile row", async () => {
    requireAuthenticatedSupabase.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: {
        id: "user-1",
        email: "reader@example.com",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/account/profile", {
        method: "POST",
        headers: {
          Authorization: "Bearer account-token",
        },
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(requireAuthenticatedSupabase).toHaveBeenCalledWith(expect.any(Headers));
    expect(ensureProfile).toHaveBeenCalledWith(
      { from: expect.any(Function) },
      {
        id: "user-1",
        email: "reader@example.com",
      },
    );
    expect(payload).toEqual({ ok: true });
  });
});
