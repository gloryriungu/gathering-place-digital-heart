import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, User, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface CounselingSession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  member_notes: string | null;
  notes: string | null;
  pastor_id: string;
  member_id: string;
  pastor_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
  member_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

const CounselingSessionsManagement = () => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("counseling_sessions")
        .select("*")
        .eq("member_id", user.id)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Fetch pastor and member profiles separately
      const pastorIds = [...new Set(data?.map(s => s.pastor_id) || [])];
      const memberIds = [...new Set(data?.map(s => s.member_id) || [])];
      
      const { data: pastorProfiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", pastorIds);

      const { data: memberProfiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", memberIds);

      // Merge profiles with sessions
      const sessionsWithProfiles = data?.map(session => ({
        ...session,
        pastor_profile: pastorProfiles?.find(p => p.user_id === session.pastor_id) || null,
        member_profile: memberProfiles?.find(p => p.user_id === session.member_id) || null
      })) || [];

      setSessions(sessionsWithProfiles);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load counseling sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    setCancelling(sessionId);
    try {
      const { error } = await supabase
        .from("counseling_sessions")
        .update({ status: "cancelled" })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Session cancelled successfully");
      fetchSessions();
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const formatSessionType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const upcomingSessions = sessions.filter(
    s => s.status === "scheduled" && new Date(s.session_date) >= new Date()
  );

  const pastSessions = sessions.filter(
    s => s.status === "completed" || s.status === "cancelled" || 
    (s.status === "scheduled" && new Date(s.session_date) < new Date())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const SessionCard = ({ session }: { session: CounselingSession }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {formatSessionType(session.session_type)}
              </CardTitle>
              <Badge variant={getStatusColor(session.status)}>
                {session.status}
              </Badge>
            </div>
            <CardDescription>
              Booked by {session.member_profile?.first_name} {session.member_profile?.last_name}
            </CardDescription>
          </div>
          {session.status === "scheduled" && new Date(session.session_date) >= new Date() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this counseling session? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Session</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancelSession(session.id)}
                    disabled={cancelling === session.id}
                  >
                    {cancelling === session.id ? "Cancelling..." : "Cancel Session"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(session.session_date), "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{session.start_time} - {session.end_time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Pastor {session.pastor_profile?.first_name} {session.pastor_profile?.last_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Member: {session.member_profile?.first_name} {session.member_profile?.last_name}</span>
          </div>
        </div>

        {session.member_notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Your Notes
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {session.member_notes}
            </p>
          </div>
        )}

        {session.notes && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Pastor's Notes
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {session.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Counseling Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your counseling appointments and notes
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No upcoming counseling sessions scheduled
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No past counseling sessions
                </p>
              </CardContent>
            </Card>
          ) : (
            pastSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CounselingSessionsManagement;
