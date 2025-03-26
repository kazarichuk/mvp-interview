// src/lib/firebase/auth.ts
import { auth } from './config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { createUserProfile, updateLastLogin } from './firestore';

export { auth };

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateLastLogin(user.uid);
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await createUserProfile(user.uid, {
      email: user.email!,
      emailVerified: false,
    });

    await sendEmailVerification(user);

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    
    // Получаем информацию о пользователе
    const userCredential = await signInWithPopup(auth, provider);
    const userEmail = userCredential.user.email;

    // Проверяем email до любых других действий
    if (!userEmail) {
      await signOut(auth);
      return { 
        user: null, 
        error: 'Email is required. Please try again.' 
      };
    }

    // Создаем профиль для любого email
    const user = userCredential.user;

    try {
      await createUserProfile(user.uid, {
        email: userEmail,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
      });
      await updateLastLogin(user.uid);
      return { user, error: null };
    } catch (profileError) {
      // Если не удалось создать профиль - выходим
      await signOut(auth);
      return { 
        user: null, 
        error: 'Failed to create user profile. Please try again.' 
      };
    }

  } catch (error: any) {
    // Убеждаемся, что пользователь точно вышел в случае любой ошибки
    try {
      await signOut(auth);
    } catch {}
    return { 
      user: null, 
      error: error.message || 'Authentication failed. Please try again.' 
    };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/login`,
      handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateUserProfile = async (user: User, data: { displayName?: string; photoURL?: string }) => {
  try {
    await updateProfile(user, data);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};