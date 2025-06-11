"use client"
import { useRef } from "react";
import { FormInput } from "@/components/common";
import {  SelectOption } from "@/components/common/Common.Select";
import { Modal } from "@/components/TeamManagment/Components/Team.PopUp";
import { SupabaseFolder } from "@/app/utils/Actions/SupaBase/ActionsImages";
import { ImageUploadWithRef } from "@/components/common/Common.ImageUploadField";
import {
  UserRole,
  UserUpdateBasicInformation,
  UserRegisterRecord,
} from "../";
import { RoleSelector } from "./RoleSelecor";

interface CreateEditFormProps {
  isOpen: boolean;
  onFileSelect: (file: File | null) => void;
  mode: "create" | "edit";
  formData: Partial<UserUpdateBasicInformation>;
  registerFormData: Partial<UserRegisterRecord>;
  errorsRegister: Record<string, string[] | undefined>;
  errorsUpdateBasicInfo: Record<string, string[] | undefined>;
  isValidCreate: boolean;
  isValidUpdate: boolean;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegisterInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (option: SelectOption<UserRole> | null) => void;
  onImageChange: (imageUrl: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  imageUploadRef: React.MutableRefObject<{ selectedFile: File | null }>;
}

export const CreateEditForm = ({
  isOpen,
  mode,
  formData,
  imageUploadRef,
  registerFormData,
  errorsRegister,
  errorsUpdateBasicInfo,
  isValidCreate,
  isValidUpdate,
  onClose,
  onInputChange,
  onRegisterInputChange,
  onFileSelect,
  onRoleChange,
  onImageChange,
  onSubmit,
}: CreateEditFormProps) => {

 return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          {mode === "create" ? "Register New User" : "Edit User"}
        </h2>

        <form onSubmit={onSubmit}>
          {/* First Name */}
          <div className="mb-4">
            <FormInput
              id="firstName"
              label="First Name"
              name="firstName"
              type="text"
              placeholder="Enter first name"
              value={
                mode === "create"
                  ? registerFormData.firstName || ""
                  : formData.firstName || ""
              }
              onChange={
                mode === "create" ? onRegisterInputChange : onInputChange
              }
              error={
                mode === "create"
                  ? errorsRegister.firstName
                    ? errorsRegister.firstName[0]
                    : undefined
                  : errorsUpdateBasicInfo.firstName
                  ? errorsUpdateBasicInfo.firstName[0]
                  : undefined
              }
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <FormInput
              id="lastName"
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Enter last name"
              value={
                mode === "create"
                  ? registerFormData.lastName || ""
                  : formData.lastName || ""
              }
              onChange={
                mode === "create" ? onRegisterInputChange : onInputChange
              }
              error={
                mode === "create"
                  ? errorsRegister.lastName
                    ? errorsRegister.lastName[0]
                    : undefined
                  : errorsUpdateBasicInfo.lastName
                  ? errorsUpdateBasicInfo.lastName[0]
                  : undefined
              }
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <FormInput
              id="email"
              label="Email"
              name="email"
              type="email"
              placeholder="Enter email"
              value={
                mode === "create"
                  ? registerFormData.email || ""
                  : formData.email || ""
              }
              onChange={
                mode === "create" ? onRegisterInputChange : onInputChange
              }
              error={
                mode === "create"
                  ? errorsRegister.email
                    ? errorsRegister.email[0]
                    : undefined
                  : errorsUpdateBasicInfo.email
                  ? errorsUpdateBasicInfo.email[0]
                  : undefined
              }
              required
            />
          </div>

          {/* Birth Date */}
          <div className="mb-4">
            <FormInput
              id="birthDate"
              label="Birth Date"
              name="birthDate"
              type="date"
              placeholder="Select birth date"
              value={
                mode === "create"
                  ? registerFormData.birthDate || ""
                  : formData.birthDate || ""
              }
              onChange={
                mode === "create" ? onRegisterInputChange : onInputChange
              }
              error={
                mode === "create"
                  ? errorsRegister.birthDate
                    ? errorsRegister.birthDate[0]
                    : undefined
                  : errorsUpdateBasicInfo.birthDate
                  ? errorsUpdateBasicInfo.birthDate[0]
                  : undefined
              }
              required
            />
          </div>

          {/* Age - Read only, calculated from birth date */}
          <div className="mb-4">
            <FormInput
              id="age"
              label="Age"
              name="age"
              type="number"
              placeholder="Age (calculated)"
              value={
                mode === "create"
                  ? registerFormData.age || 0
                  : formData.age || 0
              }
              onChange={() => {}} // Read-only
              error={errorsRegister.age ? errorsRegister.age[0] : undefined}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* Role */}
          {mode === "create" ? (
            <div className="mb-4">
              <RoleSelector
                mode={mode}
                currentRole={registerFormData.role}
                onRoleChange={onRoleChange}
              />
            </div>
          ) : (
            <RoleSelector
              mode={mode}
              currentRole={formData.role}
              onRoleChange={onRoleChange}
            />
          )}

          {/* Username - Only for create mode */}
          {mode === "create" && (
            <div className="mb-4">
              <FormInput
                id="user"
                label="Username"
                name="user"
                type="text"
                placeholder="Enter username"
                value={registerFormData.user || ""}
                onChange={onRegisterInputChange}
                error={errorsRegister.user ? errorsRegister.user[0] : undefined}
                required
              />
            </div>
          )}

          {/* Password - Only for create mode */}
          {mode === "create" && (
            <div className="mb-4">
              <FormInput
                id="password"
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={registerFormData.password || ""}
                onChange={onRegisterInputChange}
                error={
                  errorsRegister.password
                    ? errorsRegister.password[0]
                    : undefined
                }
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must contain at least 8 characters, one uppercase
                letter, one lowercase letter, and one number.
              </p>
            </div>
          )}

          {/* Image Upload - Only for create mode */}
          {mode === "create" && (
            <div className="my-auto mx-auto relative border-2 border-gray-500 dark:border-gray-600 h-[300px] w-[300px]">
              <ImageUploadWithRef
                id={registerFormData.id}
                imageUrl={
                  registerFormData.profilePhoto ||
                  "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/-29x6clq.jpg"
                }
                ref={imageUploadRef}
                onFileSelect={onFileSelect}
                folder={SupabaseFolder.USERS}
              />
            </div>
          )}

          {/* Form buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mode === "create" ? !isValidCreate : !isValidUpdate}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 ${
                (mode === "create" ? isValidCreate : isValidUpdate)
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  : "bg-blue-300 dark:bg-blue-500/50 cursor-not-allowed"
              }`}
            >
              {mode === "create" ? "Register User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface PhotoFormProps {
  isOpen: boolean;
  photoData: { id: string; profilePhoto: string | null };
  isLoading: boolean;
  onClose: () => void;
  onFileSelect: (file: File | null) => void;
  onSubmit: (e: React.FormEvent, selectedFile: File | null) => void;
}

export const PhotoForm = ({
  isOpen,
  photoData,
  isLoading,
  onClose,
  onFileSelect,
  onSubmit,
}: PhotoFormProps) => {
  const imageUploadRef = useRef<{ selectedFile: File | null }>({
    selectedFile: null,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Update Profile Photo</h2>
        <form
          onSubmit={(e) =>
            onSubmit(e, imageUploadRef.current?.selectedFile || null)
          }
        >
          <div className="mb-6 flex justify-center">
            <div className="relative border-2 border-gray-300 dark:border-gray-700 rounded-lg h-64 w-64">
              <ImageUploadWithRef
                id={photoData.id}
                imageUrl={
                  photoData.profilePhoto ||
                  "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/-29x6clq.jpg"
                }
                ref={imageUploadRef}
                onFileSelect={onFileSelect}
                folder={SupabaseFolder.REFEREEES}
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${
                !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  : "bg-blue-300 dark:bg-blue-500/50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Updating..." : "Update Photo"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface PasswordFormProps {
  isOpen: boolean;
  passwordData: { newPassword: string; confirmPassword: string };
  passwordErrors: Record<string, string[] | undefined>;
  isValidPassword: boolean;
  isLoading: boolean;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasswordForm = ({
  isOpen,
  passwordData,
  passwordErrors,
  isValidPassword,
  isLoading,
  onClose,
  onInputChange,
  onSubmit,
}: PasswordFormProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Change Password</h2>
        <form onSubmit={onSubmit}>
          {/* New Password */}
          <div className="mb-4">
            <FormInput
              id="newPassword"
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={onInputChange}
              error={passwordErrors.newPassword?.[0]}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must contain at least 8 characters, one uppercase letter,
              one lowercase letter, and one number.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <FormInput
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={onInputChange}
              error={passwordErrors.confirmPassword?.[0]}
              required
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidPassword || isLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${
                isValidPassword && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  : "bg-blue-300 dark:bg-blue-500/50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface UsernameFormProps {
  isOpen: boolean;
  usernameData: {
    currentPassword: string;
    currentUsername: string;
    newUsername: string;
  };
  usernameErrors: Record<string, string[] | undefined>;
  isValidUsername: boolean;
  isLoading: boolean;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const UsernameForm = ({
  isOpen,
  usernameData,
  usernameErrors,
  isValidUsername,
  isLoading,
  onClose,
  onInputChange,
  onSubmit,
}: UsernameFormProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Change Username</h2>
        <form onSubmit={onSubmit}>
          {/* Current Username */}
          <div className="mb-4">
            <FormInput
              id="currentUsername"
              label="Current Username"
              name="currentUsername"
              type="text"
              value={usernameData.currentUsername}
              onChange={onInputChange}
              error={usernameErrors.currentUsername?.[0]}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* New Username */}
          <div className="mb-4">
            <FormInput
              id="newUsername"
              label="New Username"
              name="newUsername"
              type="text"
              placeholder="Enter new username"
              value={usernameData.newUsername}
              onChange={onInputChange}
              error={usernameErrors.newUsername?.[0]}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Username must be unique and between 3-20 characters.
            </p>
          </div>

          {/* Current Password */}
          <div className="mb-4">
            <FormInput
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              type="password"
              placeholder="Enter your password"
              value={usernameData.currentPassword}
              onChange={onInputChange}
              error={usernameErrors.currentPassword?.[0]}
              required
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidUsername || isLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${
                isValidUsername && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  : "bg-blue-300 dark:bg-blue-500/50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Changing..." : "Change Username"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};