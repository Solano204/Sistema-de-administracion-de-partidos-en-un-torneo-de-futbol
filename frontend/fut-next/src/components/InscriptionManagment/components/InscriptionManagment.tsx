"use client";

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

// Lazy load heavy components
const InscriptionList = dynamic(() => import('./InscriptionList').then(mod => ({ default: mod.InscriptionList })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando inscripciones...</p>
    </div>
  )
});

const InscriptionForm = dynamic(() => import('./InscriptionForm').then(mod => ({ default: mod.InscriptionForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

const InscriptionSearch = dynamic(() => import('./InscriptionSearch').then(mod => ({ default: mod.InscriptionSearch })), {
  loading: () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  )
});

const TeamSearch = dynamic(() => import('./TeamSearch').then(mod => ({ default: mod.TeamSearch })), {
  loading: () => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  )
});

const Modal = dynamic(() => import('@/components/TeamManagment/Components/Team.PopUp').then(mod => ({ default: mod.Modal })), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </div>
  )
});

import { 
  useInscriptions, 
  useInscriptionForm, 
  useInscriptionMutations,
  useTeamSearch,
  usePaginatedInscriptions
} from '../hooks/inscription-hooks';
import { InscriptionInfoRecord } from '../types/inscription-types';
import { formatCurrency } from '@/components/CredentialsManagment';
import { useRevealer } from '@/components/common/hooks/hookNavigation';

// Move constants outside component
const VIEW_MODES = {
  LIST: 'list' as const,
  PAGINATED: 'paginated' as const,
  SEARCH: 'search' as const,
};

// Memoized stat card component
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

// Memoized view mode button component
const ViewModeButton = React.memo(({ 
  mode, 
  currentMode, 
  onClick, 
  children 
}: {
  mode: string;
  currentMode: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    className={`py-3 px-6 font-medium text-sm transition-all duration-200 ${
      currentMode === mode
        ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
));

ViewModeButton.displayName = 'ViewModeButton';

// Memoized header component
const PageHeader = React.memo(({ onCreateNew }: { onCreateNew: () => void }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
    <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
      Team Inscriptions Management
    </h1>
    {/* <button
      onClick={onCreateNew}
      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
    >
      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      New Inscription
    </button> */}
  </div>
));

PageHeader.displayName = 'PageHeader';

// Memoized loading state component
const LoadingState = React.memo(function LoadingState() {
  return (
    <div className="flex justify-center items-center h-64 bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-800/60 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando inscripciones...</p>
      </div>
    </div>
  );
});

// Memoized empty state component
const EmptyState = React.memo(function EmptyState({ 
  searchTerm, 
  onClearSearch 
}: {
  searchTerm: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="text-center py-12 bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md transition-all duration-300">
      <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No se encontraron inscripciones</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        No se encontraron inscripciones coincidentes con "{searchTerm}".
      </p>
      <div className="mt-6">
        <button
          onClick={onClearSearch}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          Limpiar búsqueda
        </button>
      </div>
    </div>
  );
});

export function InscriptionManagementPage() {
  useRevealer();
  
  // State for view mode
  const [viewMode, setViewMode] = useState<'list' | 'paginated' | 'search'>('search');
  
  // Initialize hooks
  const teamSearch = useTeamSearch();
  
  const {
    inscriptions,
    isLoading: isLoadingInscriptions,
    searchTerm,
    isContaining,
    setSearchTerm,
    setIsContaining,
    refreshInscriptions
  } = useInscriptions();
  
  const {
    isLoading: isLoadingPaginated,
    refreshInscriptions: refreshPaginatedInscriptions
  } = usePaginatedInscriptions();
  
  const {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedInscriptionId,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    setFormData,
  } = useInscriptionForm();
  
  const {
    createInscription,
    updateInscription,
    deleteInscription,
    isCreating,
    isUpdating,
    isDeleting,
    deletingId,
  } = useInscriptionMutations();
  
  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const totalTeams = inscriptions.length;
    const totalRevenue = inscriptions.reduce((sum, i) => sum + i.amount, 0);
    const totalPlayers = inscriptions.reduce((sum, i) => sum + i.numPlayer, 0);
    
    return {
      totalTeams,
      totalRevenue: formatCurrency(totalRevenue),
      totalPlayers
    };
  }, [inscriptions]);
  
  // Memoized view mode handlers
  const handleViewModeChange = useCallback((mode: 'list' | 'paginated' | 'search') => {
    setViewMode(mode);
  }, []);
  
  // Optimized form submission handler
  const handleFormSubmit = useCallback(
    async (data: Partial<InscriptionInfoRecord>) => {
      try {
        if (modalMode === 'create') {
          await createInscription(data);
        } else if (modalMode === 'edit' && selectedInscriptionId) {
          await updateInscription({ id: selectedInscriptionId, inscription: data as InscriptionInfoRecord });
        }
        closeModal();
        refreshInscriptions();
        refreshPaginatedInscriptions();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
    [
      modalMode,
      selectedInscriptionId,
      createInscription,
      updateInscription,
      closeModal,
      refreshInscriptions,
      refreshPaginatedInscriptions
    ]
  );
  
  // Optimized team selection handler
  const handleTeamSelect = useCallback(
    (team: { name: string; playerCount: number; }) => {
      setFormData((prev) => ({
        ...prev,
        nameTeam: team.name,
        numPlayer: team.playerCount,
      }));
    },
    [setFormData]
  );
  
  // Optimized search handler
  const handleSearch = useCallback(() => {
    refreshInscriptions();
  }, [refreshInscriptions]);
  
  // Optimized clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    handleSearch();
  }, [setSearchTerm, handleSearch]);
  
  // Optimized team search and select handler
  const handleTeamSearchSelect = useCallback((team: any) => {
    teamSearch.handleSelectTeam(team);
    handleTeamSelect(team);
  }, [teamSearch.handleSelectTeam, handleTeamSelect]);
  
  // Memoized boolean checks
  const showSearch = useMemo(() => viewMode === 'search', [viewMode]);
  const hasInscriptions = useMemo(() => inscriptions.length > 0, [inscriptions.length]);
  const showEmptyState = useMemo(() => 
    !hasInscriptions && searchTerm && !isLoadingInscriptions, 
    [hasInscriptions, searchTerm, isLoadingInscriptions]
  );
  const isCreatingMode = useMemo(() => modalMode === 'create', [modalMode]);
  const isProcessing = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  return (
    <>
      <div className='revealer'></div>
      
      <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        {/* Header Section */}
        <PageHeader onCreateNew={openCreateModal} />
        
        {/* View mode selector */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <ViewModeButton
              mode={VIEW_MODES.SEARCH}
              currentMode={viewMode}
              onClick={() => handleViewModeChange(VIEW_MODES.SEARCH)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Buscar inscripciones
              </div>
            </ViewModeButton>
          </div>
        </div>
        
        {/* Search controls - only shown in search view */}
        {showSearch && (
          <div className="mb-6 bg-white/95 dark:bg-gray-900/95 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md transition-all duration-300">
            <InscriptionSearch
              searchTerm={searchTerm}
              isContaining={isContaining}
              onSearchChange={setSearchTerm}
              onContainingChange={setIsContaining}
              onSearch={handleSearch}
              isLoading={isLoadingInscriptions}
            />
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
            title="Total equipos"
            value={statistics.totalTeams}
            bgColor="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            iconBg="bg-blue-100 dark:bg-blue-800/60"
            textColor="text-blue-700 dark:text-blue-300"
          />
          
          <StatCard
            icon={
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
            title="Total de ingresos"
            value={statistics.totalRevenue}
            bgColor="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            iconBg="bg-green-100 dark:bg-green-800/60"
            textColor="text-green-700 dark:text-green-300"
          />
          
          <StatCard
            icon={
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            }
            title="Total de jugadores"
            value={statistics.totalPlayers}
            bgColor="bg-purple-50/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            iconBg="bg-purple-100 dark:bg-purple-800/60"
            textColor="text-purple-700 dark:text-purple-300"
          />
        </div>
        
        {/* Main content area */}
        <div className="space-y-6">
          {showSearch && (
            <>
              {isLoadingInscriptions ? (
                <LoadingState />
              ) : showEmptyState ? (
                <EmptyState 
                  searchTerm={searchTerm} 
                  onClearSearch={handleClearSearch}
                />
              ) : (
                <InscriptionList
                  inscriptions={inscriptions}
                  onEdit={openEditModal}
                  onDelete={deleteInscription}
                  isDeleting={isDeleting}
                  deletingId={deletingId}
                />
              )}
            </>
          )}
        </div>
        
        {/* Modal for creating/editing inscriptions */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            contentClassName="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
          >
            <div className="space-y-6">
              {isCreatingMode && (
                <div className="mb-6 p-4 rounded-lg bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Selección de equipo</h3>
                  <TeamSearch
                    searchTerm={teamSearch.searchTerm}
                    searchResults={teamSearch.searchResults}
                    selectedTeam={teamSearch.selectedTeam}
                    isLoading={teamSearch.isLoading}
                    onSearchChange={teamSearch.handleSearchChange}
                    onSearch={teamSearch.handleSearch}
                    onSelectTeam={handleTeamSearchSelect}
                    onClearSearch={teamSearch.handleClearSearch}
                  />
                </div>
              )}
              
              <InscriptionForm
                formData={formData}
                errors={errors}
                isValid={isValid}
                isProcessing={isProcessing}
                modalMode={modalMode}
                onInputChange={handleInputChange}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
              />
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}