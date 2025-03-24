// src/components/interview/CandidateAnswerCard.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Loader2 } from 'lucide-react';

interface CandidateAnswerCardProps {
  isRecording: boolean;
  transcription: string;
  remainingTime: number;
  loading: boolean;
  micActive: boolean;
  useTextInput: boolean;
  textInput: string;
  recordingError: string | null;
  onTextInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onToggleInputMode: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitText: () => void;
  formatTime: (seconds: number) => string;
}

export default function CandidateAnswerCard({
  isRecording,
  transcription,
  remainingTime,
  loading,
  micActive,
  useTextInput,
  textInput,
  recordingError,
  onTextInputChange,
  onToggleInputMode,
  onStartRecording,
  onStopRecording,
  onSubmitText,
  formatTime
}: CandidateAnswerCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <span className="inline-block w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mr-2">
            A
          </span>
          Your Answer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        {isRecording ? (
          // Recording UI
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-2 relative">
              <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-full h-full rounded-full border-4 border-red-500 opacity-75"></div>
            </div>
            <p className="text-gray-700 mb-1">Recording...</p>
            <p className="text-sm text-gray-500">
              Speak clearly into your microphone
            </p>
          </div>
        ) : useTextInput ? (
          // Text input UI
          <div className="space-y-3">
            <textarea
              className="w-full min-h-24 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your answer here..."
              value={textInput}
              onChange={onTextInputChange}
            />
          </div>
        ) : transcription ? (
          // Transcription UI
          <div className="rounded-md bg-gray-50 p-3 text-gray-800">
            {transcription}
          </div>
        ) : (
          // Initial state
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">Press the button below to start recording your answer</p>
            <p className="text-xs text-gray-400">
              You have {formatTime(remainingTime)} to answer this question
            </p>
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm mt-4 underline"
              onClick={onToggleInputMode}
            >
              Having trouble with audio? Switch to text input
            </button>
            
            {recordingError && (
              <div className="mt-4 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                {recordingError}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {isRecording ? (
          // Stop recording button
          <Button
            className="w-full"
            variant="destructive"
            onClick={onStopRecording}
          >
            <span className="flex items-center">
              <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Stop Recording
            </span>
          </Button>
        ) : useTextInput ? (
          // Text input controls
          <div className="flex w-full space-x-2">
            <Button
              variant="outline"
              onClick={onToggleInputMode}
              className="flex-1"
            >
              Switch to Audio
            </Button>
            <Button
              className="flex-1"
              onClick={onSubmitText}
              disabled={!textInput.trim() || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <span>Submit Answer</span>
              )}
            </Button>
          </div>
        ) : (
          // Start recording button
          <Button
            className="w-full"
            onClick={onStartRecording}
            disabled={!micActive || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Mic className="h-4 w-4 mr-1" />
            )}
            {loading ? "Processing..." : "Start Recording"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}