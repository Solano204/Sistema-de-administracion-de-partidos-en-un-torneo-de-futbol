"use client";
import React, { Suspense } from "react"; // Import Suspense and lazy
import { Input } from "../ui/input";
import { FormContainer, SubmitButton } from "../ui/Form";
import { actionFunctionSync } from "@/app/utils/Types/TypesAction";

import {
  clearState,
  setBeginninState,
  setBeginnninTeam,
  setChages,
  setForms,
  setNumberOfCards,
  setTeamData,
} from "@/app/Redux/feature/Card/cardSlice";
import { useDispatch } from "react-redux";
import { InfoPlayerForm } from "@/components/PlayerManagment/types/TypesPlayer";
import clsx from "clsx";
import { redirect, useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import SwitchComponent from "../ui/Form/Plus";
import { ButtonAdd } from ".";
import { TbCancel } from "react-icons/tb";
import { buildRedirectUrl } from "@/components/TeamManagment/api/Mapper";
import {
  formContainer,
  inputBaseStyles,
  submitButtonStyles,
} from "../common/Common.FormStyles";
import { IoSave } from "react-icons/io5";

// La y-load the FormCard component

type dataTeam = {
  name: string;
  numMembers: number;
};

export const FormCard = () => {
  const params = useParams();
  const categoryId = params.id as string;
  const dispatch = useDispatch();
  const handleGenerateCards: actionFunctionSync = (state, formData) => {
    const count = parseInt(formData.get("numMembers") as string, 10);
    const newName = formData.get("nameTeam") as string;
    if (!isNaN(count) && count > 0) {
      console.log("count", count);

      const dataForm = {
        name: newName,
        numMembers: count,
        goals: 0,
        goalsReceived: 0,
        points: 0,
        matches: 0,
        id: uuidv4(),
        logo: "",
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        qualified: false,
        categoryId: categoryId,
      };

      dispatch(setTeamData(dataForm));

      const newTeamData = {
        ...dataForm,
        name: "",
        id: "", // Fixed: using colon instead of equals sign
      };

      dispatch(setBeginnninTeam(newTeamData));
      const emptyForms: InfoPlayerForm[] = Array.from(
        { length: count },
        () => ({
          playerId: uuidv4(),
          firstName: "newPlayer",
          lastName: "",
          email: "",
          age: 0,
          photoUrl: "/Images/logo.png",
          birthDate: new Date().toISOString().split("T")[0], // format to YYYY-MM-DD
          jerseyNumber: 0,
          goals: 0,
          points: 0,
          yellowCards: 0,
          redCards: 0,
          playerStatus: "",
          captain: false,
          teamId: dataForm.id,
          teamName: "",
        })
      );

      dispatch(setNumberOfCards(count));

      dispatch(setForms(emptyForms)); // Update the forms slice with empty items
      dispatch(setBeginninState(emptyForms));
      dispatch(setChages(1));
    }

    return { message: "Cards generated successfully!", success: true };
  };

  const cancelOperation = async () => {
    // No need to call any API, just invalidate the teams query to ensure fresh data

    const redirectUrl = buildRedirectUrl();
    dispatch(clearState());
    redirect(redirectUrl);
  };
  return (
    <Suspense
      fallback={
        <div className="text-gray-800 dark:text-gray-200">Loading Form...</div>
      }
    >
      <FormContainer action={handleGenerateCards} className={clsx("p-5 flex flex-col gap-4")}>
        <div className="flex  flex-col gap-2  w-full text-center h-full">
          <label className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Nombre del equipo
          </label>
          <Input type="text" name="nameTeam" className={inputBaseStyles} />
        </div>

        <div className="flex flex-col gap-2 w-full text-center h-full">
          <label className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Numero de integrantes?
          </label>
          <Input type="number" name="numMembers" className={inputBaseStyles} />
        </div>

        <div className="mt-7 flex items-center justify-center gap-4 w-full ">

           <ButtonAdd
            className={clsx(
              submitButtonStyles,
              "hover:bg-gradient-to-tr hover:from-red-500/20 hover:to-red-600/40 dark:hover:bg-gradient-to-tr dark:hover:from-red-700/30 "
            )}
            onClick={() => cancelOperation()}
            icon={<TbCancel />}
          />
          <SubmitButton
            className={clsx(
              submitButtonStyles,
              "hover:bg-gradient-to-tr hover:from-green-500/20 hover:to-green-600/40 dark:hover:bg-gradient-to-tr dark:hover:from-green-700/30 "
            )}
            logo={<IoSave />}
          />
         
        </div>
      </FormContainer>
    </Suspense>
  );
};
