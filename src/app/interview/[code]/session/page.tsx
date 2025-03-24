// src/app/interview/[code]/session/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Camera, CameraOff, Loader2, XCircle, CheckCircle, Clock } from 'lucide-react';
import { SimpleProgress } from "@/components/ui/simple-progress";
import Image from 'next/image';

// Import custom hooks and components
import useAudioRecorder from '@/hooks/useAudioRecorder';
import useInterviewSession from '@/hooks/useInterviewSession';
import CandidateAnswerCard from '@/components/interview/CandidateAnswerCard';

export default function InterviewSessionPage() {
  const params = useParams();
  const sessionId = params.code as string;
  
  // Media states
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use interview session hook
  const interview = useInterviewSession({ sessionId });
  
  // Use audio recorder hook
  const audioRecorder = useAudioRecorder({
    onRecordingComplete: async (audioBlob) => {
      await interview.submitAudioAnswer(audioBlob);
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
    interview.setTextInput(e.target.value);
  };
  
  // Handle text submission
  const handleSubmitText = () => {
    if (interview.textInput.trim()) {
      interview.submitTextAnswer(interview.textInput);
    }
  };
  
  // Request media device access
  useEffect(() => {
    async function setupMedia() {
      try {
        // Request access to microphone and camera
        const constraints = {
          audio: micActive,
          video: cameraActive ? { width: 640, height: 480 } : false
        };
        
        // Stop previous media stream if it exists
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Request new stream with updated parameters
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        // Update video element if camera is enabled
        if (videoRef.current && cameraActive) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        if (micActive) {
          interview.setError('Could not access microphone. Please check browser permissions.');
        }
      }
    }
    
    setupMedia();
    
    return () => {
      // Clean up media streams when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [micActive, cameraActive, interview]);
  
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
  
  // Media toggle handlers
  const toggleMicrophone = () => {
    setMicActive(!micActive);
  };
  
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
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
     
     <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Left column - video and control */}
       <div className="lg:col-span-1">
         <Card className="mb-4">
           <CardContent className="p-4">{/* Video */}
             <div className="relative bg-gray-900 aspect-video rounded-md mb-4 overflow-hidden">
               {cameraActive ? (
                 <video
                   ref={videoRef}
                   autoPlay
                   muted
                   playsInline
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                   <CameraOff className="h-12 w-12 text-gray-500" />
                 </div>
               )}
               
               {/* Recording indicator */}
               {audioRecorder.isRecording && (
                 <div className="absolute top-2 right-2 flex items-center bg-red-600 text-white px-2 py-1 rounded-md text-xs animate-pulse">
                   <span className="h-2 w-2 bg-white rounded-full mr-1"></span>
                   Recording
                 </div>
               )}
             </div>
             
             {/* Media control buttons */}
             <div className="flex justify-center space-x-2">
               <Button
                 variant={micActive ? "default" : "outline"}
                 size="sm"
                 onClick={toggleMicrophone}
                 className="flex-1"
               >
                 {micActive ? (
                   <>
                     <Mic className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Mic On</span>
                   </>
                 ) : (
                   <>
                     <MicOff className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Mic Off</span>
                   </>
                 )}
               </Button>
               
               <Button
                 variant={cameraActive ? "default" : "outline"}
                 size="sm"
                 onClick={toggleCamera}
                 className="flex-1"
               >
                 {cameraActive ? (
                   <>
                     <Camera className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Camera On</span>
                   </>
                 ) : (
                   <>
                     <CameraOff className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Camera Off</span>
                   </>
                 )}
               </Button>
             </div>
           </CardContent>
         </Card>
         
         {/* Interview progress */}
         <Card>
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
       </div>
       
       {/* Right column - interview */}
       <div className="lg:col-span-2 space-y-4">
         {/* Question */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center">
               <span className="inline-block w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                 Q
               </span>
               Interview Question
             </CardTitle>
           </CardHeader>
           <CardContent>
             {interview.currentQuestion ? (
               <div className="text-gray-800 py-1">{interview.currentQuestion}</div>
             ) : (
               <div className="flex items-center justify-center h-16">
                 <Loader2 className="h-5 w-5 animate-spin" />
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
           micActive={micActive}
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
         
         {/* Interviewer response */}
         {interview.aiResponse && (
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-lg flex items-center">
                 <span className="inline-block w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-2">
                   AI
                 </span>
                 Interviewer Response
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="rounded-md bg-purple-50 p-3 text-gray-800">
                 {interview.aiResponse}
               </div>
             </CardContent>
           </Card>
         )}
         
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