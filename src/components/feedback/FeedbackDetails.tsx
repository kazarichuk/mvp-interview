import { useState, useEffect } from 'react';
import { feedbackService } from '@/services/feedback';
import type { Feedback, FeedbackStatus } from '@/types/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

interface FeedbackDetailsProps {
  feedbackId: string;
  onStatusChange?: () => void;
}

export function FeedbackDetails({ feedbackId, onStatusChange }: FeedbackDetailsProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [feedbackId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getFeedbackById(feedbackId);
      setFeedback(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: FeedbackStatus) => {
    try {
      setSubmitting(true);
      await feedbackService.updateFeedbackStatus(feedbackId, { status });
      await loadFeedback();
      onStatusChange?.();
      toast({
        title: 'Success',
        description: 'Feedback status updated',
      });
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      await feedbackService.addComment(feedbackId, comment);
      setComment('');
      await loadFeedback();
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Feedback not found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            {feedback.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(feedback.status)}>
              {getStatusLabel(feedback.status)}
            </Badge>
            <Badge variant="outline">
              {feedback.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {feedback.description}
          </p>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{feedback.created_by.name}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(feedback.created_at), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={feedback.status}
                onValueChange={handleStatusChange}
                disabled={submitting}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">New</SelectItem>
                  <SelectItem value="reviewing">In Progress</SelectItem>
                  <SelectItem value="implemented">Resolved</SelectItem>
                  <SelectItem value="rejected">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddComment} className="space-y-4">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            {feedback.comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.created_by.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusVariant(status: FeedbackStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending':
      return 'default';
    case 'reviewing':
      return 'secondary';
    case 'implemented':
      return 'outline';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: FeedbackStatus): string {
  switch (status) {
    case 'pending':
      return 'New';
    case 'reviewing':
      return 'In Progress';
    case 'implemented':
      return 'Resolved';
    case 'rejected':
      return 'Closed';
    default:
      return status;
  }
} 