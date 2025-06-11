"use client";

import React, { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import clsx from "clsx";

// Lazy load heavy components
const Modal = dynamic(() => import("@/components/TeamManagment/Components/Team.PopUp").then(mod => ({ default: mod.Modal })), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </div>
  )
});

const PaymentForm = dynamic(() => import("../").then(mod => ({ default: mod.PaymentForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

const PaymentList = dynamic(() => import("../").then(mod => ({ default: mod.PaymentList })), {
  loading: () => (
    <div className="bg-white mt-10 dark:bg-gray-900 rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto -z-10"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payments...</p>
    </div>
  )
});

import { FormInput } from "@/components/common";
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import { 
  usePaymentsList, 
  usePaymentMutations, 
  usePaymentForm 
} from "../";
import { 
  RefereePaymentInput
} from "../";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { validatePaymentCreate, validatePaymentUpdate } from "../";
import { fetchAllReferees } from "@/components/RefereeManagment/api/referee-api";
import { UserDetailsRecordFull } from "@/components/RefereeManagment/types/referee-types";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

// Move constants outside component to prevent recreation
const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency' as const,
  currency: 'USD'
};

const QUERY_CONFIG = {
  staleTime: 300000, // 5 minutes
  gcTime: 300000, // 5 minutes
  refetchOnWindowFocus: false,
} as const;

// Memoized stat card component to prevent unnecessary re-renders
const StatCard = React.memo(({ 
  icon, 
  title, 
  value, 
  bgColor, 
  iconBg, 
  textColor 
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
  iconBg: string;
  textColor: string;
}) => (
  <div className={`${bgColor} rounded-xl p-4 border shadow-md transition-all duration-300`}>
    <div className="flex items-center gap-4">
      <div className={`${iconBg} p-3 rounded-full`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-medium ${textColor}`}>{title}</p>
        <p className={`text-xl font-bold ${textColor.replace('300', '200').replace('700', '800')}`}>{value}</p>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized action button component
const ActionButton = React.memo(({ 
  onClick, 
  children, 
  variant = 'primary' 
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) => {
  const baseClasses = "inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = variant === 'primary'
    ? "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white focus:ring-green-500"
    : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500";

  return (
    <button
      onClick={onClick}
      className={clsx(baseClasses, variantClasses)}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// Memoized empty state component
const EmptyState = React.memo(({ 
  hasFilters, 
  onClearFilters, 
  onCreateNew 
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
}) => (
  <div className="mt-20 bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
    <div className="flex flex-col items-center justify-center p-4">
      <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No se encontraron registros de pago</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {hasFilters ? "Intenta ajustar tus criterios de filtro" : "Comienza agregando un registro de pago"}
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {hasFilters && (
          <ActionButton onClick={onClearFilters} variant="secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
              Limpiar Filtros
          </ActionButton>
        )}
        
        <ActionButton onClick={onCreateNew}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
              Agregar Pago 
        </ActionButton>
      </div>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

export function PaymentManagementPage() {
  useRevealer();

  // Optimized referee query with better caching
  const { 
    data: referees = [], 
    isLoading: refereesLoading 
  } = useQuery<UserDetailsRecordFull[], Error>({
    queryKey: ["referees", "list"],
    queryFn: fetchAllReferees,
    ...QUERY_CONFIG,
  });

  // Memoized referee options to prevent unnecessary recalculations
  const refereeOptions = useMemo((): SelectOption<string>[] => {
    return referees.map((referee) => ({
      value: referee.id || "",
      label: `${referee.firstName} ${referee.lastName}`,
    }));
  }, [referees]);

  // Custom hooks for functionality
  const { 
    payments,
    isLoading: paymentsLoading, 
    error, 
    filterByReferee,
    filterByDate,
    handleFilterByReferee,
    handleFilterByDate,
    clearFilters,
    refreshPayments 
  } = usePaymentsList();
  
  const {
    createPayment,
    updatePayment,
    deletePayment,
    isCreating,
    isUpdating,
    isDeleting,
    deletingId
  } = usePaymentMutations();

  const {
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
    handleValidationError,
  } = usePaymentForm();

  // Memoized calculations to prevent unnecessary recalculations
  const stats = useMemo(() => {
    const totalPaymentsAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const formattedTotalAmount = new Intl.NumberFormat('en-US', CURRENCY_FORMAT_OPTIONS).format(totalPaymentsAmount);
    
    return {
      totalReferees: referees.length,
      totalPayments: payments.length,
      formattedTotalAmount
    };
  }, [payments, referees.length]);

  // Memoized filter state
  const hasActiveFilters = useMemo(() => {
    return !!(filterByReferee || filterByDate);
  }, [filterByReferee, filterByDate]);

  // Memoized loading state
  const isLoading = paymentsLoading || refereesLoading;

  // Optimized form submission handler
  const handleSubmit = useCallback(async (updatedFormData: Partial<RefereePaymentInput>) => {
    try {
      const isCreate = modalMode === "create";
      const isEdit = modalMode === "edit";
      
      if (isCreate) {
        const validatedData = validatePaymentCreate(updatedFormData);
        await createPayment(validatedData as RefereePaymentInput);
      } else if (isEdit && selectedPaymentId) {
        const validatedData = validatePaymentUpdate({
          ...updatedFormData,
          id: selectedPaymentId
        });
        
        await updatePayment({
          id: selectedPaymentId,
          payment: validatedData
        });
      }
      
      closeModal();
      refreshPayments();
    } catch (error) {
      handleValidationError(error);
    }
  }, [modalMode, selectedPaymentId, createPayment, updatePayment, closeModal, refreshPayments, handleValidationError]);
  
  // Optimized deletion handler
  const handleDeletePayment = useCallback(async (paymentId: string) => {
    if (!confirm(`Are you sure you want to delete this payment record?`)) return;
    
    try {
      await deletePayment(paymentId);
      refreshPayments();
    } catch (error) {
      console.error('Deletion error:', error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to delete payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    }
  }, [deletePayment, refreshPayments]);

  // Optimized filter handlers
  const handleRefereeFilterChange = useCallback((option: SelectOption<string> | null) => {
    handleFilterByReferee(option?.value || null);
  }, [handleFilterByReferee]);

  const handleDateFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterByDate(e.target.value);
  }, [handleFilterByDate]);

  return (
    <>
      <div className="revealer" />
      
      <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Administración de Pagos de Árbitros
        </h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md mb-6 transition-colors duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Fallo cuando se inicializaban los pagos.</span>
              <button 
                onClick={() => refreshPayments()}
                className="ml-auto p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
                aria-label="Retry loading payments"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            }
            title="Total Referees"
            value={stats.totalReferees}
            bgColor="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            iconBg="bg-blue-100 dark:bg-blue-800/60"
            textColor="text-blue-700 dark:text-blue-300"
          />
          
          <StatCard
            icon={
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            }
            title="Total Payments"
            value={stats.totalPayments}
            bgColor="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            iconBg="bg-green-100 dark:bg-green-800/60"
            textColor="text-green-700 dark:text-green-300"
          />
          
          <StatCard
            icon={
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
            title="Total Amount"
            value={stats.formattedTotalAmount}
            bgColor="bg-purple-50/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            iconBg="bg-purple-100 dark:bg-purple-800/60"
            textColor="text-purple-700 dark:text-purple-300"
          />
        </div>

        {/* Action Button and Search/Filter Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 backdrop-blur-md transition-all duration-300 z-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Administrar Pagos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administracion de Pagos</p>
            </div>
            <ActionButton onClick={openCreateModal}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Agregar Pago
            </ActionButton>
          </div>

          {/* Search and Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 z-20">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 z-20">
                Buscar por Árbitro
              </label>
              <NeonSelect
                id="filterReferee"
                options={refereeOptions}
                value={refereeOptions.find(option => option.value === filterByReferee) || null}
                onChange={handleRefereeFilterChange}
                placeholder="Select referee"
              />
            </div>

            <FormInput
              id="filterDate"
              type="date"
              label="Filter by Payment Date"
              value={filterByDate}
              onChange={handleDateFilterChange}
              className="w-full"
              disabled={!!filterByReferee}
            />

            <div className="flex items-end">
              <ActionButton onClick={clearFilters} variant="secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Limpiar Filtros
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="mt-20 bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-800/60 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Pagos...</p>
            </div>
          </div>
        ) : payments.length > 0 ? (
          <PaymentList 
            payments={payments}
            onEdit={openEditModal}
            onDelete={handleDeletePayment}
            isDeleting={isDeleting}
            deletingId={deletingId}
          />
        ) : (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onCreateNew={openCreateModal}
          />
        )}

        {/* Payment Form Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            description={
              modalMode === "create"
                ? "Create a new payment record for a referee"
                : "Update payment information"
            }
            width="800px"
            height="auto"
            contentClassName="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md p-12"
          >
            <PaymentForm 
              formData={formData}
              refereeOptions={refereeOptions}
              selectedReferee={selectedReferee}
              selectedCurrency={selectedCurrency}
              errors={errors}
              isValid={isValid}
              isProcessing={isCreating || isUpdating}
              modalMode={modalMode}
              onInputChange={handleInputChange}
              onRefereeChange={handleRefereeChange}
              onCurrencyChange={handleCurrencyChange}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </div>
    </>
  );
}