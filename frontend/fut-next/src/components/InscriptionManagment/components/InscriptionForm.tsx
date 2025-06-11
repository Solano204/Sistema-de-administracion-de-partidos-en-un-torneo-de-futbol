// File: src/app/features/inscription/components/InscriptionForm.tsx
"use client";
import { memo, useState } from "react";
import { FormInput } from "@/components/common";
import { InscriptionInfoRecord, InscriptionValidationErrors } from "../types/inscription-types";
import { formatDateForInput } from "../utils/inscription-validation";

type InscriptionFormProps = {
  formData: Partial<InscriptionInfoRecord>;
  errors: InscriptionValidationErrors;
  isValid: boolean;
  isProcessing: boolean;
  modalMode: "create" | "edit";
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (formData: Partial<InscriptionInfoRecord>) => Promise<void>;
  onCancel: () => void;
};

export const InscriptionForm = memo(function InscriptionForm({
  formData,
  errors,
  isValid,
  isProcessing,
  modalMode,
  onInputChange,
  onSubmit,
  onCancel,
}: InscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isProcessing) return;
    setIsSubmitting(true);
    
    try {
      // Call the parent onSubmit method with the form data
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
return (
    <form onSubmit={handleFormSubmit} className="space-y-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {modalMode === "edit" && (
          <FormInput
            id="id"
            label="ID de inscripción"
            type="text"
            name="id"
            value={formData.id || ""}
            onChange={onInputChange}
            error={errors.id?.[0]}
            disabled={true}
            className="bg-gray-100 dark:bg-gray-800"
          />
        )}
        
        <FormInput
          id="nameTeam"
          label="Nombre del equipo"
          type="text"
          name="nameTeam"
          value={formData.nameTeam || ""}
          onChange={onInputChange}
          error={errors.nameTeam?.[0]}
          required
        />
        
        <FormInput
          id="numPlayer"
          label="Número de jugadores"
          type="number"
          name="numPlayer"
          placeholder="0"
          value={formData.numPlayer?.toString() || ""}
          onChange={onInputChange}
          error={errors.numPlayer?.[0]}
          min={0}
          step="1"
          required
        />
        
        <FormInput
          id="date"
          label="Fecha de inscripción"
          type="date"
          name="date"
          value={formData.date ? formatDateForInput(formData.date) : ""}
          onChange={onInputChange}
          error={errors.date?.[0]}
          required
        />
        
        <FormInput
          id="amount"
          label="Monto"
          type="number"
          name="amount"
          placeholder="0.00"
          value={formData.amount?.toString() || ""}
          onChange={onInputChange}
          error={errors.amount?.[0]}
          min={0}
          step="0.01"
          required
        />
      </div>

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
              "Crear inscripción"
          ) : (
            "Actualizar inscripción"
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