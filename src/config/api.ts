export const API_BASE_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health-check`,
  chat: `${API_BASE_URL}/chat`,
  evaluation: `${API_BASE_URL}/evaluation`,
  startInterview: (sessionId: string) => `${API_BASE_URL}/start-interview/${sessionId}`,
  validateSession: `${API_BASE_URL}/validate-interview-session`,
  results: (sessionId: string) => `${API_BASE_URL}/interview-results/${sessionId}`,
  createInterview: `${API_BASE_URL}/create-interview`,
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
    // API Errors
    serviceUnavailable: 'Interview service is temporarily unavailable. Please try again later.',
    apiUnavailable: 'API services are not available',
    networkError: 'Network error occurred. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    validationError: 'Invalid session data. Please try again.',
    
    // Authentication Errors
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access to this resource is forbidden.',
    invalidToken: 'Your session has expired. Please log in again.',
    
    // Interview Errors
    interviewNotFound: 'Interview session not found.',
    interviewExpired: 'Interview session has expired.',
    interviewAlreadyStarted: 'Interview has already been started.',
    interviewCompleted: 'Interview has already been completed.',
    
    // Validation Errors
    invalidEmail: 'Invalid email address provided.',
    invalidSessionId: 'Invalid session ID provided.',
    missingRequiredFields: 'Required fields are missing.',
    
    // Rate Limiting
    rateLimitExceeded: 'Too many requests. Please try again later.',
    
    // Server Errors
    internalServerError: 'An unexpected error occurred. Please try again later.',
    badGateway: 'Unable to connect to the interview service.',
    gatewayTimeout: 'The interview service is taking too long to respond.',
  }
} as const;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
}; 