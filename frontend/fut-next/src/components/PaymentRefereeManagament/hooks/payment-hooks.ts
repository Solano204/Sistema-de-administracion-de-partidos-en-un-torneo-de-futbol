// File: src/app/features/payment/hooks/payment-hooks.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  RefereePayment, 
  RefereePaymentInput,
  PaymentValidationErrors 
} from "../types/payment-types";
import {
  fetchPaymentsByReferee,
  fetchPaymentsByDateRange,
  createRefereePayment,
  updateRefereePayment,
  deleteRefereePayment,
} from "../api/payment-api";
import { extractValidationErrors } from "../utils/payment-validation";
import { paymentKeys } from "../api/payment-api-keys";

/**
 * Custom hook for fetching and filtering payments
 */
export function usePaymentsList(initialDate = new Date().toISOString().split("T")[0]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByReferee, setFilterByReferee] = useState<string | null>(null);
  const [filterByDate, setFilterByDate] = useState<string>(initialDate);

  // Determine which query to run based on filters
  const queryKey = filterByReferee 
    ? paymentKeys.byReferee(filterByReferee) 
    : paymentKeys.byDateRange(filterByDate);

  const queryFn = () => filterByReferee 
    ? fetchPaymentsByReferee(filterByReferee) 
    : fetchPaymentsByDateRange(filterByDate);

  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = useQuery<RefereePayment[], Error>({
    queryKey,
    queryFn,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!(filterByReferee || filterByDate)
  });

  // Filter payments by search term if needed
  const filteredPayments = searchTerm.trim()
    ? payments.filter(payment => {
        const refereeName = payment.referee.fullName.toLowerCase();
        return refereeName.includes(searchTerm.toLowerCase());
      })
    : payments;

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterByReferee = useCallback((refereeId: string | null) => {
    setFilterByReferee(refereeId);
    if (refereeId) {
      setFilterByDate(""); // Clear date filter when filtering by referee
    }
  }, []);

  const handleFilterByDate = useCallback((date: string) => {
    setFilterByDate(date);
    setFilterByReferee(null); // Clear referee filter when filtering by date
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterByReferee(null);
    setFilterByDate(new Date().toISOString().split("T")[0]);
  }, []);

  return {
    payments: filteredPayments,
    isLoading,
    error,
    searchTerm,
    filterByReferee,
    filterByDate,
    handleSearch,
    handleFilterByReferee,
    handleFilterByDate,
    clearFilters,
    refreshPayments: refetch,
  };
}

/**
 * Custom hook for payment mutations (create, update, delete)
 */// Update the usePaymentMutations hook with these improvements

export function usePaymentMutations() {
    const queryClient = useQueryClient();
  
    // Toast helpers remain the same...
  
    // Create payment mutation
    const createMutation = useMutation({
      mutationFn: createRefereePayment,
      onMutate: async (newPayment) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: paymentKeys.all });
  
        // Take snapshots of both possible affected query keys
        const previousByReferee = newPayment.referee?.id 
          ? queryClient.getQueryData(paymentKeys.byReferee(newPayment.referee.id))
          : null;
          
        const previousByDate = newPayment.paymentDate
          ? queryClient.getQueryData(paymentKeys.byDateRange(newPayment.paymentDate))
          : null;
  
        // Return context with all snapshots
        return { 
          previousByReferee, 
          previousByDate,
          refereeId: newPayment.referee?.id,
          paymentDate: newPayment.paymentDate
        };
      },
      onError: (err, newPayment, context) => {
        // Roll back all affected caches
        if (context?.previousByReferee && context.refereeId) {
          queryClient.setQueryData(
            paymentKeys.byReferee(context.refereeId),
            context.previousByReferee
          );
        }
        
        if (context?.previousByDate && context.paymentDate) {
          queryClient.setQueryData(
            paymentKeys.byDateRange(context.paymentDate),
            context.previousByDate
          );
        }
  
      },
      onSuccess: () => {
      },
      onSettled: () => {
        // Invalidate ALL payment-related queries to ensure updates
        queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      },
    });
  
    // Update payment mutation
    const updateMutation = useMutation({
      mutationFn: (data: { id: string; payment: Partial<RefereePaymentInput> }) =>
        updateRefereePayment(data.id, data.payment),
      onMutate: async ({ id, payment }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: paymentKeys.all });
        
        // Get the current payment to find IDs
        const currentPayment = queryClient.getQueryData<RefereePayment>(paymentKeys.detail(id));
        
        // Get values for filtering and updating
        const refereeId = payment.referee?.id || currentPayment?.referee?.id;
        const paymentDate = payment.paymentDate || currentPayment?.paymentDate;
        
        // Take snapshots of affected query keys
        const previousByReferee = refereeId
          ? queryClient.getQueryData(paymentKeys.byReferee(refereeId))
          : null;
          
        const previousByDate = paymentDate
          ? queryClient.getQueryData(paymentKeys.byDateRange(paymentDate))
          : null;
        
        // Optimistic updates for all possible affected queries
        if (refereeId && previousByReferee) {
          queryClient.setQueryData(
            paymentKeys.byReferee(refereeId),
            (old: RefereePayment[] = []) => {
              return old.map(p => p.id === id ? { ...p, ...payment } : p);
            }
          );
        }
        
        if (paymentDate && previousByDate) {
          queryClient.setQueryData(
            paymentKeys.byDateRange(paymentDate),
            (old: RefereePayment[] = []) => {
              return old.map(p => p.id === id ? { ...p, ...payment } : p);
            }
          );
        }
  
        return { 
          previousByReferee, 
          previousByDate, 
          refereeId, 
          paymentDate 
        };
      },
      onError: (err, variables, context) => {
        // Rollback all affected caches
        if (context?.previousByReferee && context.refereeId) {
          queryClient.setQueryData(
            paymentKeys.byReferee(context.refereeId),
            context.previousByReferee
          );
        }
        
        if (context?.previousByDate && context.paymentDate) {
          queryClient.setQueryData(
            paymentKeys.byDateRange(context.paymentDate),
            context.previousByDate
          );
        }
  
      },
      onSuccess: () => {
      },
      onSettled: () => {
        // Invalidate ALL payment-related queries
        queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      },
    });
  
    // Delete payment mutation
    const deleteMutation = useMutation({
      mutationFn: deleteRefereePayment,
      onMutate: async (id) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: paymentKeys.all });
        
        // Find payment in all active queries to get refereeId and date
        const allQueries = queryClient.getQueryCache().findAll({ 
          queryKey: paymentKeys.all 
        });
        
        let refereeId: string | undefined;
        let paymentDate: string | undefined;
        let paymentToDelete: RefereePayment | undefined;
        
        // Search through all queries to find the payment
        for (const query of allQueries) {
          const data = query.state.data as RefereePayment[] | undefined;
          if (!data || !Array.isArray(data)) continue;
          
          const found = data.find(p => p.id === id);
          if (found) {
            paymentToDelete = found;
            refereeId = found.referee.id;
            paymentDate = found.paymentDate;
            break;
          }
        }
        
        // If we found the payment, take snapshots and make optimistic updates
        const previousByReferee = refereeId 
          ? queryClient.getQueryData(paymentKeys.byReferee(refereeId))
          : null;
          
        const previousByDate = paymentDate
          ? queryClient.getQueryData(paymentKeys.byDateRange(paymentDate))
          : null;
        
        // Optimistic updates for all affected query keys
        if (refereeId && previousByReferee) {
          queryClient.setQueryData(
            paymentKeys.byReferee(refereeId),
            (old: RefereePayment[] = []) => old.filter(p => p.id !== id)
          );
        }
        
        if (paymentDate && previousByDate) {
          queryClient.setQueryData(
            paymentKeys.byDateRange(paymentDate),
            (old: RefereePayment[] = []) => old.filter(p => p.id !== id)
          );
        }
        
        // For the all payments query
        queryClient.setQueriesData(
          { queryKey: paymentKeys.lists() },
          (old: RefereePayment[] = []) => old.filter(p => p.id !== id)
        );
  
        return { 
          previousByReferee, 
          previousByDate, 
          refereeId, 
          paymentDate,
          paymentToDelete
        };
      },
      onError: (err, id, context) => {
        // Rollback on error
        if (context?.previousByReferee && context.refereeId) {
          queryClient.setQueryData(
            paymentKeys.byReferee(context.refereeId),
            context.previousByReferee
          );
        }
        
        if (context?.previousByDate && context.paymentDate) {
          queryClient.setQueryData(
            paymentKeys.byDateRange(context.paymentDate),
            context.previousByDate
          );
        }
  
      },
      onSuccess: () => {
      },
      onSettled: () => {
        // Invalidate ALL payment-related queries to guarantee fresh data
        queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      },
    });
  
    return {
      // Rest of the code remains the same...
      createPayment: createMutation.mutateAsync,
      updatePayment: updateMutation.mutateAsync,
      deletePayment: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      deletingId: deleteMutation.variables as string | undefined,
    };
  }
/**
 * Custom hook for payment form management
 */
export function usePaymentForm(initialMode: "create" | "edit" = "create") {
  const [modalMode, setModalMode] = useState<"create" | "edit">(initialMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<RefereePaymentInput>>({
    id: "",
    referee: {
      id: "",
      fullName: "",
    },
    paymentDate: new Date().toISOString().split("T")[0],
    hoursWorked: 0,
    hourlyRate: 0,
    totalAmount: 0,
  });
  
  const [selectedReferee, setSelectedReferee] = useState<{ value: string, label: string } | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<{ value: string, label: string } | null>({
    value: "USD",
    label: "US Dollar (USD)"
  });
  
  const [errors, setErrors] = useState<PaymentValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      referee: {
        id: "",
        fullName: "",
      },
      paymentDate: new Date().toISOString().split("T")[0],
      hoursWorked: 0,
      hourlyRate: 0,
      totalAmount: 0,
    });
    
    setSelectedReferee(null);
    setSelectedCurrency({
      value: "USD",
      label: "US Dollar (USD)"
    });
    
    setErrors({});
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name === "hoursWorked") {
      const hoursWorked = parseFloat(value) || 0;
      const hourlyRate = formData.hourlyRate || 0;

      setFormData((prev) => ({
        ...prev,
        hoursWorked,
        totalAmount: hoursWorked * hourlyRate,
      }));
    } else if (name === "amount" || name === "hourlyRate") {
      const hourlyRateAmount = parseFloat(value) || 0;
      const hoursWorked = formData.hoursWorked || 0;

      setFormData((prev) => ({
        ...prev,
        hourlyRate: hourlyRateAmount,
        totalAmount: hourlyRateAmount * hoursWorked,
      }));
    } else if (name === "paymentDate") {
      setFormData((prev) => ({
        ...prev,
        paymentDate: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) : value,
      }));
    }
  }, [formData.hoursWorked, formData.hourlyRate]);

  // Handle referee selection
  const handleRefereeChange = useCallback((option: { value: string, label: string } | null) => {
    setSelectedReferee(option);
    if (option) {
      setFormData((prev) => ({
        ...prev,
        referee: {
          id: option.value,
          fullName: option.label
        },
      }));
    }
  }, []);

  // Handle currency selection
  const handleCurrencyChange = useCallback((option: { value: string, label: string } | null) => {
    setSelectedCurrency(option);
  }, []);

  // Modal open/close handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalMode("create");
    setSelectedPaymentId(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((payment: RefereePayment) => {
    setFormData({
      id: payment.id,
      referee: {
        id: payment.referee.id,
        fullName: payment.referee.fullName
      },
      paymentDate: payment.paymentDate,
      hoursWorked: payment.hoursWorked,
      hourlyRate: payment.hourlyRate,
      totalAmount: payment.totalAmount,
    });
    
    setSelectedReferee({
      value: payment.referee.id,
      label: payment.referee.fullName
    });
    
    setSelectedCurrency({
      value: "USD",
      label: "US Dollar (USD)"
    });
    
    setSelectedPaymentId(payment.id);
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

  // Calculate total amount based on hours and rate
  const calculateTotalAmount = useCallback(() => {
    const hoursWorked = formData.hoursWorked || 0;
    const hourlyRate = formData.hourlyRate || 0;
    const totalAmount = hoursWorked * hourlyRate;
    
    setFormData(prev => ({
      ...prev,
      totalAmount
    }));
  }, [formData.hoursWorked, formData.hourlyRate]);

  // Real-time form validation
  useEffect(() => {
    try {
      // Calculate total amount whenever hours or rate changes
      // calculateTotalAmount();
      
      // Validate based on current mode
      if (modalMode === "create" || modalMode === "edit") {
        // Basic validation for required fields
        const result = z.object({
          referee: z.object({
            id: z.string().min(1, "Referee is required")
          }).optional(),
          paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
          hoursWorked: z.number().positive("Hours worked must be positive"),
          hourlyRate: z.number().nonnegative("Hourly rate must be 0 or positive")
        }).safeParse(formData);

        if (!result.success) {
          const newErrors: PaymentValidationErrors = {};
          result.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!newErrors[path]) {
              newErrors[path] = [];
            }
            newErrors[path]!.push(issue.message);
          });
          setErrors(newErrors);
          setIsValid(false);
        } else {
          // Additional validation for referee ID
          if (!formData.referee?.id) {
            setErrors({
              "referee.id": ["Referee is required"]
            });
            setIsValid(false);
          } else {
            setErrors({});
            setIsValid(true);
          }
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      setIsValid(false);
    }
  }, [formData, modalMode, calculateTotalAmount]);

  return {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedPaymentId,
    selectedReferee,
    selectedCurrency,
    handleInputChange,
    handleRefereeChange,
    handleCurrencyChange,
    openCreateModal,
    openEditModal,
    closeModal,
    resetForm,
    setFormData,
    handleValidationError,
    calculateTotalAmount
  };
}