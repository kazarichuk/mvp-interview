import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface QuestionCardProps {
  question: string | null;
  topic: string | null;
  loading: boolean;
  error: string | null;
}

export default function QuestionCard({ question, topic, loading, error }: QuestionCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading question...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-500">No question available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question</CardTitle>
          {topic && (
            <Badge variant="secondary">{topic}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg">{question}</p>
      </CardContent>
    </Card>
  );
} 