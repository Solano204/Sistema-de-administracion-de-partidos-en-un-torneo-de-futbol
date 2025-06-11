// File: src/app/features/inscription/hooks/inscription-hooks.ts
"use client";
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  InscriptionInfoRecord,
  InscriptionValidationErrors,
  TeamSummaryRecord
} from "../types/inscription-types";
import {
  fetchAllInscriptions,
  createInscription,
  updateInscription,
  deleteInscriptionById,
  searchInscriptionsByTeam,
  searchTeamsByName,
  fetchRecentInscriptions,
} from "../api/inscription-api";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { InscriptionCreateSchema } from "../schemas/inscription-schema";
import { extractValidationErrors } from "../utils/inscription-validation";
import { inscriptionKeys } from "../api/inscription-api-keys";

/**
 * Custom hook for searching teams by name
 */
export function useTeamSearch() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<TeamSummaryRecord | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Handle search term change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  // Query for team search results
  const {
    data: searchResults = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TeamSummaryRecord[], Error>({
    queryKey: ["teams", "team-search", searchTerm],
    queryFn: () => searchTeamsByName(searchTerm),
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

  // Handle team selection
  const handleSelectTeam = useCallback((team: TeamSummaryRecord) => {
    console.log(team);
    setSelectedTeam(team);
  }, []);

  // Clear search and selection
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedTeam(null);
  }, []);

  return {
    searchTerm,
    searchResults,
    selectedTeam,
    isLoading: isLoading || isSearching,
    error,
    handleSearchChange,
    handleSearch,
    handleSelectTeam,
    handleClearSearch,
  };
}

/**
 * Custom hook for inscription mutations (create, update, delete)
 */
export function useInscriptionMutations() {
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

  // Create inscription mutation
  const createMutation = useMutation({
    mutationFn: createInscription,
    onMutate: async (newInscription) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: inscriptionKeys.all });
      
      // Snapshot previous data for rollback
      const previousInscriptions = queryClient.getQueryData(inscriptionKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        inscriptionKeys.lists(),
        (old: InscriptionInfoRecord[] = []) => [
          ...(old || []), 
          { ...newInscription as InscriptionInfoRecord, id: `temp-${Date.now()}` }
        ]
      );

      return { previousInscriptions };
    },
    onError: (err, newInscription, context) => {
      // Rollback on error
      if (context?.previousInscriptions) {
        queryClient.setQueryData(
          inscriptionKeys.lists(),
          context.previousInscriptions
        );
      }

      const errorMessage = extractErrorMessage(err);
      showErrorToast(errorMessage);
    },
    onSuccess: () => {
      showSuccessToast("Inscription created successfully");
    },
    onSettled: () => {
      // Always invalidate all inscription queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all });
    },
  });

  // Update inscription mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; inscription: InscriptionInfoRecord }) =>
      updateInscription(data.id, data.inscription),
    onMutate: async ({ id, inscription }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: inscriptionKeys.all });
      
      // Snapshot previous data for rollback
      const previousInscriptions = queryClient.getQueryData(inscriptionKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        inscriptionKeys.lists(),
        (old: InscriptionInfoRecord[] = []) => {
          return old.map((item) => (item.id === id ? { ...item, ...inscription, id } : item));
        }
      );

      return { previousInscriptions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousInscriptions) {
        queryClient.setQueryData(
          inscriptionKeys.lists(),
          context.previousInscriptions
        );
      }

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update inscription: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Inscription updated successfully");
    },
    onSettled: () => {
      // Always invalidate all inscription queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all });
    },
  });

  // Delete inscription mutation
  const deleteMutation = useMutation({
    mutationFn: deleteInscriptionById,
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: inscriptionKeys.all });
      
      // Snapshot previous data for rollback
      const previousInscriptions = queryClient.getQueryData(inscriptionKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        inscriptionKeys.lists(),
        (old: InscriptionInfoRecord[] = []) => {
          return old.filter((item) => item.id !== id);
        }
      );

      return { previousInscriptions };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousInscriptions) {
        queryClient.setQueryData(
          inscriptionKeys.lists(),
          context.previousInscriptions
        );
      }

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete inscription: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Inscription deleted successfully");
    },
    onSettled: () => {
      // Always invalidate all inscription queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all });
    },
  });

  return {
    // MUTATIONS
    createInscription: createMutation.mutateAsync,
    updateInscription: updateMutation.mutateAsync,
    deleteInscription: deleteMutation.mutateAsync,
    
    // GETTING STATUS OF MUTATIONS
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Current variables for status tracking
    deletingId: deleteMutation.variables as string | undefined,
  };
}

/**
 * Custom hook for inscription form management
 */
export function useInscriptionForm(initialMode: "create" | "edit" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInscriptionId, setSelectedInscriptionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<InscriptionInfoRecord>>({
    id: "",
    nameTeam: "",
    numPlayer: 0,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    createdAt: "",
    updatedAt: "",
  });
  
  const [errors, setErrors] = useState<InscriptionValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      nameTeam: "",
      numPlayer: 0,
      date: new Date().toISOString().split('T')[0],
      amount: 0,
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
    setSelectedInscriptionId(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((inscription: InscriptionInfoRecord) => {
    setFormData({
      ...inscription,
    });
    setSelectedInscriptionId(inscription.id);
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
      const result = InscriptionCreateSchema.partial().safeParse(formData);

      if (!result.success) {
        const newErrors: InscriptionValidationErrors = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof InscriptionInfoRecord;
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
    selectedInscriptionId,
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
 * Custom hook for fetching all inscriptions
 */
export function useInscriptions(searchParam: string = "", containing: boolean = false) {
  const [searchTerm, setSearchTerm] = useState<string>(searchParam);
  const [isContaining, setIsContaining] = useState<boolean>(containing);
  
  const queryFn = useCallback(() => {
    if (searchTerm) {
      return searchInscriptionsByTeam(searchTerm, isContaining);
    }
    return fetchAllInscriptions();
  }, [searchTerm, isContaining]);
  
  const {
    data: inscriptions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<InscriptionInfoRecord[], Error>({
    queryKey: searchTerm 
      ? inscriptionKeys.search(searchTerm, isContaining)
      : inscriptionKeys.lists(),
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
    inscriptions,
    isLoading,
    error,
    searchTerm,
    isContaining,
    setSearchTerm: handleSearchTermChange,
    setIsContaining: handleContainingChange,
    refreshInscriptions: refetch,
  };
}

/**
 * Custom hook for fetching recent inscriptions
 */
export function useRecentInscriptions() {
  const {
    data: recentInscriptions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<InscriptionInfoRecord[], Error>({
    queryKey: inscriptionKeys.recent(),
    queryFn: fetchRecentInscriptions,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    recentInscriptions,
    isLoading,
    error,
    refreshInscriptions: refetch,
  };
}

/**
 * Custom hook for fetching paginated inscriptions
 */
export function usePaginatedInscriptions(
  initialPage: number = 0,
  initialSize: number = 10,
  initialSortBy: string = "date"
) {
  const [page, setPage] = useState<number>(initialPage);
  const [size, setSize] = useState<number>(initialSize);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: inscriptionKeys.lists(),
    queryFn: () => fetchAllInscriptions(),
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // const inscriptions = data?.content || [];
  // const totalElements = data?.totalElements || 0;
  // const totalPages = data?.totalPages || 0;

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when changing size
  }, []);

  const handleSortByChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  return {
    data,
    page,
    size,
    sortBy,
    // totalElements,
    // totalPages,
    isLoading,
    error,
    setPage: handlePageChange,
    setSize: handleSizeChange,
    setSortBy: handleSortByChange,
    refreshInscriptions: refetch,
  };
}