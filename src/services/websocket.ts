import { WS_CONFIG, WS_ENDPOINTS, WSMessage, WSError } from '@/config/websocket';

type MessageHandler = (message: WSMessage) => void;
type ErrorHandler = (error: WSError) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private endpoint: string) {}

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.endpoint);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            this.handleError({
              code: 'MESSAGE_PARSE_ERROR',
              message: 'Failed to parse message from server'
            });
          }
        };

        this.ws.onerror = (error: Event) => {
          console.error('WebSocket error:', error);
          this.handleError({
            code: 'CONNECTION_ERROR',
            message: WS_CONFIG.errorMessages.connectionFailed
          });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.stopPingInterval();
          this.handleReconnect();
        };

        // Set connection timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error(WS_CONFIG.errorMessages.connectionFailed));
          }
        }, WS_CONFIG.timeouts.connection);

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPingInterval();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  send(message: WSMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error(WS_CONFIG.errorMessages.connectionLost));
        return;
      }

      try {
        this.ws.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  private handleError(error: WSError) {
    this.errorHandlers.forEach(handler => handler(error));
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= WS_CONFIG.timeouts.reconnect.maxAttempts) {
      this.handleError({
        code: 'RECONNECT_FAILED',
        message: WS_CONFIG.errorMessages.reconnectFailed
      });
      return;
    }

    const delay = Math.min(
      WS_CONFIG.timeouts.reconnect.initialDelay * Math.pow(2, this.reconnectAttempts),
      WS_CONFIG.timeouts.reconnect.maxDelay
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.send({
        type: 'ping',
        data: null,
        timestamp: new Date().toISOString()
      });
    }, 30000); // Send ping every 30 seconds
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Create singleton instances for different endpoints
export const chatWebSocket = new WebSocketService(WS_ENDPOINTS.chat);
export const evaluationWebSocket = new WebSocketService(WS_ENDPOINTS.evaluation); 