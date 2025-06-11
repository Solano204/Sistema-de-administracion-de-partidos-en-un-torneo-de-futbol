"use client";
// File: src/app/features/debt/components/DebtForm.tsx
import { memo, useState } from "react";
import { FormInput } from "@/components/common";
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import { DebtRecordDto, DebtStatus, DebtValidationErrors } from "../types/debt-types";

// Status options for the select dropdown
const statusOptions: SelectOption<DebtStatus>[] = [
  { label: "Pending", value: DebtStatus.PENDIENTE },
  { label: "Paid", value: DebtStatus.PAGADO },
];

type DebtFormProps = {
  formData: Partial<DebtRecordDto>;
  errors: DebtValidationErrors;
  isValid: boolean;
  isProcessing: boolean;
  modalMode: "create" | "edit";
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (status: DebtStatus | null) => void;
  onSubmit: (formData: Partial<DebtRecordDto>) => Promise<void>;
  onCancel: () => void;
};

export const DebtForm = memo(function DebtForm({
  formData,
  errors,
  isValid,
  isProcessing,
  modalMode,
  onInputChange,
  onStatusChange,
  onSubmit,
  onCancel,
}: DebtFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle status select change
  const handleStatusSelect = (option: SelectOption<DebtStatus> | null) => {
    if (option) {
      onStatusChange(option.value);
    }
  };

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

  // Get the currently selected status
  const selectedStatus = statusOptions.find(option => option.value === formData.state) || statusOptions[0];
return (
    <form onSubmit={handleFormSubmit} className="space-y-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <FormInput
          id="IdProperty"
            label="ID del jugador"
          type="text"
          name="IdProperty"
          value={formData.IdProperty || ""}
          onChange={onInputChange}
          error={errors.IdProperty?.[0]}
          disabled={true}
          className="bg-gray-100 dark:bg-gray-800"
        />
        
        <FormInput
          id="nameProperty"
          label="Nombre del jugador"
          type="text"
          name="nameProperty"
          value={formData.nameProperty || ""}
          onChange={onInputChange}
          error={errors.nameProperty?.[0]}
          disabled={true}
          className="bg-gray-100 dark:bg-gray-800"
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
        
        <div className="md:col-span-2">
          <FormInput
            id="description"
            label="Descripción"
            type="text"
            name="description"
            placeholder="Ingrese una descripción para este deuda"
            value={formData.description || ""}
            onChange={onInputChange}
            error={errors.description?.[0]}
            maxLength={255}
            required
          />
        </div>
        
        <FormInput
          id="dueDate"
          label="Fecha de vencimiento"
          type="date"
          name="dueDate"
          value={formData.dueDate || ""}
          onChange={onInputChange}
          error={errors.dueDate?.[0]}
          required
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estado
          </label>
          <NeonSelect
            id="state"
            options={statusOptions}
            value={selectedStatus}
            onChange={handleStatusSelect}
            placeholder="Seleccionar estado"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state[0]}</p>
          )}
        </div>
        
        {/* Paid Date - Only shown if status is PAGADO */}
        {formData.state === DebtStatus.PAGADO && (
          <FormInput
            id="paidDate"
            label="Fecha de pago"
            type="date"
            name="paidDate"
            value={formData.paidDate || new Date().toISOString().split("T")[0]}
            onChange={onInputChange}
            error={errors.paidDate?.[0]}
          />
        )}
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
              Cargando...
            </>
          ) : modalMode === "create" ? (
              "Crear deuda"
          ) : (
            "Actualizar deuda"
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