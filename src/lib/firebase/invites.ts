import { db } from './config';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import type { Invite, InviteCandidate } from '@/types/invites';

// Создание нового приглашения
export const createInvite = async (userId: string, position: string, maxCandidates?: number) => {
  try {
    // Генерируем уникальный код для приглашения
    // Используем короткий UUID (первые 8 символов) для удобства в URL
    const inviteCode = uuidv4().split('-')[0];
    
    // Создаем базовые данные приглашения
    const inviteData: any = {
      createdBy: userId,
      createdAt: serverTimestamp(),
      inviteCode,
      position,
      active: true,
      candidatesCount: 0,
      expiresAt: serverTimestamp(), // Добавляем время истечения
    };

    // Добавляем maxCandidates только если значение определено
    if (typeof maxCandidates === 'number') {
      inviteData.maxCandidates = maxCandidates;
    }

    // Создаем документ в коллекции invites
    const docRef = await addDoc(collection(db, 'invites'), inviteData);

    return {
      success: true,
      id: docRef.id,
      inviteCode
    };
  } catch (error: any) {
    console.error('Error creating invite:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Получение приглашения по коду
export const getInviteByCode = async (inviteCode: string) => {
  try {
    const invitesRef = collection(db, 'invites');
    const q = query(
      invitesRef,
      where('inviteCode', '==', inviteCode),
      where('active', '==', true),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invite not found or inactive' };
    }

    const doc = querySnapshot.docs[0];
    const invite = { id: doc.id, ...doc.data() } as Invite;

    // Проверяем срок действия
    if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
      return { success: false, error: 'Invite has expired' };
    }

    // Проверяем лимит кандидатов
    if (invite.maxCandidates && invite.candidatesCount >= invite.maxCandidates) {
      return { success: false, error: 'Maximum number of candidates reached' };
    }

    return { success: true, invite };
  } catch (error: any) {
    console.error('Error getting invite:', error);
    return { success: false, error: error.message };
  }
};

// Получение приглашений пользователя
export const getUserInvites = async (userId: string) => {
  try {
    const invitesRef = collection(db, 'invites');
    const q = query(
      invitesRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const invites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invite[];

    return { success: true, invites };
  } catch (error: any) {
    console.error('Error getting user invites:', error);
    return { success: false, error: error.message };
  }
};

// Деактивация приглашения
export const deactivateInvite = async (inviteId: string, userId: string) => {
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      return { success: false, error: 'Invite not found' };
    }

    const invite = inviteSnap.data() as Invite;

    // Проверяем, принадлежит ли приглашение пользователю
    if (invite.createdBy !== userId) {
      return { success: false, error: 'Not authorized to modify this invite' };
    }

    await updateDoc(inviteRef, {
      active: false
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deactivating invite:', error);
    return { success: false, error: error.message };
  }
};

// Добавление нового кандидата
export const addCandidate = async (inviteId: string, candidateData: {
  name: string;
  email: string;
  cvUrl?: string;
  cvFilename?: string;
  inviteLink?: string;
}) => {
  try {
    // Логируем входящие данные
    console.log('Adding Candidate - Raw Input:', {
      inviteId,
      candidateData
    });

    // Получаем информацию о приглашении
    const inviteRef = doc(db, 'invites', inviteId)
    const inviteSnap = await getDoc(inviteRef)

    if (!inviteSnap.exists()) {
      console.error('Invite not found:', inviteId)
      return { success: false, error: 'Invite not found' }
    }

    const invite = inviteSnap.data() as Invite

    // Проверка, активно ли приглашение
    if (!invite.active) {
      console.error('Invite is not active:', invite)
      return { success: false, error: 'This invitation is no longer active' }
    }

    // Проверяем лимит кандидатов
    if (invite.maxCandidates && invite.candidatesCount >= invite.maxCandidates) {
      console.error('Maximum candidates reached:', invite.candidatesCount)
      return { success: false, error: 'Maximum number of candidates reached' }
    }

    // Создаем запись о кандидате с фильтрацией полей
    const newCandidate: Omit<InviteCandidate, 'id'> = {
      inviteId,
      name: candidateData.name,
      email: candidateData.email,
      status: 'pending',
      createdAt: serverTimestamp() as any
    }

    // Условно добавляем поля CV с дополнительной проверкой
    if (candidateData.cvUrl && typeof candidateData.cvUrl === 'string') {
      newCandidate.cvUrl = candidateData.cvUrl
    }

    if (candidateData.cvFilename && typeof candidateData.cvFilename === 'string') {
      newCandidate.cvFilename = candidateData.cvFilename
    }

    if (candidateData.inviteLink && typeof candidateData.inviteLink === 'string') {
      newCandidate.inviteLink = candidateData.inviteLink
    }

    // Логируем объект перед добавлением
    console.log('Candidate Object to Add:', newCandidate)

    // Добавляем кандидата в базу данных
    const candidateRef = await addDoc(collection(db, 'candidates'), newCandidate)

    // Увеличиваем счетчик кандидатов в приглашении
    await updateDoc(inviteRef, {
      candidatesCount: increment(1)
    })

    console.log('Candidate Added Successfully:', candidateRef.id)

    return {
      success: true,
      candidateId: candidateRef.id
    }
  } catch (error: any) {
    // Подробное логирование ошибки
    console.error('Error adding candidate:', {
      message: error.message,
      stack: error.stack,
      originalData: {
        inviteId,
        candidateData
      }
    })

    return { 
      success: false, 
      error: error.message 
    }
  }
};

// Получение списка кандидатов по ID приглашения
export const getCandidatesByInvite = async (inviteId: string, userId: string) => {
  try {
    // Сначала проверяем, принадлежит ли приглашение пользователю
    const inviteRef = doc(db, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      return { success: false, error: 'Invite not found' };
    }

    const invite = inviteSnap.data() as Invite;

    if (invite.createdBy !== userId) {
      return { success: false, error: 'Not authorized to view these candidates' };
    }

    // Получаем кандидатов
    const candidatesRef = collection(db, 'candidates');
    const q = query(
      candidatesRef,
      where('inviteId', '==', inviteId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const candidates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InviteCandidate[];

    return { success: true, candidates };
  } catch (error: any) {
    console.error('Error getting candidates:', error);
    return { success: false, error: error.message };
  }
};

// Обновление статуса кандидата
export const updateCandidateStatus = async (
  candidateId: string,
  status: 'pending' | 'completed' | 'failed'
) => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);

    const updateData: any = {
      status
    };

    // Если статус "completed", добавляем время завершения
    if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }

    await updateDoc(candidateRef, updateData);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating candidate status:', error);
    return { success: false, error: error.message };
  }
};
// Функция для валидации сессии интервью в Python API
export const validateInterviewSession = async (inviteCode: string, email: string) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';
    
    // Создаем FormData для совместимости с API
    const formData = new FormData();
    formData.append('session_id', inviteCode);
    formData.append('candidate_email', email);
    
    // Отправляем запрос в Python API
    const response = await fetch(`${API_URL}/validate-interview-session`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to validate interview session');
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error: any) {
    console.error('Error validating interview session:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while validating the interview session'
    };
  }
};