import apiClient from "./api-client";
import type { CashPaymentResult, Payment } from "@/types/payment";

const PAYMENTS_PATH = "/payments";

export const paymentService = {
  async createSnap(orderId: number, paymentMethod?: string, returnUrl?: string): Promise<{ token: string; redirect_url: string }> {
    return apiClient.post(`${PAYMENTS_PATH}/${orderId}/snap`, { payment_method: paymentMethod, return_url: returnUrl });
  },

  async getByOrderId(orderId: number): Promise<Payment> {
    return apiClient.get(`${PAYMENTS_PATH}/order/${orderId}`);
  },

  async verifyOffline(orderId: number, paidAmount: number): Promise<CashPaymentResult> {
    return apiClient.post(`${PAYMENTS_PATH}/order/${orderId}/verify-offline`, { paid_amount: paidAmount });
  },
};
