"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toastCustom } from "@/components/Toast/SonnerToast";
import {
  fetchUsersByRole,
  fetchUserById,
  registerUser,
  updateUserDetails,
  updateUserStatus,
  updateUserProfilePhoto,
  changeUserName,
  deleteUser,
} from "../";

import {
  UserRole,
  UserStatus,
  UserDetailsRecordFull,
  UserRegisterRecord,
  UserUpdateBasicInformation,
  UserUpdateProfilePhoto,
  UserUpdatePassword,
  UserChangeUserName,
} from "../";

import {
  validateUserRegistration,
  validateUserUpdate,
  validateUserPhotoUpdate,
  validateUserStatus,
  validatePasswordChange,
  validateUsernameChange,
} from "../";
import { mapToBackendFormat } from "./mapper";
import { adminChangeUserPassword } from "../api/api-users";
import { userKeys } from "../api/api-users-keys";

/**
 * Custom hook for fetching users by role
 */
export const useUsersByRole = (role: UserRole | null) => {
  return useQuery<UserDetailsRecordFull[], Error>({
    queryKey: role ? userKeys.byRole(role) : userKeys.lists(),
    queryFn: () => (role ? fetchUsersByRole(role) : Promise.resolve([])),
    enabled: !!role,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook for fetching a single user by ID
 */
export const useUserById = (id: string | null) => {
  return useQuery<UserDetailsRecordFull, Error>({
    queryKey: id ? userKeys.detail(id) : userKeys.details(),
    queryFn: () => (id ? fetchUserById(id) : Promise.reject("No ID provided")),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook for registering a new user
 */
export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<UserRegisterRecord>) => {
      // Validate data before sending to API

      
      const validatedData = validateUserRegistration(userData);
    
      // 2. Map to backend format
      const backendData = mapToBackendFormat(validatedData);
      
      // 3. Send to API
      return await registerUser(backendData);
    },
    onSuccess: (newUser) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: userKeys.byRole(newUser.role),
      });
      
      toastCustom(
        {
          title: "Success",
          description: "User registered successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to register user: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};

/**
 * Custom hook for updating user details
 */
export const useUpdateUserDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      details,
    }: {
      userId: string;
      details: Partial<UserUpdateBasicInformation>;
    }) => {
      // Validate data before sending to API
      const validatedData = validateUserUpdate({
        id: userId,
        ...details,
      });
      return updateUserDetails(userId, validatedData);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      
      // Find and invalidate the role-based list that might contain this user
      Object.values(UserRole).forEach((role) => {
        queryClient.invalidateQueries({
          queryKey: userKeys.byRole(role),
        });
      });
      
      toastCustom(
        {
          title: "Success",
          description: "User details updated successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to update user: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};

/**
 * Custom hook for updating user profile photo
 */
export const useUpdateUserPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoData: Partial<UserUpdateProfilePhoto>) => {
      // Validate photo data before sending to API
      const validatedData = validateUserPhotoUpdate(photoData);
      return updateUserProfilePhoto(validatedData);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id || ""),
      });
      
      // Invalidate all role-based lists as this might be visible in any of them
      Object.values(UserRole).forEach((role) => {
        queryClient.invalidateQueries({
          queryKey: userKeys.byRole(role),
        });
      });
      
      toastCustom(
        {
          title: "Success",
          description: "Profile photo updated successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to update profile photo: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};

/**
 * Custom hook for updating user status
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: UserStatus;
    }) => {
      // Validate userId and status
      // First, validate that the status is valid
      const validStatus = validateUserStatus(status);
      
      // In the original code, validateUserStatusUpdate was expected to take userId and status
      // Since we don't have this function, we'll call updateUserStatus directly with validated status
      return updateUserStatus(userId, validStatus);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      
      // Invalidate all role-based lists as this user might be in any of them
      Object.values(UserRole).forEach((role) => {
        queryClient.invalidateQueries({
          queryKey: userKeys.byRole(role),
        });
      });
      
      toastCustom(
        {
          title: "Success",
          description: "User status updated successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to update status: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};

/**
 * Custom hook for changing user password
 */
export const useChangeUserPassword = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      username,
      newPassword,
      confirmPassword,
    }: {
      userId: string;
      username: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      // Validate password data before sending to API
      // We need to create a data object that matches what validatePasswordChange expects
      const passwordData: UserUpdatePassword = {
        id: userId,
        newPassword,
        confirmPassword
      };
      
      const validatedData = validatePasswordChange(passwordData);
      
      return adminChangeUserPassword(
        username,
        validatedData.newPassword
      );
    },
    onSuccess: () => {
      toastCustom(
        {
          title: "Success",
          description: "Password changed successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to change password: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};

/**
 * Custom hook for changing username
 */
export const useChangeUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      currentUsername,
      newUsername,
      currentPassword,
    }: {
      userId: string;
      currentUsername: string;
      newUsername: string;
      currentPassword: string;
    }) => {
      // Validate username change data before sending to API
      const usernameData: UserChangeUserName = {
        id: userId,
        currentPassword,
        currentUsername,
        newUsername
      };
      
      const validatedData = validateUsernameChange(usernameData);
      
      console.log("validatedData",validatedData)
      return changeUserName(
        // validatedData.id,
        validatedData.currentUsername,
        validatedData.newUsername,
        validatedData.currentPassword
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      
      // Invalidate all role-based lists as this user might be in any of them
      Object.values(UserRole).forEach((role) => {
        queryClient.invalidateQueries({
          queryKey: userKeys.byRole(role),
        });
      });
      
      toastCustom(
        {
          title: "Success",
          description: "Username changed successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to change username: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};

/**
 * Custom hook for deleting a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate all role-based lists as the deleted user might have been in any of them
      Object.values(UserRole).forEach((role) => {
        queryClient.invalidateQueries({
          queryKey: userKeys.byRole(role),
        });
      });
      
      toastCustom(
        {
          title: "Success",
          description: "User deleted successfully",
          button: { label: "Dismiss", onClick: () => {} },
        },
        "success"
      );
    },
    onError: (error: Error) => {
      toastCustom(
        {
          title: "Error",
          description: `Failed to delete user: ${error.message}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    },
  });
};