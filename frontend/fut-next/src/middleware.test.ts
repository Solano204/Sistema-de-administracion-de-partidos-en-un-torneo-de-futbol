import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// middleware.ts imports getAuthUserAdmin from AuthUser.tsx - the sole
// implementation (see AuthUser.test.ts). getAuthUserAdmin is mocked
// wholesale here rather than exercised through real cookies/HTTP calls,
// since this suite's job is middleware's routing logic (which paths get
// gated, redirect target/status), not the admin-check implementation
// itself.
const mockGetAuthUserAdmin = vi.fn();
vi.mock("./app/utils/Domain/AuthenticationActions/AuthUser", () => ({
  getAuthUserAdmin: () => mockGetAuthUserAdmin(),
}));

import middleware from "./middleware";

function requestFor(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware", () => {
  beforeEach(() => {
    mockGetAuthUserAdmin.mockReset();
  });

  it("excluded path (/api/...) is never checked for admin status at all", async () => {
    const response = await middleware(requestFor("/api/users"));

    expect(response.status).toBe(200); // NextResponse.next()
    expect(mockGetAuthUserAdmin).not.toHaveBeenCalled();
  });

  it("excluded path (/Categories) skips the admin check", async () => {
    const response = await middleware(requestFor("/Categories"));

    expect(mockGetAuthUserAdmin).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("admin path with an admin session: request proceeds, no redirect", async () => {
    mockGetAuthUserAdmin.mockResolvedValue(true);

    const response = await middleware(requestFor("/Admin/dashboard"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("admin path with a non-admin session: redirected to /Soccer", async () => {
    mockGetAuthUserAdmin.mockResolvedValue(false);

    const response = await middleware(requestFor("/Admin/dashboard"));

    expect(response.status).toBe(307); // NextResponse.redirect default status
    expect(response.headers.get("location")).toContain("/Soccer");
  });

  it("non-admin, non-excluded path never calls the admin check at all", async () => {
    const response = await middleware(requestFor("/Soccer/home"));

    expect(mockGetAuthUserAdmin).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("path starting with an admin path prefix but not exactly matching is still gated (startsWith, not exact match)", async () => {
    mockGetAuthUserAdmin.mockResolvedValue(false);

    // /AdminSomethingElse would ALSO match isAdminPath's startsWith('/Admin')
    // check - documenting this prefix-matching behavior explicitly, since a
    // future public route named e.g. "/AdminGuideForPlayers" would
    // unintentionally get admin-gated.
    const response = await middleware(requestFor("/AdminGuideForPlayers"));

    expect(mockGetAuthUserAdmin).toHaveBeenCalled();
    expect(response.status).toBe(307);
  });
});
