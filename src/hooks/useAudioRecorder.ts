// src/hooks/useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  recordingError: string | null;
}

export default function useAudioRecorder({ onRecordingComplete }: UseAudioRecorderProps = {}): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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
      chunksRef.current = [];
      
      // Create and configure media recorder
      const mediaRecorder = new MediaRecorder(streamRef.current);
      
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = streamRef.current;
      
      mediaRecorder.ondataavailable = (event) => {
        console.log(`Data available event, size: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        try {
          console.log("Recording stopped, creating blob...");
          
          // Create audio blob with correct type
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log(`Audio blob created, size: ${audioBlob.size} bytes`);
          
          // Pass recording to callback
          if (onRecordingComplete) {
            onRecordingComplete(audioBlob);
          }
        } catch (error) {
          console.error('Error processing recording:', error);
          setRecordingError('Error processing recording. Please try again.');
        }
      };
      
      // Start recording
      mediaRecorder.start();
      console.log("Recording started");
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError(`Failed to start recording: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, [onRecordingComplete]);
  
  // Stop recording
  const stopRecording = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !streamRef.current) {
        reject(new Error('No active recording'));
        return;
      }

      try {
        console.log("Stopping recording...");
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolve(audioBlob);
        };

        mediaRecorderRef.current.stop();
        streamRef.current.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      } catch (error) {
        reject(error);
      }
    });
  }, []);
  
  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingError
  };
}