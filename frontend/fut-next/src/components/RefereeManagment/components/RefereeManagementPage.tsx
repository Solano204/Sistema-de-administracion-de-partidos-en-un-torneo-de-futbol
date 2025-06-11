"use client";

import React, { useMemo, useCallback } from "react";
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

const RefereeList = dynamic(() => import("./RefereeList").then(mod => ({ default: mod.RefereeList })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading referees...</p>
    </div>
  )
});

const RefereeForm = dynamic(() => import("./RefereeForm").then(mod => ({ default: mod.RefereeForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

import {
  SupabaseFolder,
  uploadImage,
} from "@/app/utils/Actions/SupaBase/ActionsImages";
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import {
  useRefereesList,
  useRefereeMutations,
  useRefereeForm,
} from "../hooks/referee-hooks";
import {
  UserRegisterRecord,
  UserUpdateBasicInformation,
  UserUpdateProfilePhoto,
  UserStatus,
  UserRole,
} from "../types/referee-types";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

// Move constants outside component to prevent recreation
const STATUS_OPTIONS: SelectOption<UserStatus>[] = [
  { label: "Active", value: UserStatus.ACTIVO },
  { label: "Inactive", value: UserStatus.INACTIVO },
  { label: "Suspended", value: UserStatus.SUSPENDIDO },
  { label: "Pending", value: UserStatus.PENDIENTE },
];

// Memoized action button component
const ActionButton = React.memo(({ 
  onClick, 
  children, 
  disabled = false,
  variant = 'primary' 
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) => {
  const baseClasses = "px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:translate-y-[-2px] flex items-center gap-2 font-medium";
  
  const variantClasses = variant === 'primary'
    ? "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white"
    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseClasses, variantClasses, disabled && "opacity-50 cursor-not-allowed")}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// Memoized search input component
const SearchInput = React.memo(({ 
  value, 
  onChange, 
  placeholder = "Search..." 
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <div>
    <label
      htmlFor="search"
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      Buscar Referee
    </label>
    <input
      type="text"
      id="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';

// Memoized filter select component
const FilterSelect = React.memo(({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder 
}: {
  label: string;
  options: SelectOption<any>[];
  value: any;
  onChange: (option: SelectOption<any> | null) => void;
  placeholder: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <NeonSelect
      id={`${label.toLowerCase().replace(' ', '-')}-filter`}
      options={options}
      value={options.find(option => option.value === value) || null}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
));

FilterSelect.displayName = 'FilterSelect';

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

// Memoized empty state component
const EmptyState = React.memo(function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center justify-center p-4">
        <svg className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">
          Referre no fueron encontrados
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          Parece que aún no has agregado ningún referee. Puedes crear uno nuevo haciendo clic en el botón a continuación.
        </p>
        
        <ActionButton onClick={onCreateNew}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Crear Nuevo Referee
        </ActionButton>
      </div>
    </div>
  );
});

// Memoized error message component
const ErrorMessage = React.memo(function ErrorMessage() {
  return (
    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md mb-6 transition-colors duration-300">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Ha ocurrido un error.</span>
      </div>
    </div>
  );
});

export default function RefereeManagementPage() {
  useRevealer();

  // Custom hooks
  const {
    referees,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    handleSearch,
    handleStatusFilter,
    handleRoleFilter,
    clearFilters,
  } = useRefereesList();

  const {
    createReferee,
    updateRefereeDetails,
    updateRefereeStatus,
    updateRefereePhoto,
    deleteReferee,
    isCreating,
    isUpdating,
    isChangingStatus,
    isUpdatingPhoto,
    isDeleting,
    deletingId,
    statusUpdatingId,
  } = useRefereeMutations();

  const {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedRefereeId,
    handleInputChange,
    handleStatusChange,
    handleRoleChange,
    handleImageChange,
    openCreateModal,
    openEditModal,
    openPhotoModal,
    closeModal,
    handleValidationError,
  } = useRefereeForm();

  // Memoized modal configuration
  const modalConfig = useMemo(() => {
    const configs = {
      create: {
        title: "Add New Referee",
        description: "Create a new referee record"
      },
      edit: {
        title: "Edit Referee",
        description: "Update referee information"
      },
      photo: {
        title: "Update Profile Photo",
        description: "Update the referee's profile photo"
      }
    };
    
    return configs[modalMode as keyof typeof configs] || configs.create;
  }, [modalMode]);

  // Memoized processing state
  const isProcessing = useMemo(() => {
    return isCreating || isUpdating || isUpdatingPhoto;
  }, [isCreating, isUpdating, isUpdatingPhoto]);

  // Memoized referee count check
  const hasReferees = useMemo(() => referees.length > 0, [referees.length]);

  // Optimized image upload function
  const uploadImageFile = useCallback(async (imageFile: File, refereeId: string): Promise<string | null> => {
    try {
      const folder = SupabaseFolder.REFEREEES;
      const id = refereeId || "new-referee";
      const uploadResult = await uploadImage(imageFile, folder, id);
      return uploadResult.url;
    } catch (error) {
      console.error("Image upload error:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
      return null;
    }
  }, []);

  // Optimized form submission handler
  const handleSubmit = useCallback(async (
    updatedFormData: Partial<UserRegisterRecord>,
    imageFile: File | null = null
  ) => {
    try {
      const isCreate = modalMode === "create";
      const isEdit = modalMode === "edit";
      const isPhotoUpdate = modalMode === "photo";

      // Handle image upload if needed
      if (imageFile) {
        const imageUrl = await uploadImageFile(imageFile, selectedRefereeId || "new-referee");
        if (imageUrl) {
          updatedFormData.urlPhoto = imageUrl;
        }
      }

      // Process based on modal mode
      if (isCreate) {
        await createReferee(updatedFormData as UserRegisterRecord);
      } else if (isEdit && selectedRefereeId) {
        const updateData: UserUpdateBasicInformation = {
          id: selectedRefereeId,
          firstName: updatedFormData.firstName || "",
          lastName: updatedFormData.lastName || "",
          email: updatedFormData.email || "",
          birthDate: updatedFormData.birthDate || "",
          age: updatedFormData.age || 0,
          role: updatedFormData.role,
        };
        await updateRefereeDetails(updateData);
      } else if (isPhotoUpdate && selectedRefereeId) {
        const photoData: UserUpdateProfilePhoto = {
          id: selectedRefereeId,
          profilePhoto: updatedFormData.urlPhoto || "",
        };
        await updateRefereePhoto(photoData);
      }

      closeModal();
    } catch (error) {
      handleValidationError(error);
    }
  }, [modalMode, selectedRefereeId, uploadImageFile, createReferee, updateRefereeDetails, updateRefereePhoto, closeModal, handleValidationError]);

  // Optimized status update handler
  const handleUpdateStatus = useCallback(async (refereeId: string, newStatus: UserStatus) => {
    try {
      await updateRefereeStatus({ refereeId, status: newStatus });
    } catch (error) {
      console.error("Status update error:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to update status: ${error instanceof Error ? error.message : "Unknown error"}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    }
  }, [updateRefereeStatus]);

  // Optimized delete handler
  const handleDeleteReferee = useCallback(async (refereeId: string) => {
    if (!confirm(`Are you sure you want to delete this referee?`)) return;
    try {
      await deleteReferee(refereeId);
    } catch (error) {
      console.error("Deletion error:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to delete referee: ${error instanceof Error ? error.message : "Unknown error"}`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    }
  }, [deleteReferee]);

  // Optimized search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }, [handleSearch]);

  // Optimized filter change handlers
  const handleStatusFilterChange = useCallback((option: SelectOption<UserStatus> | null) => {
    handleStatusFilter(option?.value || null);
  }, [handleStatusFilter]);

  const handleRoleFilterChange = useCallback((option: SelectOption<UserRole> | null) => {
    handleRoleFilter(option?.value || null);
  }, [handleRoleFilter]);

  return (
    <>
      <div className="revealer"></div>

      <div className="max-w-6xl mx-auto p-6 text-black dark:text-white transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
      Administración de Referees
        </h1>

        {/* Error Message */}
        {error && <ErrorMessage />}

        {/* Action Button and Search/Filter Section */}
        <div className="bg-white dark:bg-gray-900/95 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Referee Actions</h2>
            <ActionButton onClick={openCreateModal}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New Referee
            </ActionButton>
          </div>

          {/* Search and Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search referees..."
            />

            <FilterSelect
              label="Filter by Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              placeholder="Select status"
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
          <LoadingState message="Loading referees..." />
        ) : hasReferees ? (
          <RefereeList
            referees={referees}
            onEdit={openEditModal}
            onUpdatePhoto={openPhotoModal}
            onDelete={handleDeleteReferee}
            onUpdateStatus={handleUpdateStatus}
            isDeleting={isDeleting}
            deletingId={deletingId || ""}
            isChangingStatus={isChangingStatus}
            statusUpdatingId={statusUpdatingId}
          />
        ) : (
          <EmptyState onCreateNew={openCreateModal} />
        )}

        {/* Referee Form Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={modalConfig.title}
            description={modalConfig.description}
            width="800px"
            height="auto"
            contentClassName="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
          >
            <RefereeForm
              formData={formData}
              errors={errors}
              isValid={isValid}
              isProcessing={isProcessing}
              modalMode={modalMode}
              onInputChange={handleInputChange}
              onStatusChange={handleStatusChange}
              onRoleChange={handleRoleChange}
              onImageChange={handleImageChange}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </div>
    </>
  );
}