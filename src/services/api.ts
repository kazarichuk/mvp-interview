import { API_ENDPOINTS, API_HEADERS } from '@/config/api';
import type { ChatRequest, ChatResponse, EvaluationRequest, EvaluationResponse, HealthCheckResponse } from '@/types/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, `API request failed: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(API_ENDPOINTS.health, {
      method: 'GET',
      headers: API_HEADERS,
    });
    return handleResponse<HealthCheckResponse>(response);
  },

  async startInterview(interviewId: string): Promise<{ status: string; interview_id: string }> {
    const response = await fetch(API_ENDPOINTS.startInterview(interviewId), {
      method: 'POST',
      headers: API_HEADERS,
    });
    return handleResponse(response);
  },

  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(API_ENDPOINTS.chat, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(data),
    });
    return handleResponse<ChatResponse>(response);
  },

  async getEvaluation(data: EvaluationRequest): Promise<EvaluationResponse> {
    const response = await fetch(API_ENDPOINTS.evaluation, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(data),
    });
    return handleResponse<EvaluationResponse>(response);
  },
}; 