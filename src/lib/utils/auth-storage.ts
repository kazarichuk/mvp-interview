// src/lib/utils/auth-storage.ts
export const AUTH_STORAGE_KEY = 'hireflick_auth';

export interface StoredAuthData {
  email: string;
  rememberMe: boolean;
  lastLogin: Date;
}

export const saveAuthData = (data: Partial<StoredAuthData>) => {
  try {
    const existingData = getStoredAuthData();
    const updatedData = {
      ...existingData,
      ...data,
      lastLogin: new Date()
    };

    if (updatedData.rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

export const getStoredAuthData = (): StoredAuthData | null => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;

    const parsedData = JSON.parse(data);
    return {
      ...parsedData,
      lastLogin: new Date(parsedData.lastLogin)
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};