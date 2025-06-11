"use client";
import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { FormInput, NeonSelect } from ".";
import { PerfilFormData } from "@/app/utils/Zod/Schemas/FormSchemas";
import { InfoBasicPlayer } from "@/components/PlayerManagment/types/TypesPlayer";
import { validatePerfilForm } from "@/app/utils/Zod/Validations/Form.Actions";
import { ImageUploadWithRef } from "./Common.ImageUploadField";
import { SupabaseFolder } from "@/app/utils/Actions/SupaBase/ActionsImages";

import { inputBaseStyles } from "./Common.FormStyles";
import { RootState } from "@/app/Redux/store";
import { useSelector } from "react-redux";

const roleOptions = [
  { label: "Jugador", value: "PLAYER" },
  { label: "Capitan", value: "CAPITAN" },
];

interface PerfilFormProps {
  initialData: InfoBasicPlayer;
  onNext?: (data: PerfilFormData) => boolean;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export interface PerfilFormHandle {
  getCurrentData: () => InfoBasicPlayer;
  validate: () => boolean;
}

export const PerfilForm = React.memo(
  forwardRef<PerfilFormHandle, PerfilFormProps>(function PerfilForm(
    { initialData, errors = {}, isSubmitting = false, readOnly = false },
    ref
  ) {
  

    const [formData, setFormData] = useState<InfoBasicPlayer>(initialData);
    const [formErrors, setFormErrors] =
      useState<Record<string, string>>(errors);
    const [tempImageFile, setTempImageFile] = useState<File | null>(null);
    useImperativeHandle(ref, () => ({
      getCurrentData: () => ({
        ...formData,
        // Include the temp image file in the returned data
        tempImageFile, // This will be used for upload later
      }),
      validate: () => {
        const newErrors = validatePerfilForm(formData);
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
    }));

    useEffect(() => {
      console.log("FormData", formData);
    });
    // Helper function to calculate age from birth date
    const calculateAge = (birthDate: string): number => {
      if (!birthDate) return 0;

      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      return age;
    };

    // Helper function to calculate approximate birth date from age
    const calculateBirthDate = (age: number): string => {
      if (!age || age < 0) return "";

      const today = new Date();
      const birthYear = today.getFullYear() - age;
      const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

      return birthDate.toISOString().split("T")[0];
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!readOnly) {
        const { id, value, type } = e.target;
        const processedValue = type === "number" ? Number(value) : value;

        // Create updated data with new value
        let updatedData = {
          ...formData,
          [id]: processedValue,
        };

        // Auto-calculate age or birth date based on which field was changed
        if (id === "birthDate" && value) {
          // When birth date changes, calculate age
          const calculatedAge = calculateAge(value);
          updatedData = {
            ...updatedData,
            age: calculatedAge,
          };
        } else if (id === "age" && Number(processedValue) > 0) {
          // When age changes, calculate approximate birth date
          const calculatedBirthDate = calculateBirthDate(
            Number(processedValue)
          );
          updatedData = {
            ...updatedData,
            birthDate: calculatedBirthDate,
          };
        }

        // Validate the new data
        const newErrors = validatePerfilForm(updatedData);
        setFormErrors(newErrors);

        console.log("id", id, "value", value, "type", type);
        console.log("newErrors", id);

        // Update form data with the new values
        setFormData(updatedData);
      }
    };

    const handleRoleChange = useCallback(
      (option: any | null) => {
        const value = option?.value || "";

        const isCapitan = value === "CAPITAN";
        console.log("value", value);
        if (!readOnly) {
          const updatedData = {
            ...formData,
            role: value,
            isCaptain: isCapitan,
          };
          setFormData(updatedData);

          const newErrors = validatePerfilForm(updatedData);
          setFormErrors(newErrors);
        }
      },
      [formData, readOnly]
    );

    const imageUploadRef = useRef<{ selectedFile: File | null }>({
      selectedFile: null,
    });
    // useEffect(() => {
    //   setFormData(initialData);
    // }, [initialData]);

    const handleImageChange = (file: File | null, previewUrl: string) => {
      console.log("file");
      setTempImageFile(file);
      setFormData((prev) => ({
        ...prev,
        photoUrl: previewUrl || "", // Use preview URL for immediate display
      }));
    };

    const captureSelectedFile = (file: File | null) => {
      if (file) {
        // Create a local URL for the selected file
        const localUrl = URL.createObjectURL(file);

        setFormData((prev) => ({
          ...prev,
          photoUrl: localUrl || "", // Use preview URL for immediate display
        }));
        console.log(
          "Image file selected:",
          imageUploadRef.current?.selectedFile
        );
        if (imageUploadRef.current) {
          imageUploadRef.current.selectedFile = file;
        }
      }
    };
    const selectedRoleValue = formData.isCaptain ? "CAPITAN" : "PLAYER";

    return (
      <form className="w-full h-full flex flex-col p-4 sm:p-6">
        <div className="relative h-[100px] w-full flex items-center justify-center mb-4">
          <ImageUploadWithRef
            ref={imageUploadRef}
            imageUrl={
              formData?.photoUrl ||
              "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/logo.png"
            }
            onFileSelect={captureSelectedFile}
            folder={SupabaseFolder.PLAYER}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full 
                    bg-yellow-100 dark:bg-gray-800 
                    flex items-center justify-center overflow-hidden 
                    border-2 border-company-green dark:border-company-green 
                    hover:border-company-yellow dark:hover:border-company-yellow 
                    transition-all duration-300"
          />
        </div>

        <FormInput
          id="firstName"
          label="Nombre"
          type="text"
          placeholder="Carlos Josue"
          value={formData.firstName}
          onChange={handleInputChange}
          error={formErrors.firstName}
          disabled={readOnly || isSubmitting}
          className={inputBaseStyles}
        />

        <FormInput
          id="lastName"
          label="Apellido"
          type="text"
          placeholder="Tu apellido"
          value={formData.lastName}
          onChange={handleInputChange}
          error={formErrors.lastName}
          disabled={readOnly || isSubmitting}
          className={inputBaseStyles}
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="ejemplo@gmail.com"
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          disabled={readOnly || isSubmitting}
          className={inputBaseStyles}
        />

        <NeonSelect
          className="h-[30px] mt-1 mb-9"
          id="role"
          label="Role"
          options={roleOptions}
          onChange={handleRoleChange}
          placeholder="Selecciona un rol"
          value={
            roleOptions.find((opt) => opt.value === selectedRoleValue) || null
          }
          disabled={readOnly || isSubmitting}
          error={formErrors.role}
        />

        <div className="flex w-full h gap-4 mt-9 mb-3">
          <FormInput
            className={inputBaseStyles}
            id="age"
            label="Edad"
            type="number"
            placeholder="Edad"
            value={formData.age}
            onChange={handleInputChange}
            error={formErrors.age}
            disabled={readOnly || isSubmitting}
          />

          <FormInput
            className={inputBaseStyles}
            id="birthDate"
            label="Fecha de nacimiento"
            type="date"
            value={formData.birthDate}
            onChange={handleInputChange}
            error={formErrors.birthDate}
            disabled={readOnly || isSubmitting}
          />
        </div>
      </form>
    );
  })
);
