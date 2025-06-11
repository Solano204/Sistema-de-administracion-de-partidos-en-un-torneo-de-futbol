import { RefereePayment } from "../types/payment-types";

export const paymentKeys = {
    all: ["payments"] as const,
    lists: () => [...paymentKeys.all, "list"] as const,
    list: <T extends object>(filters: T) => [...paymentKeys.lists(), filters] as const,
    details: () => [...paymentKeys.all, "detail"] as const,
    detail: (id: string) => [...paymentKeys.details(), id] as const,
    byReferee: (refereeId: string) => [...paymentKeys.all, "byReferee", refereeId] as const,
    byDateRange: (endDate: string) => [...paymentKeys.all, "byDateRange", endDate] as const,
    
    // Add these more granular keys for better cache management
    listAll: () => [...paymentKeys.lists(), "all"] as const,
    active: () => [...paymentKeys.all, "active"] as const,
    
    // Add a method to get ALL possible query keys related to a payment
    forPayment: (payment: RefereePayment) => [
      paymentKeys.detail(payment.id),
      paymentKeys.byReferee(payment.referee.id),
      paymentKeys.byDateRange(payment.paymentDate),
    ]
  };