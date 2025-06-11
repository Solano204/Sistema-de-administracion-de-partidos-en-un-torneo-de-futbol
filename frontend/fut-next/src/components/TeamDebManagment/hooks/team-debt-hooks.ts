// File: src/app/features/teamDebt/hooks/team-debt-hooks.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  TeamDebtRecordDto,
  DebtStatus,
  TeamDebtValidationErrors
} from "../types/team-debt-types";
import {
  fetchTeamDebts,
  createTeamDebt,
  updateTeamDebt,
  updateTeamDebtStatus,
  deleteTeamDebtById,
  deleteAllTeamDebts,
  deleteTeamDebtByDate
} from "../api/team-debt-api";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { TeamDebtRecordCreateSchema } from "../schemas/team-debt-schema";
import { extractValidationErrors } from "../utils/team-debt-validation";
import { teamDebtKeys } from "../api/team-debt-api-keys";

/**
 * Custom hook for fetching debts for a team
 */
export function useTeamDebts(teamId: string = "") {
  const [teamIdState, setTeamIdState] = useState<string>(teamId);
  
  const {
    data: debts = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TeamDebtRecordDto[], Error>({
    queryKey: teamDebtKeys.byTeam(teamIdState),
    queryFn: () => fetchTeamDebts(teamIdState),
    enabled: !!teamIdState, // Only run query if teamId is provided
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleTeamIdChange = useCallback((id: string) => {
    setTeamIdState(id);
  }, []);

  return {
    debts,
    isLoading,
    error,
    teamId: teamIdState,
    setTeamId: handleTeamIdChange,
    refreshDebts: refetch,
  };
}

/**
 * Custom hook for team debt mutations (create, update, delete)
 */
export function useTeamDebtMutations(teamId: string) {
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

  // Create team debt mutation
  const createMutation = useMutation({
    mutationFn: createTeamDebt,
    onMutate: async (newDebt) => {
      await queryClient.cancelQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
      const previousDebts = queryClient.getQueryData(teamDebtKeys.byTeam(teamId));

      // Optimistic update
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        (old: TeamDebtRecordDto[] = []) => [...old, newDebt as TeamDebtRecordDto]
      );

      return { previousDebts };
    },
    onError: (err, newDebt, context) => {
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(errorMessage);
    },
    onSuccess: () => {
      showSuccessToast("Team debt created successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
    },
  });

  // Update team debt mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; debt: TeamDebtRecordDto }) =>
      updateTeamDebt(data.id, data.debt),
    onMutate: async ({ id, debt }) => {
      await queryClient.cancelQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
      const previousDebts = queryClient.getQueryData(teamDebtKeys.byTeam(teamId));

      // Optimistic update
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        (old: TeamDebtRecordDto[] = []) => {
          return old.map((item) => (item.Id === id ? debt : item));
        }
      );

      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update team debt: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Team debt updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
    },
  });

  // Update team debt status mutation
  const statusMutation = useMutation({
    mutationFn: (data: { debtId: string; status: DebtStatus; date: string }) =>
      updateTeamDebtStatus(data.debtId, data.status, data.date),
    onMutate: async ({ debtId, status, date }) => {
      await queryClient.cancelQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
      const previousDebts = queryClient.getQueryData(teamDebtKeys.byTeam(teamId));

      // Optimistic update
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        (old: TeamDebtRecordDto[] = []) => {
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
        teamDebtKeys.byTeam(teamId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update status: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Team debt status updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
    },
  });

  // Delete team debt mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTeamDebtById,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
      const previousDebts = queryClient.getQueryData(teamDebtKeys.byTeam(teamId));

      // Optimistic update
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        (old: TeamDebtRecordDto[] = []) => {
          return old.filter((item) => item.Id !== id);
        }
      );

      return { previousDebts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete team debt: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Team debt deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
    },
  });

  // Delete all team debts mutation
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllTeamDebts,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
      const previousDebts = queryClient.getQueryData(teamDebtKeys.byTeam(teamId));

      // Optimistic update
      queryClient.setQueryData(teamDebtKeys.byTeam(teamId), []);

      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete all team debts: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("All team debts deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
    },
  });

  // Delete by date mutation
  const deleteByDateMutation = useMutation({
    mutationFn: (data: { teamId: string; dueDate: string }) =>
      deleteTeamDebtByDate(data.teamId, data.dueDate),
    onMutate: async ({ teamId, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
      const previousDebts = queryClient.getQueryData(teamDebtKeys.byTeam(teamId));

      // Optimistic update - remove all debts with the matching due date
      queryClient.setQueryData(
        teamDebtKeys.byTeam(teamId),
        (old: TeamDebtRecordDto[] = []) => {
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
        teamDebtKeys.byTeam(teamId),
        context?.previousDebts
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete team debts by date: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Team debts for the specified date deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamDebtKeys.byTeam(teamId) });
    },
  });

  return {
    // MUTATIONS
    createTeamDebt: createMutation.mutateAsync,
    updateTeamDebt: updateMutation.mutateAsync,
    updateTeamDebtStatus: statusMutation.mutateAsync,
    deleteTeamDebt: deleteMutation.mutateAsync,
    deleteAllTeamDebts: deleteAllMutation.mutateAsync,
    deleteTeamDebtsByDate: deleteByDateMutation.mutateAsync,
    
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
 * Custom hook for team debt form management
 */
export function useTeamDebtForm(teamId: string, initialMode: "create" | "edit" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<TeamDebtRecordDto>>({
    Id: "",
    IdProperty: teamId,
    nameProperty: "",
    amount: 0,
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    paidDate: null,
    state: DebtStatus.PENDIENTE,
  });
  
  const [errors, setErrors] = useState<TeamDebtValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      Id: "",
      IdProperty: teamId,
      nameProperty: "",
      amount: 0,
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      paidDate: null,
      state: DebtStatus.PENDIENTE,
    });
    setErrors({});
  }, [teamId]);

  // Effect to update IdProperty when teamId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      IdProperty: teamId
    }));
  }, [teamId]);


  
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

  const openEditModal = useCallback((debt: TeamDebtRecordDto) => {
    setFormData({
      ...debt,
      // Ensure we're using the team ID from state, not from the debt
      IdProperty: teamId,
    });
    setSelectedDebtId(debt.Id);
    setModalMode("edit");
    setIsModalOpen(true);
  }, [teamId]);

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
      const result = TeamDebtRecordCreateSchema.partial().safeParse(formData);

      if (!result.success) {
        const newErrors: TeamDebtValidationErrors = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof TeamDebtRecordDto;
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


