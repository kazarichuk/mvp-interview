// src/app/interview/[code]/session/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import useAudioRecorder from '@/hooks/useAudioRecorder';
import useInterviewSession from '@/hooks/useInterviewSession';
import CandidateAnswerCard from '@/components/interview/CandidateAnswerCard';
import QuestionCard from '@/components/interview/QuestionCard';
import FeedbackCard from '@/components/interview/FeedbackCard';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  // States
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Hooks
  const audioRecorder = useAudioRecorder();
  const interview = useInterviewSession({ sessionId: code });
  
  // Initialize camera
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current!.srcObject = stream;
          streamRef.current = stream;
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          interview.setError('Failed to access camera. Please check your permissions.');
        });
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive, interview]);
  
  // Initialize interview
  useEffect(() => {
    interview.fetchInterviewInfo();
  }, [interview]);
  
  // Timer effect
  useEffect(() => {
    if (interview.remainingTime > 0 && !interview.loading) {
      const timer = setInterval(() => {
        interview.setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            interview.endInterviewEarly();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [interview.remainingTime, interview.loading, interview]);
  
  const handleStartRecording = useCallback(async () => {
    try {
      await audioRecorder.startRecording();
      setMicActive(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      interview.setError('Failed to start recording. Please try again.');
    }
  }, [audioRecorder, interview]);
  
  const handleStopRecording = useCallback(async () => {
    try {
      const audioBlob = await audioRecorder.stopRecording();
      if (!audioBlob) {
        throw new Error('Failed to get audio data');
      }
      
      setMicActive(false);
      
      // Convert audio to text using Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const data = await response.json();
      interview.setTextInput(data.text);
    } catch (err) {
      console.error('Error stopping recording:', err);
      interview.setError('Failed to process audio. Please try again.');
    }
  }, [audioRecorder, interview]);
  
  const handleSubmit = useCallback(async () => {
    try {
      if (!interview.textInput.trim()) {
        interview.setError('Please provide an answer before submitting.');
        return;
      }
      
      await interview.submitAnswer(interview.textInput);
      interview.setTextInput('');
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  }, [interview]);
  
  // Show loading
  if (interview.loading && !interview.isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading interview...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Interview Session</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCameraActive(!cameraActive)}
              >
                {cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
              </Button>
              <Button
                variant="outline"
                onClick={interview.endInterviewEarly}
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question Card */}
          <QuestionCard
            question={interview.currentQuestion}
            topic={interview.currentTopic}
            loading={interview.loading}
            error={interview.error}
          />
          
          {/* Answer Card */}
          <CandidateAnswerCard
            isRecording={audioRecorder.isRecording}
            transcription={interview.textInput}
            remainingTime={interview.remainingTime}
            loading={interview.loading}
            micActive={micActive}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTextInputChange={(text) => interview.setTextInput(text)}
            useTextInput={interview.useTextInput}
            onToggleInputMode={interview.toggleInputMode}
            onSubmitText={handleSubmit}
          />
          
          {/* Feedback Card */}
          {interview.feedback && (
            <FeedbackCard
              feedback={interview.feedback}
              score={interview.score}
              loading={interview.loading}
            />
          )}
        </div>
      </main>
      
      {/* Camera Preview */}
      {cameraActive && (
        <div className="fixed bottom-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}