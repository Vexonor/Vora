import type { AccuracyResponse, MetricKey } from "@/types/selling-trend";
import apiClient from "./api-client";

const PATH = "/manager/selling-trends";

export const sellingTrendService = {
  async getAccuracy(params?: {
    metric?: MetricKey;
    from?: string;
    to?: string;
  }): Promise<AccuracyResponse> {
    const query: Record<string, string> = {};
    if (params?.metric) query.metric = params.metric;
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    return apiClient.get(`${PATH}/accuracy`, { params: query });
  },
};
