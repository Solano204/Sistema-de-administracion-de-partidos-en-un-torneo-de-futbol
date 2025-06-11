"use server";
import {
  loginSchema,
  personalInfoSchema,
  changePasswordSchema,
  changeUsernameSchema,
  signinSchema,
} from "@/app/utils/Zod/Schemas/AuthSchema";
import { updateAuthCookies } from "./AuthCookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import axios from "axios";
import {
  LoginRequest,
  TokenResponse,
  UserDetailsRecordFull,
  UserRegisterRecord,
  UserUpdateBasicInformation,
} from "./TypesAuth";
import { revalidatePath } from "next/cache";
import { calculateAge } from "@/components/UserManagment";

// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchAgenda() {
  const res = await fetch(`${API_BASE_URL}/agenda`);
  return await res.json();
}
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function signUp(
  prevState: any,
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  try {
    const rawData: UserRegisterRecord = {
      id: "",
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      birthDate: formData.get("birthDate") as string,
      age: calculateAge(formData.get("birthDate") as string),
      password: formData.get("password") as string,
      role: formData.get("role") as string,
      user: formData.get("user") as string,
    };

    // First validate the credentials using signupSchema
    const credentialsValidation = signinSchema.safeParse({
      user: rawData.user,
      password: rawData.password,
    });

    if (!credentialsValidation.success) {
      return {
        message: credentialsValidation.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
        success: false,
      };
    }

    // Then validate personal info
    const personalInfoValidation = personalInfoSchema.safeParse({
      firstName: rawData.firstName,
      lastName: rawData.lastName,
      email: rawData.email,
      birthDate: rawData.birthDate,
    });

    if (!personalInfoValidation.success) {
      return {
        message: personalInfoValidation.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
        success: false,
      };
    }

    try {
      // Parse and validate input data
      const response = await apiClient.post("/users", rawData);
      // Return a success message
      const tokenResponse = response.data as TokenResponse;

      // Proceed with login logic (e.g., verify user credentials)
      await updateAuthCookies(tokenResponse);

      // The redirect should come after the cookie is set
      // But we'll return success first, then handle navigation in the component
    } catch (error: any) {
      console.error(
        "API error during sign up:",
        error.response?.data || error.message
      );
      return {
        message:
          error.response?.data?.message ||
          "Server error occurred during registration",
        success: false,
      };
    }
  } catch (error: any) {
    console.error("Error during sign up:", error);
    return { message: "Failed to register user", success: false };
  }

  await redirectToSoccer();
  return { message: "User registered successfully", success: true };
}

export async function logIn(
  prevState: any,
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  try {
    const rawData: LoginRequest = {
      username: formData.get("user") as string,
      password: formData.get("password") as string,
    };

    // Validate the form data
    const result = loginSchema.safeParse(rawData);

    if (!result.success) {
      return {
        message: result.error.errors.map((err) => err.message).join(", "),
        success: false,
      };
    }
    // If validation fails, return the error messages
    const response = await apiClient.post("/auth/login", rawData);
    const tokenResponse = response.data as TokenResponse;
    // Proceed with login logic (e.g., verify user credentials)

    await updateAuthCookies(tokenResponse);
  } catch (error: any) {
    console.error("Error during login:", error);
    return {
      message: error.response?.data?.message || "Failed to log in",
      success: false,
    };
  }
  await redirectToSoccer();
  return { message: "Login ksks", success: true };

  // We'll handle redirection in the component after success
}

export async function redirectToSoccer() {
  revalidatePath("/Soccer");
  redirect("/Soccer");
}

export async function changePassword(
  prevState: any,
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  try {
    const rawData = {
      username: formData.get("username") as string,
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
    };

    // Validate the form data
    const result = changePasswordSchema.safeParse(rawData);

    if (!result.success) {
      return {
        message: result.error.errors.map((err) => err.message).join(", "),
        success: false,
      };
    }

    const response = await apiClient.put("/auth/change-password", null, {
      params: {
        username: rawData.username,
        currentPassword: rawData.currentPassword,
        newPassword: rawData.newPassword,
      },
    });

    const tokenResponse = response.data as TokenResponse;
    await updateAuthCookies(tokenResponse);
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      message: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to change password"
        : "Failed to change password",
      success: false,
    };
  }

  await redirectToSoccer();
  return { message: "Password changed successfully", success: true };
}

export async function changeUsername(
  prevState: any,
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  try {
    const rawData = {
      currentUsername: formData.get("currentUsername") as string,
      newUsername: formData.get("newUsername") as string,
      currentPassword: formData.get("currentPassword") as string,
    };

    // Validate the form data
    const result = changeUsernameSchema.safeParse(rawData);

    if (!result.success) {
      return {
        message: result.error.errors.map((err) => err.message).join(", "),
        success: false,
      };
    }

    const response = await apiClient.put("/auth/change-username", null, {
      params: {
        currentUsername: rawData.currentUsername,
        newUsername: rawData.newUsername,
        currentPassword: rawData.currentPassword,
      },
    });

    const tokenResponse = response.data as TokenResponse;
    await updateAuthCookies(tokenResponse);
  } catch (error) {
    console.error("Error changing username:", error);
    return {
      message: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to change username"
        : "Failed to change username",
      success: false,
    };
  }
  await redirectToSoccer();
  return { message: "Username changed successfully", success: true };
}
// Check if admin exists
export async function checkAdminExists(): Promise<boolean> {
  try {
    const response = await apiClient.get("/users/exist-admin", {
      params: { role: "ADMINISTRADOR" },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking admin existence:", error);
    return false;
  }
}

// Update user details
export async function updateUserDetails(
  prevState: any,
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  const userId: string = (await cookies()).get("sessionId")?.value || "";

  const updatedDetails: UserUpdateBasicInformation = {
    id: userId,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    birthDate: formData.get("birthDate") as string,
    age: calculateAge(formData.get("birthDate") as string),
    role: formData.get("role") as string,
  };

  try {
    await apiClient.put(`/users/${userId}`, updatedDetails);
  } catch (error) {
    console.error("Error updating user details:", error);
    return {
      message: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update user details"
        : "Failed to update user details",
      success: false,
    };
  }

  await redirectToSoccer();
  return { message: "User details updated successfully", success: true };
}

// Get user details
export async function getUserDetails(): Promise<{
  data?: UserDetailsRecordFull;
  message: string;
  success: boolean;
}> {
  try {
    const id: string = (await cookies()).get("sessionId")?.value || "";
    if (!id) {
      return {
        message: "User ID not found in cookies",
        success: false,
      };
    }
    const response = await apiClient.get(`/users/get-user-details/${id}`);
    return {
      data: response.data,
      message: "User details retrieved successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error getting user details:", error);
    return {
      message: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to get user details"
        : "Failed to get user details",
      success: false,
    };
  }
}
