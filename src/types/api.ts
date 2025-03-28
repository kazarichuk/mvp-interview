export interface ChatRequest {
  message: string;
  interview_id: string;
}

export interface ChatResponse {
  response: string;
  interview_id: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface EvaluationRequest {
  interview_id: string;
  messages: Message[];
}

export interface EvaluationResponse {
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
  };
}

export interface HealthCheckResponse {
  status: string;
  model: string;
  knowledge_base: {
    status: string;
    courses_count: number;
  };
  vector_store: {
    status: string;
    documents_count: number;
  };
} 