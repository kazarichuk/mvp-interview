export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_API_URL || 'wss://interview-api-ozcp.onrender.com/ws';

export const WS_ENDPOINTS = {
  chat: `${WS_BASE_URL}/chat`,
  evaluation: `${WS_BASE_URL}/evaluation`,
} as const;

export const WS_CONFIG = {
  endpoints: WS_ENDPOINTS,
  timeouts: {
    connection: 10000, // 10 seconds
    message: 30000, // 30 seconds
    reconnect: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  },
  errorMessages: {
    connectionFailed: 'Failed to connect to chat service',
    connectionLost: 'Connection to chat service was lost',
    messageTimeout: 'Message response timed out',
    reconnectFailed: 'Failed to reconnect to chat service',
  }
} as const;

export interface WSMessage {
  type: 'chat' | 'evaluation' | 'error' | 'ping' | 'pong';
  data: any;
  timestamp: string;
}

export interface WSError {
  code: string;
  message: string;
  details?: any;
}

export const isWebSocketEnabled = () => process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true'; 