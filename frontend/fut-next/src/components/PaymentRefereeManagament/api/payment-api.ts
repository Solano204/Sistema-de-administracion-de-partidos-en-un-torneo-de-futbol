// File: src/app/features/payment/api/payment-api.ts
"use server";

import axios from "axios";
import {
  RefereePayment,
  RefereePaymentInput,
  Money,
  RefereePaymentWithMatchId,
  RefereePaymentInputWithMatch
} from "../types/payment-types";
import { cookies } from "next/headers";

/**
 * Query key factory with improved types
 */


/**
 * API Client configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor for auth tokens
 */

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    // If token exists, add it to the headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access detected");
    }
    return Promise.reject(error);
  }
);

/**
 * Error handling wrapper for API calls
 */
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    // Handle Axios specific errors
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  // Handle other errors
  throw error;
};

/**
 * Create a new referee payment
 */
export const createRefereePayment = async (
  payment: RefereePaymentInput
): Promise<RefereePayment> => {
  try {
    // Transform data for backend
    const backendPayload = {
      ...payment,
      paymentDate: { value: payment.paymentDate },
      hourlyRate: { 
        amount: payment.hourlyRate,
        currency: "USD"
      },
      amount: {
        amount: payment.totalAmount,
        currency: "USD"
      }
    };

    const response = await apiClient.post("/referee-payments", backendPayload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
/**
 * Update or insert a referee payment (upsert operation)
 * If payment exists, updates it; if not, creates new payment
 */
export const updateOrInsertRefereePayment = async (
  payment: RefereePaymentInputWithMatch
): Promise<RefereePayment> => {
  try {
    // Transform data for backend
    const backendPayload = {
      ...payment,
      paymentDate: { value: payment.paymentDate },
      hourlyRate: { 
        amount: payment.hourlyRate,
        currency: "USD"
      },
      amount: {
        amount: payment.totalAmount,
        currency: "USD"
      },
     matchId: payment.matchId
    };

    const response = await apiClient.post("/referee-payments/update-or-insert", backendPayload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};




/**
 * Fetch a specific payment by ID
 */
export const fetchPaymentById = async (paymentId: string): Promise<RefereePayment> => {
  try {
    const response = await apiClient.get(`/referee-payments/${paymentId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};



export const fetchPaymentByIdWithMacth  = async (refereeId: string, matchId: string): Promise<RefereePaymentWithMatchId> => {
  try {
    const response = await apiClient.get(`/referee-payments/payment-by-match-referee/${matchId}/${refereeId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch payments by referee ID
 */
export const fetchPaymentsByReferee = async (
  refereeId: string
): Promise<RefereePayment[]> => {
  try {
    const response = await apiClient.get(`/referee-payments/${refereeId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch payments by date range
 */
export const fetchPaymentsByDateRange = async (
  endDate: string
): Promise<RefereePayment[]> => {
  try {
    const response = await apiClient.get(`/referee-payments/date?paymentDate=${endDate}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing payment
 */
export const updateRefereePayment = async (
  paymentId: string,
  payment: Partial<RefereePaymentInput>
): Promise<RefereePayment> => {
  try {
    const backendPayload = {
      ...payment,
      paymentDate: { value: payment.paymentDate },
      hourlyRate: { 
        amount: payment.hourlyRate,
        currency: "USD"
      },
      amount: {
        amount: payment.totalAmount,
        currency: "USD"
      }
    };

    const response = await apiClient.put(`/referee-payments/${paymentId}`, backendPayload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a payment
 */
export const deleteRefereePayment = async (paymentId: string): Promise<void> => {
  try {
    await apiClient.delete(`/referee-payments/${paymentId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Calculate total amount based on hourly rate and hours worked
 */
export const calculateAmount = async (hourlyRate: number, hoursWorked: number): Promise<Money> => ({
  amount: hourlyRate * hoursWorked,
  currency: "USD"
});