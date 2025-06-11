// File: src/app/features/debt/components/DebtList.tsx
import { memo, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { DebtRecordDto, DebtStatus } from '../types/debt-types';

type DebtListProps = {
  debts: DebtRecordDto[];
  onEdit: (debt: DebtRecordDto) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
  isDeleting: boolean;
  deletingId: string | undefined;
  isChangingStatus: boolean;
  statusUpdatingId: string | undefined;
};

// Move constants outside to prevent recreation
const DEBT_STATUSES = {
  PENDIENTE: "PENDIENTE" as DebtStatus,
  PAGADO: "PAGADO" as DebtStatus,
} as const;

// Memoized utility functions
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid date";
  }
};

const isDueDate = (dateString: string | null, state: DebtStatus): boolean => {
  if (!dateString || state === DEBT_STATUSES.PAGADO) return false;
  try {
    const dueDate = new Date(dateString);
    const today = new Date();
    return dueDate < today;
  } catch {
    return false;
  }
};

// Memoized summary card component
const SummaryCard = memo(function SummaryCard({ 
  label, 
  amount, 
  bgColor, 
  textColor 
}: {
  label: string;
  amount: number;
  bgColor: string;
  textColor: string;
}) {
  return (  
    <div className={`flex flex-col items-center px-4 py-2 ${bgColor} rounded-lg border ${bgColor.replace('100', '200').replace('900', '800')}`}>
      <span className={`text-xs font-medium ${textColor}`}>{label}</span>
      <span className={`text-lg font-bold ${textColor}`}>${amount.toFixed(2)}</span>
    </div>
  );
});

// Memoized table header component
const TableHeader = memo(function TableHeader() { 
  return (
    <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Descripción
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Monto
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Fecha de vencimiento
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Fecha de pago
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
});

// Memoized empty state component
const EmptyState = memo(function EmptyState() {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p className="text-lg font-medium">No se encontraron deudas</p>
          <p className="mt-1 text-sm">Agrega una nueva deuda para comenzar</p>
        </div>
      </td>
    </tr>
  );
});

// Memoized list header component
const ListHeader = memo(function ListHeader({ summaryData }: { summaryData: { totalAmount: number; pendingAmount: number; paidAmount: number } }) {
  return (
    <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Lista de deudas
          </h2>
        </div>
        
        <div className="flex gap-4">
          <SummaryCard
            label="Total"
            amount={summaryData.totalAmount}
            bgColor="bg-blue-100/80 dark:bg-blue-900/30"
            textColor="text-blue-800 dark:text-blue-300"
          />
          <SummaryCard
            label="Pendiente"
            amount={summaryData.pendingAmount}
            bgColor="bg-yellow-100/80 dark:bg-yellow-900/30"
            textColor="text-yellow-800 dark:text-yellow-300"
          />
          <SummaryCard
            label="Pagado"
            amount={summaryData.paidAmount}
            bgColor="bg-green-100/80 dark:bg-green-900/30"
            textColor="text-green-800 dark:text-green-300"
          />
        </div>
      </div>
    </div>
  );
});

export const DebtList = memo(function DebtList({
  debts,
  onEdit,
  onDelete,
  onUpdateStatus,
  isDeleting,
  deletingId,
  isChangingStatus,
  statusUpdatingId
}: DebtListProps) {
  // Memoized calculations to prevent recalculation on every render
  const summaryData = useMemo(() => {
    const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const pendingAmount = debts
      .filter(debt => debt.state === DEBT_STATUSES.PENDIENTE)
      .reduce((sum, debt) => sum + debt.amount, 0);
    const paidAmount = totalAmount - pendingAmount;
    
    return { totalAmount, pendingAmount, paidAmount };
  }, [debts]);

  // Memoized debt count check
  const hasDebts = useMemo(() => debts.length > 0, [debts.length]);

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 bg-white/95 dark:bg-gray-900/95 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <ListHeader summaryData={summaryData} />
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
            {hasDebts ? (
              debts.map((debt) => (
                <DebtRow
                  key={debt.Id}
                  debt={debt}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdateStatus={onUpdateStatus}
                  isDeleting={isDeleting}
                  deletingId={deletingId}
                  isChangingStatus={isChangingStatus}
                  statusUpdatingId={statusUpdatingId}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

type DebtRowProps = {
  debt: DebtRecordDto;
  onEdit: (debt: DebtRecordDto) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
  isDeleting: boolean;
  deletingId: string | undefined;
  isChangingStatus: boolean;
  statusUpdatingId: string | undefined;
};

// Individual row component with optimized rendering
const DebtRow = memo(function DebtRow({
  debt,
  onEdit,
  onDelete,
  onUpdateStatus,
  isDeleting,
  deletingId,
  isChangingStatus,
  statusUpdatingId
}: DebtRowProps) {
  // Memoized status checks
  const statusChecks = useMemo(() => ({
    isCurrentlyDeleting: isDeleting && deletingId === debt.Id,
    isCurrentlyUpdatingStatus: isChangingStatus && statusUpdatingId === debt.Id,
    isOverdue: isDueDate(debt.dueDate, debt.state),
    isPaid: debt.state === DEBT_STATUSES.PAGADO
  }), [isDeleting, deletingId, debt.Id, isChangingStatus, statusUpdatingId, debt.dueDate, debt.state]);

  // Memoized formatted dates
  const formattedDates = useMemo(() => ({
    dueDate: formatDate(debt.dueDate),
    paidDate: formatDate(debt.paidDate)
  }), [debt.dueDate, debt.paidDate]);

  // Memoized event handlers
  const handleEdit = useCallback(() => {
    onEdit(debt);
  }, [onEdit, debt]);

  const handleDelete = useCallback(() => {
    onDelete(debt.Id);
  }, [onDelete, debt.Id]);

  const handleMarkPaid = useCallback(() => {
    onUpdateStatus(debt.Id, DEBT_STATUSES.PAGADO);
  }, [onUpdateStatus, debt.Id]);

  const handleMarkPending = useCallback(() => {
    onUpdateStatus(debt.Id, DEBT_STATUSES.PENDIENTE);
  }, [onUpdateStatus, debt.Id]);

  // Memoized button states and classes
  const buttonStates = useMemo(() => {
    const { isCurrentlyDeleting, isCurrentlyUpdatingStatus } = statusChecks;
    const isAnyActionInProgress = isCurrentlyDeleting || isCurrentlyUpdatingStatus;

    return {
      editDisabled: isAnyActionInProgress,
      deleteDisabled: isAnyActionInProgress,
      statusDisabled: isAnyActionInProgress,
      editClasses: clsx(
        "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
        isAnyActionInProgress
          ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed" 
          : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:ring-blue-500"
      ),
      deleteClasses: clsx(
        "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
        isCurrentlyDeleting
          ? "bg-red-100/50 text-red-400 dark:bg-red-900/10 dark:text-red-300 animate-pulse" 
          : isCurrentlyUpdatingStatus
          ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
          : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500"
      )
    };
  }, [statusChecks]);

  return (
    <tr className={clsx(
      "transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300",
      statusChecks.isOverdue && "bg-red-50/50 dark:bg-red-900/10"
    )}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium">{debt.description}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap font-medium">
        <div className={clsx(
          statusChecks.isPaid
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        )}>
          ${debt.amount.toFixed(2)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={clsx(
          "flex items-center",
          statusChecks.isOverdue && "text-red-600 dark:text-red-400 font-medium"
        )}>
          <svg className={clsx(
            "w-4 h-4 mr-2",
            statusChecks.isOverdue 
              ? "text-red-500 dark:text-red-400" 
              : "text-gray-400 dark:text-gray-500"
          )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDates.dueDate} 
          {statusChecks.isOverdue && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
              Vencido
            </span>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {debt.paidDate ? (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedDates.paidDate}
          </div>
        ) : (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No pagado
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={clsx(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            statusChecks.isPaid
              ? "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          )}
        >
          {debt.state}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            disabled={buttonStates.editDisabled}
            className={buttonStates.editClasses}
            aria-label={`Edit debt: ${debt.description}`}
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          
          <button
            onClick={handleDelete}
            disabled={buttonStates.deleteDisabled}
            className={buttonStates.deleteClasses}
            aria-label={`Delete debt: ${debt.description}`}
          >
            {statusChecks.isCurrentlyDeleting ? (
                    <LoadingIcon text="Eliminando..." />
            ) : (
              <DeleteIcon />
            )}
          </button>
          
          {!statusChecks.isPaid ? (
            <StatusButton
              onClick={handleMarkPaid}
              disabled={buttonStates.statusDisabled}
              isLoading={statusChecks.isCurrentlyUpdatingStatus}
              variant="paid"
              loadingText="Actualizando..."
              text="Marcar como pagado"
              icon={<CheckIcon />}
            />
          ) : (
            <StatusButton
              onClick={handleMarkPending}
              disabled={buttonStates.statusDisabled}
              isLoading={statusChecks.isCurrentlyUpdatingStatus}
              variant="pending"
              loadingText="Actualizando..."
              text="Marcar como pendiente"
              icon={<ClockIcon />}
            />
          )}
        </div>
      </td>
    </tr>
  );
});

// Memoized icon components to prevent recreation
const LoadingIcon = memo(function LoadingIcon({ text }: { text: string }) {
  return (
    <>
      <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text}
    </>
  );
});

const DeleteIcon = memo(function DeleteIcon() {
  return (
    <>
      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Eliminar
    </>
  );
});

const CheckIcon = memo(function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

const ClockIcon = memo(function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

// Memoized status button component
const StatusButton = memo(function StatusButton({
  onClick,
  disabled,
  isLoading,
  variant,
  loadingText,
  text,
  icon
}: {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  variant: 'paid' | 'pending';
  loadingText: string;
  text: string;
  icon: React.ReactNode;
}) {
  const variantClasses = variant === 'paid'
    ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 focus:ring-green-500"
    : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 focus:ring-yellow-500";

  const loadingVariantClasses = variant === 'paid'
    ? "bg-green-100/50 text-green-400 dark:bg-green-900/10 dark:text-green-300 animate-pulse"
    : "bg-yellow-100/50 text-yellow-400 dark:bg-yellow-900/10 dark:text-yellow-300 animate-pulse";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
        isLoading
          ? loadingVariantClasses
          : disabled
          ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
          : variantClasses
      )}
    >
      {isLoading ? (
        <LoadingIcon text={loadingText} />
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </button>
  );
});