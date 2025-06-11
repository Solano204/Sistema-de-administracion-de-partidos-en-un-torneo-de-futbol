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

const TeamDebtForm = dynamic(() => import("../").then(mod => ({ default: mod.TeamDebtForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

const TeamDebtList = dynamic(() => import("../").then(mod => ({ default: mod.TeamDebtList })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading team debts...</p>
    </div>
  )
});

const TeamSearch = dynamic(() => import("../").then(mod => ({ default: mod.TeamSearch })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  )
});

import { useTeamDebts, useTeamDebtMutations, useTeamDebtForm } from "../";
import { useTeamSearch } from "../";
import { TeamDebtRecordDto, DebtStatus } from "../";
import { validateTeamDebtRecord } from "../";
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
  subtitle: string;
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
        <p className={`text-sm ${textColor.replace('700', '600').replace('300', '400')}`}>{subtitle}</p>
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
  variant?: 'primary' | 'danger' | 'warning';
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white focus:ring-green-500 transform hover:translate-y-[-2px]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white focus:ring-red-500 transform hover:translate-y-[-2px]",
    warning: "bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white focus:ring-orange-500 transform hover:translate-y-[-2px]"
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
          Loading...
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
  teamName, 
  onCreateNew 
}: {
  teamName: string;
  onCreateNew: () => void;
}) => (
  <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
    <div className="flex flex-col items-center justify-center p-4">
      <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No debts found for this team</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Crear una nueva deuda para <span className="font-medium">{teamName}</span>
      </p>
      
      <ActionButton onClick={onCreateNew}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Crear Nueva Deuda del Equipo 
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

export function TeamDebtManagementPage() {
  useRevealer();
  
  const [dateForDelete, setDateForDelete] = useState<string>("");
  
  // Custom hooks
  const {
    searchTerm,
    searchResults,
    selectedTeam,
    isLoading: isSearching,
    error: searchError,
    handleSearchChange,
    handleSearch,
    handleSelectTeam,
    handleClearSearch,
  } = useTeamSearch();
  
  const { 
    debts,
    isLoading: isLoadingDebts, 
    error: debtError, 
    teamId,
    setTeamId,
  } = useTeamDebts();
  
  const {
    createTeamDebt,
    updateTeamDebt,
    updateTeamDebtStatus,
    deleteTeamDebt,
    deleteAllTeamDebts,
    deleteTeamDebtsByDate,
    isCreating,
    isUpdating,
    isChangingStatus,
    isDeleting,
    isDeletingAll,
    isDeletingByDate,
    deletingId,
    statusUpdatingId
  } = useTeamDebtMutations(teamId);

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
  } = useTeamDebtForm(teamId);

  // Memoized team ID effect to prevent unnecessary updates
  useEffect(() => {
    const newTeamId = selectedTeam?.teamId || "";
    if (newTeamId !== teamId) {
      setTeamId(newTeamId);
    }
  }, [selectedTeam?.teamId, teamId, setTeamId]);

  // Memoized calculations to prevent recalculation on every render
  const debtStats = useMemo(() => {
    const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const pendingDebts = debts.filter(debt => debt.state === DEBT_STATUSES.PENDIENTE);
    const paidDebts = debts.filter(debt => debt.state === DEBT_STATUSES.PAGADO);
    const pendingAmount = pendingDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const paidAmount = paidDebts.reduce((sum, debt) => sum + debt.amount, 0);

    return {
      totalAmount,
      pendingAmount,
      paidAmount,
      pendingCount: pendingDebts.length,
      paidCount: paidDebts.length,
      hasDebts: debts.length > 0
    };
  }, [debts]);

  // Memoized event handlers to prevent function recreation
  const handleSubmit = useCallback(async (updatedFormData: Partial<TeamDebtRecordDto>) => {
    try {
      const isEdit = modalMode === "edit";
      const validatedData = validateTeamDebtRecord(updatedFormData, isEdit);
      
      if (selectedTeam && !isEdit) {
        validatedData.nameProperty = selectedTeam.name;
      }
      
      if (isEdit && selectedDebtId) {
        await updateTeamDebt({
          id: selectedDebtId,
          debt: validatedData,
        });
      } else {
        await createTeamDebt(validatedData);
      }
      
      closeModal();
    } catch (error) {
      handleValidationError(error);
    }
  }, [modalMode, selectedTeam, selectedDebtId, updateTeamDebt, createTeamDebt, closeModal, handleValidationError]);

  const handleUpdateStatus = useCallback(async (debtId: string, newStatus: DebtStatus) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      await updateTeamDebtStatus({
        debtId,
        status: newStatus,
        date: currentDate
      });
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [updateTeamDebtStatus]);

  const handleDeleteDebt = useCallback(async (debtId: string) => {
    if (!confirm(`Are you sure you want to delete this team debt?`)) return;
    try {
      await deleteTeamDebt(debtId);
    } catch (error) {
      console.error('Deletion error:', error);
    }
  }, [deleteTeamDebt]);

  const handleDeleteAllDebts = useCallback(async () => {
    if (!confirm(`Are you sure you want to delete ALL debts for this team?`)) return;
    try {
      await deleteAllTeamDebts(teamId);
    } catch (error) {
      console.error('Delete all error:', error);
    }
  }, [deleteAllTeamDebts, teamId]);

  const handleDeleteByDate = useCallback(async () => {
    if (!dateForDelete) {
      alert("Please select a date first");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete all team debts due on ${dateForDelete}?`)) return;
    
    try {
      await deleteTeamDebtsByDate({
        teamId,
        dueDate: dateForDelete
      });
    } catch (error) {
      console.error('Delete by date error:', error);
    }
  }, [deleteTeamDebtsByDate, teamId, dateForDelete]);

  const handleDateForDeleteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateForDelete(e.target.value);
  }, []);

  // Memoized boolean checks
  const showTeamSection = useMemo(() => selectedTeam && teamId, [selectedTeam, teamId]);
  const canDeleteAll = useMemo(() => debtStats.hasDebts && !isDeletingAll, [debtStats.hasDebts, isDeletingAll]);
  const canDeleteByDate = useMemo(() => !!dateForDelete && !isDeletingByDate, [dateForDelete, isDeletingByDate]);

  return (
    <>
      <div className="revealer" />
      
      <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Administracion de Deudas del Equipo
        </h1>

        {/* Team Search Section */}
        <TeamSearch
          searchTerm={searchTerm}
          searchResults={searchResults}
          selectedTeam={selectedTeam}
          isLoading={isSearching}
          error={searchError}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onSelectTeam={handleSelectTeam}
          onClearSearch={handleClearSearch}
        />

        {/* Error Message */}
        {debtError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md mb-6 transition-colors duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Failed to load team debts. Please try again.</span>
            </div>
          </div>
        )}

        {/* Team Debts Management Section */}
        {showTeamSection && (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                }
                title="Selected Team"
                value={selectedTeam?.name ?? ""}
                subtitle={`ID: ${selectedTeam?.teamId}`}
                bgColor="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                iconBg="bg-blue-100 dark:bg-blue-800/60"
                textColor="text-blue-700 dark:text-blue-300"
              />
              
              <StatCard
                icon={
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                title="Pending Amount"
                value={`$${debtStats.pendingAmount.toFixed(2)}`}
                subtitle={`${debtStats.pendingCount} pending debts`}
                bgColor="bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                iconBg="bg-yellow-100 dark:bg-yellow-800/60"
                textColor="text-yellow-700 dark:text-yellow-300"
              />
              
              <StatCard
                icon={
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                title="Paid Amount"
                value={`$${debtStats.paidAmount.toFixed(2)}`}
                subtitle={`${debtStats.paidCount} paid debts`}
                bgColor="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                iconBg="bg-green-100 dark:bg-green-800/60"
                textColor="text-green-700 dark:text-green-300"
              />
            </div>

            {/* Actions Panel */}
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 backdrop-blur-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Acciones Rápidas</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage debts for {selectedTeam?.name}</p>
                </div>
                <ActionButton onClick={openCreateModal}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  crear nueva deuda del equipo 
                </ActionButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ActionButton
                  onClick={handleDeleteAllDebts}
                  disabled={!canDeleteAll}
                  loading={isDeletingAll}
                  variant="danger"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete All Team Debts
                </ActionButton>

                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="date"
                      id="deleteByDate"
                      value={dateForDelete}
                      onChange={handleDateForDeleteChange}
                      className={clsx(
                        "block w-full py-2.5 px-4 rounded-lg transition-colors duration-200",
                        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                        "border border-gray-300 dark:border-gray-600",
                        "focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400",
                        "shadow-sm"
                      )}
                    />
                  </div>
                  <ActionButton
                    onClick={handleDeleteByDate}
                    disabled={!canDeleteByDate}
                    loading={isDeletingByDate}
                    variant="warning"
                    className="whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Delete By Date
                  </ActionButton>
                </div>
              </div>
            </div>

            {/* Content Section */}
            {isLoadingDebts ? (
              <LoadingState message="Loading team debts..." />
            ) : debtStats.hasDebts ? (
              <TeamDebtList
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
                teamName={selectedTeam?.name || ""}
                onCreateNew={openCreateModal}
              />
            )}
          </>
        )}

        {/* Team Debt Form Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            description={
              modalMode === "create"
                ? `Create a new debt record for ${selectedTeam?.name || 'team'}`
                : "Update team debt information"
            }
            width="800px"
            height="auto"
            contentClassName="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
          >
            <TeamDebtForm
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