import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Baby, 
  Shield, 
  Heart,
  Calendar,
  Clock,
  MapPin,
  User
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { usePrerequisiteGuard } from "@/hooks/usePrerequisiteCheck";

interface Ministry {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  meeting_schedule: string | null;
  location: string | null;
  leader_id: string | null;
  is_active: boolean;
  max_members: number | null;
  current_members: number;
}

const Ministries = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { hasAccess, checkAccess } = usePrerequisiteGuard("ministries");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMinistries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMinistry = async (ministryId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a ministry",
        variant: "destructive"
      });
      return;
    }

    if (!checkAccess()) {
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      
      // Check if already a member
      const { data: existing, error: checkError } = await supabase
        .from('ministry_members')
        .select('id')
        .eq('ministry_id', ministryId)
        .eq('user_id', user.data.user?.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        toast({
          title: "Already a Member",
          description: "You are already a member of this ministry",
          variant: "destructive"
        });
        return;
      }

      // Join the ministry
      const { error } = await supabase
        .from('ministry_members')
        .insert({
          ministry_id: ministryId,
          user_id: user.data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have successfully joined the ministry!"
      });

      // Refresh the ministries to update member counts
      fetchMinistries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getMinistryIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('youth') || lowercaseName.includes('young')) return Users;
    if (lowercaseName.includes('kids') || lowercaseName.includes('children')) return Baby;
    if (lowercaseName.includes('deliverance') || lowercaseName.includes('security')) return Shield;
    return Heart;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            MINISTRIES
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover your purpose and grow in faith through our specialized ministries. 
            Each ministry is designed to meet you where you are and help you take the next step in your spiritual journey.
          </p>
        </div>

        {/* Ministries */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading ministries...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {ministries.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 mb-4">No active ministries found.</p>
                  <p className="text-sm text-gray-500">Check back later for new ministry opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              ministries.map((ministry) => {
                const IconComponent = getMinistryIcon(ministry.name);
                
                return (
                  <Card key={ministry.id} className="bg-white/95 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/20 p-3 rounded-lg">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{ministry.name}</CardTitle>
                            <CardDescription className="text-lg mt-1">
                              {ministry.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button 
                            onClick={() => handleJoinMinistry(ministry.id)}
                            className="bg-primary hover:bg-primary/90 shrink-0"
                            disabled={ministry.max_members !== null && ministry.current_members >= ministry.max_members}
                          >
                            {ministry.max_members !== null && ministry.current_members >= ministry.max_members 
                              ? 'FULL' 
                              : 'JOIN MINISTRY'
                            }
                          </Button>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {ministry.current_members}
                              {ministry.max_members && ` / ${ministry.max_members}`} members
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {/* Ministry Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {ministry.meeting_schedule && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Schedule:</span>
                            <span className="text-sm text-gray-600">{ministry.meeting_schedule}</span>
                          </div>
                        )}
                        {ministry.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Location:</span>
                            <span className="text-sm text-gray-600">{ministry.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant={ministry.is_active ? "default" : "secondary"}>
                            {ministry.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>

                      {/* Requirements */}
                      {ministry.requirements && ministry.requirements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Requirements
                          </h4>
                          <ul className="space-y-2">
                            {ministry.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></div>
                                {requirement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Get Involved?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't see a ministry that fits your calling? We're always open to starting new ministries 
              based on the gifts and passions of our congregation. Contact us to discuss opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                CONTACT MINISTRY LEADER
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                SUGGEST NEW MINISTRY
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Ministries;