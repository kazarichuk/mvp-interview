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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryConfig = API_CONFIG.timeouts.retry
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...API_CONFIG.headers,
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retryConfig.maxAttempts - 1) {
        const delay = Math.min(
          retryConfig.initialDelay * Math.pow(2, attempt),
          retryConfig.maxDelay
        );
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

export const interviewService = {
  /**
   * Check if the interview API is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetchWithRetry(
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
    const response = await fetchWithRetry(
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
    const response = await fetchWithRetry(
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
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.results.replace('{id}', interviewId)}`,
        {
          method: 'GET'
        }
      );
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get interview results:', error);
      throw error;
    }
  },

  /**
   * Validate interview session
   */
  async validateSession(sessionId: string, candidateEmail: string): Promise<ValidationResponse> {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.validateSession}`,
        {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId, candidate_email: candidateEmail })
        }
      );
      
      return await response.json();
    } catch (error) {
      console.error('Session validation failed:', error);
      throw error;
    }
  },

  /**
   * Create interview link
   */
  async createInterviewLink(candidateEmail: string, position: string = "UX/UI Designer"): Promise<InterviewLink> {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.createLink}`,
        {
          method: 'POST',
          body: JSON.stringify({ candidate_email: candidateEmail, position })
        }
      );
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create interview link:', error);
      throw error;
    }
  },

  async sendMessage(message: string, sessionId: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`,
        {
          method: 'POST',
          body: JSON.stringify({ message, session_id: sessionId })
        }
      );
      
      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}; 