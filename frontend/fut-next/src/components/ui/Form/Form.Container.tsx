"use client";

import React, { useActionState } from "react";
import {
  actionFunctionAsync,
  actionFunctionSync,
} from "@/app/utils/Types/TypesAction";
import { useRouter } from "next/navigation";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { toast as sonnerToast } from "sonner";

const initialState = {
  message: "",
  success: false,
};

export function FormContainer({
  action,
  children,
  className,
}: {
  action: actionFunctionAsync | actionFunctionSync;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const router = useRouter(); // Initialize useRouter

  React.useEffect(() => {
    if (state.message) {
      if (state.success) {
        // Display a custom success toast with a duration of 5 seconds
        toastCustom(
          {
            title: "Success",
            description: state.message,
            button: {
              label: "Dismiss",
              onClick: () => sonnerToast.dismiss(),
            },
          },
          "success", // Toast type
          5000 // 5 seconds
        );
      } else {
        // Display a custom error toast with a duration of 7 seconds
        toastCustom(
          {
            title: "Error",
            description: state.message,
            button: {
              label: "Dismiss",
              onClick: () => sonnerToast.dismiss(),
            },
          },
          "error", // Toast type
          7000 // 7 seconds
        );
      }
    }
  }, [state]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
