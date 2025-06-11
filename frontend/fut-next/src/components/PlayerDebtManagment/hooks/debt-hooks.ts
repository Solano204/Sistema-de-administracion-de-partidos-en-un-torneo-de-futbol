// File: src/app/features/debt/hooks/debt-hooks.ts
"use client";
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  DebtRecordDto,
  DebtStatus,
  DebtValidationErrors
} from "../types/debt-types";
import { PlayerSummaryRecord } from "../";
import {
  fetchPlayerDebts,
  createPlayerDebt,
  updatePlayerDebt,
  updateDebtStatus,
  deleteDebtById,
  deleteAllPlayerDebts,
  deletePlayerDebtByDate
} from "../api/debt-api";
import { searchPlayersByName } from "../api/debt-api";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { DebtRecordCreateSchema } from "../schemas/debt-schema";
import { extractValidationErrors } from "../utils/debt-validation";
import { debtKeys } from "../api/debt-api-keys";
/**
 * Custom hook for searching players by name
 */
/**
 * Custom hook for searching players by name
 */
export function usePlayerSearch() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummaryRecord | null>(null); // VARIABLE TO UPDATE THE SELECTED PLAYER
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
  
    // Debounce search term to avoid too many API calls
    const handleSearchChange = useCallback((value: string) => {
      setSearchTerm(value);
      
    }, []);
  
    // Only search if we have at least 2 characters
    const shouldSearch = debouncedSearchTerm.length >= 2;
    
    // Query for player search results
    const {
      data: searchResults = [],
      isLoading,
      error,
      refetch,
    } = useQuery<PlayerSummaryRecord[], Error>({
      queryKey: [...debtKeys.all, "player-search", debouncedSearchTerm],
      queryFn: () => searchPlayersByName(debouncedSearchTerm),
      enabled: shouldSearch,
      staleTime: 300000, // 5 minutes
      gcTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
    });
  
    // Handle manual search
    const handleSearch = useCallback(() => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        // setDebouncedSearchTerm(searchTerm);
        refetch().finally(() => setIsSearching(false)); // this trigger the refetch function
      }
    }, [searchTerm, refetch]); 
  
    // HERE WILL SELECTED THE PLAYER PASSING ALL THE INFORMATION (INCLUSIVE THE ID)
    const handleSelectPlayer = useCallback((player: PlayerSummaryRecord) => {
        console.log(player);
      setSelectedPlayer(player);
    }, []);
  
    // Clear search and selection
    const handleClearSearch = useCallback(() => {
      setSearchTerm("");
      setDebouncedSearchTerm("");
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
/**
 * Custom hook for debt mutations (create, update, delete)
 */
export function useDebtMutations(playerId: string) {
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

  // Create debt mutation
  const createMutation = useMutation({
    mutationFn: createPlayerDebt,
    onMutate: async (newDebt) => {
      await queryClient.cancelQueries({ queryKey: debtKeys.byPlayer(playerId) });
      const previousDebts = queryClient.getQueryData(debtKeys.byPlayer(playerId));

      // Optimistic update
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        (old: DebtRecordDto[] = []) => [...old, newDebt as DebtRecordDto]
      );

      return { previousDebts };
    },
    onError: (err, newDebt, context) => {
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(errorMessage);
    },
    onSuccess: () => {
      showSuccessToast("Debt created successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.byPlayer(playerId) });
    },
  });

  // Update debt mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; debt: DebtRecordDto }) =>
      updatePlayerDebt(data.id, data.debt),
    onMutate: async ({ id, debt }) => {
      await queryClient.cancelQueries({ queryKey: debtKeys.byPlayer(playerId) });
      const previousDebts = queryClient.getQueryData(debtKeys.byPlayer(playerId));

      // Optimistic update
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        (old: DebtRecordDto[] = []) => {
          return old.map((item) => (item.Id === id ? debt : item));
        }
      );

      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update debt: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Debt updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.byPlayer(playerId) });
    },
  });

  // Update debt status mutation
  const statusMutation = useMutation({
    mutationFn: (data: { debtId: string; status: DebtStatus; date: string }) =>
      updateDebtStatus(data.debtId, data.status, data.date),
    onMutate: async ({ debtId, status, date }) => {
      await queryClient.cancelQueries({ queryKey: debtKeys.byPlayer(playerId) });
      const previousDebts = queryClient.getQueryData(debtKeys.byPlayer(playerId));

      // Optimistic update
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        (old: DebtRecordDto[] = []) => {
          return old.map((item) => {
            if (item.Id === debtId) {
              return {
                ...item,
                state: status,
                paidDate: status === DebtStatus.PAGADO ? date : item.paidDate,
              };
            }
            return item;
          });
        }
      );

      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update status: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Status updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.byPlayer(playerId) });
    },
  });

  // Delete debt mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDebtById,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: debtKeys.byPlayer(playerId) });
      const previousDebts = queryClient.getQueryData(debtKeys.byPlayer(playerId));

      // Optimistic update
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        (old: DebtRecordDto[] = []) => {
          return old.filter((item) => item.Id !== id);
        }
      );

      return { previousDebts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete debt: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Debt deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.byPlayer(playerId) });
    },
  });

  // Delete all debts mutation
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllPlayerDebts,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: debtKeys.byPlayer(playerId) });
      const previousDebts = queryClient.getQueryData(debtKeys.byPlayer(playerId));

      // Optimistic update
      queryClient.setQueryData(debtKeys.byPlayer(playerId), []);

      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete all debts: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("All debts deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.byPlayer(playerId) });
    },
  });

  // Delete by date mutation
  const deleteByDateMutation = useMutation({
    mutationFn: (data: { playerId: string; dueDate: string }) =>
      deletePlayerDebtByDate(data.playerId, data.dueDate),
    onMutate: async ({ playerId, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: debtKeys.byPlayer(playerId) });
      const previousDebts = queryClient.getQueryData(debtKeys.byPlayer(playerId));

      // Optimistic update - remove all debts with the matching due date
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        (old: DebtRecordDto[] = []) => {
          return old.filter((item) => {
            // Compare the date strings (ignoring time)
            const itemDate = item.dueDate.split('T')[0];
            const targetDate = dueDate.split('T')[0];
            return itemDate !== targetDate;
          });
        }
      );

      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        debtKeys.byPlayer(playerId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete debts by date: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Debts for the specified date deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.byPlayer(playerId) });
    },
  });

  return {
    // MUTATIONS
    createDebt: createMutation.mutateAsync,
    updateDebt: updateMutation.mutateAsync,
    updateDebtStatus: statusMutation.mutateAsync,
    deleteDebt: deleteMutation.mutateAsync,
    deleteAllDebts: deleteAllMutation.mutateAsync,
    deleteDebtsByDate: deleteByDateMutation.mutateAsync,
    
    // GETTING STATUS OF MUTATIONS
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isChangingStatus: statusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingAll: deleteAllMutation.isPending,
    isDeletingByDate: deleteByDateMutation.isPending,
    
    // Current variables for status tracking
    deletingId: deleteMutation.variables as string | undefined,
    statusUpdatingId: statusMutation.variables?.debtId as string | undefined,
  };
}

/**
 * Custom hook for debt form management
 */
export function useDebtForm(playerId: string, initialMode: "create" | "edit" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<DebtRecordDto>>({
    Id: "",
    IdProperty: playerId,
    nameProperty: "",
    amount: 0,
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    paidDate: null,
    state: DebtStatus.PENDIENTE,
  });
  
  const [errors, setErrors] = useState<DebtValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      Id: "",
      IdProperty: playerId,
      nameProperty: "",
      amount: 0,
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      paidDate: null,
      state: DebtStatus.PENDIENTE,
    });
    setErrors({});
  }, [playerId]);

  // Effect to update IdProperty when playerId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      IdProperty: playerId
    }));
  }, [playerId]);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((status: DebtStatus | null) => {
    if (status) {
      setFormData((prev) => ({
        ...prev,
        state: status,
        // If status is PAGADO, set paidDate to today if it's not already set
        paidDate:
          status === DebtStatus.PAGADO && !prev.paidDate
            ? new Date().toISOString().split("T")[0]
            : prev.paidDate,
      }));
    }
  }, []);

  // Modal open/close handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalMode("create");
    setSelectedDebtId(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((debt: DebtRecordDto) => {
    setFormData({
      ...debt,
      // Ensure we're using the player ID from state, not from the debt
      IdProperty: playerId,
    });
    setSelectedDebtId(debt.Id);
    setModalMode("edit");
    setIsModalOpen(true);
  }, [playerId]);

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
      const result = DebtRecordCreateSchema.partial().safeParse(formData);

      if (!result.success) {
        const newErrors: DebtValidationErrors = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof DebtRecordDto;
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
    selectedDebtId,
    handleInputChange,
    handleStatusChange,
    openCreateModal,
    openEditModal,
    closeModal,
    resetForm,
    setFormData,
    handleValidationError,
  };
}


/**
 * Custom hook for fetching debts for a player
 */
export function usePlayerDebts(playerId: string = "") {
    const [playerIdState, setPlayerIdState] = useState<string>(playerId);
    
    const {
      data: debts = [],
      isLoading,
      error,
      refetch,
    } = useQuery<DebtRecordDto[], Error>({
      queryKey: debtKeys.byPlayer(playerIdState),
      queryFn: () => fetchPlayerDebts(playerIdState),
      enabled: !!playerIdState, // Only run query if playerId is provided
      staleTime: 300000, // 5 minutes
      gcTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
    });
  
    const handlePlayerIdChange = useCallback((id: string) => {
      setPlayerIdState(id);
    }, []);
  
    return {
      debts,
      isLoading,
      error,
      playerId: playerIdState,
      setPlayerId: handlePlayerIdChange,
      refreshDebts: refetch,
    };
  }
  