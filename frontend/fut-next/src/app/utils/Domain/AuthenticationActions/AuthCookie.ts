"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TokenResponse } from "./TypesAuth";

type AuthData = {
  email: string;
  password: string;
};



// Helper function to update auth cookies
export async function updateAuthCookies(tokenResponse: TokenResponse) {
  const expires = new Date(Date.now() + tokenResponse.expiresIn * 1000);
  
  (await cookies()).set("session", tokenResponse.accessToken, {
    expires,
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",}
  });

  (await cookies()).set("sessionId", tokenResponse.userId, { 
    expires,
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
  });

  (await cookies()).set("photo", tokenResponse.photoUrl, {
    expires,
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
  });

  if (tokenResponse.refreshToken) {
    (await cookies()).set("refreshToken", tokenResponse.refreshToken, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
    });
  }
}

export async function getToke () {
  const token = (await cookies()).get("session")?.value;
  const id = (await cookies()).get("sessionId")?.value;
  return {
    idUser: id !== undefined ? id : "",
    token: token !== undefined ? token : "",
  };
}

export async function setCookie() {
  // Create the session
  const expires = new Date(Date.now() + 10 * 1000);
  (await cookies()).set("session", "hello", { expires, httpOnly: true });

  const response = await fetch("https://rickandmortyapi.com/api/character", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("response", response);
}
export async function deleteCookie(
  prevState: any,
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  // Clear the authToken cookie
  (await cookies()).delete("session");
  (await cookies()).delete("sessionId");
  (await cookies()).delete("photo");
  console.log("cookie deleted");
  redirect("/");  
}
