// File: src/app/features/user/components/RoleSelector.tsx
"use client";
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { NeonSelect } from '@/components/common';
import { SelectOption as BaseSelectOption } from '@/components/common/Common.Select';

// Extend SelectOption to include description for roles
export type SelectOption<T> = BaseSelectOption<T> & { description?: string };
import { checkAdminExists } from '@/app/utils/Domain/AuthenticationActions/AuthImpSpring';

// Types
export enum UserRole {
  ADMINISTRADOR = "ADMINISTRADOR",
  ARBITRO = "ARBITRO",
  JUGADOR = "JUGADOR",
}

type RoleSelectorProps = {
  mode: "create" | "edit";
  currentRole?: UserRole;
  onRoleChange: (option: SelectOption<UserRole> | null) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: string;
};

type AdminCheckState = {
  adminExists: boolean | null;
  isLoading: boolean;
  error: string | null;
  lastChecked: number | null;
};

// Constants
const ROLE_LABELS = {
  [UserRole.ADMINISTRADOR]: "Administrator",
  [UserRole.ARBITRO]: "Referee", 
  [UserRole.JUGADOR]: "Player"
} as const;

const ROLE_DESCRIPTIONS = {
  [UserRole.ADMINISTRADOR]: "Full system access and user management",
  [UserRole.ARBITRO]: "Game officiating and match management",
  [UserRole.JUGADOR]: "Team participation and player activities"
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Generate full role options with enhanced metadata
export const fullRoleOptions: SelectOption<UserRole>[] = Object.values(UserRole).map(role => ({
  label: ROLE_LABELS[role],
  value: role,
  description: ROLE_DESCRIPTIONS[role]
}));

// Custom hook for admin existence checking with caching and retry logic
const useAdminExistence = () => {
  const [state, setState] = useState<AdminCheckState>({
    adminExists: null,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  const checkAdminExistsWithRetry = useCallback(async (retryCount = 0): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const exists = await checkAdminExists();
      const now = Date.now();
      
      setState({
        adminExists: exists,
        isLoading: false,
        error: null,
        lastChecked: now
      });

      // Cache the result
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminExistsCache', JSON.stringify({
          exists,
          timestamp: now
        }));
      }
    } catch (error) {
      console.error(`Error checking admin status (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          checkAdminExistsWithRetry(retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check admin status. Assuming admin exists for security.',
          adminExists: true // Fail safe - assume admin exists
        }));
      }
    }
  }, []);

  const refreshAdminStatus = useCallback(() => {
    checkAdminExistsWithRetry();
  }, [checkAdminExistsWithRetry]);

  useEffect(() => {
    let isMounted = true;

    const initializeAdminCheck = async () => {
      // Check cache first
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('adminExistsCache');
        if (cached) {
          try {
            const { exists, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            // Use cached value if it's still valid
            if (now - timestamp < CACHE_DURATION) {
              if (isMounted) {
                setState({
                  adminExists: exists,
                  isLoading: false,
                  error: null,
                  lastChecked: timestamp
                });
              }
              return;
            }
          } catch (error) {
            console.warn('Invalid cache data:', error);
            localStorage.removeItem('adminExistsCache');
          }
        }
      }

      // Fetch fresh data if no valid cache
      if (isMounted) {
        await checkAdminExistsWithRetry();
      }
    };

    initializeAdminCheck();

    return () => {
      isMounted = false;
    };
  }, [checkAdminExistsWithRetry]);

  return {
    ...state,
    refreshAdminStatus
  };
};

// Memoized component for role option rendering
const RoleOptionRenderer = memo(function RoleOptionRenderer({
  option,
  isSelected
}: {
  option: SelectOption<UserRole>;
  isSelected: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg transition-colors ${
      isSelected 
        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {option.label}
        </span>
        {option.value === UserRole.ADMINISTRADOR && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Administrador
          </span>
        )}
      </div>
      {option.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {option.description}
        </p>
      )}
    </div>
  );
});

// Loading component
const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-xs">Revisa los permisos...</span>
    </div>
  );
});

// Error component
const ErrorIndicator = memo(function ErrorIndicator({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void; 
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
      <div className="flex items-center space-x-2">
        <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-xs text-yellow-800 dark:text-yellow-300">{error}</span>
      </div>
      <button
        onClick={onRetry}
        className="text-xs text-yellow-800 dark:text-yellow-300 underline hover:no-underline focus:outline-none"
      >
        Intentar
      </button>
    </div>
  );
});

// Main component
export const RoleSelector = memo(function RoleSelector({
  mode,
  currentRole,
  onRoleChange,
  disabled = false,
  className = "w-full",
  required = false,
  error
}: RoleSelectorProps) {
  const { adminExists, isLoading, error: adminCheckError, refreshAdminStatus } = useAdminExistence();

  // Memoized role options based on admin existence and mode
  const availableRoleOptions = useMemo(() => {
    if (adminExists === null) return fullRoleOptions;

    if (adminExists) {
      if (mode === "create") {
        // Create mode: Don't show admin option if one already exists
        return fullRoleOptions.filter(option => option.value !== UserRole.ADMINISTRADOR);
      } else if (mode === "edit") {
        // Edit mode: Only show admin option if the current user is already an admin
        if (currentRole !== UserRole.ADMINISTRADOR) {
          return fullRoleOptions.filter(option => option.value !== UserRole.ADMINISTRADOR);
        }
      }
    }

    // No admin exists or current user is admin - show all options
    return fullRoleOptions;
  }, [adminExists, mode, currentRole]);

  // Memoized selected option
  const selectedOption = useMemo(() => {
    return availableRoleOptions.find(option => option.value === currentRole) || null;
  }, [availableRoleOptions, currentRole]);

  // Memoized placeholder text
  const placeholderText = useMemo(() => {
    if (isLoading) return "Loading roles...";
    if (adminCheckError) return "Select role (limited options)";
    return "Select a role";
  }, [isLoading, adminCheckError]);

  // Memoized helper text
  const helperText = useMemo(() => {
    if (isLoading) return null;
    if (adminCheckError) return null;
    
    if (mode === "create" && adminExists) {
      return "Administrator role is not available (already exists)";
    }
    if (mode === "edit" && currentRole !== UserRole.ADMINISTRADOR && adminExists) {
      return "Administrator role is not available for role changes";
    }
    if (!adminExists) {
      return "All roles are available";
    }
    return null;
  }, [mode, adminExists, currentRole, isLoading, adminCheckError]);

  // Enhanced onChange handler with validation
  const handleRoleChange = useCallback((option: SelectOption<UserRole> | null) => {
    // Additional validation can be added here
    onRoleChange(option);
  }, [onRoleChange]);

  return (
    <div className="space-y-2">
      <label 
        htmlFor="role-selector"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Role {required && <span className="text-red-500">*</span>}
      </label>
      
      <NeonSelect
        id="role-selector"
        options={availableRoleOptions}
        value={selectedOption}
        onChange={handleRoleChange}
        placeholder={placeholderText}
        className={className}
        disabled={disabled || isLoading}
        // required={required}
        aria-describedby={error ? "role-error" : helperText ? "role-helper" : undefined}
        aria-invalid={!!error}
      />

      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}

      {/* Error indicator */}
      {adminCheckError && (
        <ErrorIndicator 
          error={adminCheckError} 
          onRetry={refreshAdminStatus}
        />
      )}

      {/* Validation error */}
      {error && (
        <p id="role-error" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && !adminCheckError && (
        <p id="role-helper" className="text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {/* Role information */}
      {selectedOption && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Selected Role: {selectedOption.label}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {ROLE_DESCRIPTIONS[selectedOption.value]}
          </p>
        </div>
      )}
    </div>
  );
});