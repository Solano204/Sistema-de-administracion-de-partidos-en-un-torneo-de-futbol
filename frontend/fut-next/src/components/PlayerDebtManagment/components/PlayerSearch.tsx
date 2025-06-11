// File: src/app/features/debt/components/PlayerSearch.tsx
import { memo, useCallback, useMemo } from "react";
import { FormInput } from "@/components/common";
import { PlayerSummaryRecord } from "../";
import clsx from "clsx";

type PlayerSearchProps = {
  searchTerm: string;
  searchResults: PlayerSummaryRecord[];
  selectedPlayer: PlayerSummaryRecord | null;
  isLoading: boolean;
  error: Error | null;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onSelectPlayer: (player: PlayerSummaryRecord) => void;
  onClearSearch: () => void;
};

// Memoized header component
const SearchHeader = memo(function SearchHeader() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Encontrar un jugador</h2>
    </div>
  );
});

// Memoized search button component
const SearchButton = memo(function SearchButton({ 
  onSearch, 
  disabled, 
  isLoading 
}: {
  onSearch: () => void;
  disabled: boolean;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={onSearch}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300",
        "shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        disabled
          ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 transform hover:translate-y-[-2px]"
      )}
    >
      {isLoading ? (
        <LoadingState text="Buscando..." />
      ) : (
        <SearchState />
      )}
    </button>
  );
});

// Memoized clear button component
const ClearButton = memo(function ClearButton({ 
  onClear,
  variant = 'default' 
}: {
  onClear: () => void;
  variant?: 'default' | 'green';
}) {
  const buttonClasses = variant === 'green'
    ? "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/60"
    : "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium";

  return (
    <button onClick={onClear} className={buttonClasses}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <span>{variant === 'green' ? 'Cambiar jugador' : 'Limpiar'}</span>
    </button>
  );
});

// Memoized error message component
const ErrorMessage = memo(function ErrorMessage() {
  return (
    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Error al buscar jugadores. Por favor, inténtelo de nuevo.</span>
      </div>
    </div>
  );
});

// Memoized selected player component
const SelectedPlayer = memo(function SelectedPlayer({ 
  player, 
  onClear 
}: {
  player: PlayerSummaryRecord;
  onClear: () => void;
}) {
  const playerInitial = useMemo(() => player.fullName.charAt(0).toUpperCase(), [player.fullName]);

  return (
    <div className="mb-4 p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50/70 dark:bg-green-900/20 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg text-green-800 dark:text-green-300">Jugador seleccionado</h3>
          <div className="flex items-center mt-1">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 flex items-center justify-center mr-3 font-medium">
              {playerInitial}
            </div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              {player.fullName}
              {player.jerseyNumber && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-800/50">
                  Jersey #{player.jerseyNumber}
                </span>
              )}
            </p>
          </div>
        </div>
        <ClearButton onClear={onClear} variant="green" />
      </div>
    </div>
  );
});

// Memoized player item component for search results
const PlayerItem = memo(function PlayerItem({ 
  player, 
  onSelect 
}: {
  player: PlayerSummaryRecord;
  onSelect: (player: PlayerSummaryRecord) => void;
}) {
  const playerInitial = useMemo(() => player.fullName.charAt(0).toUpperCase(), [player.fullName]);
  
  const handleSelect = useCallback(() => {
    onSelect(player);
  }, [onSelect, player]);

  return (
    <li 
      className="p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors flex justify-between items-center text-gray-700 dark:text-gray-300"
      onClick={handleSelect}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center mr-3 font-medium">
          {playerInitial}
        </div>
        <div>
          <span className="font-medium">{player.fullName}</span>
          {player.jerseyNumber && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              #{player.jerseyNumber}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        ID: {player.id}
      </span>
    </li>
  );
});

// Memoized search results component
const SearchResults = memo(function SearchResults({ 
  players, 
  onSelectPlayer 
}: {
  players: PlayerSummaryRecord[];
  onSelectPlayer: (player: PlayerSummaryRecord) => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <h3 className="font-semibold p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
        Resultados de la búsqueda
      </h3>
      <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {players.map((player) => (
          <PlayerItem
            key={player.id}
            player={player}
            onSelect={onSelectPlayer}
          />
        ))}
      </ul>
    </div>
  );
});

// Memoized no results message component
const NoResultsMessage = memo(function NoResultsMessage({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-gray-50/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-center">
      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-gray-600 dark:text-gray-400">
              No se encontraron jugadores que coincidan con "<span className="font-medium">{searchTerm}</span>"
      </p>
    </div>
  );
});

// Memoized loading and search state components
const LoadingState = memo(function LoadingState({ text }: { text: string }) {
  return (
    <>
      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>{text}</span>
    </>
  );
});

const SearchState = memo(function SearchState() {
  return (
    <>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span>Buscar</span>
    </>
  );
});

export const PlayerSearch = memo(function PlayerSearch({
  searchTerm,
  searchResults,
  selectedPlayer,
  isLoading,
  error,
  onSearchChange,
  onSearch,
  onSelectPlayer,
  onClearSearch,
}: PlayerSearchProps) {
  // Memoized search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Memoized computed values
  const searchState = useMemo(() => ({
    canSearch: searchTerm.length >= 2,
    searchDisabled: searchTerm.length < 2 || isLoading,
    hasResults: searchResults.length > 0,
    showNoResults: !selectedPlayer && searchTerm.length >= 2 && searchResults.length === 0 && !isLoading,
    showResults: !selectedPlayer && searchResults.length > 0
  }), [searchTerm.length, isLoading, searchResults.length, selectedPlayer]);

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 backdrop-blur-md transition-all duration-300">
      <SearchHeader />
      
      {/* Search Input */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <FormInput
            id="playerSearchInput"
                    label="Buscar jugadores"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
            placeholder="Ingrese el nombre del jugador a buscar"
          />
        </div>
        
        <div className="flex gap-2 md:self-end">
          <SearchButton
            onSearch={onSearch}
            disabled={searchState.searchDisabled}
            isLoading={isLoading}
          />
          
          {selectedPlayer && (
            <ClearButton onClear={onClearSearch} />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage />}

      {/* Selected Player */}
      {selectedPlayer && (
        <SelectedPlayer player={selectedPlayer} onClear={onClearSearch} />
      )}

      {/* Search Results */}
      {searchState.showResults && (
        <SearchResults players={searchResults} onSelectPlayer={onSelectPlayer} />
      )}

      {/* No Results Message */}
      {searchState.showNoResults && (
        <NoResultsMessage searchTerm={searchTerm} />
      )}
    </div>
  );
});