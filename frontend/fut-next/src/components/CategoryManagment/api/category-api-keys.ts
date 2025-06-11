// category-keys.ts
// Create this file separately without "use server" directive

/**
 * Query key factory with improved types
 */
export const categoryKeys = {
    all: ["categories"] as const,
    lists: () => [...categoryKeys.all, "list"] as const,
    list: (filters: any) => [...categoryKeys.lists(), filters] as const,
    details: () => [...categoryKeys.all, "detail"] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
  };