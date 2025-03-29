import { useState, useEffect } from 'react';
import { feedbackService } from '@/services/feedback';
import type { FeedbackStats, FeedbackInsights } from '@/types/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export function FeedbackStats() {
  const { toast } = useToast();
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [insights, setInsights] = useState<FeedbackInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, insightsData] = await Promise.all([
        feedbackService.getFeedbackStats(),
        feedbackService.getFeedbackInsights(),
      ]);
      setStats(statsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load feedback stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats || !insights) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.by_status.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.by_status.reviewing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.by_status.implemented}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.top_categories.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.count} ({category.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.priority_distribution.map((priority) => (
                <div key={priority.priority} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{priority.priority}</span>
                  <span className="text-sm text-muted-foreground">
                    {priority.count} ({priority.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recent_improvements.map((improvement) => (
              <div key={improvement.date} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">
                    {new Date(improvement.date).toLocaleDateString()}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {improvement.count} improvements
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {improvement.categories.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 