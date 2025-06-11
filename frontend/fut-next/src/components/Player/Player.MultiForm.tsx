"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MultiStepForm } from "../common";
import {
  NeonStatsPlayerCard,
  NeonStatsPlayerCardHandle,
} from "./Form.CardStatsPlayer";
import {
  NeonInformationCard,
  NeonInformationCardHandle,
} from "../common/Form.CardInformation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/Redux/store";
import {
  validatePerfilForm,
  validateStatsForm,
} from "@/components/PlayerManagment/validation/Form.Actions";

import { deleteForm, replaceForm, setChages, setCurrentModalKey, setNumberOfCards } from "@/app/Redux/feature/Card/cardSlice";
import {
  InfoPlayerForm,
  STATUSPLAYER,
} from "@/components/PlayerManagment/types/TypesPlayer";
interface ModalProps {
  onClose: () => void;
}
export function MultiStepLoaderForm( { onClose }: ModalProps) {
  const dispatch = useDispatch();
  const numberCards = useSelector((state: RootState) => state.cards.numberOfCards);
  const currentForms = useSelector((state: RootState) => state.cards.forms);
  const currentModalKey = useSelector(
    (state: RootState) => state.cards.currentModalKey
  );

  const currentPlayer = currentForms.find(
    (form: any) => form.playerId === currentModalKey
  );

  const prevPlayerKeyRef = useRef<string>("");
  const perfilCardRef = useRef<NeonInformationCardHandle>(null);
  const statsCardRef = useRef<NeonStatsPlayerCardHandle>(null);

  // Reset form when player changes
  useEffect(() => {
    if (currentPlayer?.playerId !== prevPlayerKeyRef.current) {
      setFormData(getInitialFormData());
      setPerfilErrors({});
      setStatsErrors({});
      prevPlayerKeyRef.current = currentPlayer?.playerId || "";
    }
  }, [currentPlayer]);

  const getInitialFormData = useCallback(
    () => ({
      playerId: currentPlayer?.playerId || "",
      firstName: currentPlayer?.firstName || "",
      lastName: currentPlayer?.lastName || "",
      email: currentPlayer?.email || "",
      age: currentPlayer?.age || 0,
      photoUrl: currentPlayer?.photoUrl || "",
      birthDate: currentPlayer?.birthDate || "",
      jerseyNumber: currentPlayer?.jerseyNumber || 0,
      goals: currentPlayer?.goals || 0,
      points: currentPlayer?.points || 0,
      yellowCards: currentPlayer?.yellowCards || 0,
      redCards: currentPlayer?.redCards || 0,
      playerStatus: currentPlayer?.playerStatus || "",
      captain: currentPlayer?.captain || false,
      teamId: currentPlayer?.teamId || "",
      teamName: currentPlayer?.teamName || "",
      error: "",
    }),
    [currentPlayer]
  );

  const [formData, setFormData] = useState(getInitialFormData());
  const [perfilErrors, setPerfilErrors] = useState<Record<string, string>>({});
  const [statsErrors, setStatsErrors] = useState<Record<string, string>>({});

  const handlePerfilNext = useCallback(() => {
    if (!perfilCardRef.current) return false;

    // Validate the form

    const current = perfilCardRef.current.getCurrentData();

    setFormData((prev) => ({ ...prev, ...current, captain: current.isCaptain }));
    console.log("data", formData);
    const validation: Record<string, string> = validatePerfilForm(current);
    if (Object.keys(validation).length > 0) {
      console.log("current", current);
      console.log("errors", validation);
      setPerfilErrors(validation);
      return false;
    }

    setPerfilErrors({});
    return true;
  }, []);

  const handleStatsNext = useCallback(() => {
    if (!statsCardRef.current) return false;

    // Validate the form
    const current = statsCardRef.current.getCurrentData();
    const updatedData = {
      ...current,
      jerseyNumber: current.jerseyNumber as number,
      status: current.playerStatus as STATUSPLAYER,
    };
    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }));

    const validation: Record<string, string> = validateStatsForm(updatedData);
    if (Object.keys(validation).length > 0) {
      const errors = validateStatsForm({
        ...current,
        status: current.playerStatus as STATUSPLAYER,
      });
      setStatsErrors(errors);
      console.log("errors", errors);
      console.log("current", current);
      return false;
    }

    setStatsErrors({});
    return true;
  }, []);

  const handleStepChange = useCallback(
    async (currentStep: number): Promise<boolean> => {
      let isValid = false;

      if (currentStep === 0) {
        isValid = await handlePerfilNext();
      } else if (currentStep === 1) {
        isValid = await handleStatsNext();
      }

      return isValid;
    },
    [handlePerfilNext, handleStatsNext]
  );

  function handleSubmit(
    prevState: any,
    formDat: FormData
  ): { message: string; success: boolean } {
    if (!statsCardRef.current) return { message: "", success: false };
    const current = statsCardRef.current.getCurrentData();
    const updatedData = {
      ...current,
      jerseyNumber: current.jerseyNumber,
      status: current.playerStatus as STATUSPLAYER,
    };
    console.log("updatedData", updatedData);
    // Use the callback form to ensure we have the latest state
    onClose();
    setFormData((prev) => {
      const newData = {
        ...prev,
        ...updatedData,
      };
      return newData;
    });



    try {
      const playerData: InfoPlayerForm = {
        ...(currentPlayer || {}),
        playerId: currentPlayer?.playerId || "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        age: formData.age,
        photoUrl: formData.photoUrl,
        birthDate: formData.birthDate,
        jerseyNumber: updatedData.jerseyNumber,
        goals: updatedData.goals,
        points: updatedData.points,
        yellowCards: updatedData.yellowCards,
        redCards: updatedData.redCards,
        playerStatus: updatedData.status,
        captain: formData.captain || false, 
        teamId: currentPlayer?.teamId || "",
        teamName: "",
      };

      console.log("playerData", playerData);
      dispatch(replaceForm(playerData));
      // return { success: true };
    } catch (error) {
      console.error("Form submission failed:", error);
      // return { success: false, error };
    }

    return { message: "json", success: true }; // Ensures correct return type
  }

  const steps = useMemo(
    () => [
      {
        title: "Personal Info",
        subtitle: "Player Details",
        content: () => (
          <NeonInformationCard
            ref={perfilCardRef}
            initialData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              photoUrl: formData.photoUrl,
              age: formData.age,
              birthDate: formData.birthDate,
              role: "PLAYER", // Add this line
              error: "",
              isCaptain: formData.captain
            }}
            errors={perfilErrors}
          />
        ),
        validate: () => perfilErrors,
      },
      {
        title: "Player Stats",
        subtitle: "Performance Information",
        content: () => (
          <NeonStatsPlayerCard
            ref={statsCardRef}
            initialData={{
              team: formData.teamName,
              jerseyNumber: formData.jerseyNumber,
              goals: formData.goals,
              points: formData.points,
              playerStatus: formData.playerStatus,
              yellowCards: formData.yellowCards,
              redCards: formData.redCards,
              error: "",
            }}
            errors={statsErrors}
          />
        ),
        validate: () => statsErrors,
      },
    ],
    [formData, perfilErrors, statsErrors]
  );
  const handleDeleteForm = (key: string ) => {
    dispatch(deleteForm(key));
    dispatch(setChages(1));
    dispatch(setNumberOfCards(numberCards - 1));
    setCurrentModalKey("");
    onClose();
  };
  return (
    <>

      <MultiStepForm
        steps={steps}
        deleteItem={handleDeleteForm}
        currentStepValid={true}
        handleSubmit={handleSubmit}
        onStepChange={handleStepChange}
      />
    </>
  );
}
