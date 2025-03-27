import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface FeedbackCardProps {
  feedback: string;
  score: number | null;
  loading: boolean;
}

export default function FeedbackCard({ feedback, score, loading }: FeedbackCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Processing feedback...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Feedback</CardTitle>
          {score !== null && (
            <Badge variant={score >= 0.7 ? "default" : score >= 0.4 ? "secondary" : "destructive"}>
              {Math.round(score * 100)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg whitespace-pre-wrap">{feedback}</p>
      </CardContent>
    </Card>
  );
} 