export interface CandidateData {
  name: string;
  email: string;
  inviteLink?: string;
  cvUrl?: string;
  cvFilename?: string;
  status?: string;
  level?: string;
}

export interface Candidate extends CandidateData {
  id: string;
  cv?: {
    url: string;
    filename: string;
  } | null;
} 