import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, Clock, Users, Shield, Mic, Camera } from "lucide-react";

interface ServeApplication {
  id: string;
  user_id: string;
  department_id: string;
  application_date: string;
  status: string;
  notes: string | null;
}

interface JoinFamilyApplication {
  id: string;
  user_id: string;
  volunteer_interests: string[];
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  application_date: string;
}

const departmentIcons = {
  security: Shield,
  registration: Users,
  media: Camera,
  sound: Mic,
  default: Users
};

export const ServeApplicationsManager = () => {
  const { toast } = useToast();
  const [serveApplications, setServeApplications] = useState<ServeApplication[]>([]);
  const [familyApplications, setFamilyApplications] = useState<JoinFamilyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Fetch direct serve applications
      const { data: serveData, error: serveError } = await supabase
        .from('serve_applications')
        .select('*')
        .order('application_date', { ascending: false });

      if (serveError) throw serveError;

      // Fetch family applications with volunteer interests
      const { data: familyData, error: familyError } = await supabase
        .from('join_family_applications')
        .select('*')
        .not('volunteer_interests', 'is', null)
        .order('application_date', { ascending: false });

      if (familyError) throw familyError;

      setServeApplications(serveData || []);
      setFamilyApplications(familyData || []);
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

  const approveApplication = async (applicationId: string, applicantId: string, departmentId: string, isDirectApplication = true) => {
    try {
      if (isDirectApplication) {
        const { error } = await supabase
          .from('serve_applications')
          .update({ 
            status: 'approved',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (error) throw error;
      } else {
        // For family applications, create a serve application and approve it
        const { error: createError } = await supabase
          .from('serve_applications')
          .insert({
            user_id: applicantId,
            department_id: departmentId,
            status: 'approved',
            reviewed_at: new Date().toISOString()
          });

        if (createError) throw createError;

        // Update family application status
        const { error: updateError } = await supabase
          .from('join_family_applications')
          .update({ 
            status: 'approved',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (updateError) throw updateError;
      }

      // Add user to the department role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: applicantId,
          role: departmentId as any
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      toast({
        title: "Success",
        description: "Application approved and user added to department!"
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const rejectApplication = async (applicationId: string, isDirectApplication = true) => {
    try {
      const table = isDirectApplication ? 'serve_applications' : 'join_family_applications';
      
      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application rejected"
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDepartmentIcon = (departmentId: string) => {
    return departmentIcons[departmentId as keyof typeof departmentIcons] || departmentIcons.default;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Serve Applications</h2>
        <p className="text-muted-foreground">Review and manage applications to join serve departments</p>
      </div>

      {/* Direct Serve Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Department Applications</CardTitle>
          <CardDescription>Applications made directly to serve departments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serveApplications.map((application) => {
                const Icon = getDepartmentIcon(application.department_id);
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">
                        {application.user_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{application.department_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Contact info</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        application.status === 'approved' ? 'default' : 
                        application.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(application.application_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {application.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveApplication(application.id, application.user_id, application.department_id, true)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectApplication(application.id, true)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Family Applications with Volunteer Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Family Applications (Volunteer Interests)</CardTitle>
          <CardDescription>People who expressed volunteer interests in their join family application</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Volunteer Interests</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.first_name} {application.last_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {application.volunteer_interests?.map((interest) => {
                        const Icon = getDepartmentIcon(interest);
                        return (
                          <Badge key={interest} variant="outline" className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {interest}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{application.email}</div>
                      <div className="text-muted-foreground">{application.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      application.status === 'approved' ? 'default' : 
                      application.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(application.application_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {application.status === 'pending' && (
                      <div className="space-y-1">
                        {application.volunteer_interests?.map((interest) => (
                          <div key={interest} className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveApplication(application.id, application.user_id, interest, false)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve for {interest}
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectApplication(application.id, false)}
                          className="w-full mt-2"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Reject All
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};