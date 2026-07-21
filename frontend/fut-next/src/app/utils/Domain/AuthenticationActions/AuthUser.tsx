"use server"
import { cookies } from "next/headers";
import axios from "axios";

export type session = {
  idUser: string;
  token: string;
};
export async function getAuthUser(): Promise<session> {
  const token = (await cookies()).get("session")?.value;
  const id = (await cookies()).get("sessionId")?.value;
  return {
    idUser: id !== undefined ? id : "",
    token: token !== undefined ? token : "",
  };
}

// SECURITY FIX: this used to decide "is this user an admin" by comparing
// the raw `sessionId` cookie value against process.env.ID_ADMIN as plain
// strings, with the `session` token itself never validated at all (only
// checked for "is it present"). Cookies are httpOnly (page JS can't touch
// them), but they're still plain, unsigned values editable via devtools -
// anyone who learned the admin's user id could set their own sessionId
// cookie to that value and pass this check with zero real credentials.
//
// Fixed by not trusting any client-supplied identity claim at all: this now
// calls the backend's own GET /users?role=ADMINISTRADOR, which is gated by
// SecurityConfig's real `hasRole('ADMINISTRADOR') or
// hasAuthority('ADMINISTRADOR')` check (see SecurityConfigIntegrationTest,
// soccer-application module) - a 200 response can only happen if the
// backend's own, already-verified authorization logic accepted this exact
// bearer token as belonging to an administrator. Any other outcome (401
// invalid/missing/expired token, 403 authenticated-but-not-admin, network
// failure) fails closed to false. This also closes a second issue the
// original "fix" (checking get-user-details/{sessionId} instead) would
// still have had: that endpoint has no ownership check, so a caller could
// still have pointed sessionId at the admin's id and read back the admin's
// own role using their own valid token. Querying a role-gated endpoint
// instead means the caller's OWN token is what's being authorized, not
// whichever id happens to be sitting in a cookie.
export async function getAuthUserAdmin(): Promise<boolean> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return false;

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    await axios.get(`${API_BASE_URL}/users`, {
      params: { role: "ADMINISTRADOR" },
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    return false;
  }
}



export async function getPhotoUser(): Promise<string> {
  const photo = (await cookies()).get("photo")?.value;
  return photo !== undefined ? photo : "";
}