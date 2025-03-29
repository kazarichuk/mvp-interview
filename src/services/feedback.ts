import { API_CONFIG, ApiError } from '@/config/api';
import type {
  Feedback,
  FeedbackStats,
  FeedbackInsights,
  CreateFeedbackRequest,
  UpdateFeedbackStatusRequest,
  FeedbackFilters
} from '@/types/feedback';

class FeedbackService {
  private baseUrl = '/api/feedback';

  async getFeedback(filters?: FeedbackFilters): Promise<Feedback[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else if (value) {
            queryParams.append(key, value);
          }
        });
      }

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'GET_FEEDBACK_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      throw error;
    }
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'GET_FEEDBACK_BY_ID_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch feedback by id:', error);
      throw error;
    }
  }

  async createFeedback(feedback: CreateFeedbackRequest): Promise<Feedback> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'CREATE_FEEDBACK_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to create feedback:', error);
      throw error;
    }
  }

  async updateFeedbackStatus(
    id: string,
    update: UpdateFeedbackStatusRequest
  ): Promise<Feedback> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/status`, {
        method: 'PUT',
        headers: API_CONFIG.headers,
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'UPDATE_FEEDBACK_STATUS_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      throw error;
    }
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'GET_FEEDBACK_STATS_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch feedback stats:', error);
      throw error;
    }
  }

  async getFeedbackInsights(): Promise<FeedbackInsights> {
    try {
      const response = await fetch(`${this.baseUrl}/insights`, {
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'GET_FEEDBACK_INSIGHTS_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch feedback insights:', error);
      throw error;
    }
  }

  async addComment(id: string, content: string): Promise<Feedback> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/comments`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'ADD_COMMENT_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  async voteFeedback(id: string, vote: 'up' | 'down'): Promise<Feedback> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/vote`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        throw new ApiError(
          response.status,
          'VOTE_FEEDBACK_FAILED',
          API_CONFIG.errorMessages.serviceUnavailable,
          { status: response.status }
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to vote feedback:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService(); 