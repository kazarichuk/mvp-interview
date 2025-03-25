import { Timestamp } from 'firebase/firestore';

export interface Invite {
  id: string;                  
  createdBy: string;           
  createdAt: Timestamp;        
  inviteCode: string;          
  position: string;            
  active: boolean;             
  candidatesCount: number;     
  maxCandidates?: number;      
  expiresAt?: Timestamp;       
  link?: string;               // Добавляем поле для полной ссылки
}

export interface InviteCandidate {
  id: string;                  
  inviteId: string;            
  name: string;                
  email: string;               
  cvUrl?: string;              
  cvFilename?: string;         
  status: 'pending' | 'completed' | 'failed';  
  createdAt: Timestamp;        
  completedAt?: Timestamp;     
  inviteLink?: string;         // Добавляем поле для ссылки приглашения
}