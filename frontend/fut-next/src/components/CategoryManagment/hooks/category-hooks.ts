// File: src/app/features/category/category-hooks.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { toastCustom } from "@/components/Toast/SonnerToast";
import {
  CategoryInfoRecord,
  CategoryValidationErrors,
  CategoryBaseSchema,
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllInTournament,
} from "../components";
import { createBasicInformationBatchDetails, createTeam, deleteTeamByCategory, removePlayersFromTeam, updateBasicInformationBatchDetails, updateTeam } from "@/components/TeamManagment/api/team-api";
import { categoryKeys } from "../api/category-api-keys";

/**
 * Custom hook for fetching categories with search functionality
 */
export function useCategoriesList(initialSearchQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CategoryInfoRecord[], Error>({
    queryKey: categoryKeys.lists(),
    queryFn: fetchAllCategories,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim()
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    categories: filteredCategories,
    isLoading,
    error,
    searchQuery,
    handleSearch,
    refreshCategories: refetch,
  };
}

/**
 * Custom hook for category mutations (create, update, delete)
 */// Modified mutation functions in useCategoryMutations hook

export function useCategoryMutations() {
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
      // If error is from API and contains structured error data
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        
        // Check for structured error response with details
        if (response?.data) {
          const data = response.data;
          
          // Check for specific error details formats
          if (data.errors && typeof data.errors === 'object') {
            // Format: { errors: { fieldName: "error message" } }
            return Object.entries(data.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
          }
          
          // Check for message field
          if (data.message) {
            return data.message;
          }
          
          // Check for details field
          if (data.details) {
            return data.details;
          }
        }
        
        // If we have a status text, use it
        if (response?.statusText) {
          return `${response.status}: ${response.statusText}`;
        }
      }
      
      // Fallback to standard error message
      if (err instanceof Error) {
        return err.message;
      }
      
      // Last resort
      return typeof err === 'string' ? err : "An unexpected error occurred";
    };
  
    // Create category mutation
    const createMutation = useMutation({
      mutationFn: createCategory,
      onMutate: async (newCategory) => {
        await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
        const previousCategories = queryClient.getQueryData(categoryKeys.lists());
  
        queryClient.setQueryData(
          categoryKeys.lists(),
          (old: CategoryInfoRecord[] = []) => [
            ...old,
            { ...newCategory, id: "temp-id" } as CategoryInfoRecord,
          ]
        );
  
        return { previousCategories };
      },
      onError: (err, _, context) => {
        queryClient.setQueryData(
          categoryKeys.lists(),
          context?.previousCategories
        );
  
        const errorMessage = extractErrorMessage(err);
        showErrorToast(errorMessage);
      },
      onSuccess: () => {
        showSuccessToast("Category created successfully");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      },
    });
  
    // Update category mutation
    const updateMutation = useMutation({
      mutationFn: (data: { id: string; category: Partial<CategoryInfoRecord> }) =>
        updateCategory(data.id, data.category),
      onMutate: async ({ id, category }) => {
        await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
        const previousCategories = queryClient.getQueryData(categoryKeys.lists());
  
        queryClient.setQueryData(
          categoryKeys.lists(),
          (old: CategoryInfoRecord[] = []) => {
            return old.map((item) =>
              item.id === id ? { ...item, ...category } : item
            );
          }
        );
  
        return { previousCategories, updatedId: id };
      },
      onError: (err, _, context) => {
        queryClient.setQueryData(
          categoryKeys.lists(),
          context?.previousCategories
        );
  
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to update: ${errorMessage}`);
      },
      onSuccess: () => {
        showSuccessToast("Category updated successfully");
      },
      onSettled: (_, __, variables, context) => {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        if (context?.updatedId) {
          queryClient.invalidateQueries({
            queryKey: categoryKeys.detail(context.updatedId),
          });
        }
      },
    });
  



    // Delete category mutation
    const deleteMutation = useMutation({
      mutationFn: deleteCategory,
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
        const previousCategories = queryClient.getQueryData(categoryKeys.lists());
  
        queryClient.setQueryData(
          categoryKeys.lists(),
          (old: CategoryInfoRecord[] = []) => old.filter((item) => item.id !== id)
        );
  
        return { previousCategories };
      },
      onError: (err, __, context) => {
        queryClient.setQueryData(
          categoryKeys.lists(),
          context?.previousCategories
        );
        
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to delete: ${errorMessage}`);
      },
      onSuccess: () => {
        showSuccessToast("Category deleted successfully");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      },
    });


    // Create team mutation
    const createTeamMutation = useMutation({
      mutationFn: createTeam,
      onMutate: async (teamData) => {
        // If the team has a categoryId, invalidate related queries
        if (teamData.categoryId) {
          await queryClient.cancelQueries({ queryKey: ["teamsByCategory", teamData.categoryId] });
          await queryClient.cancelQueries({ queryKey: ["teamsByCategory", teamData.categoryId, teamData.id] });
        }
        return { teamData };
      },
      onError: (err) => {
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to create team: ${errorMessage}`);
      },
      onSuccess: (_, teamData) => {
        // Invalidate teams by category query
        if (teamData.categoryId) {
          queryClient.invalidateQueries({ queryKey: ["teamsByCategory", teamData.categoryId] });
        }
        showSuccessToast("Team created successfully");
      }
    });
    
    // Update team mutation
    const updateTeamMutation = useMutation({
      mutationFn: ({ categoryId, teamId, team }: { categoryId: string, teamId: string, team: any }) => 
        updateTeam(categoryId, teamId, team),
      onMutate: async ({ categoryId, teamId }) => {
        await queryClient.cancelQueries({ queryKey: ["teamsByCategory", categoryId] });
        await queryClient.cancelQueries({ queryKey: ["teamsByCategory", categoryId, teamId] });
        return { categoryId };

      },
      onError: (err) => {
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to update team: ${errorMessage}`);
      },
      onSuccess: (_, { categoryId }) => {
        queryClient.invalidateQueries({ queryKey: ["teamsByCategory", categoryId] });
        showSuccessToast("Team updated successfully");
      }
    });
    
    // Delete team mutation
    const deleteTeamMutation = useMutation({
      mutationFn: ({ categoryId, teamId }: { categoryId: string, teamId: string }) => 
        deleteTeamByCategory(categoryId, teamId),
      onMutate: async ({ categoryId, teamId }) => {
        await queryClient.cancelQueries({ queryKey: ["teamsByCategory", categoryId] });
        await queryClient.cancelQueries({ queryKey: ["teamsByCategory", categoryId, teamId] });
        return { categoryId };
      },
      onError: (err) => {
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to delete team: ${errorMessage}`);
      },
      onSuccess: (_, { categoryId }) => {
        queryClient.invalidateQueries({ queryKey: ["teamsByCategory", categoryId] });
        showSuccessToast("Team deleted successfully");
      }
    });
    
    // Create players mutation
    const createPlayersMutation = useMutation({
      mutationFn: ({ players, teamId }: { players: any[], teamId: string }) => 
        createBasicInformationBatchDetails(players, teamId),
      onSuccess: (_, { teamId }) => {
        // Invalidate any queries that may have player data
        queryClient.invalidateQueries({ queryKey: ["team", teamId] });
        showSuccessToast("Players created successfully");
      },
      onError: (err) => {
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to create players: ${errorMessage}`);
      }
    });
    
    // Update players mutation
    const updatePlayersMutation = useMutation({
      mutationFn: updateBasicInformationBatchDetails,
      onSuccess: (_, players) => {
        if (players.length > 0 && players[0].teamId) {
          queryClient.invalidateQueries({ queryKey: ["team", players[0].teamId] });
        }
        showSuccessToast("Players updated successfully");
      },
      onError: (err) => {
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to update players: ${errorMessage}`);
      }
    });
    
    // Delete players mutation
    const deletePlayersMutation = useMutation({
      mutationFn: ({ teamId, playerIds }: { teamId: string, playerIds: string[] }) => 
        removePlayersFromTeam(teamId, playerIds),
      onSuccess: (_, { teamId }) => {
        queryClient.invalidateQueries({ queryKey: ["team", teamId] });
        showSuccessToast("Players removed successfully");
      },
      onError: (err) => {
        const errorMessage = extractErrorMessage(err);
        showErrorToast(`Failed to remove players: ${errorMessage}`);
      }
    });
    

  
    return {
      // MUTATIONS
      createCategory: createMutation.mutateAsync,
      updateCategory: updateMutation.mutateAsync,
      deleteCategory: deleteMutation.mutateAsync,
      deleteAllInTournament: deleteAllInTournament,
      createTeam: createTeamMutation.mutateAsync,
      updateTeam: updateTeamMutation.mutateAsync,
      deleteTeam: deleteTeamMutation.mutateAsync,
      createPlayers: createPlayersMutation.mutateAsync,
      updatePlayers: updatePlayersMutation.mutateAsync,
      deletePlayers: deletePlayersMutation.mutateAsync,
      // GETTING STATUS OF MUTATIONS
      isCreatingTeam: createTeamMutation.isPending,
      isUpdatingTeam: updateTeamMutation.isPending,
      isDeletingTeam: deleteTeamMutation.isPending,
      isCreatingPlayers: createPlayersMutation.isPending,
      isUpdatingPlayers: updatePlayersMutation.isPending,
      isDeletingPlayers: deletePlayersMutation.isPending,
      isCreating: createMutation.isPending, 
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      deletingId: deleteMutation.variables as string | undefined,
    };
  }


/**
 * Custom hook for category form management (STATES AND ACTIONS )
 */
export function useCategoryForm(initialMode: "create" | "edit" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Partial<CategoryInfoRecord>>({
    name: "",
    imageUrl: "",
    ageRange: { minAge: 0, maxAge: 18 },
  });
  
  const [errors, setErrors] = useState<CategoryValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      imageUrl: "",
      ageRange: { minAge: 0, maxAge: 18 },
    });
    setErrors({});
    setTempImageFile(null);
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name === "minAge" || name === "maxAge") {
      setFormData((prev) => ({
        ...prev,
        ageRange: {
          ...(prev.ageRange || { minAge: 0, maxAge: 18 }),
          [name]: type === "number" ? parseInt(value) || 0 : 0,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  }, []);

  // Handle image change
  const handleImageChange = (file: File | null, previewUrl: string) => {
    setTempImageFile(file);
    setFormData((prev) => ({
      ...prev,
      imageUrl: previewUrl || "",
    }));


}

  // Modal open/close handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalMode("create");
    setSelectedCategoryId(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((category: CategoryInfoRecord) => {
    setFormData({
      ...category,
    });
    setSelectedCategoryId(category.id);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm]);

  // Real-time form validation
  useEffect(() => {
    try {
      // Validate against partial schema when form is incomplete
      const result = CategoryBaseSchema.partial().safeParse(formData);

      if (!result.success) {
        const newErrors: CategoryValidationErrors = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0] === "ageRange" && issue.path.length > 1) {
            if (!newErrors.ageRange) {
              newErrors.ageRange = [];
            }
            newErrors.ageRange.push(issue.message);
          } else {
            const path = issue.path[0] as keyof CategoryInfoRecord;
            newErrors[path] = (newErrors[path] || []).concat(issue.message);
          }
        });
        setErrors(newErrors);
        setIsValid(false);
      } else {
        // Check ageRange validation
        if (formData.ageRange) {
          const { minAge, maxAge } = formData.ageRange;
          if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
            setErrors({
              ageRange: ["Minimum age must be less than or equal to maximum age"],
            });
            setIsValid(false);
            return;
          }
        }
        setErrors({});
        setIsValid(true);
      }
    } catch (error) {
      console.error("Validation error:", error);
      setIsValid(false);
    }
  }, [formData]);

  // Handle validation errors from form submission
  const handleValidationError = useCallback((error: unknown) => {
    if (error instanceof z.ZodError) {
      const newErrors: CategoryValidationErrors = {};
      error.issues.forEach((issue) => {
        if (issue.path[0] === "ageRange" && issue.path.length > 1) {
          if (!newErrors.ageRange) {
            newErrors.ageRange = [];
          }
          newErrors.ageRange.push(issue.message);
        } else {
          const path = issue.path[0] as keyof CategoryInfoRecord;
          newErrors[path] = (newErrors[path] || []).concat(issue.message);
        }
      });
      setErrors(newErrors);
    } else {
      console.error("Form validation error:", error);
    }
  }, []);

  return {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedCategoryId,
    tempImageFile,
    handleInputChange,
    handleImageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    resetForm,
    setFormData,
    handleValidationError,
  };
}