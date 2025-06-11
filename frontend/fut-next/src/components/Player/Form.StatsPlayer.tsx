"use client";
import {
  StatsFormData,
  StatsFormHandle,
} from "@/components/PlayerManagment/types/TypesPlayer";
import { FormInput } from "../common";
import { NeonSelect, SelectOption } from "../common/Common.Select";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { validateStatsForm } from "@/app/utils/Zod/Validations/Form.Actions";
import { inputBaseStyles } from "../common/Common.FormStyles";
import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/store";

interface StatsFormProps {
  initialData: StatsFormData;
  onNext?: (data: StatsFormData) => boolean;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
}

export const StatsForm = memo(
  forwardRef<StatsFormHandle, StatsFormProps>(function StatsForm(
    { initialData, errors = {}, isSubmitting = false },
    ref
  ) {
    const captionSelected = useSelector(
      (state: RootState) => state.cards.captionSelected
    );
    const [formData, setFormData] = useState<StatsFormData>(initialData);

    // Expose the getCurrentData function to parent via ref
    useImperativeHandle(ref, () => ({
      getCurrentData: () => formData,
    }));

    const handleTeamChange = useCallback(
      (option: SelectOption<string> | null) => {
        if (!isSubmitting) {
          const value = option?.value || "";
          const updatedData = { ...formData, team: value };
          setFormData(updatedData);
          validateStatsForm(updatedData);
        }
      },
      [formData, isSubmitting]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSubmitting) {
          const { id, value } = e.target;

          const updatedData: StatsFormData = {
            ...formData,
            [id]: Number(value),
          };

          const validationErrors = validateStatsForm(updatedData);

          const updatedWithError: StatsFormData = {
            ...updatedData,
            error: validationErrors[id] ?? "", // Only show error for the field being edited
          };

          setFormData(updatedWithError);
        }
      },
      [formData, isSubmitting]
    );

    const handleStatusChange = useCallback(
      (option: SelectOption<string> | null) => {
        if (!isSubmitting) {
          const value = option?.value || "";
          const updatedData = { ...formData, playerStatus: value };
          setFormData(updatedData);
          const newErrors = validateStatsForm(updatedData);
        }
      },
      [formData, isSubmitting]
    );

    const statusOptions = [
      { label: "ACTIVO", value: "ACTIVO" },
      { label: "Inactive", value: "Inactive" },
      { label: "Injured", value: "Injured" },
    ];

    return (
      <form className="w-full h-full flex flex-col p-4 sm:p-6">
        <div className="flex w-full gap-4 mb-3">
          <FormInput
            id="jerseyNumber"
            label="Jersey Number"
            type="number"
            value={formData.jerseyNumber ?? ""}
            onChange={handleInputChange}
            placeholder="10"
            error={errors.jersey}
            disabled={isSubmitting}
            className={inputBaseStyles}
          />
          <FormInput
            id="goals"
            label="Goals"
            type="number"
            value={formData.goals ?? ""}
            onChange={handleInputChange}
            placeholder="10"
            error={errors.goals}
            disabled={isSubmitting}
            className={inputBaseStyles}
          />
        </div>

        <div className="flex w-full gap-4 mb-3">
          <FormInput
            id="points"
            label="Points"
            type="number"
            value={formData.points ?? ""}
            onChange={handleInputChange}
            placeholder="10"
            error={errors.points}
            disabled={isSubmitting}
            className={inputBaseStyles}
          />
          <NeonSelect
            id="status"
            label="Status"
            options={statusOptions}
            value={
              statusOptions.find(
                (opt) => opt.value === formData.playerStatus
              ) || null
            }
            onChange={handleStatusChange}
            error={errors.status}
            disabled={isSubmitting}
            // className={inputBaseStyles}
          />
        </div>

        <div className="flex w-full gap-4 mb-3">
          <FormInput
            id="yellowCards"
            label="Yellow Cards"
            type="number"
            value={formData.yellowCards ?? ""}
            onChange={handleInputChange}
            placeholder="0"
            error={errors.yellowCards}
            disabled={isSubmitting}
            className={inputBaseStyles}
          />
          <FormInput
            id="redCards"
            label="Red Cards"
            type="number"
            value={formData.redCards ?? ""}
            onChange={handleInputChange}
            placeholder="0"
            error={errors.redCards}
            disabled={isSubmitting}
            className={inputBaseStyles}
          />
        </div>
      </form>
    );
  })
);
