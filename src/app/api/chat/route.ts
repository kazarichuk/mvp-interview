import { NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/api';
import type { WSMessage, WSError } from '@/config/websocket';
import { API_CONFIG, ApiError } from '@/config/api';
import { isWebSocketEnabled } from '@/config/websocket';
import { chatWebSocket } from '@/services/websocket';

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    
    // Validate required fields
    if (!body.message || !body.session_id || !body.interview_id) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.missingRequiredFields,
        { required: ['message', 'session_id', 'interview_id'] }
      );
    }

    // Check if WebSocket is enabled and connection is available
    if (isWebSocketEnabled() && chatWebSocket.isConnected()) {
      // Use WebSocket for streaming response
      return new NextResponse(
        new ReadableStream({
          async start(controller) {
            try {
              // Send message through WebSocket
              await chatWebSocket.send({
                type: 'chat',
                data: body,
                timestamp: new Date().toISOString()
              });

              // Handle streaming response
              const unsubscribe = chatWebSocket.onMessage((message: WSMessage) => {
                if (message.type === 'chat') {
                  controller.enqueue(new TextEncoder().encode(JSON.stringify(message.data) + '\n'));
                  
                  // If message indicates completion, close the stream
                  if (message.data.completed) {
                    controller.close();
                    unsubscribe();
                  }
                }
              });

              // Handle errors
              const errorUnsubscribe = chatWebSocket.onError((error: WSError) => {
                controller.error(error);
                unsubscribe();
                errorUnsubscribe();
              });

            } catch (error) {
              controller.error(error);
            }
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Fallback to HTTP if WebSocket is not available or disabled
    const response = await fetch(API_CONFIG.endpoints.chat, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        'CHAT_REQUEST_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: ChatResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'CHAT_ERROR',
        data.error?.message || API_CONFIG.errorMessages.serviceUnavailable,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: API_CONFIG.errorMessages.internalServerError
        }
      },
      { status: 500 }
    );
  }
} 