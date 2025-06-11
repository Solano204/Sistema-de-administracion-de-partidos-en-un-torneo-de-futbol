// File: src/app/features/tournament/components/TournamentNavigationBar.tsx
"use client";

import React, { useState } from "react";
import {
  useTournamentNavigation,
  useCategories,
  useTournamentsByCategory,
  useTeamCountByCategory,
  useTournamentStageInfo,
  useDivisionsByTournament,
  useDivisionStatus,
  useTournamentMutations,
  useAccumulatedPhases,
  useTournamentCreationInfo
} from "../hooks/tournament-hooks";
import { getPhaseDisplayName } from "../utils/tournament-utils";

const TournamentNavigationBar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // State management
  const {
    state,
    updateState,
    resetTournamentSelection,
    resetDivisionSelection
  } = useTournamentNavigation();

  // Data fetching hooks
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  
  const {
    data: tournaments = [],
    isLoading: isLoadingTournaments,
    refetch: refetchTournaments
  } = useTournamentsByCategory(state.selectedCategoryId);

  const {
    data: teamCount,
    isLoading: isLoadingTeamCount,
    refetch: refetchTeamCount
  } = useTeamCountByCategory(
    state.selectedCategoryId,
    tournaments.length === 0
  );

  const { data: tournamentStageInfo, isLoading: isLoadingStageInfo } = 
    useTournamentStageInfo(state.selectedTournamentId, state.selectedCategoryId);

  const { data: divisions = [], isLoading: isLoadingDivisions } = 
    useDivisionsByTournament(state.selectedTournamentId);

  const { data: divisionStatus, isLoading: isLoadingDivisionStatus } = 
    useDivisionStatus(
      state.selectedTournamentId,
      state.selectedDivisionId,
      state.selectedCategoryId
    );

  // Mutations
  const { createTournament, createDivisions, advancePhase } = useTournamentMutations();

  // Tournament creation info
  const {
    canCreateTournament,
    selectedCategory,
    createTournamentData
  } = useTournamentCreationInfo(
    state.selectedCategoryId,
    tournaments,
    teamCount,
    categories
  );

  // Accumulated phases
  const accumulatedPhases = useAccumulatedPhases(divisionStatus ?? null);

  // Event handlers
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    updateState({
      selectedCategoryId: categoryId,
      selectedTournamentId: null,
      selectedDivisionId: null,
      error: null
    });
    
    if (categoryId) {
      refetchTournaments();
      refetchTeamCount();
    }
  };

  const handleCreateTournament = () => {
    const tournamentData = createTournamentData();
    if (!tournamentData) return;

    createTournament.mutate(tournamentData, {
      onSuccess: (data) => {
        updateState({
          selectedTournamentId: data.id
        });
        refetchTournaments();
      },
      onError: (error) => {
        updateState({ error: `Error creating tournament: ${error.message}` });
      }
    });
  };

  const handleTournamentSelect = (tournamentId: string) => {
    updateState({
      selectedTournamentId: tournamentId,
      selectedDivisionId: null,
      error: null
    });
  };

  const handleDivisionSelect = (divisionId: string) => {
    updateState({
      selectedDivisionId: divisionId,
      error: null
    });
  };

  const handleCreateDivisions = () => {
    if (!state.selectedTournamentId) return;
    createDivisions.mutate(state.selectedTournamentId, {
      onError: (error) => {
        updateState({ error: `Error creating divisions: ${error.message}` });
      }
    });
  };

  const handleAdvanceToNextPhase = () => {
    if (!state.selectedTournamentId || !divisionStatus) return;
    advancePhase.mutate({
      tournamentId: state.selectedTournamentId,
      divisionName: divisionStatus.divisionName
    }, {
      onError: (error) => {
        updateState({ error: `Error advancing phase: ${error.message}` });
      }
    });
  };

  const navigateToPhase = (phase: string) => {
    console.log("Navigate to phase:", phase);
    // Implement actual navigation logic here
  };

  // Loading state
  const isLoading = isLoadingCategories || isLoadingTournaments || isLoadingStageInfo || 
                    isLoadingDivisions || isLoadingDivisionStatus || isLoadingTeamCount ||
                    createDivisions.isPending || advancePhase.isPending ||
                    createTournament.isPending;

  // Find selected objects
  const selectedTournament = tournaments.find(t => t.id === state.selectedTournamentId);
  const selectedDivision = divisions.find(d => d.id === state.selectedDivisionId);
return (
  <div className="relative">
    {/* Barra desplegable */}
    <div
      className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 p-2 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span>Navegación de Torneos</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    {/* Contenido desplegable */}
    {isHovered && (
      <div
        className="absolute z-10 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 p-4 shadow-lg rounded-b w-full max-w-4xl border border-gray-700 dark:border-gray-600"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="container mx-auto">
          {/* Selector de Categoría */}
          <div className="mb-4">
            <label htmlFor="category-select" className="block mb-2 text-gray-300 dark:text-gray-200">Seleccionar Categoría:</label>
            <select
              id="category-select"
              value={state.selectedCategoryId}
              onChange={handleCategoryChange}
              className="p-2 rounded text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-600 dark:border-gray-500 w-full focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
              disabled={isLoadingCategories}
            >
              <option value="">-- Selecciona una categoría --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {state.error && (
            <div className="bg-red-600 dark:bg-red-700 text-white p-2 rounded mb-4 border border-red-500 dark:border-red-600">
              {state.error}
            </div>
          )}

          {/* Indicador de carga */}
          {isLoading && (
            <div className="bg-blue-600 dark:bg-blue-700 text-white p-2 rounded mb-4 border border-blue-500 dark:border-blue-600 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </div>
          )}

          {/* Sección de creación de torneo */}
          {state.selectedCategoryId && tournaments.length === 0 && teamCount !== undefined && (
            <div className="mb-4 p-4 bg-gray-700 dark:bg-gray-600 rounded border border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-100">
              {teamCount < 2 ? (
                <div>
                  <p className="mb-2">No hay suficientes equipos en esta categoría.</p>
                  <p className="text-sm text-gray-400">Se necesitan al menos 2 equipos para crear un torneo. Equipos actuales: {teamCount}</p>
                </div>
              ) : canCreateTournament ? (
                <div>
                  <p className="mb-3">Listo para crear un torneo para <strong>{selectedCategory?.name}</strong></p>
                  <p className="text-sm text-gray-400 mb-3">Equipos disponibles: {teamCount}</p>
                  <button
                    onClick={handleCreateTournament}
                    disabled={createTournament.isPending}
                    className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed border border-blue-500 dark:border-blue-600 p-2 rounded text-white transition-colors"
                  >
                    {createTournament.isPending ? "Creando Torneo..." : "Crear Torneo"}
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Lista de torneos */}
          {tournaments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-300 dark:text-gray-200">
                Seleccionar Torneo:
              </h3>
              <div className="flex flex-wrap gap-2">
                {tournaments.map((tournament) => (
                  <button
                    key={tournament.id}
                    onClick={() => handleTournamentSelect(tournament.id)}
                    className={`p-2 rounded transition-colors ${
                      state.selectedTournamentId === tournament.id
                        ? "bg-blue-600 dark:bg-blue-700 text-white border border-blue-500 dark:border-blue-600"
                        : "bg-gray-600 dark:bg-gray-600 text-white border border-gray-500 dark:border-gray-500"
                    } hover:bg-blue-500 dark:hover:bg-blue-600`}
                  >
                    {tournament.tournamentName} - {tournament.categoryName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información de fase del torneo */}
          {selectedTournament && tournamentStageInfo && (
            <div className="mb-4 p-4 bg-gray-700 dark:bg-gray-600 rounded border border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-200 dark:text-gray-100">
                Fase del Torneo: {getPhaseDisplayName(tournamentStageInfo.currentStage)}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p>Total de Equipos: {tournamentStageInfo.totalTeams}</p>
                  <p>
                    Divisiones Recomendadas:{" "}
                    {tournamentStageInfo.recommendedDivisions}
                  </p>
                </div>
                <div>
                  <p>
                    Partidos Completados: {tournamentStageInfo.completedMatches}
                  </p>
                  <p>Total de Partidos: {tournamentStageInfo.totalMatches}</p>
                </div>
              </div>
              
              {/* Mostrar botón de crear divisiones solo en fase ROUND_ROBIN */}
              {tournamentStageInfo.currentStage === "ROUND_ROBIN" && (
                <button
                  onClick={handleCreateDivisions}
                  disabled={!tournamentStageInfo.canCreateDivisions}
                  className={`${
                    tournamentStageInfo.canCreateDivisions
                      ? "bg-green-600 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600 border border-green-500 dark:border-green-600"
                      : "bg-gray-500 dark:bg-gray-500 cursor-not-allowed border border-gray-400 dark:border-gray-400"
                  } p-2 rounded text-white transition-colors`}
                >
                  Crear Divisiones
                </button>
              )}
            </div>
          )}

          {/* Mostrar divisiones si estamos pasada la fase ROUND_ROBIN o existen divisiones */}
          {divisions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-300 dark:text-gray-200">Divisiones:</h3>
              <div className="flex flex-wrap gap-2">
                {divisions.map((division) => (
                  <button
                    key={division.id}
                    onClick={() => handleDivisionSelect(division.id)}
                    className={`p-2 rounded transition-colors ${
                      state.selectedDivisionId === division.id
                        ? "bg-green-600 dark:bg-green-700 text-white border border-green-500 dark:border-green-600"
                        : "bg-gray-600 dark:bg-gray-600 text-white border border-gray-500 dark:border-gray-500"
                    } hover:bg-green-500 dark:hover:bg-green-600`}
                  >
                    {division.divisionName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estado de Avance de División */}
          {selectedDivision && divisionStatus && (
            <div className="mb-4 p-4 bg-gray-700 dark:bg-gray-600 rounded border border-gray-600 dark:border-gray-500 text-gray-200 dark:text-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-200 dark:text-gray-100">
                Estado de {divisionStatus.divisionName}
              </h3>
              <p>Fase Actual: {getPhaseDisplayName(divisionStatus.currentPhase)}</p>
              <p>Siguiente Fase: {getPhaseDisplayName(divisionStatus.nextPhase)}</p>
              <p>Partidos Completados: {divisionStatus.completedMatches} / {divisionStatus.totalMatches}</p>
              <p>Equipos Listos: {divisionStatus.teamsReady} / {divisionStatus.totalTeams}</p>
              
              <button
                onClick={handleAdvanceToNextPhase}
                disabled={!divisionStatus.canAdvance}
                className={`mt-2 p-2 rounded transition-colors ${
                  divisionStatus.canAdvance
                    ? "bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-500 dark:hover:bg-yellow-600 border border-yellow-500 dark:border-yellow-600"
                    : "bg-gray-500 dark:bg-gray-500 cursor-not-allowed border border-gray-400 dark:border-gray-400"
                } text-white`}
              >
                {divisionStatus.canAdvance
                  ? `Avanzar a ${getPhaseDisplayName(divisionStatus.nextPhase)}`
                  : `No se puede avanzar aún`}
              </button>
            </div>
          )}

          {/* Fases Acumuladas */}
          {accumulatedPhases.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-300 dark:text-gray-200">
                Progresión de Fases:
              </h3>
              <div className="flex gap-2 flex-wrap">
                {accumulatedPhases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => navigateToPhase(phase)}
                    className={`p-2 rounded transition-colors ${
                      phase === divisionStatus?.currentPhase
                        ? "bg-purple-600 dark:bg-purple-700 text-white border border-purple-500 dark:border-purple-600"
                        : "bg-purple-500 dark:bg-purple-600 text-white border border-purple-400 dark:border-purple-500"
                    } hover:bg-purple-400 dark:hover:bg-purple-500`}
                  >
                    {getPhaseDisplayName(phase)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}

export default TournamentNavigationBar