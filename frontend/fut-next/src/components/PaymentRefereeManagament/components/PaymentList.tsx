// File: src/app/features/payment/components/PaymentList.tsx
import { memo, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { RefereePayment } from '../types/payment-types';
import { formatDate, formatCurrency } from '../utils/payment-validation';

type PaymentListProps = {
  payments: RefereePayment[];
  onEdit: (payment: RefereePayment) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deletingId: string | undefined;
};

// Memoized header component to prevent unnecessary re-renders
const TableHeader = memo(function TableHeader() {
  return (
    <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Arbitro
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
Fecha de Pago
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Horas Trabajadas
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Tarifa por Hora
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Monto Total
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
            <p className="text-lg font-medium">No se encontraron registros de pago</p>
          <p className="mt-1 text-sm">Agrega un nuevo pago para comenzar</p>
        </div>
      </td>
    </tr>
  );
});

// Memoized list header component
const ListHeader = memo(function ListHeader({ count }: { count: number }) {
  return (
    <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Registros de Pago
        </h2>
      </div>
      <div className={clsx(
        "px-3 py-1 rounded-full text-sm font-medium",
        "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      )}>
            {count} {count === 1 ? "registro" : "registros"}
      </div>
    </div>
  );
});

export const PaymentList = memo(function PaymentList({
  payments,
  onEdit,
  onDelete,
  isDeleting,
  deletingId
}: PaymentListProps) {
  // Memoize the payment count to prevent unnecessary re-renders
  const paymentCount = useMemo(() => payments.length, [payments.length]);

  // Memoize the has payments check
  const hasPayments = useMemo(() => payments.length > 0, [payments.length]);

  return (
    <div className="mt-40 rounded-xl -z-10  transition-all duration-300 bg-white/95 dark:bg-gray-900/95 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <ListHeader count={paymentCount} />
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
            {hasPayments ? (
              payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                  isDeletingThis={deletingId === payment.id}
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

type PaymentRowProps = {
  payment: RefereePayment;
  onEdit: (payment: RefereePayment) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isDeletingThis: boolean;
};

// Individual row component with optimized formatting and event handlers
const PaymentRow = memo(function PaymentRow({
  payment,
  onEdit,
  onDelete,
  isDeleting,
  isDeletingThis
}: PaymentRowProps) {
  // Memoize formatted values to prevent recalculation on every render
  const formattedValues = useMemo(() => ({
    date: formatDate(payment.paymentDate),
    hourlyRate: formatCurrency(payment.hourlyRate),
    totalAmount: formatCurrency(payment.totalAmount),
    initials: payment.referee.fullName.charAt(0).toUpperCase()
  }), [payment.paymentDate, payment.hourlyRate, payment.totalAmount, payment.referee.fullName]);

  // Memoize event handlers to prevent function recreation
  const handleEdit = useCallback(() => {
    onEdit(payment);
  }, [onEdit, payment]);

  const handleDelete = useCallback(() => {
    onDelete(payment.id);
  }, [onDelete, payment.id]);

  // Memoize button states
  const buttonStates = useMemo(() => ({
    editDisabled: isDeleting,
    deleteDisabled: isDeleting,
    editClasses: clsx(
      "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
      isDeleting 
        ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed" 
        : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:ring-blue-500"
    ),
    deleteClasses: clsx(
      "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
      isDeletingThis 
        ? "bg-red-100/50 text-red-400 dark:bg-red-900/10 dark:text-red-300 animate-pulse" 
        : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500"
    )
  }), [isDeleting, isDeletingThis]);

  return (
    <tr className="transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center mr-3 font-medium">
            {formattedValues.initials}
          </div>
          <div className="font-medium">
            {payment.referee.fullName}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedValues.date}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        )}>
          {payment.hoursWorked} hrs
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formattedValues.hourlyRate}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={clsx(
          "font-bold",
          "text-emerald-600 dark:text-emerald-400"
        )}>
          {formattedValues.totalAmount}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            disabled={buttonStates.editDisabled}
            className={buttonStates.editClasses}
            aria-label={`Edit payment for ${payment.referee.fullName}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          
          <button
            onClick={handleDelete}
            disabled={buttonStates.deleteDisabled}
            className={buttonStates.deleteClasses}
            aria-label={`Delete payment for ${payment.referee.fullName}`}
          >
            {isDeletingThis ? (
              <DeletingState />
            ) : (
              <DeleteState />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

// Memoized button states to prevent unnecessary re-renders
const DeletingState = memo(function DeletingState() {
  return (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Deleting...
    </>
  );
});

const DeleteState = memo(function DeleteState() {
  return (
    <>
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete
    </>
  );
});