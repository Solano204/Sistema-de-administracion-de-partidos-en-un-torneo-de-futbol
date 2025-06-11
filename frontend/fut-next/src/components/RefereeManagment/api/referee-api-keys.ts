export const refereeKeys = {
    all: ["referees"] as const,
    lists: () => [...refereeKeys.all, "list"] as const,
    list: <T extends object>(filters: T) => [...refereeKeys.lists(), filters] as const,
    details: () => [...refereeKeys.all, "detail"] as const,
    detail: (id: string) => [...refereeKeys.details(), id] as const,
  };