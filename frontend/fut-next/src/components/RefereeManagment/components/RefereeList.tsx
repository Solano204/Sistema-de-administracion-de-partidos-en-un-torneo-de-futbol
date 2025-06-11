// File: src/app/features/referee/components/RefereeList.tsx
import { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { UserDetailsRecordFull, UserStatus, UserRole } from '../types/referee-types';

type RefereeListProps = {
  referees: UserDetailsRecordFull[];
  onEdit: (referee: UserDetailsRecordFull) => void;
  onUpdatePhoto: (referee: UserDetailsRecordFull) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: UserStatus) => void;
  isDeleting: boolean;
  deletingId: string;
  isChangingStatus: boolean;
  statusUpdatingId: string | undefined;
};

// Move styling functions outside component to prevent recreation
const getRoleClass = (role: UserRole): string => {
  const roleClasses = {
    [UserRole.ADMINISTRADOR]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    [UserRole.ARBITRO]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    [UserRole.JUGADOR]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  };
  return roleClasses[role] || "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
};

const getStatusClass = (status: UserStatus): string => {
  const statusClasses = {
    [UserStatus.ACTIVO]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    [UserStatus.INACTIVO]: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
    [UserStatus.SUSPENDIDO]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    [UserStatus.PENDIENTE]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
};

const getToggleStatusConfig = (status: UserStatus) => {
  const isActive = status === UserStatus.ACTIVO;
  return {
    text: isActive ? "Deactivate" : "Activate",
    class: isActive 
      ? "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-800/50" 
      : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30",
    value: isActive ? UserStatus.INACTIVO : UserStatus.ACTIVO
  };
};

// Memoized table header component
const TableHeader = memo(function TableHeader() {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Nombre 
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Edad
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Role
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
});

// Memoized list header component
const ListHeader = memo(function ListHeader({ count }: { count: number }) {
  return (
    <h2 className="text-xl font-semibold p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      Referees List ({count} {count === 1 ? "referee" : "referees"})
    </h2>
  );
});

// Memoized profile image component
const ProfileImage = memo(function ProfileImage({ 
  src, 
  alt, 
  firstName, 
  lastName 
}: {
  src?: string;
  alt: string;
  firstName: string;
  lastName: string;
}) {
  if (!src) {
    // Show initials if no photo
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return (
      <div className="flex-shrink-0 h-10 w-10 mr-3 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-700">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{initials}</span>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0 h-10 w-10 mr-3">
      <Image
        fill
        className="rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 shadow-sm"
        src={src}
        alt={alt}
        loading="lazy"
        sizes="40px"
      />
    </div>
  );
});

// Memoized action button component
const ActionButton = memo(function ActionButton({
  onClick,
  disabled = false,
  variant = 'default',
  children,
  loading = false,
  loadingText = "Loading..."
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'edit' | 'photo' | 'delete' | 'status' | 'default';
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}) {
  const variantClasses = {
    edit: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30",
    photo: "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30",
    delete: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    status: "", // Dynamic based on status
    default: "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-800/50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200",
        disabled || loading
          ? "bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500 cursor-not-allowed"
          : variant !== 'status' ? variantClasses[variant] : ""
      )}
    >
      {loading ? loadingText : children}
    </button>
  );
});

export const RefereeList = memo(function RefereeList({
  referees,
  onEdit,
  onUpdatePhoto,
  onDelete,
  onUpdateStatus,
  isDeleting,
  deletingId,
  isChangingStatus,
  statusUpdatingId
}: RefereeListProps) {
  // Memoized referee count
  const refereeCount = useMemo(() => referees.length, [referees.length]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <ListHeader count={refereeCount} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {referees.map((referee) => (
              <RefereeRow
                key={referee.id}
                referee={referee}
                onEdit={onEdit}
                onUpdatePhoto={onUpdatePhoto}
                onDelete={onDelete}
                onUpdateStatus={onUpdateStatus}
                isDeleting={isDeleting}
                deletingId={deletingId}
                isChangingStatus={isChangingStatus}
                statusUpdatingId={statusUpdatingId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

type RefereeRowProps = {
  referee: UserDetailsRecordFull;
  onEdit: (referee: UserDetailsRecordFull) => void;
  onUpdatePhoto: (referee: UserDetailsRecordFull) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: UserStatus) => void;
  isDeleting: boolean;
  deletingId: string;
  isChangingStatus: boolean;
  statusUpdatingId: string | undefined;
};

// Individual row component with optimized rendering
const RefereeRow = memo(function RefereeRow({
  referee,
  onEdit,
  onUpdatePhoto,
  onDelete,
  onUpdateStatus,
  isDeleting,
  deletingId,
  isChangingStatus,
  statusUpdatingId
}: RefereeRowProps) {
  // Memoized status checks
  const statusChecks = useMemo(() => ({
    isCurrentlyDeleting: isDeleting && deletingId === referee.id,
    isCurrentlyUpdatingStatus: isChangingStatus && statusUpdatingId === referee.id,
  }), [isDeleting, deletingId, referee.id, isChangingStatus, statusUpdatingId]);

  // Memoized style classes
  const styleClasses = useMemo(() => ({
    role: getRoleClass(referee.role),
    status: getStatusClass(referee.status),
  }), [referee.role, referee.status]);

  // Memoized status toggle configuration
  const statusToggleConfig = useMemo(() => 
    getToggleStatusConfig(referee.status), 
    [referee.status]
  );

  // Memoized action states
  const actionStates = useMemo(() => {
    const { isCurrentlyDeleting, isCurrentlyUpdatingStatus } = statusChecks;
    const isAnyActionInProgress = isCurrentlyDeleting || isCurrentlyUpdatingStatus;
    
    return {
      disabled: isAnyActionInProgress,
      deleteLoading: isCurrentlyDeleting,
      statusLoading: isCurrentlyUpdatingStatus
    };
  }, [statusChecks]);

  // Memoized event handlers
  const handleEdit = useCallback(() => {
    onEdit(referee);
  }, [onEdit, referee]);

  const handleUpdatePhoto = useCallback(() => {
    onUpdatePhoto(referee);
  }, [onUpdatePhoto, referee]);

  const handleDelete = useCallback(() => {
    onDelete(referee.id);
  }, [onDelete, referee.id]);

  const handleUpdateStatus = useCallback(() => {
    onUpdateStatus(referee.id, statusToggleConfig.value);
  }, [onUpdateStatus, referee.id, statusToggleConfig.value]);

  // Memoized full name
  const fullName = useMemo(() => 
    `${referee.firstName} ${referee.lastName}`, 
    [referee.firstName, referee.lastName]
  );

  return (
    <tr className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200/70 dark:border-gray-700/70">
        <div className="flex items-center">
          <ProfileImage
            src={referee.urlPhoto ?? undefined}
            alt={fullName}
            firstName={referee.firstName}
            lastName={referee.lastName}
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {fullName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{referee.email}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200/70 dark:border-gray-700/70 text-gray-800 dark:text-gray-300">
        {referee.age}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200/70 dark:border-gray-700/70">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${styleClasses.role}`}>
          {referee.role}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200/70 dark:border-gray-700/70">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${styleClasses.status}`}>
          {referee.status}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200/70 dark:border-gray-700/70">
        <div className="flex space-x-2">
          <ActionButton
            onClick={handleEdit}
            disabled={actionStates.disabled}
            variant="edit"
          >
            Editar
          </ActionButton>
          
          <ActionButton
            onClick={handleUpdatePhoto}
            disabled={actionStates.disabled}
            variant="photo"
          >
            Modificar Foto
          </ActionButton>
          
          <ActionButton
            onClick={handleDelete}
            disabled={actionStates.disabled}
            variant="delete"
            loading={actionStates.deleteLoading}
            loadingText="Deleting..."
          >
            Eliminar
          </ActionButton>
          
          <button
            onClick={handleUpdateStatus}
            disabled={actionStates.disabled}
            className={clsx(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200",
              actionStates.disabled
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500 cursor-not-allowed"
                : statusToggleConfig.class
            )}
          >
            {actionStates.statusLoading ? "Updating..." : statusToggleConfig.text}
          </button>
        </div>
      </td>
    </tr>
  );
});