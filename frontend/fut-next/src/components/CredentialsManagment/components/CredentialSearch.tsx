import { memo } from "react";
import { FormInput } from "@/components/common";

type CredentialSearchProps = {
  searchTerm: string;
  isContaining: boolean;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onContainingChange: (value: boolean) => void;
  onSearch: () => void;
  onClearFilter: () => void; // Add this new prop
};

export const CredentialSearch = memo(function CredentialSearch({
  searchTerm,
  isContaining,
  isLoading,
  onSearchChange,
  onContainingChange,
  onSearch,
  onClearFilter, // Add this new prop
}: CredentialSearchProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleContainingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onContainingChange(e.target.checked);
  };

  return (
     <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md  transition-all duration-300">
  
    
    <div className="p-5 md:w-1/2 ">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <FormInput
            id="credentialSearchInput"
            label="Buscar por nombre del jugador"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pr-20" // Extra padding for the clear button
            placeholder="Ingrese el nombre del jugador a buscar"
          />
          
          {searchTerm && (
            <button
              onClick={() => {
                // This simulates clearing the input by triggering onChange with empty string
                // handleSearchChange({ target: { value: '' } });
                onClearFilter();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              id="containingCheckbox"
              type="checkbox"
              checked={isContaining}
              onChange={handleContainingChange}
              className="sr-only peer"
            />
           
          </div>
          
          <div className="ml-auto">
            <button
              onClick={onSearch}
              disabled={isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
                isLoading 
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white transform hover:translate-y-[-2px]"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  Buscar
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Search chips/suggestions could go here */}
        <div className="flex flex-wrap gap-2 mt-2">
          {searchTerm && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm">
                        <span className="mr-1">Búsqueda actual:</span>
              <span className="font-medium">{searchTerm}</span>
              <button
                onClick={onClearFilter}
                className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                aria-label="Clear filter"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Help text */}
   
  </div>
  );
});