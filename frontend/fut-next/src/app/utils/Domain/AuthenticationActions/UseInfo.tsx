// "use server";
// import { last } from "lodash";
// import { cookies } from "next/headers";
// import { date } from "zod";

// export type userInfo = {
//   id: number;
//   name: string;
//   lastName: string;
//   age: number;
//   dateBirth: string;
//   urlPhoto: string;
// };

// export async function updatingInfo(
//   prevState: any,
//   formData: FormData
// ): Promise<{ message: string; success: boolean }> {
//   try {
//     const rawData = {
//       name: formData.get("name"),
//       lastName: formData.get("lastName"),
//       age: formData.get("age"),
//       id: formData.get("id"),
//       dateBirth: formData.get("DateBirth"),
//     };

//     console.log("rawData", rawData);
//     // Return a success message
//     return { message: "User logged in successfully", success: true };
//   } catch (error) {
//     return { message: "Failed to log in", success: false };
//   }
// }

// export async function getImageUser(idUser: string): Promise<string> {
//   return "/Images/logo.png";
// }
// export async function getInfo(): Promise<userInfo> {
//   const token = (await cookies()).get("session")?.value;
//   const id = (await cookies()).get("sessionId")?.value;
//   console.log("token", token, "id", id);
//   return {
//     id: id !== undefined ? Number(id) : 2,
//     name: "name",
//     lastName: "lastName",
//     age: 20,
//     urlPhoto: "/Images/logo.png",
//     dateBirth: "1990-01-01",
//   };
// }
