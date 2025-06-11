"use server"
import { cookies } from "next/headers";
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
export async function getAuthUserAdmin(): Promise<boolean> {
  const adminId = process.env.ID_ADMIN;
  const user = await getAuthUser();
  if (!user) return false;

  
  const tokenAccess = (await cookies()).get("session")?.value;
  const sessionId = (await cookies()).get("sessionId")?.value;

  const isAdmin = tokenAccess !== undefined && sessionId === adminId;
  return isAdmin;
}



export async function getPhotoUser(): Promise<string> {
  const photo = (await cookies()).get("photo")?.value;
  return photo !== undefined ? photo : "";
}