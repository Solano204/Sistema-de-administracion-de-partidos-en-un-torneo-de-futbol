"use client";
import { fetchAllCategories } from '@/components/CategoryManagment/components';
import { NeonSelect } from '@/components/common';
import { CategoryInfoRecord } from '@/components/TeamManagment';
import { SelectOption } from '@/components/UserManagment/components/RoleSelecor';
import React, { useState, useEffect } from 'react';
import MatchesTableWithPDF from './page2';

interface CategoryWithPDFProps {
  className?: string;
}

const CategorySelectWithPDF: React.FC<CategoryWithPDFProps> = ({ 
  className = "" 
}) => {
  const [categories, setCategories] = useState<CategoryInfoRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption<string> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllCategories();
        setCategories(data);
      } catch (err) {
        setError('Error al cargar las categorías');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Convert categories to select options
  const categoryOptions: SelectOption<string>[] = categories.map(category => ({
    label: category.name || `Categoría ${category.id}`,
    value: category.id,
    // Add image if your category has an image field
    // image: category.image
  }));

  // Handle category selection
  const handleCategoryChange = (option: SelectOption<string> | null) => {
    setSelectedCategory(option);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
        <span className="ml-2 text-gray-700 dark:text-gray-300">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 transition-colors duration-300">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Selection */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Seleccionar Categoría para Reporte PDF
        </h2>
        
        <div className="max-w-md">
          <NeonSelect<string>
            id="category-select"
            label="Elegir Categoría"
            placeholder="Selecciona una categoría..."
            options={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChange}
            searchable={true}
            className="w-full"
          />
        </div>

        {selectedCategory && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700 transition-colors duration-300">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Categoría Seleccionada:</strong> {selectedCategory.label}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              <strong>ID:</strong> {selectedCategory.value}
            </p>
          </div>
        )}
      </div>

      {/* PDF Generation Component */}
      {selectedCategory && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <MatchesTableWithPDF categoryId={selectedCategory.value} />
        </div>
      )}

      {!selectedCategory && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Selecciona una categoría arriba para generar el reporte PDF de partidos</p>
        </div>
      )}
    </div>
  );
};

export default CategorySelectWithPDF;