// src/types/invites.ts

import { Timestamp } from 'firebase/firestore';

export interface Invite {
  id: string;                  // Уникальный ID приглашения
  createdBy: string;           // UID пользователя, создавшего приглашение
  createdAt: Timestamp;        // Когда было создано приглашение
  inviteCode: string;          // Уникальный код приглашения (для URL)
  position: string;            // Должность, на которую проводится собеседование
  active: boolean;             // Активно ли приглашение
  candidatesCount: number;     // Количество кандидатов, прошедших по этому приглашению
  maxCandidates?: number;      // Опциональное ограничение на количество кандидатов
  expiresAt?: Timestamp;       // Опциональная дата истечения срока действия
}

export interface InviteCandidate {
  id: string;                  // Уникальный ID кандидата
  inviteId: string;            // ID приглашения, по которому пришел кандидат
  name: string;                // Имя кандидата
  email: string;               // Email кандидата
  cvUrl?: string;              // URL резюме (опционально)
  cvFilename?: string;         // Имя файла резюме (опционально)
  status: 'pending' | 'completed' | 'failed';  // Статус прохождения интервью
  createdAt: Timestamp;        // Когда кандидат заполнил форму
  completedAt?: Timestamp;     // Когда завершил интервью (опционально)
}