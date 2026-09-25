import { isAxiosError } from "axios";
import apiClient from "./api-client";
import type { CashPaymentResult, Payment, SnapTransaction } from "@/types/payment";

const PAYMENTS_PATH = "/payments";

export const paymentService = {
  async createSnapTransaction(orderId: number, paymentMethod?: string, returnUrl?: string): Promise<SnapTransaction> {
    return apiClient.post(`${PAYMENTS_PATH}/${orderId}/snap`, { payment_method: paymentMethod, return_url: returnUrl });
  },

  async findByOrderId(orderId: number): Promise<Payment | null> {
    try {
      return await apiClient.get(`${PAYMENTS_PATH}/order/${orderId}`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async verifyCashPayment(orderId: number, paidAmount: number): Promise<CashPaymentResult> {
    return apiClient.post(`${PAYMENTS_PATH}/order/${orderId}/verify-offline`, { paid_amount: paidAmount });
  },
};
