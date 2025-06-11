// File: src/app/features/credential/hooks/credential-hooks.ts
"use client";
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  CredentialInfoRecord,
  CredentialValidationErrors,
  PlayerSummaryRecord
} from "../types/credential-types";
import {
  fetchAllCredentials,
  createCredential,
  updateCredential,
  deleteCredentialById,
  searchCredentialsByName,
  searchPlayersByName
} from "../api/credential-api";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { CredentialCreateSchema } from "../schemas/credential-schema";
import { extractValidationErrors } from "../utils/credential-validation";
import { deleteAllInTournament } from "@/components/CategoryManagment/components";
import { credentialKeys } from "../api/credential-api-keys";

/**
 * Custom hook for searching players by name (reused from debt module)
 */
export function usePlayerSearch() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummaryRecord | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Handle search term change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  // Query for player search results
  const {
    data: searchResults = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PlayerSummaryRecord[], Error>({
    queryKey: ["debts", "player-search", searchTerm],
    queryFn: () => searchPlayersByName(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle manual search
  const handleSearch = useCallback(() => {
    if (searchTerm.trim().length >= 2) {
      setIsSearching(true);
      refetch().finally(() => setIsSearching(false));
    }
  }, [searchTerm, refetch]);

  // Handle player selection
  const handleSelectPlayer = useCallback((player: PlayerSummaryRecord) => {
    console.log(player);
    setSelectedPlayer(player);
  }, []);

  // Clear search and selection
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedPlayer(null);
  }, []);

  return {
    searchTerm,
    searchResults,
    selectedPlayer,
    isLoading: isLoading || isSearching,
    error,
    handleSearchChange,
    handleSearch,
    handleSelectPlayer,
    handleClearSearch,
  };
}


export function useCredentialMutations() {
  const queryClient = useQueryClient();

  // Toast helpers
  const showSuccessToast = useCallback((message: string) => {
    toastCustom(
      {
        title: "Success",
        description: message,
        button: { label: "Dismiss", onClick: () => {} },
      },
      "success"
    );
  }, []);

  const showErrorToast = useCallback((message: string, duration = 7000) => {
    toastCustom(
      {
        title: "Error",
        description: message,
        button: { label: "Dismiss", onClick: () => {} },
      },
      "error",
      duration
    );
  }, []);

  // Helper to extract user-friendly error message
  const extractErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as any).response;
      
      if (response?.data) {
        const data = response.data;
        
        if (data.errors && typeof data.errors === 'object') {
          return Object.entries(data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
        }
        
        if (data.message) {
          return data.message;
        }
        
        if (data.details) {
          return data.details;
        }
      }
      
      if (response?.statusText) {
        return `${response.status}: ${response.statusText}`;
      }
    }
    
    if (err instanceof Error) {
      return err.message;
    }
    
    return typeof err === 'string' ? err : "An unexpected error occurred";
  };

  // Create credential mutation
 // Create credential mutation
const createMutation = useMutation({
  mutationFn: createCredential,
  onMutate: async (newCredential) => {
    // Cancel any outgoing refetches to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey: credentialKeys.all });
    
    // Snapshot previous data for rollback
    const previousCredentials = queryClient.getQueryData(credentialKeys.lists());

    // Optimistic update
    queryClient.setQueryData(
      credentialKeys.lists(),
      (old: CredentialInfoRecord[] = []) => [
        ...(old || []), 
        { ...newCredential as CredentialInfoRecord, id: `temp-${Date.now()}` }
      ]
    );

    return { previousCredentials };
  },
  onError: (err, newCredential, context) => {
    // Rollback on error
    if (context?.previousCredentials) {
      queryClient.setQueryData(
        credentialKeys.lists(),
        context.previousCredentials
      );
    }

    const errorMessage = extractErrorMessage(err);
    showErrorToast(errorMessage);
  },
  onSuccess: () => {
    showSuccessToast("Credential created successfully");
  },
  onSettled: () => {
    // Always invalidate all credential queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: credentialKeys.all });
  },
});

// Update credential mutation
const updateMutation = useMutation({
  mutationFn: (data: { id: string; credential: CredentialInfoRecord }) =>
    updateCredential(data.id, data.credential),
  onMutate: async ({ id, credential }) => {
    // Cancel any outgoing refetches to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey: credentialKeys.all });
    
    // Snapshot previous data for rollback
    const previousCredentials = queryClient.getQueryData(credentialKeys.lists());

    // Optimistic update
    queryClient.setQueryData(
      credentialKeys.lists(),
      (old: CredentialInfoRecord[] = []) => {
        return old.map((item) => (item.id === id ? { ...item, ...credential, id } : item));
      }
    );

    return { previousCredentials };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousCredentials) {
      queryClient.setQueryData(
        credentialKeys.lists(),
        context.previousCredentials
      );
    }

    const errorMessage = extractErrorMessage(err);
    showErrorToast(`Failed to update credential: ${errorMessage}`);
  },
  onSuccess: () => {
    showSuccessToast("Credential updated successfully");
  },
  onSettled: () => {
    // Always invalidate all credential queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: credentialKeys.all });
  },
});

// Delete tournament teams all
const deleteTournamentMutation = useMutation({
  mutationFn: deleteAllInTournament,
  onMutate: async (id) => {
    // Cancel any outgoing refreshes to avoid optimistic update being overwritten
    await queryClient.cancelQueries({ queryKey: ["teamsByCategory", id] });
    
    // Return previous state in case we need to rollback
    return { previousTeams: queryClient.getQueryData(["teamsByCategory", id]) };
  },
  onError: (err, id, context) => {
    // If the mutation fails, use the context we saved to roll back
    if (context?.previousTeams) {
      queryClient.setQueryData(["teamsByCategory", id], context.previousTeams);
    }
    
    const errorMessage = extractErrorMessage(err);
    showErrorToast(`Failed to delete tournament teams: ${errorMessage}`);
  },
  onSuccess: (_, id) => {
    // Invalidate relevant queries after successful deletion
    queryClient.invalidateQueries({ queryKey: ["teamsByCategory", id] });
    showSuccessToast("All teams in tournament deleted successfully");
  }
});
// Delete credential mutation
const deleteMutation = useMutation({
  mutationFn: deleteCredentialById,
  onMutate: async (id) => {
    // Cancel any outgoing refetches to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey: credentialKeys.all });
    
    // Snapshot previous data for rollback
    const previousCredentials = queryClient.getQueryData(credentialKeys.lists());

    // Optimistic update
    queryClient.setQueryData(
      credentialKeys.lists(),
      (old: CredentialInfoRecord[] = []) => {
        return old.filter((item) => item.id !== id);
      }
    );

    return { previousCredentials };
  },
  onError: (err, id, context) => {
    // Rollback on error
    if (context?.previousCredentials) {
      queryClient.setQueryData(
        credentialKeys.lists(),
        context.previousCredentials
      );
    }

    const errorMessage = extractErrorMessage(err);
    showErrorToast(`Failed to delete credential: ${errorMessage}`);
  },
  onSuccess: () => {
    showSuccessToast("Credential deleted successfully");
  },
  onSettled: () => {
    // Always invalidate all credential queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: credentialKeys.all });
  },


  
});



  return {
    // MUTATIONS
    createCredential: createMutation.mutateAsync,
    updateCredential: updateMutation.mutateAsync,
    deleteCredential: deleteMutation.mutateAsync,
    deleteAllInTournament: deleteTournamentMutation.mutateAsync,
       // Mutations
      
    // GETTING STATUS OF MUTATIONS
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeletingTournament: deleteTournamentMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Current variables for status tracking
    deletingId: deleteMutation.variables as string | undefined,


 
  };
}

/**
 * Custom hook for credential form management
 */
export function useCredentialForm(initialMode: "create" | "edit" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<CredentialInfoRecord>>({
    id: "",
    playerName: "",
    amount: 0,
    description: "",
    createdAt: "",
    updatedAt: "",
  });
  
  const [errors, setErrors] = useState<CredentialValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      playerName: "",
      amount: 0,
      description: "",
      transactionDate: new Date().toISOString(),
      createdAt: "",
      updatedAt: "",
    });
    setErrors({});
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }, []);

  // Modal open/close handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalMode("create");
    setSelectedCredentialId(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((credential: CredentialInfoRecord) => {
    setFormData({
      ...credential,
    });
    setSelectedCredentialId(credential.id);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm]);

  // Handle validation errors from form submission
  const handleValidationError = useCallback((error: unknown) => {
    if (error instanceof z.ZodError) {
      const newErrors = extractValidationErrors(error);
      setErrors(newErrors);
    } else {
      console.error("Form validation error:", error);
    }
  }, []);

  // Real-time form validation
  useEffect(() => {
    try {
      // Validate against partial schema when form is incomplete
      const result = CredentialCreateSchema.partial().safeParse(formData);

      if (!result.success) {
        const newErrors: CredentialValidationErrors = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof CredentialInfoRecord;
          if (!newErrors[path]) {
            newErrors[path] = [];
          }
          newErrors[path]!.push(issue.message);
        });
        setErrors(newErrors);
        setIsValid(false);
      } else {
        setErrors({});
        setIsValid(true);
      }
    } catch (error) {
      console.error("Validation error:", error);
      setIsValid(false);
    }
  }, [formData]);

  return {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedCredentialId,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    resetForm,
    setFormData,
    handleValidationError,
  };
}

/**
 * Custom hook for fetching all credentials
 */
export function useCredentials(searchParam: string = "", containing: boolean = false) {
  const [searchTerm, setSearchTerm] = useState<string>(searchParam);
  const [isContaining, setIsContaining] = useState<boolean>(containing);
  
  const queryFn = useCallback(() => {
    if (searchTerm) {
      return searchCredentialsByName(searchTerm, isContaining);
    }
    return fetchAllCredentials();
  }, [searchTerm, isContaining]);
  
  const {
    data: credentials = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CredentialInfoRecord[], Error>({
    queryKey: searchTerm 
      ? credentialKeys.search(searchTerm, isContaining)
      : credentialKeys.lists(),
    queryFn,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleContainingChange = useCallback((value: boolean) => {
    setIsContaining(value);
  }, []);

  return {
    credentials,
    isLoading,
    error,
    searchTerm,
    isContaining,
    setSearchTerm: handleSearchTermChange,
    setIsContaining: handleContainingChange,
    refreshCredentials: refetch,
  };
}