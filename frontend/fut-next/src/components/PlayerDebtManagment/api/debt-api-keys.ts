export const debtKeys = {
    all: ["debts"] as const,
    byPlayer: (playerId: string) => [...debtKeys.all, "player", playerId] as const,
    detail: (debtId: string) => [...debtKeys.all, "detail", debtId] as const,
    playerSearch: (term: string) => [...debtKeys.all, "player-search", term] as const,
  };