"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/store";
import {  resetMatches } from "@/app/Redux/feature/Matches/matchSlice";
import { resetWeeks } from "@/app/Redux/feature/Matches/WeekSlice";
// Import date-fns functions
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { useDeleteMatchSchedule, useScheduleMatches } from "../hooks/tournament-keys-hooks";
import clsx from "clsx";

type ChangeTrackerProps = {

  isAuthenticated: boolean
};
export const ChangeTracker = ( {isAuthenticated}: ChangeTrackerProps) => {
  const dispatch = useDispatch();
  const matchesState = useSelector((state: RootState) => state.matches);
  const matchesToDelete = useSelector((state: RootState) => state.weekMatches.matchesToDelete);

 
  
  // React Query mutations
  const scheduleMutation = useScheduleMatches();
  const deleteMutation = useDeleteMatchSchedule();
  
  // Track if changes are being sent
  const [isSending, setIsSending] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSendChanges = async () => {
    setIsSending(true);

    try {
      // Check if there are matches to schedule
      if (matchesState.choseMatches.length > 0) {
        // Convert weeks to API format and send
        await scheduleMutation.mutateAsync(matchesState.matches);
      }
      
      // Check if there are matches to delete
      if (matchesToDelete.length > 0) {
        console.log("Deleting matches:", matchesToDelete);
        for (const matchId of matchesToDelete) {
          const response = await deleteMutation.mutateAsync(matchId);
          console.log(response);
        }
      }
      
      // Record the successful save time
      setLastSaved(new Date());

      // Reset Redux state after successful operations
      dispatch(resetMatches());
      dispatch(resetWeeks());

        // Optional: Explicit refetch if needed
    
      // Show success message
      console.info("Changes saved successfully!");
    } catch (error) {
      console.error("Error sending changes:", error);
      console.error("Failed to save changes. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Reset all data function

  // Simple check if there are any changes to save
  const hasChangesToSave = matchesState.matches.length > 0 || matchesToDelete.length > 0;

  // Format the last saved date using date-fns
  const formattedLastSaved = lastSaved 
    ? format(lastSaved, "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: es })
    : null;

   return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        {isAuthenticated && (
          <button
            onClick={handleSendChanges}
            disabled={isSending || !hasChangesToSave}
            className={clsx(
              "px-4 py-2 text-white rounded transition-colors flex items-center justify-center",
              (isSending || !hasChangesToSave) 
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            )}
          >
            {isSending ? (
              <>
                <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        )}
        {/* <button
          onClick={handleResetAll}
          disabled={isSending}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Resetear Todo
        </button> */}
      </div>
      
      {lastSaved && (
        <div className="text-sm text-green-600 dark:text-green-400 mb-2">
          Último guardado: {formattedLastSaved}
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {matchesState.matches.length > 0 && (
          <p>Partidos para guardar: {matchesState.matches.length}</p>
        )}
        {matchesToDelete.length > 0 && (
          <p>Partidos para eliminar: {matchesToDelete.length}</p>
        )}
        
        {!hasChangesToSave && (
          <p>No hay cambios pendientes</p>
        )}
      </div>
    </div>
  );
};