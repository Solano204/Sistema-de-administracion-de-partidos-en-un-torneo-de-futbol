// File: src/app/features/payment/components/PaymentForm.tsx
"use client";
import { memo, useState } from "react";
import { FormInput } from "@/components/common";
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import {
  RefereePaymentInput,
  PaymentValidationErrors,
} from "../types/payment-types";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { inputBaseStyles } from "@/components/common/Common.FormStyles";

// Opciones de moneda para el dropdown de selección
const currencyOptions: SelectOption<string>[] = [
  { label: "Dólar estadounidense (USD)", value: "USD" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "British Pound (GBP)", value: "GBP" },
  { label: "Japanese Yen (JPY)", value: "JPY" },
  { label: "Canadian Dollar (CAD)", value: "CAD" },
  { label: "Australian Dollar (AUD)", value: "AUD" },
  { label: "Swiss Franc (CHF)", value: "CHF" },
  { label: "Chinese Yuan (CNY)", value: "CNY" },
  { label: "Mexican Peso (MXN)", value: "MXN" },
];

export type PaymentFormProps = {
  formData: Partial<RefereePaymentInput>;
  refereeOptions: SelectOption<string>[];
  selectedReferee: SelectOption<string> | null;
  selectedCurrency: SelectOption<string> | null;
  errors: PaymentValidationErrors;
  isValid: boolean;
  isProcessing: boolean;
  modalMode: "create" | "edit";
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefereeChange: (option: SelectOption<string> | null) => void;
  onCurrencyChange: (option: SelectOption<string> | null) => void;
  onSubmit: (formData: Partial<RefereePaymentInput>) => Promise<void>;
  onCancel: () => void;
};

export const PaymentForm = memo(function PaymentForm({
  formData,
  refereeOptions,
  selectedReferee,
  selectedCurrency,
  errors,
  isValid,
  isProcessing,
  modalMode,
  onInputChange,
  onRefereeChange,
  onCurrencyChange,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isProcessing) return;
    setIsSubmitting(true);

    try {
      // Create a new ID for new payments if not provided
      if (modalMode === "create" && !formData.id) {
        formData.id = crypto.randomUUID();
      }

      // Call the parent onSubmit method with the updated form data
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to save payment: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleFormSubmit}
      className="p-15 space-y-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300"
    >
      {/* Referee Select */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          
        </label>
        <NeonSelect
          id="referee"
          options={refereeOptions}
          value={selectedReferee}
          onChange={onRefereeChange}
          placeholder="Select referee"
        />
        {errors["referee.id"] && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors["referee.id"][0]}
          </p>
        )}
      </div>

      {/* Payment Date */}
      <FormInput
        id="paymentDate"
        type="date"
        label="Payment Date"
        name="paymentDate"
        className={inputBaseStyles}
        value={formData.paymentDate || ""}
        onChange={onInputChange}
        error={errors.paymentDate?.[0]}
        required
      />

      {/* Hours Worked */}
      <FormInput
        id="hoursWorked"
        type="number"
        label="Hours Worked"
        name="hoursWorked"
        className={inputBaseStyles}
        value={formData.hoursWorked?.toString() || "0"}
        onChange={onInputChange}
        step="0.5"
        min="0"
        error={errors.hoursWorked?.[0]}
        required
      />

      {/* Hourly Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          className={inputBaseStyles}
          id="hourlyRate"
          type="number"
          label=""
          name="hourlyRate"
          value={formData.hourlyRate?.toString() || "0"}
          onChange={onInputChange}
          step="0.01"
          min="0"
          error={errors.hourlyRate?.[0]}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency
          </label>
          <NeonSelect
            id="currency"
            options={currencyOptions}
            value={selectedCurrency}
            onChange={onCurrencyChange}
            placeholder="Select currency"
          />
        </div>
      </div>

      {/* Total Amount (Calculated) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Total (Calculado)
        </label>
        <div className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          {formData.totalAmount?.toFixed(2) || "0.00"}{" "}
          {selectedCurrency?.value || "USD"}
        </div>
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
            "Crear Pago"
          ) : (
            "Actualizar Pago"
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
