// src/types/auth.ts
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface ResetPasswordResponse {
  error: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLogin: Date | Timestamp;
  company?: string;
  role?: string;
  teamSize?: string;
  bio?: string;
  provider?: 'google.com' | 'password';
  notifications?: {
    email?: boolean;
    newCandidates?: boolean;
    results?: boolean;
    marketing?: boolean;
  };
  privacy?: {
    dataCollection?: boolean;
    shareResults?: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResponse>;
}

// Form States
export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormState {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormState {
  email: string;
}