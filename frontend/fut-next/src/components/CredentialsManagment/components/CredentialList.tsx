import { memo } from 'react';
import clsx from 'clsx';
import { CredentialInfoRecord } from '../types/credential-types';
import { formatCurrency } from '../utils/credential-validation';

type CredentialListProps = {
  credentials: CredentialInfoRecord[];
  onEdit: (credential: CredentialInfoRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deletingId: string | undefined;
};

export const CredentialList = memo(function CredentialList({
  credentials,
  onEdit,
  onDelete,
  isDeleting,
  deletingId
}: CredentialListProps) {
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 bg-white/95 dark:bg-gray-900/95 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Lista de credenciales
          </h2>
        </div>
        <div className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        )}>
          {credentials.length}{" "}{credentials.length === 1 ? "record" : "records"}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre del jugador
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
            {credentials.length > 0 ? (
              credentials.map((credential) => (
                <CredentialRow
                  key={credential.id}
                  credential={credential}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                  isDeletingThis={deletingId === credential.id}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-lg font-medium">No se encontraron credenciales</p>
                    <p className="mt-1 text-sm">Agrega una nueva credencial para comenzar</p>
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

type CredentialRowProps = {
  credential: CredentialInfoRecord;
  onEdit: (credential: CredentialInfoRecord) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isDeletingThis: boolean;
};

const CredentialRow = memo(function CredentialRow({
  credential,
  onEdit,
  onDelete,
  isDeleting,
  isDeletingThis
}: CredentialRowProps) {
  return (
    <tr className="transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium">{credential.playerName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={clsx(
          "font-bold",
          "text-emerald-600 dark:text-emerald-400"
        )}>
          {formatCurrency(credential.amount)}
        </div>
      </td>
      <td className="px-6 py-4 max-w-xs truncate">
        <div className="text-gray-600 dark:text-gray-400">
          {credential.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(credential)}
            disabled={isDeleting}
            className={clsx(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
              isDeleting 
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
            onClick={() => onDelete(credential.id)}
            disabled={isDeleting}
            className={clsx(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center",
              isDeletingThis 
                ? "bg-red-100/50 text-red-400 dark:bg-red-900/10 dark:text-red-300 animate-pulse" 
                : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500"
            )}
          >
            {isDeletingThis ? (
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