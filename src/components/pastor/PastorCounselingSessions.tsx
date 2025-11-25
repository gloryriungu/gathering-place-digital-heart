import { useState, useEffect } from "react";
import { format, parse, isPast, startOfDay } from "date-fns";
import { Calendar, Clock, User, FileText, CheckCircle, Loader2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CounselingSession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  member_notes: string | null;
  notes: string | null;
  member: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export default function PastorCounselingSessions() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all sessions for this pastor
      const { data: sessionsData, error } = await supabase
        .from("counseling_sessions")
        .select("*")
        .eq("pastor_id", user.id)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // Fetch member profiles
      const memberIds = sessionsData.map(s => s.member_id);
      const { data: memberProfiles, error: memberError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", memberIds);

      if (memberError) {
        console.error("Error fetching member profiles:", memberError);
      }

      // For members without profiles, fetch from members table as fallback
      const missingProfileIds = memberIds.filter(
        id => !memberProfiles?.find(p => p.user_id === id)
      );
      
      let memberTableData: any[] = [];
      if (missingProfileIds.length > 0) {
        const { data: membersData } = await supabase
          .from("members")
          .select("user_id, first_name, last_name, email")
          .in("user_id", missingProfileIds);
        
        memberTableData = membersData || [];
      }

      // Map sessions with member info
      const sessionsWithMembers = sessionsData.map(session => {
        const profileData = memberProfiles?.find(p => p.user_id === session.member_id);
        const memberData = memberTableData.find(m => m.user_id === session.member_id);
        
        // Build display info from available data
        const firstName = profileData?.first_name || memberData?.first_name;
        const lastName = profileData?.last_name || memberData?.last_name;
        const email = memberData?.email;
        
        // Create display name with fallback options
        let displayFirstName: string;
        let displayLastName: string;
        
        if (firstName && lastName) {
          // We have full name
          displayFirstName = firstName;
          displayLastName = lastName;
        } else if (email) {
          // Show email if no name available
          displayFirstName = email.split('@')[0];
          displayLastName = `(${email})`;
        } else {
          // Last resort: show ID
          displayFirstName = "Member";
          displayLastName = `(ID: ${session.member_id.slice(0, 8)})`;
        }
        
        return {
          ...session,
          member: {
            first_name: displayFirstName,
            last_name: displayLastName,
            email: email || ""
          }
        };
      });

      setSessions(sessionsWithMembers as CounselingSession[]);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load counseling sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    // Set up real-time subscription
    const channel = supabase
      .channel('pastor-counseling-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counseling_sessions'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSaveNotes = async () => {
    if (!selectedSession) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("counseling_sessions")
        .update({ notes: sessionNotes })
        .eq("id", selectedSession.id);

      if (error) throw error;

      toast.success("Session notes saved successfully");
      setSelectedSession(null);
      setSessionNotes("");
      fetchSessions();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save session notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    setCompletingSession(sessionId);
    try {
      const { error } = await supabase
        .from("counseling_sessions")
        .update({ status: "completed" })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Session marked as completed");
      fetchSessions();
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session");
    } finally {
      setCompletingSession(null);
      setShowCompleteDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "default";
      case "confirmed": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const formatSessionType = (type: string) => {
    return type.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const upcomingSessions = sessions.filter(s => 
    !isPast(startOfDay(new Date(s.session_date))) && 
    ["scheduled", "confirmed"].includes(s.status)
  );

  const pastSessions = sessions.filter(s => 
    isPast(startOfDay(new Date(s.session_date))) || 
    ["completed", "cancelled"].includes(s.status)
  );

  const SessionCard = ({ session, isPastSession = false }: { session: CounselingSession; isPastSession?: boolean }) => (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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
              
              {session.member && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {session.member.first_name} {session.member.last_name}
                  </span>
                </div>
              )}
              
              {session.member_notes && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-background/50 rounded">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium mb-1">Member's Notes:</p>
                    <p className="text-xs text-muted-foreground">{session.member_notes}</p>
                  </div>
                </div>
              )}

              {session.notes && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-primary/10 rounded">
                  <FileText className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium mb-1">Your Session Notes:</p>
                    <p className="text-xs text-muted-foreground">{session.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedSession(session);
                    setSessionNotes(session.notes || "");
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {session.notes ? "Edit Notes" : "Add Notes"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Notes</DialogTitle>
                  <DialogDescription>
                    Add private notes about this counseling session with{" "}
                    {session.member?.first_name} {session.member?.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-notes">Notes</Label>
                    <Textarea
                      id="session-notes"
                      placeholder="Enter your session notes here..."
                      rows={8}
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {sessionNotes.length}/2000 characters
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSession(null);
                      setSessionNotes("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Notes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {!isPastSession && session.status !== "completed" && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowCompleteDialog(true);
                  }}
                  disabled={completingSession === session.id}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>

                <AlertDialog open={showCompleteDialog && selectedSession?.id === session.id} onOpenChange={setShowCompleteDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark Session as Completed?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the counseling session with{" "}
                        {session.member?.first_name} {session.member?.last_name} on{" "}
                        {format(new Date(session.session_date), "MMMM d, yyyy")} as completed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSelectedSession(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCompleteSession(session.id)}>
                        Mark as Complete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Counseling Sessions</CardTitle>
          <CardDescription>Loading your sessions...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Counseling Sessions
        </CardTitle>
        <CardDescription>
          Manage your counseling appointments and session notes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming counseling sessions</p>
              </div>
            ) : (
              upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-4">
            {pastSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No past counseling sessions</p>
              </div>
            ) : (
              pastSessions.map((session) => (
                <SessionCard key={session.id} session={session} isPastSession />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
