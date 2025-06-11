"use client";
// File: src/app/features/category/components/CategoryForm.tsx
import { memo, useState, useRef, useEffect } from "react";
import { FormInput } from "@/components/common";
import { CategoryInfoRecord, CategoryValidationErrors } from ".";
import {  SupabaseFolder } from "@/app/utils/Actions/SupaBase/ActionsImages";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { ImageUploadWithRef } from "../../common/Common.ImageUploadField";

type CategoryFormProps = {
  formData: Partial<CategoryInfoRecord>;
  errors: CategoryValidationErrors;
  isValid: boolean;
  isProcessing: boolean;
  onImageChange: (file: File | null, previewUrl: string) => void;
  modalMode: "create" | "edit";
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (formData: Partial<CategoryInfoRecord>, imageFile?: File | null) => Promise<void>;
  onCancel: () => void;
};

export const CategoryForm = memo(function CategoryForm({
  formData,
  errors,
  isValid,
  isProcessing,
  modalMode,
  onImageChange,
  onInputChange,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  // Ref to access the ImageUpload component's file
  const imageUploadRef = useRef<{ selectedFile: File | null }>({ selectedFile: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [updatedImageUrl, setUpdatedImageUrl] = useState<string | null>(null);
 

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Get the updated form data with any changes
      const updatedFormData = {
        ...formData,
        // If we got a new image URL from the ImageUpload component, use it
        // ...(updatedImageUrl ? { imageUrl: updatedImageUrl } : {})
      };
      
      // Call the parent onSubmit method with the updated form data and the selected file
      await onSubmit(updatedFormData, imageUploadRef.current?.selectedFile || null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to save category: ${error instanceof Error ? error.message : 'Unknown error'}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom handler to capture the selected file from the ImageUpload component
  const captureSelectedFile = (file: File | null) => {
    if (file) {
      // Create a local URL for the selected file
      const localUrl = URL.createObjectURL(file);
      
      // Pass the file and the local URL to onImageChange
      onImageChange(file, localUrl);
      
      if (imageUploadRef.current) {
        imageUploadRef.current.selectedFile = file;
      }
    }
  };

 
  return (
     <form onSubmit={handleFormSubmit} className="space-y-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="name"
          label="Nombre de categoriaa"
          type="text"
          name="name"
          placeholder="Ingresa tu equipo"
          value={formData.name || ""}
          onChange={onInputChange}
          error={errors.name?.[0]}
          maxLength={100}
        />

        <div className="my-auto mx-auto relative  h-[300px] w-[300px]">
          {/* Custom ImageUpload component with additional props */}
          <ImageUploadWithRef
            id={formData?.id || modalMode === "create" ? "new-category" : ""}
            imageUrl={formData?.imageUrl || "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/logo.png"}
            ref={imageUploadRef}
            onFileSelect={captureSelectedFile}
            // onImageUpdate={onImageChange}
            folder={SupabaseFolder.CATEGORIES}
          />
          {errors.imageUrl && (
            <p className="mt-1 text-sm text-red-600 absolute bottom-2 left-2 right-2 bg-white bg-opacity-75 p-1 rounded">
              {errors.imageUrl[0]}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="minAge"
              label="Minima edad"
              type="number"
              name="minAge"
              placeholder="0"
              value={formData.ageRange?.minAge?.toString() || "0"}
              onChange={onInputChange}
              min={0}
            />

            <FormInput
              id="maxAge"
              label="Maxima edad"
              type="number"
              name="maxAge"
              placeholder="18"
              value={formData.ageRange?.maxAge?.toString() || "18"}
              onChange={onInputChange}
              min={0}
            />
          </div>
          {/* Age range validation error */}
          {errors.ageRange && (
            <p className="mt-1 text-sm text-red-600">{errors.ageRange[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          disabled={isSubmitting || isProcessing}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isProcessing || !isValid}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting || isProcessing ? (
            <>
              <LoadingSpinner />
               Procesando...
            </>
          ) : modalMode === "create" ? (
            "Crear categoria"
          ) : (
            "Actualizar categoria"
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