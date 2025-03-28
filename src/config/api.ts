export const API_BASE_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health-check`,
  chat: `${API_BASE_URL}/chat`,
  evaluation: `${API_BASE_URL}/evaluation`,
  startInterview: (id: string) => `${API_BASE_URL}/interview/${id}/start`,
  validateSession: `${API_BASE_URL}/validate-interview-session`,
  results: (id: string) => `${API_BASE_URL}/interview/${id}/results`,
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  headers: API_HEADERS,
  timeouts: {
    request: 30000, // 30 seconds
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  },
  limits: {
    maxResponseLength: 4000,
    maxQuestions: 10,
    sessionLifetime: 24 * 60 * 60 * 1000 // 24 hours
  },
  errorMessages: {
    serviceUnavailable: 'Interview service is temporarily unavailable. Please try again later.',
    apiUnavailable: 'API services are not available',
    networkError: 'Network error occurred. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    validationError: 'Invalid session data. Please try again.'
  }
} as const; 