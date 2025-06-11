
/**
 * Query key factory with improved types
 */
export const credentialKeys = {
    all: ["credentials"] as const,
    lists: () => [...credentialKeys.all, "list"] as const,
    details: (id: string) => [...credentialKeys.all, "detail", id] as const,
    search: (term: string, containing: boolean = false) => 
      [...credentialKeys.all, "search", term, containing.toString()] as const,
  };