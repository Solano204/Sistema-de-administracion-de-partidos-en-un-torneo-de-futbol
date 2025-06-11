import { memo, useMemo, useCallback } from "react";
import Image from "next/image";
import { UserDetailsRecordFull } from "../";
import { getStatusClass } from "../";

// Types
interface UserTableProps {
  users: UserDetailsRecordFull[];
  onEdit: (user: UserDetailsRecordFull) => void;
  onUpdatePhoto: (user: UserDetailsRecordFull) => void;
  onChangePassword: (user: UserDetailsRecordFull) => void;
  onChangeUsername: (user: UserDetailsRecordFull) => void;
  onDelete: (userId: string) => void;
  isDeleting?: boolean;
  deletingId?: string;
}

interface UserRowProps {
  user: UserDetailsRecordFull;
  isCurrentlyDeleting: boolean;
  onEdit: (user: UserDetailsRecordFull) => void;
  onUpdatePhoto: (user: UserDetailsRecordFull) => void;
  onChangePassword: (user: UserDetailsRecordFull) => void;
  onChangeUsername: (user: UserDetailsRecordFull) => void;
  onDelete: (userId: string) => void;
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  variant: 'edit' | 'photo' | 'password' | 'username' | 'delete';
  isLoading?: boolean;
  title: string;
  children: React.ReactNode;
}

// Constants
const TABLE_COLUMNS = [
  { key: 'Foto', label: 'Profile', width: 'w-20' },
  { key: 'Nombre', label: 'Name', width: 'w-48' },
  { key: 'username', label: 'Username', width: 'w-32' },
  { key: 'edad', label: 'Age', width: 'w-20' },
  { key: 'estado', label: 'Status', width: 'w-24' },
  { key: 'acciones', label: 'Actions', width: 'w-80' },
] as const;

const ICONS = {
  users: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  ),
  edit: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  ),
  photo: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  password: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  ),
  username: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
  emptyUsers: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  )
} as const;

const ACTION_VARIANTS = {
  edit: {
    base: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 focus:ring-indigo-500",
    disabled: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
  },
  photo: {
    base: "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 focus:ring-purple-500",
    disabled: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
  },
  password: {
    base: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:ring-blue-500",
    disabled: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
  },
  username: {
    base: "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 focus:ring-green-500",
    disabled: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
  },
  delete: {
    base: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500",
    disabled: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed",
    loading: "bg-red-100/50 text-red-400 dark:bg-red-900/10 dark:text-red-300 animate-pulse"
  }
} as const;

// Utility functions
const formatUserDisplayName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

const generateInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Memoized Components
const UserAvatar = memo(function UserAvatar({
  user,
  size = 40
}: {
  user: UserDetailsRecordFull;
  size?: number;
}) {
  const initials = useMemo(() => generateInitials(user.firstName, user.lastName), [user.firstName, user.lastName]);
  const displayName = useMemo(() => formatUserDisplayName(user.firstName, user.lastName), [user.firstName, user.lastName]);

  if (user.urlPhoto) {
    return (
      <div className={`relative flex-shrink-0 h-${size/4} w-${size/4}`}>
        <Image
          fill
          className={`h-${size/4} w-${size/4} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 transition-all duration-200`}
          src={user.urlPhoto}
          alt={`${displayName}'s profile picture`}
          sizes="40px"
          priority={false}
        />
      </div>
    );
  }

  return (
    <div 
      className={`h-${size/4} w-${size/4} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-medium shadow-md transition-all duration-200 hover:shadow-lg`}
      title={`${displayName}'s avatar`}
    >
      <span className="text-sm font-semibold">{initials}</span>
    </div>
  );
});

const ActionButton = memo(function ActionButton({
  onClick,
  disabled,
  variant,
  isLoading = false,
  title,
  children
}: ActionButtonProps) {
  const buttonClasses = useMemo(() => {
    const baseClasses = "p-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 active:scale-95";
    const variantConfig = ACTION_VARIANTS[variant];
    
    if (disabled) {
      if (disabled) {
        if (variant === 'delete' && isLoading) {
          return `${baseClasses} ${(variantConfig as typeof ACTION_VARIANTS.delete).loading}`;
        }
        return `${baseClasses} ${variantConfig.disabled}`;
      }
    }
    
    return `${baseClasses} ${variantConfig.base}`;
  }, [disabled, variant, isLoading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
});

const TableHeader = memo(function TableHeader({ userCount }: { userCount: number }) {
  return (
    <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {ICONS.users}
        </svg>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Lista de usuarios
        </h2>
      </div>
      <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        {userCount} {userCount === 1 ? "user" : "users"}
      </div>
    </div>
  );
});

const TableHeaderRow = memo(function TableHeaderRow() {
  return (
    <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
      <tr>
        {TABLE_COLUMNS.map(column => (
          <th 
            key={column.key}
            className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.width}`}
            scope="col"
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
});

const EmptyTableRow = memo(function EmptyTableRow() {
  return (
    <tr>
      <td colSpan={TABLE_COLUMNS.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.emptyUsers}
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No user records found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add a new user to get started</p>
        </div>
      </td>
    </tr>
  );
});

const UserRow = memo(function UserRow({
  user,
  isCurrentlyDeleting,
  onEdit,
  onUpdatePhoto,
  onChangePassword,
  onChangeUsername,
  onDelete
}: UserRowProps) {
  // Memoized handlers
  const handleEdit = useCallback(() => onEdit(user), [onEdit, user]);
  const handleUpdatePhoto = useCallback(() => onUpdatePhoto(user), [onUpdatePhoto, user]);
  const handleChangePassword = useCallback(() => onChangePassword(user), [onChangePassword, user]);
  const handleChangeUsername = useCallback(() => onChangeUsername(user), [onChangeUsername, user]);
  const handleDelete = useCallback(() => onDelete(user.id), [onDelete, user.id]);

  // Memoized computed values
  const displayName = useMemo(() => formatUserDisplayName(user.firstName, user.lastName), [user.firstName, user.lastName]);
  const statusClasses = useMemo(() => getStatusClass(user.status), [user.status]);

  return (
    <tr 
      className="transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300"
      role="row"
    >
      {/* Profile Picture */}
      <td className="px-6 py-4 whitespace-nowrap">
        <UserAvatar user={user} />
      </td>

      {/* Name and Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900 dark:text-gray-100" title={displayName}>
          {displayName}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs" title={user.email}>
          {user.email}
        </div>
      </td>

      {/* Username */}
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-gray-500 dark:text-gray-400 font-mono text-sm bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded-md inline-block">
          {user.user}
        </code>
      </td>

      {/* Age */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-500 dark:text-gray-400 font-medium">
          {user.age}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
          {user.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2" role="group" aria-label={`Actions for ${displayName}`}>
          <ActionButton
            onClick={handleEdit}
            disabled={isCurrentlyDeleting}
            variant="edit"
            title={`Edit ${displayName}`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {ICONS.edit}
            </svg>
          </ActionButton>

          <ActionButton
            onClick={handleUpdatePhoto}
            disabled={isCurrentlyDeleting}
            variant="photo"
            title={`Update ${displayName}'s photo`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {ICONS.photo}
            </svg>
          </ActionButton>

          <ActionButton
            onClick={handleChangePassword}
            disabled={isCurrentlyDeleting}
            variant="password"
            title={`Change ${displayName}'s password`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {ICONS.password}
            </svg>
          </ActionButton>

          <ActionButton
            onClick={handleChangeUsername}
            disabled={isCurrentlyDeleting}
            variant="username"
            title={`Change ${displayName}'s username`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {ICONS.username}
            </svg>
          </ActionButton>

          <ActionButton
            onClick={handleDelete}
            disabled={isCurrentlyDeleting}
            variant="delete"
            isLoading={isCurrentlyDeleting}
            title={`Delete ${displayName}`}
          >
            {isCurrentlyDeleting ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS.spinner}
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {ICONS.delete}
              </svg>
            )}
          </ActionButton>
        </div>
      </td>
    </tr>
  );
});

// Main Component
export const UserTable = memo(function UserTable({
  users,
  onEdit,
  onUpdatePhoto,
  onChangePassword,
  onChangeUsername,
  onDelete,
  isDeleting = false,
  deletingId = ""
}: UserTableProps) {
  // Memoized computed values
  const userCount = useMemo(() => users.length, [users.length]);
  const hasUsers = useMemo(() => userCount > 0, [userCount]);

  // Memoized rendered rows
  const renderedRows = useMemo(() => {
    if (!hasUsers) {
      return <EmptyTableRow />;
    }

    return users.map((user) => (
      <UserRow
        key={user.id}
        user={user}
        isCurrentlyDeleting={isDeleting && deletingId === user.id}
        onEdit={onEdit}
        onUpdatePhoto={onUpdatePhoto}
        onChangePassword={onChangePassword}
        onChangeUsername={onChangeUsername}
        onDelete={onDelete}
      />
    ));
  }, [users, hasUsers, isDeleting, deletingId, onEdit, onUpdatePhoto, onChangePassword, onChangeUsername, onDelete]);

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 bg-white/95 dark:bg-gray-900/95 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <TableHeader userCount={userCount} />
      
      <div className="overflow-x-auto">
        <table className="min-w-full" role="table" aria-label="User management table">
          <TableHeaderRow />
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
            {renderedRows}
          </tbody>
        </table>
      </div>
    </div>
  );
});