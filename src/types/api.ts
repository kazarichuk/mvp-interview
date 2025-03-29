// Common types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Chat types
export interface ChatRequest {
  message: string;
  session_id: string;
  interview_id: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    interview_id: string;
    session_id: string;
    timestamp: string;
    message_id: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  message_id: string;
}

// Interview types
export interface CreateInterviewRequest {
  candidate_email: string;
  position: string;
  interview_type: 'technical' | 'behavioral' | 'mixed';
  duration_minutes: number;
}

export interface CreateInterviewResponse {
  success: boolean;
  data: {
    interview_id: string;
    session_id: string;
    created_at: string;
    expires_at: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface StartInterviewRequest {
  session_id: string;
  interview_id: string;
}

export interface StartInterviewResponse {
  success: boolean;
  data: {
    status: 'started' | 'already_started' | 'completed' | 'expired';
    interview_id: string;
    session_id: string;
    started_at: string;
    first_question: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Evaluation types
export interface EvaluationRequest {
  interview_id: string;
  session_id: string;
  messages: Message[];
}

export interface EvaluationResponse {
  success: boolean;
  data: {
    report: string;
    evaluation: {
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
      feedback: string;
      recommendations: string[];
    };
    generated_at: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Results types
export interface InterviewResults {
  success: boolean;
  data: {
    interview_id: string;
    session_id: string;
    status: 'completed' | 'in_progress' | 'expired';
    started_at: string;
    completed_at?: string;
    duration_minutes: number;
    evaluation: {
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
      feedback: string;
      recommendations: string[];
    };
    messages: Message[];
    report: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Health check types
export interface HealthCheckResponse {
  success: boolean;
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
      api: {
        status: 'up' | 'down';
        latency_ms: number;
      };
      database: {
        status: 'up' | 'down';
        latency_ms: number;
      };
      cache: {
        status: 'up' | 'down';
        latency_ms: number;
      };
      ai_model: {
        status: 'up' | 'down';
        model: string;
        latency_ms: number;
      };
    };
    version: string;
    environment: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Session validation types
export interface ValidateSessionRequest {
  session_id: string;
  interview_id: string;
}

export interface ValidateSessionResponse {
  success: boolean;
  data: {
    valid: boolean;
    status: 'active' | 'expired' | 'completed' | 'invalid';
    interview_id: string;
    session_id: string;
    created_at: string;
    expires_at: string;
    completed_at?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Streaming types
export interface StreamingChatResponse {
  success: boolean;
  data: {
    chunk: string;
    is_complete: boolean;
    interview_id: string;
    session_id: string;
    timestamp: string;
    message_id: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface StreamingEvaluationResponse {
  success: boolean;
  data: {
    chunk: string;
    is_complete: boolean;
    interview_id: string;
    session_id: string;
    timestamp: string;
    progress: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
} 