// File: src/app/features/referee/hooks/referee-hooks.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  UserDetailsRecordFull, 
  UserRegisterRecord,
  UserUpdateBasicInformation,
  UserStatus, 
  UserRole,
  RefereeValidationErrors
} from "../types/referee-types";
import {
  fetchAllReferees,
  createReferee,
  updateRefereeDetails,
  updateRefereeStatus,
  deleteReferee,
  updateRefereePhoto,
} from "../api/referee-api";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { extractValidationErrors } from "../utils/referee-validation";
import { refereeKeys } from "../api/referee-api-keys";

/**
 * Custom hook for fetching referees with search functionality
 */
export function useRefereesList(initialSearchQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null);

  const {
    data: referees = [],
    isLoading,
    error,
    refetch,
  } = useQuery<UserDetailsRecordFull[], Error>({
    queryKey: refereeKeys.lists(),
    queryFn: fetchAllReferees,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Filter referees based on search query and filters
  const filteredReferees = referees.filter((referee) => {
    const matchesSearch = searchQuery.trim()
      ? `${referee.firstName} ${referee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus = statusFilter
      ? referee.status === statusFilter
      : true;

    const matchesRole = roleFilter 
      ? referee.role === roleFilter 
      : true;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilter = useCallback((status: UserStatus | null) => {
    setStatusFilter(status);
  }, []);

  const handleRoleFilter = useCallback((role: UserRole | null) => {
    setRoleFilter(role);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter(null);
    setRoleFilter(null);
  }, []);

  return {
    referees: filteredReferees,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    roleFilter,
    handleSearch,
    handleStatusFilter,
    handleRoleFilter,
    clearFilters,
    refreshReferees: refetch,
  };
}

/**
 * Custom hook for referee mutations (create, update, delete)
 */
export function useRefereeMutations() {
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

  // Create referee mutation
  const createMutation = useMutation({
    mutationFn: createReferee,
    onMutate: async (newReferee) => {
      await queryClient.cancelQueries({ queryKey: refereeKeys.lists() });
      const previousReferees = queryClient.getQueryData(refereeKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        refereeKeys.lists(),
        (old: UserDetailsRecordFull[] = []) => [
          ...old,
          {
            id: "temp-id",
            firstName: newReferee.firstName,
            lastName: newReferee.lastName,
            email: newReferee.email,
            birthDate: newReferee.birthDate,
            age: newReferee.age,
            role: newReferee.role,
            urlPhoto: newReferee.urlPhoto,
            status: newReferee.status || UserStatus.ACTIVO,
            user: newReferee.user
          } as UserDetailsRecordFull,
        ]
      );

      return { previousReferees };
    },
    onError: (err, newReferee, context) => {
      queryClient.setQueryData(
        refereeKeys.lists(),
        context?.previousReferees
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(errorMessage);
    },
    onSuccess: () => {
      showSuccessToast("Referee created successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
    },
  });

  // Update referee details mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateBasicInformation) =>
      updateRefereeDetails(data.id, data),
    onMutate: async (updatedReferee) => {
      await queryClient.cancelQueries({ queryKey: refereeKeys.lists() });
      const previousReferees = queryClient.getQueryData(refereeKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        refereeKeys.lists(),
        (old: UserDetailsRecordFull[] = []) => {
          return old.map((referee) =>
            referee.id === updatedReferee.id
              ? {
                  ...referee,
                  firstName: updatedReferee.firstName,
                  lastName: updatedReferee.lastName,
                  birthDate: updatedReferee.birthDate,
                  age: updatedReferee.age,
                  email: updatedReferee.email,
                  role: updatedReferee.role || referee.role,
                }
              : referee
          );
        }
      );

      return { previousReferees };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        refereeKeys.lists(),
        context?.previousReferees
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update referee: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Referee updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
    },
  });

  // Update referee status mutation
  const statusMutation = useMutation({
    mutationFn: (data: { refereeId: string; status: UserStatus }) =>
      updateRefereeStatus(data.refereeId, data.status),
    onMutate: async ({ refereeId, status }) => {
      await queryClient.cancelQueries({ queryKey: refereeKeys.lists() });
      const previousReferees = queryClient.getQueryData(refereeKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        refereeKeys.lists(),
        (old: UserDetailsRecordFull[] = []) => {
          return old.map((referee) =>
            referee.id === refereeId ? { ...referee, status } : referee
          );
        }
      );

      return { previousReferees };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        refereeKeys.lists(),
        context?.previousReferees
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update status: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Status updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
    },
  });

  // Update referee photo mutation
  const photoMutation = useMutation({
    mutationFn: updateRefereePhoto,
    onMutate: async (photoUpdate) => {
      await queryClient.cancelQueries({ queryKey: refereeKeys.lists() });
      const previousReferees = queryClient.getQueryData(refereeKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        refereeKeys.lists(),
        (old: UserDetailsRecordFull[] = []) => {
          return old.map((referee) =>
            referee.id === photoUpdate.id
              ? { ...referee, profile: photoUpdate.profilePhoto }
              : referee
          );
        }
      );

      return { previousReferees };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        refereeKeys.lists(),
        context?.previousReferees
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to update profile photo: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Profile photo updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
    },
  });

  // Delete referee mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReferee,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: refereeKeys.lists() });
      const previousReferees = queryClient.getQueryData(refereeKeys.lists());

      // Optimistic update
      queryClient.setQueryData(
        refereeKeys.lists(),
        (old: UserDetailsRecordFull[] = []) =>
          old.filter((referee) => referee.id !== id)
      );

      return { previousReferees };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(
        refereeKeys.lists(),
        context?.previousReferees
      );

      const errorMessage = extractErrorMessage(err);
      showErrorToast(`Failed to delete referee: ${errorMessage}`);
    },
    onSuccess: () => {
      showSuccessToast("Referee deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
    },
  });

  return {
    // MUTATIONS
    createReferee: createMutation.mutateAsync,
    updateRefereeDetails: updateMutation.mutateAsync,
    updateRefereeStatus: statusMutation.mutateAsync,
    updateRefereePhoto: photoMutation.mutateAsync,
    deleteReferee: deleteMutation.mutateAsync,
    
    // GETTING STATUS OF MUTATIONS
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isChangingStatus: statusMutation.isPending,
    isUpdatingPhoto: photoMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Current variables for status tracking
    deletingId: deleteMutation.variables as string | undefined,
    statusUpdatingId: statusMutation.variables?.refereeId as string | undefined,
  };
}

/**
 * Custom hook for referee form management
 */
export function useRefereeForm(initialMode: "create" | "edit" | "photo" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit" | "photo">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRefereeId, setSelectedRefereeId] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Partial<UserRegisterRecord>>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: new Date().toISOString().split("T")[0],
    age: 18,
    user: "",
    password: "",
    role: UserRole.ARBITRO,
    urlPhoto: "",
    status: UserStatus.ACTIVO
  });
  
  const [errors, setErrors] = useState<RefereeValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      birthDate: new Date().toISOString().split("T")[0],
      age: 18,
      user: "",
      password: "",
      role: UserRole.ARBITRO,
      urlPhoto: "",
      status: UserStatus.ACTIVO
    });
    setErrors({});
    setTempImageFile(null);
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // Special handling for birthDate to auto-calculate age
    if (name === "birthDate") {
      try {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        setFormData((prev) => ({
          ...prev,
          [name]: value,
          age: age,
        }));
      } catch (error) {
        console.error("Error calculating age:", error);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((status: UserStatus | null) => {
    if (status) {
      setFormData((prev) => ({
        ...prev,
        status,
      }));
    }
  }, []);

  // Handle role change
  const handleRoleChange = useCallback((role: UserRole | null) => {
    if (role) {
      setFormData((prev) => ({
        ...prev,
        role,
      }));
    }
  }, []);

  // Handle image change
  const handleImageChange = useCallback((file: File | null, previewUrl: string) => {
    setTempImageFile(file);
    setFormData((prev) => ({
      ...prev,
      urlPhoto: previewUrl || "",
    }));
  }, []);

  // Modal open/close handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalMode("create");
    setSelectedRefereeId(null);
    setIsModalOpen(true);
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

  useEffect(() => {
      console.log(formData);
  })
  // Real-time form validation
  useEffect(() => {
    try {
      if (modalMode === "create") {
        // Validate registration fields
        const result = z.object({
          firstName: z.string().min(1, "First name is required").optional(),
          lastName: z.string().min(1, "Last name is required").optional(),
          email: z.string().email("Invalid email format").optional(),
          birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
          user: z.string().min(3, "Username must be at least 3 characters").optional(),
          password: z.string().min(8, "Password must be at least 8 characters").optional(),
        }).safeParse(formData);

        if (!result.success) {
          const newErrors: RefereeValidationErrors = {};
          result.error.issues.forEach((issue) => {
            const path = issue.path[0] as keyof UserRegisterRecord;
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
      } else if (modalMode === "edit") {
        // Validate edit fields
        const result = z.object({
          firstName: z.string().min(1, "First name is required").optional(),
          lastName: z.string().min(1, "Last name is required").optional(),
          email: z.string().email("Invalid email format").optional(),
          birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
        }).safeParse(formData);

        if (!result.success) {
          const newErrors: RefereeValidationErrors = {};
          result.error.issues.forEach((issue) => {
            const path = issue.path[0] as keyof UserUpdateBasicInformation;
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
      } else if (modalMode === "photo") {
        // Only validate URL field for photo update
        const isValidUrl = typeof formData.urlPhoto === 'string';
        
        setIsValid(isValidUrl);
        
        if (!isValidUrl && formData.urlPhoto) {
          setErrors({
            urlPhoto: ["Invalid URL format"]
          });
        } else {
          setErrors({});
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      setIsValid(false);
    }
  }, [formData, modalMode]);


  
  const openEditModal = useCallback((referee: UserDetailsRecordFull) => {
    setFormData({
      id: referee.id,
      firstName: referee.firstName,
      lastName: referee.lastName,
      email: referee.email,
      birthDate: referee.birthDate,
      age: referee.age,
      role: referee.role,
      status: referee.status,
      urlPhoto: referee.urlPhoto || "",
    });
    setSelectedRefereeId(referee.id);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const openPhotoModal = useCallback((referee: UserDetailsRecordFull) => {
    setFormData({
      id: referee.id,
      urlPhoto: referee.urlPhoto || "",
    });
    setSelectedRefereeId(referee.id);
    setModalMode("photo");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm]);


  return {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedRefereeId,
    tempImageFile,
    handleInputChange,
    handleStatusChange,
    handleRoleChange,
    handleImageChange,
    openCreateModal,
    openEditModal,
    openPhotoModal,
    closeModal,
    resetForm,
    setFormData,
    handleValidationError,
  };
}
