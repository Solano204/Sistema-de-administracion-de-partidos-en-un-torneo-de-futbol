// File: src/app/features/category/components/CategoryList.tsx
import { memo } from 'react';
import { CategoryInfoRecord } from '../types/category-types';
import clsx from 'clsx';
import Image from 'next/image';

type CategoryListProps = {
  categories: CategoryInfoRecord[];
  onEdit: (category: CategoryInfoRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deletingId: string;
};

export const CategoryList = memo(function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  isDeleting, 
  deletingId 
}: CategoryListProps) {
  return (
    <div className={clsx(
      "rounded-xl overflow-hidden transition-all duration-300",
      "bg-white/95 dark:bg-gray-900/95 shadow-lg",
      "border border-gray-200 dark:border-gray-700",
      "backdrop-blur-md"
    )}>
      <div className={clsx(
        "flex items-center justify-between p-6",
        "border-b border-gray-200/70 dark:border-gray-700/70",
        "bg-gradient-to-r from-blue-50/50 to-indigo-50/50",
        "dark:from-blue-900/20 dark:to-indigo-900/20"
      )}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Lista de categorías
        </h2>
        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={clsx(
            "sticky top-0 z-10",
            "bg-gray-50/90 dark:bg-gray-800/90",
            "backdrop-blur-sm",
            "transition-colors duration-300"
          )}>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rango de edad
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryRow 
                  key={category.id} 
                  category={category}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                  deletingId={deletingId}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-lg font-medium">No se encontraron categorías</p>
                    <p className="mt-1 text-sm">Agrega una nueva categoría para comenzar</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

type CategoryRowProps = {
  category: CategoryInfoRecord;
  onEdit: (category: CategoryInfoRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deletingId: string;
};

// Individual row component to optimize renders
const CategoryRow = memo(function CategoryRow({ 
  category, 
  onEdit, 
  onDelete, 
  isDeleting, 
  deletingId 
}: CategoryRowProps) {
  const isCurrentlyDeleting = isDeleting && deletingId === category.id;
  
  return (
    <tr className={clsx(
      "transition-all duration-200",
      "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
      "text-gray-700 dark:text-gray-300"
    )}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium">{category.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={clsx(
            "h-12 w-12 relative rounded-lg overflow-hidden",
            "ring-2 ring-gray-200 dark:ring-gray-700",
            "shadow-sm"
          )}>
            <Image
              fill
              src={category.imageUrl}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={clsx(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
          "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        )}>
          {category.ageRange.minAge} - {category.ageRange.maxAge} years
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(category)}
            disabled={isCurrentlyDeleting}
            className={clsx(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "flex items-center",
              isCurrentlyDeleting 
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:ring-blue-500"
            )}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={() => onDelete(category.id)}
            disabled={isCurrentlyDeleting}
            className={clsx(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "flex items-center",
              isCurrentlyDeleting 
                ? "bg-red-100/50 text-red-400 dark:bg-red-900/10 dark:text-red-300 animate-pulse"
                : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500"
            )}
          >
            {isCurrentlyDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                  Eliminar
              </>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});