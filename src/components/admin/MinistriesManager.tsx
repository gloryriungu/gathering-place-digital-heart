import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Eye, UserCheck, UserX, Clock } from "lucide-react";

interface Ministry {
  id: string;
  name: string;
  description: string;
  leader_id: string | null;
  requirements: string[];
  meeting_schedule: string;
  location: string;
  is_active: boolean;
  max_members: number | null;
  current_members: number;
  created_at: string;
}

interface MinistryApplication {
  id: string;
  user_id: string;
  ministry_interests: string[];
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  application_date: string;
}

export const MinistriesManager = () => {
  const { toast } = useToast();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [applications, setApplications] = useState<MinistryApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMinistry, setNewMinistry] = useState({
    name: "",
    description: "",
    requirements: "",
    meeting_schedule: "",
    location: "",
    max_members: ""
  });

  useEffect(() => {
    fetchMinistries();
    fetchApplications();
  }, []);

  const fetchMinistries = async () => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMinistries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('join_family_applications')
        .select('*')
        .not('ministry_interests', 'is', null)
        .order('application_date', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
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

  const createMinistry = async () => {
    try {
      const requirements = newMinistry.requirements.split(',').map(req => req.trim()).filter(req => req);
      
      const { error } = await supabase
        .from('ministries')
        .insert({
          name: newMinistry.name,
          description: newMinistry.description,
          requirements,
          meeting_schedule: newMinistry.meeting_schedule,
          location: newMinistry.location,
          max_members: newMinistry.max_members ? parseInt(newMinistry.max_members) : null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ministry created successfully!"
      });

      setDialogOpen(false);
      setNewMinistry({
        name: "",
        description: "",
        requirements: "",
        meeting_schedule: "",
        location: "",
        max_members: ""
      });
      fetchMinistries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const approveApplication = async (applicationId: string, applicantId: string, ministryId: string) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('join_family_applications')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Add to ministry_members if ministry specified
      if (ministryId) {
        const { error: memberError } = await supabase
          .from('ministry_members')
          .insert({
            ministry_id: ministryId,
            user_id: applicantId
          });

        if (memberError) throw memberError;
      }

      toast({
        title: "Success",
        description: "Application approved and member added to ministry!"
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

  const rejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('join_family_applications')
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ministries Management</h2>
          <p className="text-muted-foreground">Manage church ministries and member applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Ministry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Ministry</DialogTitle>
              <DialogDescription>
                Add a new ministry to your church
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ministry Name</Label>
                <Input
                  id="name"
                  value={newMinistry.name}
                  onChange={(e) => setNewMinistry(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMinistry.description}
                  onChange={(e) => setNewMinistry(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="requirements">Requirements (comma separated)</Label>
                <Input
                  id="requirements"
                  placeholder="e.g. Baptized, Training completed, 18+ years old"
                  value={newMinistry.requirements}
                  onChange={(e) => setNewMinistry(prev => ({ ...prev, requirements: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule">Meeting Schedule</Label>
                  <Input
                    id="schedule"
                    placeholder="e.g. Sundays 9 AM"
                    value={newMinistry.meeting_schedule}
                    onChange={(e) => setNewMinistry(prev => ({ ...prev, meeting_schedule: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Youth Hall"
                    value={newMinistry.location}
                    onChange={(e) => setNewMinistry(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxMembers">Max Members (optional)</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  value={newMinistry.max_members}
                  onChange={(e) => setNewMinistry(prev => ({ ...prev, max_members: e.target.value }))}
                />
              </div>
              <Button onClick={createMinistry} className="w-full">
                Create Ministry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="ministries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ministries">Active Ministries</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="ministries">
          <Card>
            <CardHeader>
              <CardTitle>Active Ministries</CardTitle>
              <CardDescription>Manage your church ministries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ministry</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ministries.map((ministry) => (
                    <TableRow key={ministry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ministry.name}</div>
                          <div className="text-sm text-muted-foreground">{ministry.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {ministry.current_members}{ministry.max_members ? `/${ministry.max_members}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>{ministry.meeting_schedule}</TableCell>
                      <TableCell>{ministry.location}</TableCell>
                      <TableCell>
                        <Badge variant={ministry.is_active ? "default" : "secondary"}>
                          {ministry.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Ministry Applications</CardTitle>
              <CardDescription>Review applications from people wanting to join ministries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Ministry Interests</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="font-medium">{application.first_name} {application.last_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {application.ministry_interests?.map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveApplication(application.id, application.user_id, '')}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectApplication(application.id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
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
        </TabsContent>
      </Tabs>
    </div>
  );
};