import type { EnumItem } from "@/types/enum";
import apiClient from "./api-client";

const ENUM_PATH = "/enum";

export const enumService = {
  async getUserRoles(): Promise<EnumItem[]> {
    return apiClient.get(`${ENUM_PATH}/user-roles`);
  },

  async getStockStatuses(): Promise<EnumItem[]> {
    return apiClient.get(`${ENUM_PATH}/stock-statuses`);
  },

  async getMenuTypes(): Promise<EnumItem[]> {
    return apiClient.get(`${ENUM_PATH}/menu-types`);
  },

  async getMenuStatuses(): Promise<EnumItem[]> {
    return apiClient.get(`${ENUM_PATH}/menu-statuses`);
  },

  async getOrderStatuses(): Promise<EnumItem[]> {
    return apiClient.get(`${ENUM_PATH}/order-statuses`);
  },

  async getPaymentTypes(): Promise<EnumItem[]> {
    return apiClient.get(`${ENUM_PATH}/payment-types`);
  },
};
