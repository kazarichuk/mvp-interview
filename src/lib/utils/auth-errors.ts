export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  // Firebase auth error codes
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-credential':
      return 'Invalid credentials';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with a different sign-in method';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    default:
      return error.message || 'An error occurred during authentication';
  }
}; 