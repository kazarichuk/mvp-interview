import { useState, useEffect } from 'react';
import { feedbackService } from '@/services/feedback';
import type { Feedback, FeedbackFilters, FeedbackStatus } from '@/types/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FeedbackListProps {
  onFeedbackSelect?: (feedback: Feedback) => void;
}

export function FeedbackList({ onFeedbackSelect }: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FeedbackFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, [filters]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getFeedback(filters);
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: FeedbackStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(id, { status });
      loadFeedbacks();
    } catch (error) {
      console.error('Failed to update feedback status:', error);
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select
          value={filters.status?.[0]}
          onValueChange={(value) => setFilters({ ...filters, status: value ? [value as FeedbackStatus] : undefined })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="pending">New</SelectItem>
            <SelectItem value="reviewing">In Progress</SelectItem>
            <SelectItem value="implemented">Resolved</SelectItem>
            <SelectItem value="rejected">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <Card
            key={feedback.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onFeedbackSelect?.(feedback)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
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
              <p className="text-sm text-muted-foreground line-clamp-2">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(feedback.id, 'reviewing');
                    }}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(feedback.id, 'implemented');
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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