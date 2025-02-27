// src/lib/utils/auth-errors.ts
type FirebaseErrorCode = 
  | 'auth/wrong-password'
  | 'auth/user-not-found'
  | 'auth/email-already-in-use'
  | 'auth/invalid-email'
  | 'auth/weak-password'
  | 'auth/network-request-failed'
  | 'auth/popup-closed-by-user'
  | 'auth/cancelled-popup-request'
  | 'auth/requires-recent-login'
  | 'auth/invalid-credential';  // Добавили новый код

const errorMessages: Record<FirebaseErrorCode, string> = {
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/network-request-failed': 'Connection error. Please check your internet.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Only one sign-in window can be open at a time.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.' // Добавили новое сообщение
};

export const getAuthErrorMessage = (error: any): string => {
  if (error?.code && errorMessages[error.code as FirebaseErrorCode]) {
    return errorMessages[error.code as FirebaseErrorCode];
  }
  return 'An unexpected error occurred. Please try again.';
};