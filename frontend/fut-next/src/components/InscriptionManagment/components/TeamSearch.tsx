// File: src/app/features/inscription/components/TeamSearch.tsx
"use client";
import { 
  memo, 
  useState, 
  useCallback, 
  useEffect, 
  useRef, 
  useMemo,
  ChangeEvent, 
  KeyboardEvent, 
  FormEvent, 
  RefObject
} from "react";
import { useDebouncedCallback } from 'use-debounce';
import { TeamSummaryRecord } from "../types/inscription-types";

// Types
type TeamSearchProps = {
  searchTerm: string;
  searchResults: TeamSummaryRecord[];
  selectedTeam: TeamSummaryRecord | null;
  isLoading: boolean;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  onSelectTeam: (team: TeamSummaryRecord) => void;
  onClearSearch: () => void;
};

type DropdownState = 'closed' | 'open' | 'loading';

// Constants
const ICONS = {
  search: (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  ),
  clear : (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M6 18L18 6M6 6l12 12" 
    />
  ),
  spinner: (
    <>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </>
  ),
  users: (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
    />
  ),
  noResults: (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  )
} as const;

const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 50;
const DEBOUNCE_DELAY = 300;
const MAX_RESULTS_DISPLAY = 10;

// Utility functions
const sanitizeSearchTerm = (term: string): string => {
  return term.trim().slice(0, MAX_SEARCH_LENGTH);
};

const validateSearchTerm = (term: string): boolean => {
  return term.length >= MIN_SEARCH_LENGTH && term.length <= MAX_SEARCH_LENGTH;
};

// Hooks
const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
};

const useKeyboardNavigation = (
  dropdownState: DropdownState,
  searchResults: TeamSummaryRecord[],
  onSelectTeam: (team: TeamSummaryRecord) => void,
  onCloseDropdown: () => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (dropdownState === 'closed') {
      setSelectedIndex(-1);
    }
  }, [dropdownState]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (dropdownState !== 'open' || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelectTeam(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onCloseDropdown();
        break;
    }
  }, [dropdownState, searchResults, selectedIndex, onSelectTeam, onCloseDropdown]);

  return { selectedIndex, handleKeyDown };
};

// Memoized Components
const SearchIcon = memo(function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg 
      className={`text-gray-400 dark:text-gray-500 ${className}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {ICONS.search}
    </svg>
  );
});

const ClearButton = memo(function ClearButton({ 
  onClear,
  isVisible 
}: { 
  onClear: () => void;
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={onClear}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-md"
      aria-label="Limpiar búsqueda"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {ICONS.clear}
      </svg>
    </button>
  );
});

const TeamResultItem = memo(function TeamResultItem({
  team,
  isSelected,
  onClick
}: {
  team: TeamSummaryRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      className={`relative cursor-pointer select-none py-3 px-4 transition-colors duration-150 ${
        isSelected 
          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100" 
          : "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-900 dark:text-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <span className="font-medium block truncate" title={team.name}>
            {team.name}
          </span>
        </div>
        <div className="ml-3 flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.users}
            </svg>
            {team.playerCount}
          </span>
        </div>
      </div>
    </li>
  );
});

const DropdownContent = memo(function DropdownContent({
  dropdownState,
  searchResults,
  localSearchTerm,
  selectedIndex,
  onSelectTeam
}: {
  dropdownState: DropdownState;
  searchResults: TeamSummaryRecord[];
  localSearchTerm: string;
  selectedIndex: number;
  onSelectTeam: (team: TeamSummaryRecord) => void;
}) {
  const displayResults = useMemo(() => 
    searchResults.slice(0, MAX_RESULTS_DISPLAY), 
    [searchResults]
  );

  const showDropdown = dropdownState === 'open' && localSearchTerm.length >= MIN_SEARCH_LENGTH;
  const showNoResults = showDropdown && searchResults.length === 0;
  const showLoading = dropdownState === 'loading';

  if (!showDropdown && !showNoResults && !showLoading) return null;

  return (
    <div className={`absolute z-30 w-full mt-1 overflow-hidden transition-all duration-200 transform origin-top rounded-lg shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 ${
      showDropdown || showNoResults || showLoading
        ? "opacity-100 scale-100 translate-y-0"
        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
    }`}>
      {showLoading && (
        <div className="py-4 px-4 text-center">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
              {ICONS.spinner}
            </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Buscando equipos...</span>
          </div>
        </div>
      )}

      {showDropdown && searchResults.length > 0 && (
        <>
          <ul
            className="max-h-60 w-full overflow-auto py-1 text-base sm:text-sm"
            role="listbox"
            aria-label="Resultados de búsqueda de equipos"
          >
            {displayResults.map((team, index) => (
              <TeamResultItem
                key={team.id}
                team={team}
                isSelected={index === selectedIndex}
                onClick={() => onSelectTeam(team)}
              />
            ))}
          </ul>
          {searchResults.length > MAX_RESULTS_DISPLAY && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mostrando {MAX_RESULTS_DISPLAY} de {searchResults.length} resultados. Refina tu búsqueda para obtener resultados más específicos.
              </p>
            </div>
          )}
        </>
      )}

      {showNoResults && (
        <div className="py-4 px-4 text-center">
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.noResults}
            </svg>
                    <span className="text-sm">No se encontraron equipos que coincidan con "{localSearchTerm}"</span>
          </div>
        </div>
      )}
    </div>
  );
});

const SearchButton = memo(function SearchButton({
  isLoading,
  disabled,
  onSubmit
}: {
  isLoading: boolean;
  disabled: boolean;
  onSubmit: () => void;
}) {
  const buttonClasses = useMemo(() => {
    const baseClasses = "inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400";
    
    if (disabled || isLoading) {
      return `${baseClasses} bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 transform hover:translate-y-[-1px]`;
  }, [disabled, isLoading]);

  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      onClick={onSubmit}
      className={buttonClasses}
      aria-label={isLoading ? "Buscando equipos..." : "Buscar equipos"}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.spinner}
          </svg>
          <span>Buscando...</span>
        </>
      ) : (
        <>
          <SearchIcon />
          <span>Buscar equipos</span>
        </>
      )}
    </button>
  );
});

const SelectedTeamCard = memo(function SelectedTeamCard({
  selectedTeam,
  onClear
}: {
  selectedTeam: TeamSummaryRecord | null;
  onClear: () => void;
}) {
  if (!selectedTeam) return null;

  return (
    <div className="mt-4 p-4 rounded-lg transition-all duration-300 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
            Equipo seleccionado
          </h4>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 truncate" title={selectedTeam.name}>
            {selectedTeam.name}
          </p>
          <div className="flex items-center mt-2">
            <svg className="h-4 w-4 text-blue-700 dark:text-blue-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.users}
            </svg>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {selectedTeam.playerCount} {selectedTeam.playerCount === 1 ? 'player' : 'players'}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Change selected team"
        >
          Cambiar equipo
        </button>
      </div>
    </div>
  );
});

// Main Component
export const TeamSearch = memo(function TeamSearch({
  searchTerm,
  searchResults,
  selectedTeam,
  isLoading,
  onSearchChange,
  onSearch,
  onSelectTeam,
  onClearSearch,
}: TeamSearchProps) {
  // State
  const [dropdownState, setDropdownState] = useState<DropdownState>('closed');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    useCallback((term: string) => {
      if (term !== searchTerm && validateSearchTerm(term)) {
        onSearchChange(term);
        onSearch();
      }
    }, [onSearchChange, onSearch, searchTerm]),
    DEBOUNCE_DELAY
  );

  // Custom hooks
  const closeDropdown = useCallback(() => {
    setDropdownState('closed');
  }, []);

  useClickOutside(dropdownRef as RefObject<HTMLElement>, closeDropdown);

  const { selectedIndex, handleKeyDown } = useKeyboardNavigation(
    dropdownState,
    searchResults,
    onSelectTeam,
    closeDropdown
  );

  // Sync local state with props
  useEffect(() => {
    if (searchTerm !== localSearchTerm && !hasInteracted) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm, localSearchTerm, hasInteracted]);

  // Handle dropdown state based on loading
  useEffect(() => {
    if (isLoading) {
      setDropdownState('loading');
    } else if (localSearchTerm.length >= MIN_SEARCH_LENGTH) {
      setDropdownState('open');
    } else {
      setDropdownState('closed');
    }
  }, [isLoading, localSearchTerm.length]);

  // Close dropdown when team is selected
  useEffect(() => {
    if (selectedTeam) {
      setDropdownState('closed');
    }
  }, [selectedTeam]);

  // Memoized validations
  const isValidSearch = useMemo(() => 
    validateSearchTerm(localSearchTerm), 
    [localSearchTerm]
  );

  const hasSearchTerm = useMemo(() => 
    localSearchTerm.trim().length > 0, 
    [localSearchTerm]
  );

  // Handlers
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeSearchTerm(e.target.value);
    setLocalSearchTerm(value);
    setHasInteracted(true);
    
    // Auto-search as user types
    if (value.length >= MIN_SEARCH_LENGTH) {
      debouncedSearch(value);
    } else {
      setDropdownState('closed');
    }
  }, [debouncedSearch]);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else {
      handleKeyDown(e);
    }
  }, [handleKeyDown]);

  const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isValidSearch) return;
    
    const sanitized = sanitizeSearchTerm(localSearchTerm);
    onSearchChange(sanitized);
    onSearch();
    setHasInteracted(false);
  }, [localSearchTerm, onSearchChange, onSearch, isValidSearch]);

  const handleSelectTeam = useCallback((team: TeamSummaryRecord) => {
    onSelectTeam(team);
    setLocalSearchTerm(team.name);
    setDropdownState('closed');
    setHasInteracted(false);
  }, [onSelectTeam]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    onClearSearch();
    setDropdownState('closed');
    setHasInteracted(false);
    inputRef.current?.focus();
  }, [onClearSearch]);

  const handleInputFocus = useCallback(() => {
    setHasInteracted(true);
    if (searchResults.length > 0 && localSearchTerm.length >= MIN_SEARCH_LENGTH) {
      setDropdownState('open');
    }
  }, [searchResults.length, localSearchTerm.length]);

  return (
    <div className="w-full">
      <form onSubmit={handleFormSubmit} role="search">
        <label 
          htmlFor="team-search" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Buscar un equipo
        </label>
        
        <div className="relative" ref={dropdownRef}>
          <div className="flex rounded-lg shadow-sm">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                ref={inputRef}
                type="text"
                id="team-search"
                name="team-search"
                autoComplete="off"
                spellCheck="false"
                className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm rounded-lg transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border placeholder-gray-400 dark:placeholder-gray-500 shadow-sm ${
                  isValidSearch || localSearchTerm.length === 0
                    ? "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    : "border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400"
                }`}
                placeholder="Ingrese el nombre del equipo..."
                value={localSearchTerm}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={handleInputFocus}
                maxLength={MAX_SEARCH_LENGTH}
                aria-haspopup="listbox"
                aria-expanded={dropdownState === 'open'}
                aria-describedby={!isValidSearch && localSearchTerm.length > 0 ? "search-error" : undefined}
                aria-invalid={!isValidSearch && localSearchTerm.length > 0}
              />
              <ClearButton onClear={handleClearSearch} isVisible={hasSearchTerm} />
            </div>
          </div>
          
          {/* Error message */}
          {!isValidSearch && localSearchTerm.length > 0 && (
            <p id="search-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {localSearchTerm.length < MIN_SEARCH_LENGTH 
                ? `Por favor, ingrese al menos ${MIN_SEARCH_LENGTH} caracteres.`
                : `El término de búsqueda es demasiado largo. Máximo ${MAX_SEARCH_LENGTH} caracteres permitidos.`
              }
            </p>
          )}
          
          {/* Dropdown Content */}
          <DropdownContent
            dropdownState={dropdownState}
            searchResults={searchResults}
            localSearchTerm={localSearchTerm}
            selectedIndex={selectedIndex}
            onSelectTeam={handleSelectTeam}
          />
        </div>
        
        {/* Search Button */}
        <div className="mt-3">
          <SearchButton
            isLoading={isLoading}
            disabled={!isValidSearch}
            onSubmit={handleSubmit}
          />
        </div>
      </form>
      
      {/* Selected Team Display */}
      <SelectedTeamCard 
        selectedTeam={selectedTeam}
        onClear={handleClearSearch}
      />
    </div>
  );
});