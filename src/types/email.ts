
export interface EmailInviteProps {
    to: string;
    name: string;
    inviteLink: string;
    position: string;
  }
  
  export interface EmailSendResult {
    success: boolean;
    data?: any;
    error?: string;
  }