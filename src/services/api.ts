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

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export const api = {
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetchWithRetry(API_ENDPOINTS.health, {
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
      throw new Error('API services are not available');
    }
  },

  async startInterview(interviewId: string): Promise<{ status: string; interview_id: string }> {
    try {
      const response = await fetchWithRetry(API_ENDPOINTS.startInterview(interviewId), {
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
      throw new Error('Failed to start interview. Please try again later.');
    }
  },

  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetchWithRetry(API_ENDPOINTS.chat, {
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
      throw new Error('Failed to send message. Please try again later.');
    }
  },

  async getEvaluation(data: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const response = await fetchWithRetry(API_ENDPOINTS.evaluation, {
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
      throw new Error('Failed to get evaluation. Please try again later.');
    }
  },
}; 