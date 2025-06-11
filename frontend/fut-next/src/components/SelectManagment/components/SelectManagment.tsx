// File: src/app/features/tournament/TournamentManagementPage.tsx
"use client";

import { TournamentNavigationBar } from "../";
import { useRevealer } from "@/components/common/hooks/hookNavigation";

export default function TournamentManagementPage() {
  useRevealer();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra de navegación del torneo */}
      <TournamentNavigationBar />
      
      {/* Área de contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Gestión de Torneos
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen del torneo */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Resumen del Torneo
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Usa la barra de navegación de arriba para seleccionar una categoría y gestionar torneos.
                Puedes crear nuevos torneos, administrar divisiones y avanzar entre fases.
              </p>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Acciones Rápidas
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  • Selecciona una categoría para ver o crear torneos
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  • Crea divisiones cuando la fase de grupos esté completa
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  • Avanza de fase cuando todos los partidos hayan terminado
                </p>
              </div>
            </div>
          </div>

          {/* Secciones adicionales pueden agregarse aquí */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Funcionalidades del Torneo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Creación Automática de Torneos
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Los torneos se crean automáticamente cuando una categoría tiene suficientes equipos.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Gestión Dinámica de Divisiones
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Crea divisiones basadas en el rendimiento del equipo y las necesidades del torneo.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Progresión de Fases
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Sigue y navega a través de las diferentes fases del torneo sin interrupciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
