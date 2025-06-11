// File: src/app/features/credential/components/CredentialManagementPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/TeamManagment/Components/Team.PopUp";
import { CredentialForm } from "./CredentialForm";
import { CredentialList } from "./CredentialList";
import { CredentialSearch } from "./CredentialSearch";
import {
  useCredentialMutations,
  useCredentialForm,
} from "../hooks/credential-hooks";
import { usePlayerSearch } from "../hooks/credential-hooks";
import { useCredentials } from "../hooks/credential-hooks";
import { CredentialInfoRecord } from "../types/credential-types";
import { validateCredentialRecord } from "../utils/credential-validation";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

export function CredentialManagementPage() {
  useRevealer();

  // Use the player search hook for player selection
  const {
    selectedPlayer,
  } = usePlayerSearch();

  // Use the credential search hook for credential filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [isContaining, setIsContaining] = useState(false);

  // Use custom hooks for different aspects of functionality
  const {
    credentials,
    isLoading: isLoadingCredentials,
    error: credentialError,
    refreshCredentials,
    setSearchTerm: updateCredentialSearch,
    setIsContaining: updateIsContaining,
  } = useCredentials(searchTerm, isContaining);

  // Handle credential search
  const handleCredentialSearch = () => {
    updateCredentialSearch(searchTerm);
    updateIsContaining(isContaining);
  };

  // Get mutations from the custom hook
  const {
    createCredential,
    updateCredential,
    deleteCredential,
    isCreating,
    isUpdating,
    isDeleting,
    deletingId,
  } = useCredentialMutations();

  // Get form management from the custom hook
  const {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedCredentialId,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleValidationError,
  } = useCredentialForm();

  // Update player name in form when a player is selected
  useEffect(() => {
    if (selectedPlayer && modalMode === "create") {
      handleInputChange({
        target: {
          name: "playerName",
          value: selectedPlayer.fullName,
          type: "text",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [selectedPlayer, modalMode]);

  // Form submission handler
  // Form submission handler
  const handleSubmit = async (
    updatedFormData: Partial<CredentialInfoRecord>
  ) => {
    try {
      // Determine if we're creating or editing a credential
      const isEdit = modalMode === "edit";

      // Validate the form data
      const validatedData = validateCredentialRecord(updatedFormData, isEdit);

      if (isEdit && selectedCredentialId) {
        // For editing an existing credential
        await updateCredential({
          id: selectedCredentialId,
          credential: validatedData,
        });
      } else {
        // For creating a new credential
        await createCredential(validatedData);
      }

      // Close the modal after successful operation
      closeModal();

      // Force refresh credentials after operation completes
      refreshCredentials();
    } catch (error) {
      handleValidationError(error);
    }
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setIsContaining(false);
    updateCredentialSearch("");
    updateIsContaining(false);
    refreshCredentials(); // Force refresh of credentials
  };

  // Handle credential deletion
  const handleDeleteCredential = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this credential?`)) return;
    try {
      await deleteCredential(id);
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };
  return (
    <>
      <div className="revealer"></div>

      <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
            Gestion de credenciales
        </h1>

        {/* Search Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full">
          <div className="w-full">
            <div className=" bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 backdrop-blur-md transition-all duration-300">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                      Buscar credenciales
              </h3>
              <CredentialSearch
                searchTerm={searchTerm}
                isContaining={isContaining}
                isLoading={isLoadingCredentials}
                onSearchChange={setSearchTerm}
                onContainingChange={setIsContaining}
                onSearch={handleCredentialSearch}
                onClearFilter={handleClearFilter}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {credentialError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-md mb-6 transition-colors duration-300">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Error al cargar las credenciales. Por favor, inténtelo de nuevo.</span>
              <button
                onClick={handleCredentialSearch}
                className="ml-auto p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
                aria-label="Retry loading credentials"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Credentials Management Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Acciones de credenciales
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gestionar el acceso y permisos de los usuarios
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:translate-y-[-2px] flex items-center gap-2 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Agregar nueva credencial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center gap-3 border border-blue-200 dark:border-blue-800">
              <div className="bg-blue-100 dark:bg-blue-800/60 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Total de credenciales
                </div>
                <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  {credentials.length}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex items-center gap-3 border border-purple-200 dark:border-purple-800">
              <div className="bg-purple-100 dark:bg-purple-800/60 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Credenciales activas
                </div>
                <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
                  {/* {credentials.filter(c => c.).length} */}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 flex items-center gap-3 border border-amber-200 dark:border-amber-800">
              <div className="bg-amber-100 dark:bg-amber-800/60 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  Ultima actualización
                </div>
                <div className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  {credentials.length > 0
                    ? new Date(
                        Math.max(
                          ...credentials.map((c) =>
                            new Date(c.updatedAt).getTime()
                          )
                        )
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials List */}
        {isLoadingCredentials ? (
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-800/60 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Cargando credenciales...
              </p>
            </div>
          </div>
        ) : credentials.length > 0 ? (
          <CredentialList
            credentials={credentials}
            onEdit={openEditModal}
            onDelete={handleDeleteCredential}
            isDeleting={isDeleting}
            deletingId={deletingId}
          />
        ) : (
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col items-center justify-center p-4">
              <svg
                className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                ></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No se encontraron credenciales
                {searchTerm ? (
                    <span className="font-medium"> coincidiendo con {searchTerm}</span>
                ) : (
                  ""
                )}
              </p>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchTerm
                  ? "Intenta ajustar tus criterios de búsqueda"
                  : "Agrega una nueva credencial para comenzar"}
              </p>

              <div className="flex gap-4">
                {searchTerm && (
                  <button
                    onClick={handleClearFilter}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    Limpiar búsqueda
                  </button>
                )}

                <button
                  onClick={openCreateModal}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:translate-y-[-2px] flex items-center gap-2 font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Agregar nueva credencial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credential Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          description={
            modalMode === "create"
                  ? "Crea un nuevo registro de credencial con permisos de acceso seguros"
              : "Actualiza la información de la credencial y los niveles de acceso"
          }
          width="800px"
          height="auto"
          contentClassName="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
        >
          <CredentialForm
            formData={formData}
            errors={errors}
            isValid={isValid}
            isProcessing={isCreating || isUpdating}
            modalMode={modalMode}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    </>
  );
}
