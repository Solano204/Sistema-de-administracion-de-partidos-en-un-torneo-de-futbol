"use client";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { PerfilForm, PerfilFormHandle } from "./Form.Information";
import { InfoBasicPlayer } from "@/components/PlayerManagment/types/TypesPlayer";

const defaultFormData: InfoBasicPlayer = {
  firstName: "",
  lastName: "",
  photoUrl: "",
  isCaptain: false,
  email: "",
  role: "PLAYER",
  age: 0,
  birthDate: "",
  error: "",
};
export interface NeonInformationCardHandle {
  getCurrentData: () => InfoBasicPlayer;
}

interface NeonInformationCardProps {
  initialData?: InfoBasicPlayer;
  errors?: Record<string, string>;
  readOnly?: boolean;
}

export const NeonInformationCard = forwardRef<NeonInformationCardHandle, NeonInformationCardProps>(
  function NeonInformationCard(
    {
      initialData = defaultFormData,
      errors = {},
      readOnly = false,
    },
    ref
  ) {
    const perfilFormRef = useRef<PerfilFormHandle>(null);

    useImperativeHandle(ref, () => ({
      getCurrentData: () => {
        return perfilFormRef.current?.getCurrentData() ?? defaultFormData;
      },
    }));

    return (
        <div className="flex w-full h-full items-center justify-center rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 font-['Poppins'] transition-all duration-300">
          <div className="w-full max-w-md mx-auto p-4 sm:p-6">
            <PerfilForm
              ref={perfilFormRef}
              initialData={initialData}
              errors={errors}
              readOnly={readOnly}
            />
          </div>
        </div>
    );
  }
);