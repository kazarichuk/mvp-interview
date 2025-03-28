import { API_ENDPOINTS, API_HEADERS } from '@/config/api';
import type { ChatRequest, ChatResponse, EvaluationRequest, EvaluationResponse, HealthCheckResponse } from '@/types/api';
import * as Sentry from '@sentry/nextjs';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = new ApiError(response.status, `API request failed: ${response.statusText}`);
    Sentry.captureException(error, {
      tags: {
        status: response.status.toString(),
        url: response.url,
      },
    });
    throw error;
  }
  return response.json();
}

export const api = {
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.health, {
        method: 'GET',
        headers: API_HEADERS,
      });
      return handleResponse<HealthCheckResponse>(response);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          endpoint: 'healthCheck',
        },
      });
      throw error;
    }
  },

  async startInterview(interviewId: string): Promise<{ status: string; interview_id: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.startInterview(interviewId), {
        method: 'POST',
        headers: API_HEADERS,
      });
      return handleResponse(response);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          endpoint: 'startInterview',
          interviewId,
        },
      });
      throw error;
    }
  },

  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(data),
      });
      return handleResponse<ChatResponse>(response);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          endpoint: 'sendMessage',
          interviewId: data.interview_id,
        },
      });
      throw error;
    }
  },

  async getEvaluation(data: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.evaluation, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(data),
      });
      return handleResponse<EvaluationResponse>(response);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          endpoint: 'getEvaluation',
          interviewId: data.interview_id,
        },
      });
      throw error;
    }
  },
}; 