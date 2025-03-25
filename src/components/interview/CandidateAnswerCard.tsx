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
  // Add state for transition
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [processingTimeout, setProcessingTimeout] = React.useState<NodeJS.Timeout | null>(null);
  
  // Handle recording state changes with timeout
  const handleStartRecording = async () => {
    try {
      setIsTransitioning(true);
      await onStartRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    } finally {
      setIsTransitioning(false);
    }
  };
  
  const handleStopRecording = async () => {
    try {
      setIsTransitioning(true);
      await onStopRecording();
      
      // Set a timeout to force reset the processing state
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        console.log('Processing timeout reached, resetting state');
      }, 30000); // 30 seconds timeout
      
      setProcessingTimeout(timeout);
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsTransitioning(false);
    }
  };
  
  // Cleanup timeout on unmount or when loading state changes
  React.useEffect(() => {
    if (processingTimeout) {
      if (!loading) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
        setIsTransitioning(false);
      }
    }
    
    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [loading, processingTimeout]);
  
  // Handle input mode toggle
  const handleInputModeToggle = () => {
    if (!loading && !isTransitioning) {
      onToggleInputMode();
    }
  };
  
  // Add error state handling
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (recordingError) {
      setError(recordingError);
      setIsTransitioning(false);
    }
  }, [recordingError]);
  
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
            <p className="text-sm text-gray-400 mt-2">
              Time remaining: {formatTime(remainingTime)}
            </p>
          </div>
        ) : useTextInput ? (
          // Text input UI
          <div className="space-y-3">
            <textarea
              className="w-full min-h-24 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Type your answer here..."
              value={textInput}
              onChange={onTextInputChange}
              disabled={loading || isTransitioning}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Time remaining: {formatTime(remainingTime)}</span>
              <span>{textInput.length} characters</span>
            </div>
          </div>
        ) : transcription ? (
          // Transcription UI
          <div className="space-y-4">
            <div className="rounded-md bg-gray-50 p-3 text-gray-800">
              {transcription}
            </div>
            {(loading || isTransitioning) && (
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing your answer...
              </div>
            )}
          </div>
        ) : (
          // Initial state
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">
              {loading || isTransitioning ? 'Processing...' : 'Press the button below to start recording your answer'}
            </p>
            <p className="text-xs text-gray-400">
              You have {formatTime(remainingTime)} to answer this question
            </p>
            {!loading && !isTransitioning && (
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm mt-4 underline disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleInputModeToggle}
                disabled={loading || isTransitioning}
              >
                Having trouble with audio? Switch to text input
              </button>
            )}
            
            {error && (
              <div className="mt-4 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                {error}
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
            onClick={handleStopRecording}
            disabled={loading || isTransitioning}
          >
            <span className="flex items-center">
              {isTransitioning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
              )}
              {isTransitioning ? 'Processing...' : 'Stop Recording'}
            </span>
          </Button>
        ) : useTextInput ? (
          // Text input controls
          <div className="flex w-full space-x-2">
            <Button
              variant="outline"
              onClick={handleInputModeToggle}
              disabled={loading || isTransitioning}
              className="flex-1"
            >
              Switch to Audio
            </Button>
            <Button
              className="flex-1"
              onClick={onSubmitText}
              disabled={!textInput.trim() || loading || isTransitioning}
            >
              {loading || isTransitioning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </div>
        ) : (
          // Start recording button
          <Button
            className="w-full"
            onClick={handleStartRecording}
            disabled={loading || isTransitioning}
          >
            {loading || isTransitioning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {loading ? "Processing..." : "Starting..."}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}