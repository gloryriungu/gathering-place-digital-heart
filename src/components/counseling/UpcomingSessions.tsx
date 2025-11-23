import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Calendar, Clock, User, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CounselingSession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  member_notes: string | null;
  pastor: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function UpcomingSessions() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: sessionsData, error } = await supabase
        .from("counseling_sessions")
        .select("*")
        .eq("member_id", user.id)
        .gte("session_date", format(new Date(), "yyyy-MM-dd"))
        .in("status", ["scheduled", "confirmed"])
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // Fetch pastor profiles
      const pastorIds = sessionsData.map(s => s.pastor_id);
      const { data: pastorProfiles, error: pastorError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", pastorIds);

      if (pastorError) {
        console.error("Error fetching pastor profiles:", pastorError);
      }

      // Map sessions with pastor info
      const sessionsWithPastors = sessionsData.map(session => ({
        ...session,
        pastor: pastorProfiles?.find(p => p.user_id === session.pastor_id) || null
      }));

      setSessions(sessionsWithPastors as CounselingSession[]);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load your sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

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
      case "confirmed": return "secondary";
      default: return "outline";
    }
  };

  const formatSessionType = (type: string) => {
    return type.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Sessions</CardTitle>
          <CardDescription>Loading your counseling appointments...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return null; // Don't show anything if no sessions
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Upcoming Sessions
        </CardTitle>
        <CardDescription>
          You have {sessions.length} scheduled counseling {sessions.length === 1 ? "session" : "sessions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getStatusColor(session.status)}>
                        {session.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {formatSessionType(session.session_type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(session.session_date), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parse(session.start_time, "HH:mm:ss", new Date()), "h:mm a")} - 
                          {format(parse(session.end_time, "HH:mm:ss", new Date()), "h:mm a")}
                        </span>
                      </div>
                      
                      {session.pastor && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {session.pastor.first_name} {session.pastor.last_name}
                          </span>
                        </div>
                      )}
                      
                      {session.member_notes && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-background/50 rounded">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-xs text-muted-foreground">
                            {session.member_notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={cancelling === session.id}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this counseling session scheduled for{" "}
                            {format(new Date(session.session_date), "MMMM d, yyyy")} at{" "}
                            {format(parse(session.start_time, "HH:mm:ss", new Date()), "h:mm a")}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Session</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleCancelSession(session.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Cancel Session
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
