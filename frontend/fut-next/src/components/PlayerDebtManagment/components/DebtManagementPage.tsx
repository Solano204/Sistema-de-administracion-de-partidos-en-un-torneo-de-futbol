"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const DebtForm = dynamic(() => import("../").then(mod => ({ default: mod.DebtForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

const DebtList = dynamic(() => import("../").then(mod => ({ default: mod.DebtList })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading debts...</p>
    </div>
  )
});

const PlayerSearch = dynamic(() => import("../").then(mod => ({ default: mod.PlayerSearch })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  )
});

import { useDebtMutations, useDebtForm } from "../";
import { usePlayerSearch } from "../";
import { DebtRecordDto, DebtStatus } from "../";
import { validateDebtRecord } from "../";
import { usePlayerDebts } from "../hooks/debt-hooks";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

// Move constants outside component to prevent recreation
const DEBT_STATUSES = {
  PENDIENTE: "PENDIENTE" as const,
  PAGADO: "PAGADO" as const,
} as const;

// Memoized stat card component
const StatCard = React.memo(({ 
  icon, 
  title, 
  value, 
  subtitle,
  bgColor, 
  iconBg, 
  textColor 
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
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
        {subtitle && (
          <p className={`text-sm ${textColor.replace('700', '600').replace('300', '400')}`}>{subtitle}</p>
        )}
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized action button component
const ActionButton = React.memo(({ 
  onClick, 
  disabled = false,
  loading = false,
  children, 
  variant = 'primary',
  className = ""
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'danger';
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white focus:ring-green-500 transform hover:translate-y-[-2px]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white focus:ring-red-500 transform hover:translate-y-[-2px]"
  };

  const disabledClasses = "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transform-none";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        disabled || loading ? disabledClasses : variantClasses[variant],
        className
      )}  
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando... 
        </>
      ) : (
        children
      )}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// Memoized empty state component
const EmptyDebtState = React.memo(({ 
  playerName, 
  onCreateNew 
}: {
  playerName: string;
  onCreateNew: () => void;
}) => (
  <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
    <div className="flex flex-col items-center justify-center p-4">
      <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No se encontraron deudas para este jugador</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Agrega una nueva deuda para <span className="font-medium">{playerName}</span>
      </p>
      
      <ActionButton onClick={onCreateNew}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Agregar nueva deuda
      </ActionButton>
    </div>
  </div>
));

EmptyDebtState.displayName = 'EmptyDebtState';

// Memoized loading state component
const LoadingState = React.memo(function LoadingState({ message }: { message: string }) {
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-800/60 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
});

// Memoized error message component
const ErrorMessage = React.memo(function ErrorMessage() {
  return (
    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md mb-6 transition-colors duration-300">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Error al cargar las deudas. Por favor, inténtelo de nuevo.</span>
      </div>
    </div>
  );
});

export function DebtManagementPage() {
  useRevealer();
  
  const [dateForDelete, setDateForDelete] = useState<string>("");
  
  // Custom hooks
  const {
    searchTerm,
    searchResults,
    selectedPlayer,
    isLoading: isSearching,
    error: searchError,
    handleSearchChange,
    handleSearch,
    handleSelectPlayer,
    handleClearSearch,
  } = usePlayerSearch();
  
  const { 
    debts,
    isLoading: isLoadingDebts, 
    error: debtError, 
    playerId,
    setPlayerId,
  } = usePlayerDebts();
  
  const {
    createDebt,
    updateDebt,
    updateDebtStatus,
    deleteDebt,
    deleteAllDebts,
    deleteDebtsByDate,
    isCreating,
    isUpdating,
    isChangingStatus,
    isDeleting,
    isDeletingAll,
    deletingId,
    statusUpdatingId
  } = useDebtMutations(playerId);

  const {
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
    handleValidationError
  } = useDebtForm(playerId);

  // Memoized player ID effect to prevent unnecessary updates
  useEffect(() => {
    const newPlayerId = selectedPlayer?.id || "";
    if (newPlayerId !== playerId) {
      setPlayerId(newPlayerId);
    }
  }, [selectedPlayer?.id, playerId, setPlayerId]);

  // Memoized debt statistics
  const debtStats = useMemo(() => {
    const totalDebts = debts.length;
    const paidDebts = debts.filter(d => d.state === DEBT_STATUSES.PAGADO).length;
    const pendingDebts = totalDebts - paidDebts;
    
    return {
      totalDebts,
      paidDebts,
      pendingDebts,
      hasDebts: totalDebts > 0,
      paidRatio: `${paidDebts} / ${totalDebts} Paid`
    };
  }, [debts]);

  // Memoized boolean checks
  const showPlayerSection = useMemo(() => selectedPlayer && playerId, [selectedPlayer, playerId]);
  const canDeleteAll = useMemo(() => debtStats.hasDebts && !isDeletingAll, [debtStats.hasDebts, isDeletingAll]);

  // Optimized form submission handler
  const handleSubmit = useCallback(async (updatedFormData: Partial<DebtRecordDto>) => {
    try {
      const isEdit = modalMode === "edit";
      const validatedData = validateDebtRecord(updatedFormData, isEdit);
      
      if (selectedPlayer && !isEdit) {
        validatedData.nameProperty = selectedPlayer.fullName;
      }
      
      if (isEdit && selectedDebtId) {
        await updateDebt({
          id: selectedDebtId,
          debt: validatedData,
        });
      } else {
        await createDebt(validatedData);
      }
      
      closeModal();
    } catch (error) {
      handleValidationError(error);
    }
  }, [modalMode, selectedPlayer, selectedDebtId, updateDebt, createDebt, closeModal, handleValidationError]);

  // Optimized status update handler
  const handleUpdateStatus = useCallback(async (debtId: string, newStatus: DebtStatus) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      await updateDebtStatus({
        debtId,
        status: newStatus,
        date: currentDate
      });
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [updateDebtStatus]);

  // Optimized delete handlers
  const handleDeleteDebt = useCallback(async (debtId: string) => {
    if (!confirm(`Are you sure you want to delete this debt?`)) return;
    try {
      await deleteDebt(debtId);
    } catch (error) {
      console.error('Deletion error:', error);
    }
  }, [deleteDebt]);

  const handleDeleteAllDebts = useCallback(async () => {
    if (!confirm(`Are you sure you want to delete ALL debts for this player?`)) return;
    try {
      await deleteAllDebts(playerId);
    } catch (error) {
      console.error('Delete all error:', error);
    }
  }, [deleteAllDebts, playerId]);

  // Memoized modal description
  const modalDescription = useMemo(() => {
    return modalMode === "create"
      ? `Create a new debt record for ${selectedPlayer?.fullName || 'player'}`
      : "Update debt information";
  }, [modalMode, selectedPlayer?.fullName]);

  return (
    <>
      <div className="revealer"></div>
      
      <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Gestión de deudas
        </h1>

        {/* Player Search Section */}
        <PlayerSearch
          searchTerm={searchTerm}
          searchResults={searchResults}
          selectedPlayer={selectedPlayer}
          isLoading={isSearching}
          error={searchError}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onSelectPlayer={handleSelectPlayer}
          onClearSearch={handleClearSearch}
        />

        {/* Error Message */}
        {debtError && <ErrorMessage />}

        {/* Debts Management Section */}
        {showPlayerSection && (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                }
                title="Jugador seleccionado"
                value={selectedPlayer?.fullName ?? ""}
                subtitle={selectedPlayer?.jerseyNumber ? `Jersey #${selectedPlayer.jerseyNumber}` : undefined}
                bgColor="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                iconBg="bg-blue-100 dark:bg-blue-800/60"
                textColor="text-blue-700 dark:text-blue-300"
              />
              
              <StatCard
                icon={
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                title="Estado de la deuda"
                value={debtStats.paidRatio}
                bgColor="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                iconBg="bg-green-100 dark:bg-green-800/60"
                textColor="text-green-700 dark:text-green-300"
              />
              
              <StatCard
                icon={
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                }
                title="Total de deudas"
                value={debtStats.totalDebts.toString()}
                bgColor="bg-purple-50/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                iconBg="bg-purple-100 dark:bg-purple-800/60"
                textColor="text-purple-700 dark:text-purple-300"
              />
            </div>

            {/* Bulk Actions */}
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 backdrop-blur-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Acciones de deudas</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona las deudas para {selectedPlayer?.fullName}</p>
                </div>
                <ActionButton onClick={openCreateModal}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Agregar nueva deuda
                </ActionButton>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <ActionButton
                  onClick={handleDeleteAllDebts}
                  disabled={!canDeleteAll}
                  loading={isDeletingAll}
                  variant="danger"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar todas las deudas
                </ActionButton>
              </div>
            </div>

            {/* Content Section */}
            {isLoadingDebts ? (
                    <LoadingState message="Cargando deudas..." />
            ) : debtStats.hasDebts ? (
              <DebtList
                debts={debts}
                onEdit={openEditModal}
                onDelete={handleDeleteDebt}
                onUpdateStatus={handleUpdateStatus}
                isDeleting={isDeleting}
                deletingId={deletingId}
                isChangingStatus={isChangingStatus}
                statusUpdatingId={statusUpdatingId}
              />
            ) : (
              <EmptyDebtState
                playerName={selectedPlayer?.fullName || ''}
                onCreateNew={openCreateModal}
              />
            )}
          </>
        )}

        {/* Debt Form Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            description={modalDescription}
            width="800px"
            height="auto"
            contentClassName="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
          >
            <DebtForm
              formData={formData}
              errors={errors}
              isValid={isValid}
              isProcessing={isCreating || isUpdating}
              modalMode={modalMode}
              onInputChange={handleInputChange}
              onStatusChange={handleStatusChange}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </div>
    </>
  );
}