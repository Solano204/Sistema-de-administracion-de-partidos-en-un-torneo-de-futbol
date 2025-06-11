"use client";
import React, { forwardRef } from "react";
import { StatsFormData, StatsFormHandle } from "@/components/PlayerManagment/types/TypesPlayer";
import { StatsForm } from "./Form.StatsPlayer";

interface NeonStatsPlayerCardProps {
  initialData?: StatsFormData;
  onNext?: (data: StatsFormData) => boolean;
  errors?: Record<string, string>;
}

export interface NeonStatsPlayerCardHandle {
  getCurrentData: () => StatsFormData;
}

export const NeonStatsPlayerCard = forwardRef<
  NeonStatsPlayerCardHandle,
  NeonStatsPlayerCardProps
>(function NeonStatsPlayerCard(
  {
    initialData = {
      team: "",
      jerseyNumber: 0,
      goals: 0,
      points: 0,
      playerStatus: "",
      yellowCards: 0,
      redCards: 0,
      error: "",
    },
    onNext = () => true,
    errors = {},
  },
  ref
) {
  const statsFormRef = React.useRef<StatsFormHandle>(null);

  // Expose the getCurrentData function to parent via ref
  React.useImperativeHandle(ref, () => ({
    getCurrentData: () => {
      return statsFormRef.current?.getCurrentData() ?? initialData;
    },
  }));

  return (
    <div className="flex w-full h-full items-center justify-center rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 font-['Poppins'] transition-all duration-300">
        <div className="w-full max-w-md mx-auto p-4 sm:p-6">
          <StatsForm
            ref={statsFormRef}
            initialData={initialData}
            onNext={onNext}
            errors={errors}
            // readOnly={readOnly}
          />
        </div>
      </div>
  );
});

NeonStatsPlayerCard.displayName = "NeonStatsPlayerCard";