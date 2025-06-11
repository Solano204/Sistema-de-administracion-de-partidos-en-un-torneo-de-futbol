// File: src/app/features/referee/components/RefereeForm.tsx
import { memo, useState, useRef, useEffect } from "react";
import { FormInput } from "@/components/common";
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import { 
  UserRegisterRecord, 
  RefereeValidationErrors, 
  UserStatus, 
  UserRole 
} from "../types/referee-types";
import { SupabaseFolder } from "@/app/utils/Actions/SupaBase/ActionsImages";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { ImageUploadWithRef } from "@/components/common/Common.ImageUploadField";
  
// Status options for the select dropdown

const statusOptions: SelectOption<UserStatus>[] = [
  { label: "Activo", value: UserStatus.ACTIVO },
  { label: "Inactivo", value: UserStatus.INACTIVO },
  { label: "Suspendido", value: UserStatus.SUSPENDIDO },
  { label: "Pendiente", value: UserStatus.PENDIENTE },
];

// Role options for the select dropdown
const roleOptions: SelectOption<UserRole>[] = [
  { label: "Administrador", value: UserRole.ADMINISTRADOR },
  { label: "Arbitro", value: UserRole.ARBITRO },
          { label: "Jugador", value: UserRole.JUGADOR },
];

type RefereeFormProps = {
  formData: Partial<UserRegisterRecord>;
  errors: RefereeValidationErrors;
  isValid: boolean;
  isProcessing: boolean;
  modalMode: "create" | "edit" | "photo";
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (status: UserStatus | null) => void;
  onRoleChange: (role: UserRole | null) => void;
  onImageChange: (file: File | null, previewUrl: string) => void;
  onSubmit: (formData: Partial<UserRegisterRecord>, imageFile?: File | null) => Promise<void>;
  onCancel: () => void;
};

export const RefereeForm = memo(function RefereeForm({
  formData,
  errors,
  isValid,
  isProcessing,
  modalMode,
  onInputChange,
  onStatusChange,
  onRoleChange,
  onImageChange,
  onSubmit,
  onCancel,
}: RefereeFormProps) {
  // Ref to access the ImageUpload component's file
  const imageUploadRef = useRef<{ selectedFile: File | null }>({ selectedFile: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle selected status from dropdown
  const handleStatusSelect = (option: SelectOption<UserStatus> | null) => {
    if (option) {
      onStatusChange(option.value);
    }
  };

  // Handle selected role from dropdown
  const handleRoleSelect = (option: SelectOption<UserRole> | null) => {
    if (option) {
      onRoleChange(option.value);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isProcessing) return;
    setIsSubmitting(true);
    
    try {
      // Get the updated form data with any changes
      const updatedFormData = {
        ...formData,
      };
      
      // Call the parent onSubmit method with the updated form data and the selected file
      await onSubmit(updatedFormData, imageUploadRef.current?.selectedFile || null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to save referee: ${error instanceof Error ? error.message : 'Unknown error'}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
      console.log("Image file selected:", imageUploadRef.current?.selectedFile);
  })
  // Custom handler to capture the selected file from the ImageUpload component
  const captureSelectedFile = (file: File | null) => {
    if (file) {
      // Create a local URL for the selected file
      const localUrl = URL.createObjectURL(file);
      
      // Pass the file and the local URL to onImageChange
      onImageChange(file, localUrl);
      
console.log("Image file selected:", imageUploadRef.current?.selectedFile);
      if (imageUploadRef.current) {
        imageUploadRef.current.selectedFile = file;
      }
    }
  };

  // Get the currently selected status and role
  const selectedStatus = statusOptions.find(option => option.value === formData.status) || statusOptions[0];
  const selectedRole = roleOptions.find(option => option.value === formData.role) || roleOptions[1]; // Default to ARBITRO
return (
    <form onSubmit={handleFormSubmit} className="space-y-4 bg-white   dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {modalMode === "create" || modalMode === "edit" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="firstName"
              label="Nombre"
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName || ""}
              onChange={onInputChange}
              error={errors.firstName?.[0]}
              required={modalMode === "create"}
            />

            <FormInput
              id="lastName"
              label="Apellido"
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName || ""}
              onChange={onInputChange}
              error={errors.lastName?.[0]}
              required={modalMode === "create"}
            />

            <FormInput
              id="email"
              label="Correo electrónico"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email || ""}
              onChange={onInputChange}
              error={errors.email?.[0]}
              required={modalMode === "create"}
            />

            <FormInput
              id="birthDate"
              label="Fecha de nacimiento"
              type="date"
              name="birthDate"
              value={formData.birthDate || ""}
              onChange={onInputChange}
              error={errors.birthDate?.[0]}
              required={modalMode === "create"}
            />

            <FormInput
              id="age"
              label="Age"
              type="number"
              name=" Edad"
              value={formData.age?.toString() || ""}
              onChange={onInputChange}
              error={errors.age?.[0]}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />

            {modalMode === "create" && (
              <>
                <FormInput
                  id="user"
                  label="Username"
                  name="user"
                  placeholder="Enter username"
                  value={formData.user || ""}
                  onChange={onInputChange}
                  error={errors.user?.[0]}
                  required
                />

                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password || ""}
                  onChange={onInputChange}
                  error={errors.password?.[0]}
                  required
                />
              </>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <NeonSelect
                id="role"
                options={roleOptions}
                value={selectedRole}
                onChange={handleRoleSelect}
                placeholder="Select role"
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role[0]}</p>
              )}
            </div>

            {modalMode === "create" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <NeonSelect
                  id="status"
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={handleStatusSelect}
                  placeholder="Select status"
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status[0]}</p>
                )}
              </div>
            )}
          </div>

          {/* Profile image upload section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modificar Foto de Perfil
            </label>
            <div className="mx-auto relative border-2 border-gray-300 dark:border-gray-700 h-[200px] w-[200px] rounded-full overflow-hidden">
              <ImageUploadWithRef
                id={formData?.id || modalMode === "create" ? "new-referee" : ""}
                imageUrl={formData?.urlPhoto || "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/logo.png"}
                ref={imageUploadRef}
                onFileSelect={captureSelectedFile}
                folder={SupabaseFolder.REFEREEES}
              />
              {errors.urlPhoto && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 absolute bottom-2 left-2 right-2 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 p-1 rounded">
                  {errors.urlPhoto[0]}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        // Photo update mode
        <div className="space-y-4 flex items-center justify-center">
          <div className="my-auto mx-auto relative border-2 border-gray-300 dark:border-gray-700 h-[300px] w-[300px] rounded-full overflow-hidden">
            <ImageUploadWithRef
              id={formData?.id || ""}
              imageUrl={formData?.urlPhoto || "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/default-avatar.png"}
              ref={imageUploadRef}
              onFileSelect={captureSelectedFile}
              folder={SupabaseFolder.USERS}
            />
            {errors.urlPhoto && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 absolute bottom-2 left-2 right-2 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 p-1 rounded">
                {errors.urlPhoto[0]}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isProcessing}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isProcessing || !isValid}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting || isProcessing ? (
            <>
              <LoadingSpinner />
              Procesando...
            </>
          ) : modalMode === "create" ? (
            "Crear Referee"
          ) : modalMode === "edit" ? (
            "Actualizar Referee"
          ) : (
            "Actualizar Foto"
          )}
        </button>
      </div>
    </form>
  );
});

// Extracted loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}