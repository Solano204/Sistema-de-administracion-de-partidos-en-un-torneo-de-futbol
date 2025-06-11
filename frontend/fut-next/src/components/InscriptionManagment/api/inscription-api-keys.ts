
/**
 * Query key factory with improved types
 */
export const inscriptionKeys = {
    all: ["inscriptions"] as const,
    lists: () => [...inscriptionKeys.all, "list"] as const,
    details: (id: string) => [...inscriptionKeys.all, "detail", id] as const,
    search: (term: string, containing: boolean = false) => 
      [...inscriptionKeys.all, "search", term, containing.toString()] as const,
    recent: () => [...inscriptionKeys.all, "recent"] as const,
    // paginated: (page: number, size: number, sortBy: string) => 
    //   [...inscriptionKeys.all, "paginated", page.toString(), size.toString(), sortBy] as const,
  };