// src/hooks/useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderProps {
  onRecordingComplete: (blob: Blob) => Promise<void>;
  onError?: (error: Error) => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  recordingError: string | null;
}

export default function useAudioRecorder({
  onRecordingComplete,
  onError
}: UseAudioRecorderProps): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Start recording
  const startRecording = useCallback(async () => {
    try {
      console.log("Starting audio recording...");
      setRecordingError(null);
      
      // Get audio stream if not already available
      if (!streamRef.current) {
        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        console.log("Microphone access granted");
      }
      
      // Clear previous chunks
      audioChunksRef.current = [];
      
      // Determine supported audio formats
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
      ];
      
      // Find supported MIME type
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      if (!supportedMimeType) {
        throw new Error('No supported audio MIME type found');
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: supportedMimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
          await onRecordingComplete(audioBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          setRecordingError('Failed to process recording');
          onError?.(error instanceof Error ? error : new Error('Failed to process recording'));
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      console.log("Recording started");
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError('Failed to start recording');
      onError?.(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }, [onRecordingComplete, onError]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);
  
  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingError
  };
}