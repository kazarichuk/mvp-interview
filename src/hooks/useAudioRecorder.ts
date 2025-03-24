// src/hooks/useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderProps {
  onRecordingComplete: (blob: Blob) => Promise<void>;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  recordingError: string | null;
}

export default function useAudioRecorder({
  onRecordingComplete
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
      
      let options = {};
      let selectedType = '';
      
      // Find first supported format
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options = { mimeType: type };
          selectedType = type;
          console.log(`Using audio format: ${type}`);
          break;
        }
      }
      
      // Create and configure media recorder
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorder.ondataavailable = (event) => {
        console.log(`Data available event, size: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          // Get mime type from recorder or use fallback
          const mimeType = mediaRecorder.mimeType || selectedType || 'audio/webm';
          console.log(`Recording stopped, creating blob with type: ${mimeType}`);
          
          // Create audio blob with correct type
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log(`Audio blob created, size: ${audioBlob.size} bytes`);
          
          // Pass recording to callback
          await onRecordingComplete(audioBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          setRecordingError('Error processing recording. Please try again.');
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording in 1-second chunks for better reliability
      mediaRecorder.start(1000);
      console.log("Recording started");
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError(`Failed to start recording: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [onRecordingComplete]);
  
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