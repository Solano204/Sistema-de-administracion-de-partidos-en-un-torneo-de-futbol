// File: src/app/features/category/CategoryManagementPage.tsx
"use client";

import { SupabaseFolder, uploadImage } from "@/app/utils/Actions/SupaBase/ActionsImages";
import { Modal } from "@/components/TeamManagment/Components/Team.PopUp";
import { FormInput } from "@/components/common";
import { CategoryForm, CategoryInfoRecord } from ".";
import { 
  useCategoriesList, 
  useCategoryMutations, 
  useCategoryForm 
} from ".";
import { CategoryList } from ".";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

export default function CategoryManagementPage() {

  useRevealer();

  // Use custom hooks for different aspects of functionality
  const { 
    categories,
    isLoading, 
    error, 
    searchQuery, 
    handleSearch, 
    refreshCategories 
  } = useCategoriesList();
  
  /// Here im getting the data from the custom hook
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
    deletingId
  } = useCategoryMutations();


  // Here im getting the data from the custom hook
  const {
    formData,
    errors,
    isValid,
    modalMode,
    isModalOpen,
    selectedCategoryId,
    handleInputChange,
    openCreateModal,
    openEditModal,
    handleImageChange,
    closeModal,
    handleValidationError,
  } = useCategoryForm();

  // Form submission handler with file upload integration
  const handleSubmit = async (updatedFormData: Partial<CategoryInfoRecord>, imageFile: File | null = null) => {
    try {
      const isEdit = modalMode === "edit";
      
      // Handle the image upload if a new file was selected
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(
            imageFile, 
            SupabaseFolder.CATEGORIES, 
            selectedCategoryId || 'new-category'
          );
          

          console.log('Image uploaded successfully:', uploadResult.url);
          // Update the form data with the new image URL
          updatedFormData.imageUrl = uploadResult.url;
        } catch (error) {
          console.error('Image upload error:', error);
          toastCustom(
            {
              title: "Error",
              description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
              button: { label: "Dismiss", onClick: () => {} },
            },
            "error",
            7000
          );
          // Don't stop the submission if the image upload fails
        }
      }

      // Submit the data based on current mode
      if (isEdit && selectedCategoryId) {
        await updateCategory({
          id: selectedCategoryId,
          category: updatedFormData,
        });
      } else {
        await createCategory(updatedFormData as Omit<CategoryInfoRecord, "id">);
      }
      
      closeModal();
    } catch (error) {
      handleValidationError(error);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm(`Are you sure you want to delete this category?`)) return;
    await deleteCategory(categoryId);
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };
return (
  <>
  <div className="revealer"></div>
  <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-200">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        Gestion de categorías
      </h1>
      
      <button
        onClick={openCreateModal}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Agregar nueva categoría
      </button>
    </div>

    {/* Search Panel */}
    <div className="rounded-xl overflow-hidden shadow-lg mb-8 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h2 className="text-xl font-semibold">Buscar y filtrar</h2>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <FormInput
            id="searchInput"
            label="Buscar categorías"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1"
            placeholder="Buscar categorías..."
            />
          
          <button
            disabled={isLoading}
            onClick={() => refreshCategories()}
            className={`flex items-center justify-center gap-2 h-10 self-end px-5 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading 
              ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            }`}
            >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                  Cargando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refrescar
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Status and Error Messages */}
    {error && (
      <div className="rounded-lg overflow-hidden mb-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 shadow-md">
        <div className="p-4 flex gap-3 items-center">
          <div className="text-red-600 dark:text-red-400 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-red-600 dark:text-red-400 font-medium">Error al cargar las categorías. Por favor, inténtelo de nuevo.</p>
          </div>
          <button 
            onClick={() => refreshCategories()}
            className="ml-auto p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    )}

    {/* Categories List or Empty State */}
    {isLoading ? (
      <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 animate-spin"></div>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Cargando categorías...</p>
        </div>
      </div>
    ) : categories.length > 0 ? (
      <CategoryList 
      categories={categories}
      onEdit={openEditModal}
      onDelete={handleDeleteCategory}
      isDeleting={isDeleting}
      deletingId={deletingId || ""}
      />
    ) : (
      <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-24 h-24 mb-6 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">No se encontraron categorías</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Comienza creando tu primera categoría</p>
          
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar nueva categoría
          </button>
        </div>
      </div>
    )}

    {/* Category Form Modal */}
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
    
      description={
        modalMode === "create"
            ? "Crea una nueva categoría para tu torneo o liga"
        : "Actualiza los detalles de esta categoría"
      }
      width="800px"
      height="auto"
      contentClassName="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700"
      >
      <CategoryForm 
        formData={formData}
        errors={errors}
        isValid={isValid}
        isProcessing={isCreating || isUpdating}
        modalMode={modalMode}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        />
    </Modal>
  </div>
        </>
);
}