// src/app/interview/[code]/session/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Camera, CameraOff, Loader2, XCircle, CheckCircle, Clock, AlertTriangle, User, Brain } from 'lucide-react';
import { SimpleProgress } from "@/components/ui/simple-progress";
import Image from 'next/image';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Import custom hooks and components
import useAudioRecorder from '@/hooks/useAudioRecorder';
import useInterviewSession from '@/hooks/useInterviewSession';
import CandidateAnswerCard from '@/components/interview/CandidateAnswerCard';

// API URL for Python backend
const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export default function InterviewSessionPage() {
  const params = useParams();
  const sessionId = params.code as string;
  
  // Remove media states and keep only necessary ones
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use interview session hook
  const interview = useInterviewSession({ sessionId });
  
  // Use audio recorder hook
  const audioRecorder = useAudioRecorder({
    onRecordingComplete: async (audioBlob) => {
      try {
        setMediaError(null);
        await interview.submitAudioAnswer(audioBlob);
      } catch (error) {
        console.error('Error submitting audio:', error);
        setMediaError('Failed to submit audio. Please try again or switch to text input.');
      }
    },
    onError: (error) => {
      console.error('Audio recording error:', error);
      setMediaError('Error with audio recording. Please try again or switch to text input.');
    }
  });
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      interview.setTextInput(e.target.value);
    } catch (error) {
      console.error('Error updating text input:', error);
    }
  };
  
  // Handle text submission
  const handleSubmitText = async () => {
    try {
      setMediaError(null);
      await interview.submitTextAnswer(interview.textInput);
    } catch (error) {
      console.error('Error submitting text:', error);
      setMediaError('Failed to submit text. Please try again.');
    }
  };

  // Timer management
  useEffect(() => {
    if (interview.currentQuestion && !interview.interviewComplete) {
      // Start timer
      timerRef.current = setInterval(() => {
        interview.setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            // Time's up, stop recording if active
            if (audioRecorder.isRecording) {
              audioRecorder.stopRecording();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interview.currentQuestion, interview.interviewComplete, audioRecorder, interview]);
  
  // Load interview on mount
  useEffect(() => {
    if (!interview.isInitialized) {
      interview.fetchInterviewInfo();
    }
  }, [interview]);
  
  // Add AI system status handling
  const [aiSystemStatus, setAiSystemStatus] = useState<'available' | 'unavailable' | 'recovering'>('available');

  // Check AI system status periodically
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/health-check`);
        if (!response.ok) {
          setAiSystemStatus('unavailable');
        } else {
          setAiSystemStatus('available');
        }
      } catch (err) {
        console.error('AI system check failed:', err);
        setAiSystemStatus('unavailable');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, []);

  // Show AI system status warning
  const renderAiSystemStatus = () => {
    if (aiSystemStatus === 'unavailable') {
      return (
        <Alert className="bg-yellow-50 text-yellow-800 border border-yellow-200 mb-4">
          <AlertDescription className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            AI system is currently unavailable. You can continue with text input or wait for the system to recover.
          </AlertDescription>
        </Alert>
      );
    }
    if (aiSystemStatus === 'recovering') {
      return (
        <Alert className="bg-blue-50 text-blue-800 border border-blue-200 mb-4">
          <AlertDescription className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 flex-shrink-0 animate-spin" />
            Attempting to recover AI system...
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };
  
  // Show loading
  if (interview.loading && !interview.currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }
  
  // Show error
  if (interview.error && !interview.currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="mb-6">
          <Image
            src="/logo.svg"
            alt="HireFlick Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
        
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-red-600">Interview Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{interview.error}</AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If interview is complete
  if (interview.interviewComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="mb-6">
          <Image
            src="/logo.svg"
            alt="HireFlick Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
        
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-6 w-6" />
              Interview Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Thank you for participating in the interview! Your answers have been recorded and will be analyzed.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-md text-blue-800">
              <p>Redirecting you to the results page...</p>
              <SimpleProgress value={100} className="mt-2 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main interview UI
  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <header className="bg-white border-b py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.svg"
              alt="HireFlick Logo"
              width={100}
              height={32}
              className="object-contain"
            />
            <span className="hidden md:inline-block text-sm text-gray-500">AI-Powered UX/UI Interview</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-700 mr-2">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span className={interview.remainingTime < 60 ? "text-red-600 font-medium" : ""}>
                {formatTime(interview.remainingTime)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-red-600"
              onClick={interview.endInterviewEarly}
            >
              <XCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">End Interview</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Interview progress */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Interview Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interview.progress ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Questions: {interview.progress.questions_asked}/{interview.progress.max_questions}</span>
                    <span>{Math.round((interview.progress.questions_asked / interview.progress.max_questions) * 100)}%</span>
                  </div>
                  <SimpleProgress value={(interview.progress.questions_asked / interview.progress.max_questions) * 100} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Time: {Math.round(interview.progress.elapsed_minutes)}/{interview.progress.max_duration_minutes} min</span>
                    <span>{Math.round((interview.progress.elapsed_minutes / interview.progress.max_duration_minutes) * 100)}%</span>
                  </div>
                  <SimpleProgress value={(interview.progress.elapsed_minutes / interview.progress.max_duration_minutes) * 100} />
                </div>
                
                {interview.currentTopic && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 mb-1">Current Topic:</p>
                    <p className="text-sm font-medium capitalize">
                      {typeof interview.currentTopic === 'string' ? interview.currentTopic.replace('_', ' ') : ''}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-2">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question and Answer Section */}
        <div className="space-y-4">
          {/* AI System Status */}
          {renderAiSystemStatus()}
          
          {/* Interview Dialog */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span className="inline-block w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-2">
                  AI
                </span>
                Interview Dialog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Question */}
              {interview.currentQuestion && (
                <div className="bg-purple-50 rounded-lg p-3 text-gray-800">
                  {interview.currentQuestion}
                </div>
              )}
              {interview.currentTopic && (
                <div className="mt-1 text-xs text-gray-500">
                  Topic: {typeof interview.currentTopic === 'string' ? interview.currentTopic.replace('_', ' ') : ''}
                </div>
              )}
              
              {/* AI Response */}
              {interview.aiResponse && (
                <div className="bg-purple-50 rounded-lg p-3 text-gray-800">
                  {interview.aiResponse}
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Follow-up question
              </div>
              
              {/* Loading State */}
              {interview.loading && (
                <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                  <LoadingSpinner className="w-5 h-5" />
                  <span>Processing your response...</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Answer and recording */}
          <CandidateAnswerCard 
            isRecording={audioRecorder.isRecording}
            transcription={interview.transcription}
            remainingTime={interview.remainingTime}
            loading={interview.loading}
            useTextInput={interview.useTextInput}
            textInput={interview.textInput}
            recordingError={audioRecorder.recordingError}
            onTextInputChange={handleTextInputChange}
            onToggleInputMode={interview.toggleInputMode}
            onStartRecording={audioRecorder.startRecording}
            onStopRecording={audioRecorder.stopRecording}
            onSubmitText={handleSubmitText}
            formatTime={formatTime}
          />
          
          {/* Error message */}
          {interview.error && (
            <Alert variant="destructive">
              <AlertDescription>{interview.error}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}