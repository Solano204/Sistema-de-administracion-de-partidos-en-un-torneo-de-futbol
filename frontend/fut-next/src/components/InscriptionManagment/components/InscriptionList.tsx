// File: src/app/features/inscription/components/InscriptionList.tsx
import { memo, useMemo, useCallback } from 'react';
import { InscriptionInfoRecord } from '../types/inscription-types';
import { formatCurrency } from '../utils/inscription-validation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
type InscriptionListProps = {
  inscriptions: InscriptionInfoRecord[];
  onEdit: (inscription: InscriptionInfoRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deletingId: string | undefined;
};

type InscriptionRowProps = {
  inscription: InscriptionInfoRecord;
  onEdit: (inscription: InscriptionInfoRecord) => void;
  onDelete: (id: string) => void;
  isCurrentlyDeleting: boolean;
};

// Constants
const TABLE_HEADERS = [
  { key: 'teamName', label: 'Nombre del equipo', className: 'px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider' },
  { key: 'players', label: 'Jugadores', className: 'px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider' },
  { key: 'date', label: 'Fecha', className: 'px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider' },
  { key: 'amount', label: 'Monto', className: 'px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider' },
  { key: 'actions', label: 'Acciones', className: 'px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider' },
] as const;

const ICONS = {
  clipboard: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  ),
  edit: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
  ),
  delete: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  ),
  spinner: (
    <>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </>
  ),
  pdf: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  )
} as const;

// Utility functions
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const getDaysSinceInscription = (dateString: string): number | null => {
  try {
    const inscriptionDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - inscriptionDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

const formatDaysAgo = (days: number | null): string => {
  if (days === null) return '';
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `${days} días atrás`;
};

// PDF Generation function for single inscription
const generateSingleInscriptionPDF = (inscription: InscriptionInfoRecord) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Comprobante de Inscripción', 14, 22);
  
  // Add horizontal line
  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);
  
  // Team information section
  doc.setFontSize(14);
  doc.setFont("", 'bold');
  doc.text('Información del Equipo', 14, 45);
  
  doc.setFont("", 'normal');
  doc.setFontSize(11);
  
  // Team details
  doc.text('Nombre del Equipo:', 14, 58);
  doc.setFont("", 'bold');
  doc.text(inscription.nameTeam, 60, 58);
  
  doc.setFont("", 'normal');
  doc.text('Número de Jugadores:', 14, 68);
  doc.setFont("", 'bold');
  doc.text(inscription.numPlayer.toString(), 70, 68);
  
  // Registration details section
  doc.setFont("", 'bold');
  doc.setFontSize(14);
  doc.text('Detalles de la Inscripción', 14, 85);
  
  doc.setFont("", 'normal');
  doc.setFontSize(11);
  
  doc.text('Fecha de Inscripción:', 14, 98);
  doc.setFont("", 'bold');
  doc.text(formatDate(inscription.date), 70, 98);
  
  doc.setFont("", 'normal');
  doc.text('Monto de Inscripción:', 14, 108);
  doc.setFont("", 'bold');
  doc.setFontSize(12);
  doc.text(formatCurrency(inscription.amount), 70, 108);
  
  // Add generation info
  doc.setFont("", 'normal');
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 14, 130);
  doc.text(`ID de Inscripción: ${inscription.id}`, 14, 138);
  
  // Add footer
  doc.setFontSize(8);
  doc.text('Este documento es un comprobante oficial de inscripción.', 14, 280);
  
  // Save the PDF
  doc.save(`inscripcion-${inscription.nameTeam.replace(/\s+/g, '-')}-${inscription.id}.pdf`);
};

// PDF Generation function for all inscriptions
const generateAllInscriptionsPDF = (inscriptions: InscriptionInfoRecord[]) => {
  if (inscriptions.length === 0) {
    alert('No hay inscripciones disponibles para exportar');
    return;
  }

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Reporte de Inscripciones', 14, 22);
  
  // Add date and count info
  doc.setFontSize(11);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 32);
  doc.text(`Total de inscripciones: ${inscriptions.length}`, 14, 40);
  
  // Calculate total amount
  const totalAmount = inscriptions.reduce((sum, inscription) => sum + inscription.amount, 0);
  doc.text(`Monto total: ${formatCurrency(totalAmount)}`, 14, 48);
  
  // Prepare table data
  const tableData = inscriptions.map(inscription => [
    inscription.nameTeam,
    inscription.numPlayer.toString(),
    formatDate(inscription.date),
    formatCurrency(inscription.amount)
  ]);

  // Add table using autoTable
  autoTable(doc, {
    head: [['Nombre del Equipo', 'Jugadores', 'Fecha', 'Monto']],
    body: tableData,
    startY: 56,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 56 },
    columnStyles: {
      0: { cellWidth: 60 }, // Team name
      1: { cellWidth: 30, halign: 'center' }, // Players
      2: { cellWidth: 40, halign: 'center' }, // Date
      3: { cellWidth: 40, halign: 'right' }, // Amount
    },
  });

  // Save the PDF
  doc.save(`inscripciones-reporte-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Memoized Components
const EmptyState = memo(function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.clipboard}
          </svg>
          <h3 className="text-lg font-medium mb-1">No se encontraron inscripciones</h3>
          <p className="text-sm">Agrega una nueva inscripción para comenzar</p>
        </div>
      </td>
    </tr>
  );
});

const ListHeader = memo(function ListHeader({ 
  inscriptionsCount, 
  onExportPDF 
}: { 
  inscriptionsCount: number;
  onExportPDF: () => void;
}) {
  return (
    <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {ICONS.clipboard}
        </svg>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lista de inscripciones</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-blue-600 dark:text-blue-400">
          {inscriptionsCount} {inscriptionsCount === 1 ? 'inscripción' : 'inscripciones'}
        </div>
        
        {/* PDF Export Button */}
        <button
          onClick={onExportPDF}
          disabled={inscriptionsCount === 0}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium"
          title={inscriptionsCount === 0 ? 'No hay inscripciones para exportar' : 'Exportar a PDF'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.pdf}
          </svg>
          Exportar PDF ({inscriptionsCount})
        </button>
      </div>
    </div>
  );
});

const TableHeader = memo(function TableHeader() {
  return (
    <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
      <tr>
        {TABLE_HEADERS.map(header => (
          <th key={header.key} className={header.className}>
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
});

const ActionButton = memo(function ActionButton({
  onClick,
  disabled,
  variant,
  isLoading = false,
  children,
  icon
}: {
  onClick: () => void;
  disabled: boolean;
  variant: 'edit' | 'delete' | 'pdf';
  isLoading?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  const baseClasses = "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center";
  
  const variantClasses = {
    edit: disabled 
      ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed" 
      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:ring-blue-500",
    delete: disabled 
      ? "bg-red-100/50 text-red-400 dark:bg-red-900/10 dark:text-red-300" + (isLoading ? " animate-pulse" : "")
      : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500",
    pdf: disabled 
      ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed" 
      : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 focus:ring-green-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-label={`${variant} inscription`}
    >
      {icon}
      {children}
    </button>
  );
});

// Main Row Component - Highly optimized
const InscriptionRow = memo(function InscriptionRow({
  inscription,
  onEdit,
  onDelete,
  isCurrentlyDeleting
}: InscriptionRowProps) {
  // Memoized calculations
  const formattedDate = useMemo(() => formatDate(inscription.date), [inscription.date]);
  const daysSince = useMemo(() => getDaysSinceInscription(inscription.date), [inscription.date]);
  const daysAgoText = useMemo(() => formatDaysAgo(daysSince), [daysSince]);
  const formattedAmount = useMemo(() => formatCurrency(inscription.amount), [inscription.amount]);
  
  // Memoized handlers
  const handleEdit = useCallback(() => {
    onEdit(inscription);
  }, [onEdit, inscription]);
  
  const handleDelete = useCallback(() => {
    onDelete(inscription.id);
  }, [onDelete, inscription.id]);
  
  const handleExportSinglePDF = useCallback(() => {
    generateSingleInscriptionPDF(inscription);
  }, [inscription]);
  
  return (
    <tr 
      className="transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300"
      role="row"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium" title={inscription.nameTeam}>
          {inscription.nameTeam}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          {inscription.numPlayer} {inscription.numPlayer === 1 ? 'player' : 'players'}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{formattedDate}</span>
          {daysAgoText && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {daysAgoText}
            </span>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formattedAmount}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <ActionButton
            onClick={handleExportSinglePDF}
            disabled={isCurrentlyDeleting}
            variant="pdf"
            icon={
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS.pdf}
              </svg>
            }
          >
            PDF
          </ActionButton>
          
          <ActionButton
            onClick={handleEdit}
            disabled={isCurrentlyDeleting}
            variant="edit"
            icon={
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS.edit}
              </svg>
            }
          >
            Editar
          </ActionButton>
          
          <ActionButton
            onClick={handleDelete}
            disabled={isCurrentlyDeleting}
            variant="delete"
            isLoading={isCurrentlyDeleting}
            icon={
              isCurrentlyDeleting ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS.spinner}
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS.delete}
                </svg>
              )
            }
          >
            {isCurrentlyDeleting ? 'Eliminando...' : 'Eliminar'}
          </ActionButton>
        </div>
      </td>
    </tr>
  );
});

// Main Component
export const InscriptionList = memo(function InscriptionList({
  inscriptions,
  onEdit,
  onDelete,
  isDeleting,
  deletingId
}: InscriptionListProps) {
  // Memoized PDF export handler
  const handleExportAllPDF = useCallback(() => {
    generateAllInscriptionsPDF(inscriptions);
  }, [inscriptions]);

  // Memoized row rendering
  const renderedRows = useMemo(() => {
    if (inscriptions.length === 0) {
      return <EmptyState />;
    }
    
    return inscriptions.map((inscription) => (
      <InscriptionRow
        key={inscription.id}
        inscription={inscription}
        onEdit={onEdit}
        onDelete={onDelete}
        isCurrentlyDeleting={isDeleting && deletingId === inscription.id}
      />
    ));
  }, [inscriptions, onEdit, onDelete, isDeleting, deletingId]);

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 bg-white/95 dark:bg-gray-900/95 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <ListHeader 
        inscriptionsCount={inscriptions.length} 
        onExportPDF={handleExportAllPDF}
      />
      
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Inscriptions table">
          <TableHeader />
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
            {renderedRows}
          </tbody>
        </table>
      </div>
    </div>
  );
});