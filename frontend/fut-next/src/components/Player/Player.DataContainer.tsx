"use client";

import React, { Suspense, useState, useEffect } from "react";
import { FormContainer, SubmitButton } from "../ui/Form";
import { Input } from "../ui/input";
import { actionFunctionSync } from "@/app/utils/Types/TypesAction";
import {
  deleteForm,
  setCurrentTempData,
} from "@/app/Redux/feature/Card/cardSlice";
import { useDispatch, useSelector } from "react-redux";
import { dataTeam } from "@/components/PlayerManagment/types/TypesPlayer";
import { RootState } from "@/app/Redux/store";
// import { Bar } from ".";
import clsx from "clsx";
import { validateTeamData } from "@/app/utils/Zod/Validations/Form.Actions"; // Import the validation function
import { submitButtonStyles } from "../common/Common.FormStyles";

export const DataContainer = () => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const dataTeam = useSelector((state: RootState) => state.cards.dataTeam);
 

  // Validate form on initial load
  useEffect(() => {
    if (dataTeam) {
      const errors = validateTeamData(dataTeam);
      setFormErrors(errors);
    }
  }, []);

  const handleGenerateCards: actionFunctionSync = (state, formData) => {
    setIsSubmitting(true);
    
    // Validate the entire form before submission
    const errors = validateTeamData(dataTeam);
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Form is valid, proceed with submission
      setIsSubmitting(false);
      return { message: "Team data saved successfully!", success: true };
    } else {
      // Form has errors
      setIsSubmitting(false);
      return { message: "Please fix the errors in the form", success: false };
    }
  };

  const handleInputChange = (field: keyof dataTeam, value: string | number | boolean) => {
    // Convert string values to numbers for number fields
    let processedValue = value;
    if (
      ["numMembers", "goals", "goalsReceived", "points", "matches", 
       "matchesWon", "matchesDrawn", "matchesLost"].includes(field) && 
      typeof value === "string"
    ) {
      processedValue = Number(value) || 0;
    }

    // Update the specific field of dataTeam
    const updatedData = {
      ...dataTeam,
      [field]: processedValue,
    };
    
    // Validate the updated data
    const errors = validateTeamData(updatedData);

    if (Object.keys(errors).length != 0) {
    }
    setFormErrors(errors);
    
    // Dispatch the updated data
    dispatch(setCurrentTempData(updatedData));
  };

  // Reusable input styles
  const inputStyles = clsx(
    "h-[40%] w-[70%] mx-auto mt-6", // Height, width, margin
    "input p-3 rounded-xl bg-[rgba(255,255,255,0.8)] border-2 border-[rgba(0,0,0,0.2)] backdrop-blur-sm", // Base styling
    "text-black placeholder-[rgba(0,0,0,0.7)] shadow-[0px_2px_4px_rgba(0,0,0,0.1),0px_7px_13px_rgba(0,0,0,0.1),inset_0px_-3px_0px_rgba(0,0,0,0.1)]", // Text and shadow
    "transition-all duration-300 ease-in-out transform-style-3d backface-hidden", // Transitions
    "hover:border-[rgba(0,0,0,0.4)] hover:bg-[rgba(255,255,255,1)] hover:scale-105 hover:rotate-y-[20deg]", // Hover effects
    "focus:border-[rgba(0,0,0,0.4)] focus:bg-[rgba(255,255,255,1)] focus:scale-105 focus:rotate-y-[20deg] focus:outline-none", // Focus effects
    "w-full pr-10", // Width and padding
    "transform-style-3d backface-hidden rotate-x-[-10deg] transition-all duration-300 ease-in-out", // 3D effects
    "hover:text-lg hover:scale-105 hover:rotate-y-[20deg] hover:rotate-x-[10deg]" // Additional hover effects
  );

  const errorMessageStyle = "text-red-500 text-sm mt-1 block";

  return (
    <Suspense fallback={<div>Loading Data...</div>}>
      <FormContainer
        action={handleGenerateCards}
        className={clsx(
          "py-8 grid sm:grid-cols-2 gap-8 w-full h-full lg:grid-cols-3 px-5",
        )}
      >
        {/* Name Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Name</label>
          <Input
            type="text"
            name="nameTeam"
            className={inputStyles}
            value={dataTeam.name}
            disabled={ isSubmitting}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          {formErrors.name && <span className={errorMessageStyle}>{formErrors.name}</span>}
        </div>
  
        {/* Logo URL Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Logo URL</label>
          <Input
            type="text"
            name="logo"
            className={inputStyles}
            value={dataTeam.logo}
            disabled={ isSubmitting}
            onChange={(e) => handleInputChange("logo", e.target.value)}
          />
          {formErrors.logo && <span className={errorMessageStyle}>{formErrors.logo}</span>}
        </div>
  
        {/* Number of Players Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Number of Players</label>
          <Input
            type="number"
            name="numMembers"
            className={inputStyles}
            value={dataTeam.numMembers}
            onChange={(e) => handleInputChange("numMembers", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.numMembers && <span className={errorMessageStyle}>{formErrors.numMembers}</span>}
        </div>
  
        {/* Goals Scored Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Goals Scored</label>
          <Input
            type="number"
            name="goals"
            className={inputStyles}
            value={dataTeam.goals}
            onChange={(e) => handleInputChange("goals", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.goals && <span className={errorMessageStyle}>{formErrors.goals}</span>}
        </div>
  
        {/* Goals Against Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Goals Against</label>
          <Input
            type="number"
            name="goalsReceived"
            className={inputStyles}
            value={dataTeam.goalsReceived}
            onChange={(e) => handleInputChange("goalsReceived", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.goalsReceived && <span className={errorMessageStyle}>{formErrors.goalsReceived}</span>}
        </div>
  
        {/* Points Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Points</label>
          <Input
            type="number"
            name="points"
            className={inputStyles}
            value={dataTeam.points}
            onChange={(e) => handleInputChange("points", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.points && <span className={errorMessageStyle}>{formErrors.points}</span>}
        </div>
  
        {/* Matches Played Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Matches Played</label>
          <Input
            type="number"
            name="matches"
            className={inputStyles}
            value={dataTeam.matches}
            onChange={(e) => handleInputChange("matches", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.matches && <span className={errorMessageStyle}>{formErrors.matches}</span>}
        </div>
  
        {/* Matches Won Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Matches Won</label>
          <Input
            type="number"
            name="matchesWon"
            className={inputStyles}
            value={dataTeam.matchesWon}
            onChange={(e) => handleInputChange("matchesWon", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.matchesWon && <span className={errorMessageStyle}>{formErrors.matchesWon}</span>}
        </div>
  
        {/* Matches Drawn Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Matches Drawn</label>
          <Input
            type="number"
            name="matchesDrawn"
            className={inputStyles}
            value={dataTeam.matchesDrawn}
            onChange={(e) => handleInputChange("matchesDrawn", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.matchesDrawn && <span className={errorMessageStyle}>{formErrors.matchesDrawn}</span>}
        </div>
  
        {/* Matches Lost Input */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Matches Lost</label>
          <Input
            type="number"
            name="matchesLost"
            className={inputStyles}
            value={dataTeam.matchesLost}
            onChange={(e) => handleInputChange("matchesLost", e.target.value)}
            disabled={ isSubmitting}
          />
          {formErrors.matchesLost && <span className={errorMessageStyle}>{formErrors.matchesLost}</span>}
        </div>
  
        {/* Qualified Checkbox */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium flex items-center justify-center gap-2">
            Qualified
            <input
              type="checkbox"
              name="qualified"
              className="h-5 w-5"
              checked={dataTeam.qualified}
              onChange={(e) => handleInputChange("qualified", e.target.checked)}
              disabled={ isSubmitting}
            />
          </label>
          {formErrors.qualified && <span className={errorMessageStyle}>{formErrors.qualified}</span>}
        </div>
  
        {/* Team ID (Display Only) */}
        <div className="flex-col gap-24 w-full text-center h-full">
          <label className="text-lg font-medium">Team ID</label>
          <Input
            type="text"
            name="id"
            className={inputStyles}
            value={dataTeam.id}
            readOnly
          />
        </div>
  
        {/* Submit Button */}
        <SubmitButton 
          className={clsx(submitButtonStyles)} 
          text="Guardar" 
        />
        
        {/* Form-wide error message */}
        {formErrors.form && (
          <div className="col-span-full">
            <span className={errorMessageStyle}>{formErrors.form}</span>
          </div>
        )}
      </FormContainer>
    </Suspense>
  );
};