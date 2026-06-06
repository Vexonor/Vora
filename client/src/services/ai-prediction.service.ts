import type { PredictionResult } from "@/types/ai-prediction"
import apiClient from "./api-client"

const AI_PATH = "/manager/ai"

export const aiPredictionService = {
  async predict(days = 30): Promise<PredictionResult> {
    return apiClient.get(`${AI_PATH}/prediction`, { params: { days: String(days) } })
  },
}
