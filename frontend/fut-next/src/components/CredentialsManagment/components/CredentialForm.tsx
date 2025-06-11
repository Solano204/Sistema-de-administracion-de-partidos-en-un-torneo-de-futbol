// File: src/app/features/credential/components/CredentialForm.tsx
"use client";
import { memo, useState } from "react";
import { FormInput } from "@/components/common";
import { CredentialInfoRecord, CredentialValidationErrors } from "../types/credential-types";

import clsx from "clsx";

type CredentialFormProps = {
  formData: Partial<CredentialInfoRecord>;
  errors: CredentialValidationErrors;
  isValid: boolean;
  isProcessing: boolean;
  modalMode: "create" | "edit";
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (formData: Partial<CredentialInfoRecord>) => Promise<void>;
  onCancel: () => void;
};

export const CredentialForm = memo(function CredentialForm({
  formData,
  errors,
  isValid,
  isProcessing,
  modalMode,
  onInputChange,
  onSubmit,
  onCancel,
}: CredentialFormProps) {
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
            label="ID de la credencial"
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
          id="playerName"
          label="Nombre del jugador"
          type="text"
          name="playerName"
          value={formData.playerName || ""}
          onChange={onInputChange}
          error={errors.playerName?.[0]}
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
     
        <FormInput
          id="createdAt"
          label="Fecha de creación"
          type="Date"
          name="createdAt"
          value={formData.createdAt}
          onChange={onInputChange}
          error={errors.transactionDate?.[0]}
          required
        />

        <FormInput
          id="updatedAt"
          label="Fecha de actualización"
          type="Date"
          name="updatedAt"
          value={formData.updatedAt}
          onChange={onInputChange}
          error={errors.transactionDate?.[0]}
          required
        />

        <div className="md:col-span-2">
          <FormInput
            id="description"
            label="Descripción"
            type="text"
            name="description"
              placeholder="Ingrese una descripción para esta credencial"
            value={formData.description || ""}
            onChange={onInputChange}
            error={errors.description?.[0]}
            maxLength={255}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className={clsx(
            "px-4 py-2 rounded transition-colors",
            "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700",
            "text-white",
            (isSubmitting || isProcessing) && "opacity-50 cursor-not-allowed"
          )}
          disabled={isSubmitting || isProcessing}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isProcessing || !isValid}
          className={clsx(
            "px-4 py-2 rounded transition-colors flex items-center justify-center gap-2",
            "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
            "text-white",
            (isSubmitting || isProcessing || !isValid) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting || isProcessing ? (
            <>
              <LoadingSpinner />
              Procesando...
            </>
          ) : modalMode === "create" ? (
            "Crear credencial"
          ) : (
            "Actualizar credencial"
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