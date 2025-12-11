import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePrerequisiteGuard } from "@/hooks/usePrerequisiteCheck";
import { 
  Music, Camera, Laptop, Heart, Users, Shield, HandHelping, Mic,
  Clock, CheckCircle, AlertCircle
} from "lucide-react";

interface ServeDepartment {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: string[];
  time_commitment: string;
  is_visible: boolean;
}

interface MyApplication {
  department_id: string;
  status: string;
}

export const ApplyToServe = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasAccess, checkAccess } = usePrerequisiteGuard("Apply to Serve");
  const [departments, setDepartments] = useState<ServeDepartment[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
    if (user) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('serve_departments')
      .select('*')
      .eq('is_visible', true)
      .order('display_order');

    if (error) {
      toast({ title: "Error", description: "Failed to load departments", variant: "destructive" });
    } else {
      setDepartments(data || []);
    }
    setLoading(false);
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('serve_applications')
      .select('department_id, status')
      .eq('user_id', user.id);
    
    if (data) {
      setMyApplications(data);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Music, Camera, Laptop, Heart, Users, Shield, HandHelping, Mic
    };
    return icons[iconName] || Heart;
  };

  const handleDepartmentToggle = (departmentId: string) => {
    // Check if already applied
    const existingApp = myApplications.find(a => a.department_id === departmentId);
    if (existingApp) {
      toast({ 
        title: "Already Applied", 
        description: `You have already applied to this department (Status: ${existingApp.status})`,
        variant: "default" 
      });
      return;
    }

    setSelectedDepartments(prev => 
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!checkAccess()) return;
    if (selectedDepartments.length === 0) {
      toast({ title: "Select Departments", description: "Please select at least one department", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const applications = selectedDepartments.map(departmentId => ({
      user_id: user.id,
      department_id: departmentId,
      status: 'pending'
    }));

    const { error } = await supabase
      .from('serve_applications')
      .insert(applications);

    if (error) {
      toast({ title: "Error", description: "Failed to submit applications", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Your applications have been submitted for review" });
      setSelectedDepartments([]);
      fetchMyApplications();
    }
    setSubmitting(false);
  };

  const getApplicationStatus = (departmentId: string) => {
    return myApplications.find(a => a.department_id === departmentId);
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
        <h2 className="text-2xl font-bold text-foreground">Serve With Us</h2>
        <p className="text-muted-foreground mt-1">Select the departments you'd like to serve in</p>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No serve departments are currently available.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const Icon = getIconComponent(dept.icon);
              const application = getApplicationStatus(dept.id);
              const isSelected = selectedDepartments.includes(dept.id);
              const hasApplied = !!application;

              return (
                <Card 
                  key={dept.id}
                  className={`cursor-pointer transition-all ${
                    hasApplied 
                      ? 'border-muted bg-muted/30' 
                      : isSelected 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                  }`}
                  onClick={() => !hasApplied && handleDepartmentToggle(dept.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}>
                          <Icon className={`h-5 w-5 ${isSelected ? '' : 'text-primary'}`} />
                        </div>
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                      </div>
                      {hasApplied ? (
                        <Badge variant={application.status === 'approved' ? 'default' : 'secondary'}>
                          {application.status === 'approved' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Approved</>
                          ) : application.status === 'rejected' ? (
                            <><AlertCircle className="h-3 w-3 mr-1" />Rejected</>
                          ) : (
                            <>Pending</>
                          )}
                        </Badge>
                      ) : isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-sm line-clamp-2">
                      {dept.description}
                    </CardDescription>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{dept.time_commitment}</span>
                    </div>

                    {dept.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {dept.requirements.slice(0, 3).map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {dept.requirements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{dept.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedDepartments.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Selected: {selectedDepartments.length} department(s)</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDepartments.map(id => {
                        const dept = departments.find(d => d.id === id);
                        return dept && (
                          <Badge key={id} variant="secondary">{dept.name}</Badge>
                        );
                      })}
                    </div>
                  </div>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
