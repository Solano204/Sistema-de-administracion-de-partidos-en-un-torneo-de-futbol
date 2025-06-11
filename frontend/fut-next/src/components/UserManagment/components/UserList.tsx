"use client";

import { memo, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";

// Static imports for critical components
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import { useUserManagement, roleOptions, UserRole } from "../";
import { UserDetailsRecordFull } from "../";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

// Dynamic imports for modal components (loaded on demand)
const UserTable = dynamic(() => import("./UserTable").then(mod => ({ default: mod.UserTable })), {
  loading: () => <TableSkeleton />,
  ssr: false
});

const CreateEditForm = dynamic(() => import("../").then(mod => ({ default: mod.CreateEditForm })), {
  loading: () => <ModalSkeleton />,
  ssr: false
});

const PhotoForm = dynamic(() => import("../").then(mod => ({ default: mod.PhotoForm })), {
  loading: () => <ModalSkeleton />,
  ssr: false
});

const PasswordForm = dynamic(() => import("../").then(mod => ({ default: mod.PasswordForm })), {
  loading: () => <ModalSkeleton />,
  ssr: false
});

const UsernameForm = dynamic(() => import("../").then(mod => ({ default: mod.UsernameForm })), {
  loading: () => <ModalSkeleton />,
  ssr: false
});

// Types
type ModalType = "create" | "edit" | "photo" | "password" | "username" | null;

// Constants
const ICONS = {
  add: (
    <path
      fillRule="evenodd"
      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
      clipRule="evenodd"
    />
  ),
  spinner: (
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  ),
  error: (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  )
} as const;

const LOADING_MESSAGES = {
  users: "Loading users...",
  table: "Loading user table...",
  modal: "Loading form..."
} as const;

const ERROR_MESSAGES = {
  load: "Failed to load users. Please try again.",
  noUsers: "No users found for the selected role.",
  noUsersAll: "No users found. Start by adding your first user.",
  filterNoResults: "No users match the current filter criteria."
} as const;

// Skeleton Components
const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/6" />
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ModalSkeleton = memo(function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4 mb-2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>
    </div>
  );
});

// State Components
const LoadingState = memo(function LoadingState({ message = LOADING_MESSAGES.users }: { message?: string }) {
  return (
    <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
});

const ErrorState = memo(function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: Error; 
  onRetry?: () => void; 
}) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-6">
      <div className="flex items-start">
        <svg className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          {ICONS.error}
        </svg>
        <div className="flex-1">
          <h3 className="font-medium">Error loading users</h3>
          <p className="mt-1 text-sm">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium underline hover:no-underline focus:outline-none"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const EmptyState = memo(function EmptyState({
  selectedRole,
  onCreateUser,
  totalUsers
}: {
  selectedRole: string;
  onCreateUser: () => void;
  totalUsers: number;
}) {
  const getMessage = () => {
    if (totalUsers === 0) return ERROR_MESSAGES.noUsersAll;
    if (selectedRole) return ERROR_MESSAGES.noUsers;
    return ERROR_MESSAGES.filterNoResults;
  };

  const getActionText = () => {
    if (totalUsers === 0) return "Create your first user";
    return "Add new user";
  };

  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {ICONS.users}
      </svg>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {totalUsers === 0 ? "No users yet" : "No users found"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {getMessage()}
      </p>
      <button
        onClick={onCreateUser}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          {ICONS.add}
        </svg>
        {getActionText()}
      </button>
    </div>
  );
});

// Header Component
const PageHeader = memo(function PageHeader({
  selectedRole,
  onRoleChange,
  onCreateUser,
  userCount,
  isLoading
}: {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  onCreateUser: () => void;
  userCount: number;
  isLoading: boolean;
}) {
  // Adapter for NeonSelect's onChange
  const handleSelectChange = (selectedOption: { value: string } | null) => {
    onRoleChange(selectedOption ? selectedOption.value : "");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Administracion de usuarios
        </h1>
        {!isLoading && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage {userCount} {userCount === 1 ? 'user' : 'users'}
            {selectedRole && ` with role: ${roleOptions.find(r => r.value === selectedRole)?.label}`}
          </p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-64">
          <NeonSelect
            id="role-filter"
            options={roleOptions}
            value={roleOptions.find(option => option.value === selectedRole) || null}
            onChange={handleSelectChange}
            placeholder="Filter by role..."
            className="w-full"
            aria-label="Filter users by role"
          />
        </div>
        
        <button
          onClick={onCreateUser}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          aria-label="Create new user"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            {ICONS.add}
          </svg>
          <span className="whitespace-nowrap">Add New User</span>
        </button>
      </div>
    </div>
  );
});

// Error Boundary Fallback
const ErrorFallback = memo(function ErrorFallback({
  error,
  resetErrorBoundary
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            {ICONS.error}
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
});

// Modal Manager Component
const ModalManager = memo(function ModalManager({
  modalMode,
  activeModal,
  selectedUser,
  isModalOpen,
  formData,
  registerFormData,
  photoData,
  passwordData,
  usernameData,
  errorsRegister,
  errorsUpdateBasicInfo,
  passwordErrors,
  usernameErrors,
  isValidCreate,
  isValidUpdate,
  isValidPassword,
  isValidUsername,
  imageUploadRef,
  handlers
}: {
  modalMode: string;
  activeModal: string;
  selectedUser: UserDetailsRecordFull | null;
  isModalOpen: boolean;
  formData: any;
  registerFormData: any;
  photoData: any;
  passwordData: any;
  usernameData: any;
  errorsRegister: any;
  errorsUpdateBasicInfo: any;
  passwordErrors: any;
  usernameErrors: any;
  isValidCreate: boolean;
  isValidUpdate: boolean;
  isValidPassword: boolean;
  isValidUsername: boolean;
  imageUploadRef: any;
  handlers: {
    handleCloseModal: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRegisterInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRoleChange: (option: SelectOption<UserRole> | null) => void;
    handleImageChangeCreate: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRegisterSubmit: (e: React.FormEvent) => Promise<void>;
    handleUpdateSubmit: (e: React.FormEvent) => Promise<void>;
    captureSelectedFileCreate: (file: File) => void;
    captureSelectedFile: (file: File) => void;
    handleUpdatePhotoSubmit: (e: React.FormEvent) => Promise<void>;
    handlePasswordInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePasswordSubmit: (e: React.FormEvent) => Promise<void>;
    handleUsernameInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUsernameSubmit: (e: React.FormEvent) => Promise<void>;
  };
}) {
  if (!isModalOpen && !activeModal) return null;

  return (
    <Suspense fallback={<ModalSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* Create/Edit Modal */}
        {(modalMode === "create" || modalMode === "edit") && (
          <CreateEditForm
            onFileSelect={(file: File | null) => {
              if (file) handlers.captureSelectedFileCreate(file);
            }}
            isOpen={isModalOpen}
            imageUploadRef={imageUploadRef}
            mode={modalMode}
            formData={formData}
            registerFormData={registerFormData}
            errorsRegister={errorsRegister}
            errorsUpdateBasicInfo={errorsUpdateBasicInfo}
            isValidCreate={isValidCreate}
            isValidUpdate={isValidUpdate}
            onClose={handlers.handleCloseModal}
            onInputChange={handlers.handleInputChange}
            onRegisterInputChange={handlers.handleRegisterInputChange}
            onRoleChange={handlers.handleRoleChange}
            onImageChange={() => {
              // No-op: handler expects a ChangeEvent<HTMLInputElement>, so we do not call it here.
            }}
            onSubmit={modalMode === "create" ? handlers.handleRegisterSubmit : handlers.handleUpdateSubmit}
          />
        )}

        {/* Photo Modal */}
        {activeModal === "photo" && selectedUser && (
          <PhotoForm
            isOpen={true}
            photoData={photoData}
            isLoading={false}
            onClose={handlers.handleCloseModal}
            onFileSelect={(file: File | null) => {
              if (file) handlers.captureSelectedFile(file);
            }}
            onSubmit={handlers.handleUpdatePhotoSubmit}
          />
        )}

        {/* Password Modal */}
        {activeModal === "password" && selectedUser && (
          <PasswordForm
            isOpen={true}
            passwordData={passwordData}
            passwordErrors={passwordErrors}
            isValidPassword={isValidPassword}
            isLoading={false}
            onClose={handlers.handleCloseModal}
            onInputChange={handlers.handlePasswordInputChange}
            onSubmit={handlers.handlePasswordSubmit}
          />
        )}

        {/* Username Modal */}
        {activeModal === "username" && selectedUser && (
          <UsernameForm
            isOpen={true}
            usernameData={usernameData}
            usernameErrors={usernameErrors}
            isValidUsername={isValidUsername}
            isLoading={false}
            onClose={handlers.handleCloseModal}
            onInputChange={handlers.handleUsernameInputChange}
            onSubmit={handlers.handleUsernameSubmit}
          />
        )}
      </ErrorBoundary>
    </Suspense>
  );
});

// Main Component
export const UserList = memo(function UserList() {
  useRevealer();
  
  const userManagement = useUserManagement();
  const {
    // State
    users,
    isLoading,
    error,
    selectedRole,
    selectedUser,
    activeModal,
    modalMode,
    isModalOpen,
    formData,
    registerFormData,
    photoData,
    passwordData,
    usernameData,
    errorsRegister,
    errorsUpdateBasicInfo,
    passwordErrors,
    usernameErrors,
    isValidCreate,
    isValidUpdate,
    isValidPassword,
    isValidUsername,

    // Handlers
    handleRoleFilterChange,
    handleRoleChange,
    handleInputChange,
    handleRegisterInputChange,
    handlePasswordInputChange,
    handleUsernameInputChange,
    handleImageChangeCreate,
    handleOpenModal,
    handleOpenCreateModal,
    handleCloseModal,
    handleUpdateSubmit,
    handleRegisterSubmit,
    handleUpdatePhotoSubmit,
    handlePasswordSubmit,
    handleUsernameSubmit,
    captureSelectedFile,
    captureSelectedFileCreate,
    handleDeleteUser,
    imageUploadRef,
  } = userManagement;

  // Memoized handlers for table actions
  const tableHandlers = useMemo(() => ({
    onEditUser: (user: UserDetailsRecordFull) => handleOpenModal("edit", user),
    onUpdatePhoto: (user: UserDetailsRecordFull) => handleOpenModal("photo", user),
    onChangePassword: (user: UserDetailsRecordFull) => handleOpenModal("password", user),
    onChangeUsername: (user: UserDetailsRecordFull) => handleOpenModal("username", user),
    onDelete: handleDeleteUser
  }), [handleOpenModal, handleDeleteUser]);

  // Memoized modal handlers
  const modalHandlers = useMemo(() => ({
    handleCloseModal,
    handleInputChange,
    handleRegisterInputChange,
    handleRoleChange: (option: SelectOption<UserRole> | null) => {
      handleRoleChange(option);
    },
    handleImageChangeCreate,
    handleRegisterSubmit,
    handleUpdateSubmit,
    captureSelectedFileCreate,
    captureSelectedFile,
    handleUpdatePhotoSubmit: (e: React.FormEvent) => handleUpdatePhotoSubmit(e, null),
    handlePasswordInputChange,
    handlePasswordSubmit,
    handleUsernameInputChange,
    handleUsernameSubmit,
  }), [
    handleCloseModal,
    handleInputChange,
    handleRegisterInputChange,
    handleRoleChange,
    handleImageChangeCreate,
    handleRegisterSubmit,
    handleUpdateSubmit,
    captureSelectedFileCreate,
    captureSelectedFile,
    handleUpdatePhotoSubmit,
    handlePasswordInputChange,
    handlePasswordSubmit,
    handleUsernameInputChange,
    handleUsernameSubmit,
  ]);

  // Memoized computed values
  const userCount = useMemo(() => users.length, [users.length]);
  const hasUsers = useMemo(() => userCount > 0, [userCount]);
  const showEmptyState = useMemo(() => 
    !isLoading && !hasUsers, 
    [isLoading, hasUsers]
  );

  // Error retry handler
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      <div className="revealer" />
      
      <div className="container mx-auto p-4 space-y-6">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {/* Page Header */}
          <PageHeader
            selectedRole={selectedRole ? (typeof selectedRole === "string" ? selectedRole : selectedRole.value) : ""}
            onRoleChange={(role: string) => handleRoleFilterChange(roleOptions.find(option => option.value === role) || null)}
            onCreateUser={handleOpenCreateModal}
            userCount={userCount}
            isLoading={isLoading}
          />

          {/* Error State */}
          {error && <ErrorState error={error} onRetry={handleRetry} />}

          {/* Loading State */}
          {isLoading && <LoadingState />}

          {/* Empty State */}
          {showEmptyState && (
            <EmptyState
              selectedRole={selectedRole ? (typeof selectedRole === "string" ? selectedRole : selectedRole.value) : ""}
              onCreateUser={handleOpenCreateModal}
              totalUsers={userCount}
            />
          )}

          {/* User Table */}
          {!isLoading && hasUsers && (
            <Suspense fallback={<TableSkeleton />}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <UserTable
                  users={users}
                  onEdit={tableHandlers.onEditUser}
                  onUpdatePhoto={tableHandlers.onUpdatePhoto}
                  onChangePassword={tableHandlers.onChangePassword}
                  onChangeUsername={tableHandlers.onChangeUsername}
                  onDelete={tableHandlers.onDelete}
                />
              </ErrorBoundary>
            </Suspense>
          )}

          {/* Modal Manager */}
          <ModalManager
            modalMode={modalMode}
            activeModal={activeModal ?? ""}
            selectedUser={selectedUser}
            isModalOpen={isModalOpen}
            formData={formData}
            registerFormData={registerFormData}
            photoData={photoData}
            passwordData={passwordData}
            usernameData={usernameData}
            errorsRegister={errorsRegister}
            errorsUpdateBasicInfo={errorsUpdateBasicInfo}
            passwordErrors={passwordErrors}
            usernameErrors={usernameErrors}
            isValidCreate={isValidCreate}
            isValidUpdate={isValidUpdate}
            isValidPassword={isValidPassword}
            isValidUsername={isValidUsername}
            imageUploadRef={imageUploadRef}
            handlers={modalHandlers}
          />
        </ErrorBoundary>
      </div>
    </>
  );
});