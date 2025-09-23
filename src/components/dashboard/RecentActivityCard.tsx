import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  type: 'member_joined' | 'attendance_recorded' | 'contribution_made' | 'event_created';
  description: string;
  timestamp: string;
  details?: string;
}

export const RecentActivityCard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Get recent members
      const { data: members } = await supabase
        .from('members')
        .select('first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount, created_at, members(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent events
      const { data: events } = await supabase
        .from('church_events')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      const activities: Activity[] = [];

      // Add member activities
      members?.forEach((member, index) => {
        activities.push({
          id: `member-${member.created_at}-${index}`,
          type: 'member_joined',
          description: 'New member joined',
          details: `${member.first_name} ${member.last_name} joined the family`,
          timestamp: member.created_at
        });
      });

      // Add contribution activities
      contributions?.forEach((contribution, index) => {
        const member = contribution.members as any;
        activities.push({
          id: `contribution-${contribution.created_at}-${index}`,
          type: 'contribution_made',
          description: 'New contribution received',
          details: `$${contribution.amount} from ${member?.first_name} ${member?.last_name}`,
          timestamp: contribution.created_at
        });
      });

      // Add event activities
      events?.forEach((event, index) => {
        activities.push({
          id: `event-${event.created_at}-${index}`,
          type: 'event_created',
          description: 'New event created',
          details: event.title,
          timestamp: event.created_at
        });
      });

      // Sort by timestamp and take the 5 most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'member_joined': return 'bg-primary';
      case 'contribution_made': return 'bg-green-500';
      case 'event_created': return 'bg-blue-500';
      default: return 'bg-secondary';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-2 h-2 bg-muted rounded-full mt-2" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-48"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{activity.details}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};