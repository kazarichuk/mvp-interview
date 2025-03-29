'use client';

import { useState } from 'react';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import { FeedbackDetails } from '@/components/feedback/FeedbackDetails';
import { CreateFeedback } from '@/components/feedback/CreateFeedback';
import { FeedbackStats } from '@/components/feedback/FeedbackStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Feedback } from '@/types/feedback';

export default function FeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleFeedbackSelect = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowCreateForm(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Feedback
        </button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Feedback List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {showCreateForm ? (
            <CreateFeedback onSuccess={handleCreateSuccess} />
          ) : selectedFeedback ? (
            <FeedbackDetails
              feedbackId={selectedFeedback.id}
              onStatusChange={() => setSelectedFeedback(null)}
            />
          ) : (
            <FeedbackList onFeedbackSelect={handleFeedbackSelect} />
          )}
        </TabsContent>

        <TabsContent value="stats">
          <FeedbackStats />
        </TabsContent>
      </Tabs>
    </div>
  );
} 