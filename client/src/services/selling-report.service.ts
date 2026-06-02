import type { SellingReport } from "@/types/selling-report";
import apiClient from "./api-client";

const REPORTS_PATH = "/manager/selling-reports";

export const sellingReportService = {
  async getAll(params?: { q?: string; month?: string; year?: string }): Promise<SellingReport[]> {
    const query: Record<string, string> = {};
    if (params?.q) query.q = params.q;
    if (params?.month) query.month = params.month;
    if (params?.year) query.year = params.year;
    return apiClient.get(REPORTS_PATH, { params: query });
  },

  async getById(id: number): Promise<SellingReport> {
    return apiClient.get(`${REPORTS_PATH}/${id}`);
  },

  /**
   * Generate a selling report for a given date (YYYY-MM-DD).
   */
  async generate(date: string): Promise<SellingReport> {
    return apiClient.post(`${REPORTS_PATH}/generate`, { date });
  },

  async remove(id: number): Promise<void> {
    return apiClient.delete(`${REPORTS_PATH}/${id}`);
  },
};
