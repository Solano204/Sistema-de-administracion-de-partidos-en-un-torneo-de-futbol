"use client";
import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchMatchesByCategory } from '@/components/MatchManagment/api/match-api';
import clsx from 'clsx';

// Types
export interface MatchTinyDetails {
  idMatch: string;
  phase: string;
  tourmentId: string;
  tournamentName: string;
  status: statusMatch;
  team1: TeamNameIdRecord;
  team2: TeamNameIdRecord;
  category: string;
}

export interface TeamNameIdRecord {
  teamId?: string;
  name?: string;
}

export type statusMatch = "PENDIENTE" | "POSPONIDO" | "SELECIONADO" | "JUGADO" | "CANCELADO";

// Component Props
interface MatchesTableWithPDFProps {
  categoryId: string;
  className?: string;
}

// Status styling functions
const getStatusClass = (status: statusMatch): string => {
  const statusClasses = {
    PENDIENTE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    POSPONIDO: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    SELECIONADO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    JUGADO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    CANCELADO: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
};

const getStatusColor = (status: statusMatch): string => {
  switch (status) {
    case 'PENDIENTE':
      return '#fbbf24'; // Yellow
    case 'POSPONIDO':
      return '#f87171'; // Red
    case 'SELECIONADO':
      return '#60a5fa'; // Blue
    case 'JUGADO':
      return '#34d399'; // Green
    case 'CANCELADO':
      return '#ef4444'; // Dark Red
    default:
      return '#6b7280'; // Gray
  }
};

// Status translation
const getStatusTranslation = (status: statusMatch): string => {
  const translations = {
    PENDIENTE: "Pendiente",
    POSPONIDO: "Pospuesto",
    SELECIONADO: "Seleccionado",
    JUGADO: "Jugado",
    CANCELADO: "Cancelado",
  };
  return translations[status] || status;
};

// Memoized table header component
const TableHeader = memo(function TableHeader() {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          ID Partido
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Fase
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Torneo
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Equipo 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Equipo 2
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Categoría
        </th>
      </tr>
    </thead>
  );
});

// Memoized list header component
const ListHeader = memo(function ListHeader({ 
  count, 
  categoryId, 
  onGeneratePDF, 
  isGeneratingPDF 
}: { 
  count: number;
  categoryId: string;
  onGeneratePDF: () => void;
  isGeneratingPDF: boolean;
}) {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Reporte de Partidos
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ID de Categoría: {categoryId}
          </p>
        </div>
        
        {/* PDF Export Button */}
        <button
          onClick={onGeneratePDF}
          disabled={count === 0 || isGeneratingPDF}
          className={clsx(
            "px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200",
            count === 0 || isGeneratingPDF
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white"
              : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isGeneratingPDF ? "Generando..." : `Exportar PDF (${count} partidos)`}
        </button>
      </div>
    </div>
  );
});

// Individual row component
const MatchRow = memo(function MatchRow({ 
  match, 
  index 
}: { 
  match: MatchTinyDetails; 
  index: number 
}) {
  const statusClass = useMemo(() => getStatusClass(match.status), [match.status]);
  const statusText = useMemo(() => getStatusTranslation(match.status), [match.status]);

  return (
    <tr className={clsx(
      "hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-200",
      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
    )}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200/70 dark:border-gray-700/70">
        {match.idMatch}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200/70 dark:border-gray-700/70">
        {match.phase}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200/70 dark:border-gray-700/70">
        {match.tournamentName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200/70 dark:border-gray-700/70">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${statusClass}`}>
          {statusText}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200/70 dark:border-gray-700/70">
        {match.team1.name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200/70 dark:border-gray-700/70">
        {match.team2.name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200/70 dark:border-gray-700/70">
        {match.category}
      </td>
    </tr>
  );
});

const MatchesTableWithPDF: React.FC<MatchesTableWithPDFProps> = ({ 
  categoryId,
  className = ""
}) => {
  const [matches, setMatches] = useState<MatchTinyDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Fetch matches data when categoryId changes
  useEffect(() => {
    const loadMatches = async () => {
      if (!categoryId) {
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchMatchesByCategory(categoryId);
        setMatches(data);
      } catch (err) {
        setError('Error al cargar los datos de partidos');
        console.error('Error:', err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [categoryId]);

  // Generate PDF
  const generatePDF = useCallback(async () => {
    if (matches.length === 0) {
      alert('No hay partidos disponibles para exportar');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Reporte de Partidos', 14, 22);
      
      // Add category and date info
      doc.setFontSize(11);
      doc.text(`ID de Categoría: ${categoryId}`, 14, 32);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 40);
      doc.text(`Total de partidos: ${matches.length}`, 14, 48);
      
      // Prepare table data
      const tableData = matches.map(match => [
        match.idMatch,
        match.phase,
        match.tournamentName,
        getStatusTranslation(match.status),
        match.team1.name || 'N/A',
        match.team2.name || 'N/A',
        match.category
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [['ID Partido', 'Fase', 'Torneo', 'Estado', 'Equipo 1', 'Equipo 2', 'Categoría']],
        body: tableData,
        startY: 56,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 56 },
      });

      // Save the PDF
      doc.save(`reporte-partidos-${categoryId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [matches, categoryId]);

  // Memoized matches count
  const matchesCount = useMemo(() => matches.length, [matches.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
        <span className="ml-2 text-gray-700 dark:text-gray-300">Cargando partidos...</span>
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
    <div className={`max-w-7xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <ListHeader 
          count={matchesCount} 
          categoryId={categoryId}
          onGeneratePDF={generatePDF}
          isGeneratingPDF={isGeneratingPDF}
        />

        {matches.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-6 text-center m-6 transition-colors duration-300">
            <div className="text-yellow-600 dark:text-yellow-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              No se Encontraron Partidos
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400">
              No hay partidos disponibles para la categoría seleccionada.
            </p>
          </div>
        ) : (
          <>
            {/* Matches count */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <p className="text-gray-600 dark:text-gray-400">
                Total de partidos: <span className="font-semibold text-gray-800 dark:text-gray-200">{matchesCount}</span>
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <TableHeader />
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {matches.map((match, index) => (
                    <MatchRow
                      key={match.idMatch}
                      match={match}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchesTableWithPDF;