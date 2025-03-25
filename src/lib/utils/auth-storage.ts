interface AuthData {
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  rememberMe?: boolean;
}

export const saveAuthData = (data: AuthData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_data', JSON.stringify(data));
  }
};

export const getStoredAuthData = (): AuthData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('auth_data');
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_data');
  }
}; 