import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ClipboardList, 
  Users, 
  Sparkles, 
  Coffee, 
  Music, 
  Volume2, 
  Camera, 
  Crown, 
  FileText, 
  GraduationCap, 
  Heart 
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { usePrerequisiteGuard } from "@/hooks/usePrerequisiteCheck";

interface ServeDepartment {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: string[];
  time_commitment: string;
  is_visible: boolean;
}

const ServeWithUs = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { hasAccess, checkAccess } = usePrerequisiteGuard("serve departments");
  const [departments, setDepartments] = useState<ServeDepartment[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('serve_departments')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');

      if (error) throw error;
      setDepartments(data || []);
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

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      shield: Shield,
      clipboardList: ClipboardList,
      users: Users,
      sparkles: Sparkles,
      coffee: Coffee,
      music: Music,
      volume2: Volume2,
      camera: Camera,
      crown: Crown,
      fileText: FileText,
      graduationCap: GraduationCap,
      heart: Heart
    };
    return iconMap[iconName] || Users;
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply to serve",
        variant: "destructive"
      });
      return;
    }

    if (!checkAccess()) {
      return;
    }

    if (selectedDepartments.length === 0) {
      toast({
        title: "No Departments Selected",
        description: "Please select at least one department to serve in",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const user = await supabase.auth.getUser();
      
      // Create applications for each selected department
      const applications = selectedDepartments.map(departmentId => ({
        user_id: user.data.user?.id,
        department_id: departmentId
      }));

      const { error } = await supabase
        .from('serve_applications')
        .insert(applications);

      if (error) throw error;

      toast({
        title: "Applications Submitted!",
        description: `Your applications to ${selectedDepartments.length} department(s) have been submitted successfully. You will be contacted soon.`
      });

      setSelectedDepartments([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            SERVE WITH US
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find your place in ministry! Every member is a minister, and we have 
            opportunities for everyone to serve according to their gifts and calling.
          </p>
        </div>

        {/* Selection Instructions */}
        <Card className="max-w-4xl mx-auto mb-8 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Choose Your Ministry Areas</CardTitle>
            <CardDescription>
              Select the departments where you'd like to serve. You can choose multiple areas 
              that interest you, and we'll help you find the best fit.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Departments Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading departments...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {departments.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-white/95 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 mb-4">No serve departments available at this time.</p>
                    <p className="text-sm text-gray-500">Check back later for new serving opportunities.</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              departments.map((dept) => {
                const IconComponent = getIconComponent(dept.icon);
                const isSelected = selectedDepartments.includes(dept.id);
                
                return (
                  <Card 
                    key={dept.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'bg-white/95 backdrop-blur-sm hover:bg-white'
                    }`}
                    onClick={() => handleDepartmentToggle(dept.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg">{dept.name}</CardTitle>
                        </div>
                        {isSelected && <Badge>Selected</Badge>}
                      </div>
                      <CardDescription className="text-sm">
                        {dept.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dept.requirements && dept.requirements.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {dept.requirements.map((req, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {dept.time_commitment && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Time Commitment:</h4>
                            <p className="text-xs text-gray-600">{dept.time_commitment}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Submit Section */}
        {selectedDepartments.length > 0 && (
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Ready to Serve?
                </h3>
                <p className="text-gray-600 mb-6">
                  You've selected {selectedDepartments.length} department{selectedDepartments.length > 1 ? 's' : ''}. 
                  We'll contact you with more information about getting started.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {selectedDepartments.map(deptId => {
                    const dept = departments.find(d => d.id === deptId);
                    return (
                      <Badge key={deptId} variant="secondary" className="text-sm">
                        {dept?.name}
                      </Badge>
                    );
                  })}
                </div>
                <Button 
                  onClick={handleSubmit} 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={submitting || !isAuthenticated}
                >
                  {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServeWithUs;