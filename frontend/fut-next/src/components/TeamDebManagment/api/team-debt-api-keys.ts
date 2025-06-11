export const teamDebtKeys = {
    all: ["team-debts"] as const,
    byTeam: (teamId: string) => [...teamDebtKeys.all, "team", teamId] as const,
    detail: (debtId: string) => [...teamDebtKeys.all, "detail", debtId] as const,
    searchResults: (teamName: string) => [...teamDebtKeys.all, "search", teamName] as const,
  };
