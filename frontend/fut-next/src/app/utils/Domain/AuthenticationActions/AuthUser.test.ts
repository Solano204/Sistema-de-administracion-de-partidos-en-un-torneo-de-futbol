import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// next/headers' cookies() only works inside a real Next.js request context;
// mocked here so this Server Action module can be imported and exercised as
// plain TypeScript.
const mockCookieStore = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = mockCookieStore.get(name);
      return value === undefined ? undefined : { name, value };
    },
  })),
}));

vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

// NOTE: this file used to live at ./AuthCookie.test.ts and imported
// getAuthUser/getAuthUserAdmin/getPhotoUser from "./AuthCookie" - that file
// never actually exported those functions (it only has updateAuthCookies,
// getToke, setCookie, deleteCookie), so those tests could never have run.
// The real, only implementation of these three functions lives here, in
// AuthUser.tsx - moved and corrected to import from the right module.
import { getAuthUser, getAuthUserAdmin, getPhotoUser } from "./AuthUser";

describe("getAuthUserAdmin", () => {
  beforeEach(() => {
    mockCookieStore.clear();
    vi.mocked(axios.get).mockReset();
  });

  it("no session cookie at all: returns false without calling the backend", async () => {
    await expect(getAuthUserAdmin()).resolves.toBe(false);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("backend accepts the session token as an administrator (200): returns true", async () => {
    mockCookieStore.set("session", "a-real-admin-jwt");
    vi.mocked(axios.get).mockResolvedValue({ status: 200, data: [] });

    await expect(getAuthUserAdmin()).resolves.toBe(true);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      expect.objectContaining({
        params: { role: "ADMINISTRADOR" },
        headers: { Authorization: "Bearer a-real-admin-jwt" },
      })
    );
  });

  it("backend rejects with 403 (authenticated but not an admin): returns false", async () => {
    mockCookieStore.set("session", "a-real-non-admin-jwt");
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 403 } });

    await expect(getAuthUserAdmin()).resolves.toBe(false);
  });

  it("backend rejects with 401 (invalid/expired token): returns false", async () => {
    mockCookieStore.set("session", "an-expired-jwt");
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 401 } });

    await expect(getAuthUserAdmin()).resolves.toBe(false);
  });

  it("network/backend failure: fails closed to false rather than throwing", async () => {
    mockCookieStore.set("session", "some-token");
    vi.mocked(axios.get).mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(getAuthUserAdmin()).resolves.toBe(false);
  });

  it("REGRESSION for the fixed vulnerability: a tampered sessionId cookie matching the admin's id no longer has any effect - only the backend's verdict on the session token matters", async () => {
    // This is the exact original exploit shape: attacker's own (non-admin)
    // session token, plus a sessionId cookie manually set to the admin's
    // known id. The old implementation granted admin here purely from the
    // sessionId string match. The new implementation never reads sessionId
    // at all - it asks the backend to authorize the session token itself,
    // which correctly rejects a non-admin token with 403.
    mockCookieStore.set("session", "attackers-own-non-admin-jwt");
    mockCookieStore.set("sessionId", "11111111-1111-1111-1111-111111111111"); // admin's real id, guessed/leaked
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 403 } });

    await expect(getAuthUserAdmin()).resolves.toBe(false);
  });
});

describe("getAuthUser", () => {
  beforeEach(() => {
    mockCookieStore.clear();
  });

  it("both cookies present, returns them as-is", async () => {
    mockCookieStore.set("session", "token-value");
    mockCookieStore.set("sessionId", "user-id-value");

    await expect(getAuthUser()).resolves.toEqual({
      idUser: "user-id-value",
      token: "token-value",
    });
  });

  it("no cookies set, returns empty strings rather than undefined", async () => {
    await expect(getAuthUser()).resolves.toEqual({ idUser: "", token: "" });
  });
});

describe("getPhotoUser", () => {
  beforeEach(() => {
    mockCookieStore.clear();
  });

  it("photo cookie present, returns its value", async () => {
    mockCookieStore.set("photo", "https://example.com/photo.jpg");

    await expect(getPhotoUser()).resolves.toBe("https://example.com/photo.jpg");
  });

  it("no photo cookie, returns an empty string", async () => {
    await expect(getPhotoUser()).resolves.toBe("");
  });
});
