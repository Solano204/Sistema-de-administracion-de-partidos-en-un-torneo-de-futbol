// File: src/app/features/inscription/components/InscriptionSearch.tsx
"use client";
import { 
  memo, 
  useState, 
  useCallback, 
  useEffect, 
  useMemo,
  useRef,
  ChangeEvent, 
  KeyboardEvent, 
  FormEvent 
} from "react";
import { useDebouncedCallback } from 'use-debounce';

// Types
type InscriptionSearchProps = {
  searchTerm: string;
  isContaining: boolean;
  onSearchChange: (term: string) => void;
  onContainingChange: (isContaining: boolean) => void;
  onSearch: () => void;
  isLoading: boolean;
};

// Constants
const SEARCH_ICONS = {
  search: (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  ),
  clear: (
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
  )
} as const;

const SEARCH_DEBOUNCE_DELAY = 300;
const MAX_SEARCH_LENGTH = 100;

// Utility functions
const validateSearchTerm = (term: string): boolean => {
  return term.length <= MAX_SEARCH_LENGTH;
};

const sanitizeSearchTerm = (term: string): string => {
  return term.trim().slice(0, MAX_SEARCH_LENGTH);
};

// Memoized components
const SearchIcon = memo(function SearchIcon({ 
  className = "h-5 w-5" 
}: { 
  className?: string 
}) {
  return (
    <svg 
      className={`text-gray-400 dark:text-gray-500 ${className}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {SEARCH_ICONS.search}
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
      aria-label="Clear search"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {SEARCH_ICONS.clear}
      </svg>
    </button>
  );
});

const SearchButton = memo(function SearchButton({ 
  isLoading,
  disabled,
  hasSearchTerm
}: { 
  isLoading: boolean;
  disabled: boolean;
  hasSearchTerm: boolean;
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
      className={buttonClasses}
      aria-label={isLoading ? "Searching..." : "Search inscriptions"}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            {SEARCH_ICONS.spinner}
          </svg>
          <span>Buscando...</span>
        </>
      ) : (
        <>
          <SearchIcon />
          <span>Buscar</span>
        </>
      )}
    </button>
  );
});

const CurrentSearchBadge = memo(function CurrentSearchBadge({ 
  searchTerm,
  onClear 
}: { 
  searchTerm: string;
  onClear: () => void;
}) {
  if (!searchTerm) return null;

  return (
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
          Búsqueda actual:
        </span>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
          <span className="truncate max-w-[200px]" title={searchTerm}>
            {searchTerm}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="ml-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm transition-colors"
            aria-label="Clear current search"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {SEARCH_ICONS.clear}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});


// Main Component
export const InscriptionSearch = memo(function InscriptionSearch({
  searchTerm,
  isContaining,
  onSearchChange,
  onContainingChange,
  onSearch,
  isLoading,
}: InscriptionSearchProps) {
  // Local state
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sync local state with props
  useEffect(() => {
    if (searchTerm !== localSearchTerm && !hasInteracted) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm, localSearchTerm, hasInteracted]);

  // Debounced search for auto-search as user types
  const debouncedSearch = useDebouncedCallback(
    useCallback((term: string) => {
      if (term !== searchTerm) {
        onSearchChange(term);
        onSearch();
      }
    }, [onSearchChange, onSearch, searchTerm]),
    SEARCH_DEBOUNCE_DELAY
  );

  // Memoized validation
  const isValidSearchTerm = useMemo(() => {
    return validateSearchTerm(localSearchTerm);
  }, [localSearchTerm]);

  const hasSearchTerm = useMemo(() => {
    return localSearchTerm.trim().length > 0;
  }, [localSearchTerm]);

  // Handlers
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = sanitizeSearchTerm(e.target.value);
    setLocalSearchTerm(newValue);
    setHasInteracted(true);
    
    // Auto-search as user types (debounced)
    if (isValidSearchTerm) {
      debouncedSearch(newValue);
    }
  }, [debouncedSearch, isValidSearchTerm]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    } else if (e.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch();
  }, []);

  const submitSearch = useCallback(() => {
    if (!isValidSearchTerm) return;
    
    const sanitizedTerm = sanitizeSearchTerm(localSearchTerm);
    onSearchChange(sanitizedTerm);
    onSearch();
    setHasInteracted(false);
  }, [localSearchTerm, onSearchChange, onSearch, isValidSearchTerm]);

  const handleClear = useCallback(() => {
    setLocalSearchTerm("");
    onSearchChange("");
    setHasInteracted(false);
    inputRef.current?.focus();
  }, [onSearchChange]);

  // Focus management
  const handleInputFocus = useCallback(() => {
    setHasInteracted(true);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:items-end md:space-x-4">
        {/* Search Input */}
        <div className="flex-grow">
          <label 
            htmlFor="search" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Buscar por nombre de equipo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              id="search"
              name="search"
              autoComplete="off"
              spellCheck="false"
              className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm rounded-lg transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border placeholder-gray-400 dark:placeholder-gray-500 shadow-sm ${
                isValidSearchTerm
                  ? "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  : "border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400"
              }`}
              placeholder="Ingrese el nombre del equipo..."
              value={localSearchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              maxLength={MAX_SEARCH_LENGTH}
              aria-describedby={!isValidSearchTerm ? "search-error" : undefined}
              aria-invalid={!isValidSearchTerm}
            />
            <ClearButton onClear={handleClear} isVisible={hasSearchTerm} />
          </div>
          
          {/* Error message */}
          {!isValidSearchTerm && (
            <p id="search-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    El término de búsqueda es demasiado largo. Máximo {MAX_SEARCH_LENGTH} caracteres permitidos.
            </p>
          )}
        </div>

        {/* Search Filters */}
        <div className="flex-shrink-0 min-w-[200px]">
         
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0">
          <SearchButton 
            isLoading={isLoading}
            disabled={!isValidSearchTerm}
            hasSearchTerm={hasSearchTerm}
          />
        </div>
      </div>
      
      {/* Current Search Badge */}
      <CurrentSearchBadge 
        searchTerm={searchTerm} 
        onClear={handleClear}
      />
    </form>
  );
});