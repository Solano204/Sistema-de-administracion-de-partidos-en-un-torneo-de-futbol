
// Query key factory with improved typing
export const teamKeys = {
    all: ["teams"] as const,
    lists: () => [...teamKeys.all, "list"] as const,
    list: <T extends object>(filters: T) =>
      [...teamKeys.lists(), filters] as const,
    details: () => [...teamKeys.all, "detail"] as const,
    detail: (id: string) => [...teamKeys.details(), id] as const,
    byCategory: (categoryId: string) =>
      [...teamKeys.all, "byCategory", categoryId] as const,
    byCategoryWithPlayers: (categoryId: string, teamId: string) =>
      [...teamKeys.all, "byCategoryWithPlayers", categoryId, teamId] as const,
    byPosition: (categoryId: string) =>
      [...teamKeys.all, "byPosition", categoryId] as const,
  };
  