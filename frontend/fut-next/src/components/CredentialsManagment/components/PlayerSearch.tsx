// File: src/app/features/credential/components/PlayerSearch.tsx
import { memo } from "react";
import { FormInput } from "@/components/common";
import { PlayerSummaryRecord } from "../types/credential-types";

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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Buscar un jugador</h2>
      
      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <FormInput
          id="playerSearchInput"
          label="Buscar jugadores"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          // onKeyDown={handleKeyDown}
          className="flex-1"
          placeholder="Ingrese el nombre del jugador a buscar"
        />
        <button
          onClick={onSearch}
          disabled={searchTerm.length < 2 || isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 self-end"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
        {selectedPlayer && (
          <button
            onClick={onClearSearch}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 self-end"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error al buscar jugadores. Por favor, inténtelo de nuevo.
        </div>
      )}

      {/* Selected Player */}
      {selectedPlayer && (
        <div className="mb-4 p-4 border-2 border-green-500 rounded-md bg-green-50">
          <h3 className="font-semibold text-lg text-green-800">Jugador seleccionado</h3>
          <div className="flex items-center justify-between">
            <p className="text-green-700">
              <span className="font-medium">{selectedPlayer.fullName}</span> 
              {selectedPlayer.jerseyNumber && (
                <span className="ml-2">(Jersey #{selectedPlayer.jerseyNumber})</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!selectedPlayer && searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Resultados de la búsqueda</h3>
          <ul className="max-h-64 overflow-y-auto border rounded-md divide-y">
            {searchResults.map((player) => (
              <li 
                key={player.id}
                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
                onClick={() => onSelectPlayer(player)}
              >
                <div>
                  <span className="font-medium">{player.fullName}</span>
                  {player.jerseyNumber && (
                    <span className="ml-2 text-gray-600">#{player.jerseyNumber}</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">ID: {player.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results Message */}
      {!selectedPlayer && searchTerm.length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className="mt-4 p-3 bg-gray-50 rounded border text-center">
            <p className="text-gray-600">No se encontraron jugadores que coincidan con {searchTerm}</p>
        </div>
      )}
    </div>
  );
});