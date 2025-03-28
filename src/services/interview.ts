import { API_CONFIG } from '@/config/api';

export interface InterviewResponse {
  response: string;
  interviewId?: string;
}

export interface InterviewResults {
  technical_skills: number;
  design_methodology: number;
  design_principles: number;
  design_systems: number;
  communication: number;
  problem_solving: number;
  overall_score: number;
  experience_level: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export interface ValidationResponse {
  valid: boolean;
  message?: string;
}

export interface InterviewLink {
  link: string;
  session_id: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include', // Important for CORS
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export const interviewService = {
  /**
   * Check if the interview API is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.healthCheck}`,
        { headers: API_CONFIG.headers }
      );
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  /**
   * Start a new interview session
   */
  async startInterview(): Promise<InterviewResponse> {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ message: 'Start interview' }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start interview');
    }

    const data = await response.json();
    return {
      ...data,
      interviewId: response.headers.get('rndr-id') || undefined,
    };
  },

  /**
   * Send an answer to the current interview question
   */
  async sendAnswer(answer: string): Promise<InterviewResponse> {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ message: answer }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send answer');
    }

    const data = await response.json();
    return {
      ...data,
      interviewId: response.headers.get('rndr-id') || undefined,
    };
  },

  /**
   * Get interview results
   */
  async getResults(interviewId: string): Promise<InterviewResults> {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.results(interviewId)}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Interview session not found');
      }
      throw new Error('Failed to fetch results');
    }

    return response.json();
  },

  /**
   * Validate interview session
   */
  async validateSession(sessionId: string, candidateEmail: string): Promise<ValidationResponse> {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.validateSession}`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({
          session_id: sessionId,
          candidate_email: candidateEmail
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to validate session');
    }

    return response.json();
  },

  /**
   * Create interview link
   */
  async createInterviewLink(candidateEmail: string, position: string = "UX/UI Designer"): Promise<InterviewLink> {
    const formData = new FormData();
    formData.append('candidate_email', candidateEmail);
    formData.append('position', position);

    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.createLink}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create interview link');
    }

    return response.json();
  }
}; 