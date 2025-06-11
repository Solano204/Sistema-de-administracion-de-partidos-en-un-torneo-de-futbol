import { UserRole } from "../types/types-user";

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: <T extends object>(filters: T) => [...userKeys.lists(), filters] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    byRole: (role: UserRole) => [...userKeys.all, "byRole", role] as const,
  };
  