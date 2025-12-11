import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePrerequisiteGuard } from "@/hooks/usePrerequisiteCheck";
import { Heart, Users, Music, BookOpen, Utensils, Baby, HandHelping, Calendar, MapPin, Clock, CheckCircle } from "lucide-react";

interface Ministry {
  id: string;
  name: string;
  description: string;
  requirements: string[] | null;
  meeting_schedule: string | null;
  location: string | null;
  leader_id: string | null;
  is_active: boolean;
  max_members: number | null;
  current_members: number | null;
}

export const ApplyToMinistry = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasAccess, checkAccess } = usePrerequisiteGuard("Join Ministry");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningMinistryId, setJoiningMinistryId] = useState<string | null>(null);
  const [myMemberships, setMyMemberships] = useState<string[]>([]);

  useEffect(() => {
    fetchMinistries();
    if (user) {
      fetchMyMemberships();
    }
  }, [user]);

  const fetchMinistries = async () => {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      toast({ title: "Error", description: "Failed to load ministries", variant: "destructive" });
    } else {
      setMinistries(data || []);
    }
    setLoading(false);
  };

  const fetchMyMemberships = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ministry_members')
      .select('ministry_id')
      .eq('user_id', user.id);
    
    if (data) {
      setMyMemberships(data.map(m => m.ministry_id));
    }
  };

  const handleJoinMinistry = async (ministryId: string) => {
    if (!user) return;
    
    if (!checkAccess()) return;

    setJoiningMinistryId(ministryId);

    // Check if already a member
    const { data: existing } = await supabase
      .from('ministry_members')
      .select('id')
      .eq('ministry_id', ministryId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      toast({ title: "Already a Member", description: "You are already a member of this ministry", variant: "default" });
      setJoiningMinistryId(null);
      return;
    }

    const { error } = await supabase
      .from('ministry_members')
      .insert({
        ministry_id: ministryId,
        user_id: user.id,
        role: 'member',
        status: 'active'
      });

    if (error) {
      toast({ title: "Error", description: "Failed to join ministry", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "You have successfully joined the ministry" });
      fetchMinistries();
      fetchMyMemberships();
    }
    setJoiningMinistryId(null);
  };

  const getMinistryIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('worship') || lowercaseName.includes('music') || lowercaseName.includes('choir')) return Music;
    if (lowercaseName.includes('youth') || lowercaseName.includes('young')) return Users;
    if (lowercaseName.includes('children') || lowercaseName.includes('kids')) return Baby;
    if (lowercaseName.includes('prayer') || lowercaseName.includes('intercession')) return Heart;
    if (lowercaseName.includes('hospitality') || lowercaseName.includes('ushering')) return HandHelping;
    if (lowercaseName.includes('women') || lowercaseName.includes('men')) return Users;
    if (lowercaseName.includes('bible') || lowercaseName.includes('study')) return BookOpen;
    if (lowercaseName.includes('food') || lowercaseName.includes('kitchen')) return Utensils;
    return Heart;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Join a Ministry</h2>
        <p className="text-muted-foreground mt-1">Find a ministry that matches your passion and skills</p>
      </div>

      {ministries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No ministries are currently available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ministries.map((ministry) => {
            const Icon = getMinistryIcon(ministry.name);
            const isMember = myMemberships.includes(ministry.id);
            const isFull = ministry.max_members && ministry.current_members 
              ? ministry.current_members >= ministry.max_members 
              : false;

            return (
              <Card key={ministry.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{ministry.name}</CardTitle>
                        {isMember && (
                          <Badge variant="secondary" className="mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Member
                          </Badge>
                        )}
                      </div>
                    </div>
                    {ministry.max_members && (
                      <Badge variant={isFull ? "destructive" : "outline"}>
                        {ministry.current_members || 0}/{ministry.max_members}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {ministry.description}
                  </CardDescription>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {ministry.meeting_schedule && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{ministry.meeting_schedule}</span>
                      </div>
                    )}
                    {ministry.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{ministry.location}</span>
                      </div>
                    )}
                  </div>

                  {ministry.requirements && ministry.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ministry.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full"
                    onClick={() => handleJoinMinistry(ministry.id)}
                    disabled={isMember || isFull || joiningMinistryId === ministry.id}
                  >
                    {joiningMinistryId === ministry.id ? "Joining..." : 
                     isMember ? "Already a Member" : 
                     isFull ? "Ministry Full" : "Join Ministry"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
