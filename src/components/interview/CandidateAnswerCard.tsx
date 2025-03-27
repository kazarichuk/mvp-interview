// src/components/interview/CandidateAnswerCard.tsx
import React, { ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, Loader2 } from "lucide-react";

interface CandidateAnswerCardProps {
  isRecording: boolean;
  transcription: string;
  remainingTime: number;
  loading: boolean;
  micActive: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextInputChange: (text: string) => void;
  useTextInput: boolean;
  onToggleInputMode: () => void;
  onSubmitText: () => void;
}

export default function CandidateAnswerCard({
  isRecording,
  transcription,
  remainingTime,
  loading,
  micActive,
  onStartRecording,
  onStopRecording,
  onTextInputChange,
  useTextInput,
  onToggleInputMode,
  onSubmitText
}: CandidateAnswerCardProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onTextInputChange(e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Answer</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleInputMode}
              className={useTextInput ? "bg-primary text-primary-foreground" : ""}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={loading}
              className={micActive ? "bg-primary text-primary-foreground" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {useTextInput ? (
            <Textarea
              value={transcription}
              onChange={handleTextChange}
              placeholder="Type your answer here..."
              className="min-h-[200px]"
              disabled={loading}
            />
          ) : (
            <div className="min-h-[200px] p-4 bg-muted rounded-md">
              {transcription || "Your transcribed answer will appear here..."}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Time remaining: {formatTime(remainingTime)}
            </div>
            <Button
              onClick={onSubmitText}
              disabled={loading || !transcription.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}