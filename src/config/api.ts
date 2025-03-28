export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com',
  endpoints: {
    healthCheck: '/health-check',
    chat: '/chat',
    results: (interviewId: string) => `/interview/${interviewId}/results`,
    validateSession: '/validate-interview-session',
    createLink: '/create-interview-link',
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
} as const; 