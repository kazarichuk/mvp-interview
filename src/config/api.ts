export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com',
  endpoints: {
    chat: '/chat',
    results: '/interview/{id}/results',
    validateSession: '/validate-interview-session',
    createLink: '/create-interview-link',
    healthCheck: '/health-check'
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
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
  }
} as const; 