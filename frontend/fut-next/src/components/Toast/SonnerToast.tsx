"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";

/** A reusable custom toast function */
export function toastCustom(
  toast: Omit<ToastProps, "id">,
  type: "success" | "error" | "warning" | "info" = "success",
  duration: number = 10000
) {
  return sonnerToast.custom(
    (id) => (
      <Toast
        id={id}
        title={toast.title}
        description={toast.description}
        button={{
          label: toast.button.label,
          onClick: () => {
            toast.button.onClick();
            sonnerToast.dismiss(id);
          },
        }}
        type={type}
      />
    ),
    { duration }
  );
}

/** Enhanced custom toast component with your design */
function Toast(
  props: ToastProps & { type: "success" | "error" | "warning" | "info" }
) {
  const { title, description, button, id, type } = props;

  const toastStyles = {
    success: {
      bgColor: "bg-green-100 dark:bg-green-900",
      borderColor: "border-l-4 border-green-500 dark:border-green-700",
      textColor: "text-green-900 dark:text-green-100",
      icon: (
        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-300" />
      ),
      buttonColor: "bg-green-600 hover:bg-green-700 text-white",
    },
    error: {
      bgColor: "bg-red-100 dark:bg-red-900",
      borderColor: "border-l-4 border-red-500 dark:border-red-700",
      textColor: "text-red-900 dark:text-red-100",
      icon: (
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300" />
      ),
      buttonColor: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      borderColor: "border-l-4 border-yellow-500 dark:border-yellow-700",
      textColor: "text-yellow-900 dark:text-yellow-100",
      icon: (
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-300" />
      ),
      buttonColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      bgColor: "bg-blue-100 dark:bg-blue-900",
      borderColor: "border-l-4 border-blue-500 dark:border-blue-700",
      textColor: "text-blue-900 dark:text-blue-100",
      icon: (
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
      ),
      buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const { bgColor, borderColor, textColor, icon, buttonColor } =
    toastStyles[type];

  return (
    <div
      className={`${bgColor} ${borderColor} ${textColor} rounded-lg p-4 flex flex-col gap-3 w-full max-w-md relative overflow-hidden transition duration-300 ease-in-out transform hover:scale-[1.01]`}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent ${
          type === "success"
            ? "to-green-200 dark:to-green-800"
            : type === "error"
            ? "to-red-200 dark:to-red-800"
            : type === "warning"
            ? "to-yellow-200 dark:to-yellow-800"
            : "to-blue-200 dark:to-blue-800"
        } opacity-40 pointer-events-none`}
      ></div>

      <div className="flex items-start gap-3 relative z-10">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs mt-1">{description}</p>}
        </div>
      </div>

      {button && (
        <div className="flex justify-end relative z-10">
          <button
            className={`${buttonColor} text-xs font-medium rounded px-3 py-1 transition-colors`}
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button.label}
          </button>
        </div>
      )}
    </div>
  );
}

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  button: {
    label: string;
    onClick: () => void;
  };
}
