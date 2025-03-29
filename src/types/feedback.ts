export type FeedbackCategory = 
  | 'interview_questions'
  | 'course_content'
  | 'technical_accuracy'
  | 'user_experience'
  | 'other';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackStatus = 
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'implemented';

export type FeedbackType = 
  | 'improvement'
  | 'bug'
  | 'feature_request'
  | 'content_update'
  | 'other';

export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  type: FeedbackType;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  interview_id?: string;
  course_id?: string;
  tags: string[];
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
  comments: FeedbackComment[];
  votes: {
    up: number;
    down: number;
  };
}

export interface FeedbackComment {
  id: string;
  content: string;
  created_at: string;
  created_by: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface FeedbackStats {
  total: number;
  by_category: Record<FeedbackCategory, number>;
  by_status: Record<FeedbackStatus, number>;
  by_priority: Record<FeedbackPriority, number>;
  recent_activity: {
    date: string;
    count: number;
  }[];
}

export interface FeedbackInsights {
  top_categories: {
    category: FeedbackCategory;
    count: number;
    percentage: number;
  }[];
  priority_distribution: {
    priority: FeedbackPriority;
    count: number;
    percentage: number;
  }[];
  recent_improvements: {
    date: string;
    count: number;
    categories: FeedbackCategory[];
  }[];
  user_engagement: {
    date: string;
    active_users: number;
    feedback_count: number;
  }[];
}

export interface CreateFeedbackRequest {
  title: string;
  description: string;
  category: FeedbackCategory;
  type: FeedbackType;
  priority: FeedbackPriority;
  interview_id?: string;
  course_id?: string;
  tags?: string[];
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
  comment?: string;
}

export interface FeedbackFilters {
  category?: FeedbackCategory[];
  type?: FeedbackType[];
  priority?: FeedbackPriority[];
  status?: FeedbackStatus[];
  search?: string;
  date_from?: string;
  date_to?: string;
  created_by?: string;
  interview_id?: string;
  course_id?: string;
  tags?: string[];
} 