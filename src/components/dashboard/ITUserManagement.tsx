import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Shield, RefreshCw, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  county: string;
  created_at: string;
  updated_at: string;
  user_roles?: Array<{
    role: string;
  }>;
}

interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_visible: boolean;
}

export const ITUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const roleOptions = [
    { value: "user", label: "User", description: "General access" },
    { value: "admin", label: "Admin", description: "Full system access" },
    { value: "pastor", label: "Pastor", description: "Content management & ministry oversight" },
    { value: "senior_pastor", label: "Senior Pastor", description: "Senior leadership & church oversight" },
    { value: "founder", label: "Founder", description: "Highest level access & strategic decisions" },
    { value: "registration", label: "Registration", description: "Attendance tracking" },
    { value: "accounts", label: "Accounts", description: "Financial management & requisitions" },
    { value: "sunday_school", label: "Sunday School", description: "Manage children's ministry" },
    { value: "teacher", label: "Teacher", description: "Class management & attendance" },
    { value: "it", label: "IT", description: "System administration & support" },
    { value: "media", label: "Media", description: "Content and media management" },
    { value: "marketing", label: "Marketing", description: "Social media, testimonials, newsletters & outreach" }
  ];

  // System logging function
  const logSystemEvent = async (
    action: string,
    details: string,
    level: 'info' | 'warning' | 'error' = 'info',
    metadata?: any
  ) => {
    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from('system_logs')
        .insert({
          log_level: level,
          category: 'User Management',
          action,
          details,
          user_id: user.data.user?.id,
          metadata,
          ip_address: null // Will be handled by database if needed
        });

      if (error) {
        console.error('Failed to log system event:', error);
      }
    } catch (error) {
      console.error('Error logging system event:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        await logSystemEvent(
          'fetch_user_profiles_failed',
          `Failed to fetch user profiles: ${profilesError.message}`,
          'error',
          { error: profilesError }
        );
        toast({
          title: "Error",
          description: "Failed to fetch user profiles",
          variant: "destructive",
        });
        return;
      }

      // Then get user roles for each profile
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        await logSystemEvent(
          'fetch_user_roles_failed',
          `Failed to fetch user roles: ${rolesError.message}`,
          'error',
          { error: rolesError }
        );
        toast({
          title: "Error",
          description: "Failed to fetch user roles",
          variant: "destructive",
        });
        return;
      }

      // Combine the data
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.user_id) || []
      })) || [];

      setUsers(usersWithRoles);
      await logSystemEvent(
        'user_data_fetched',
        `Successfully fetched ${usersWithRoles.length} user profiles`,
        'info',
        { user_count: usersWithRoles.length }
      );
    } catch (error: any) {
      await logSystemEvent(
        'fetch_users_error',
        `Unexpected error while fetching users: ${error.message}`,
        'error',
        { error: error.message }
      );
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data: depts, error } = await supabase
        .from("serve_departments")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) {
        await logSystemEvent(
          'fetch_departments_failed',
          `Failed to fetch departments: ${error.message}`,
          'error',
          { error }
        );
        return;
      }

      setDepartments(depts || []);
      await logSystemEvent(
        'departments_fetched',
        `Successfully fetched ${depts?.length || 0} departments`,
        'info',
        { department_count: depts?.length || 0 }
      );
    } catch (error: any) {
      await logSystemEvent(
        'fetch_departments_error',
        `Unexpected error while fetching departments: ${error.message}`,
        'error',
        { error: error.message }
      );
    }
  };

  const updateUserRole = async (userId: string, newRole: string, departments: string[] = []) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const currentUser = await supabase.auth.getUser();
      
      // Get user details for logging
      const targetUser = users.find(u => u.user_id === userId);
      const userName = targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : 'Unknown User';
      
      // First remove existing roles
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        await logSystemEvent(
          'role_update_failed',
          `Failed to remove existing roles for user ${userName}: ${deleteError.message}`,
          'error',
          { 
            target_user_id: userId,
            target_user_name: userName,
            admin_user_id: currentUser.data.user?.id,
            error: deleteError 
          }
        );
        throw deleteError;
      }

      // Then add the new role with proper type casting
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: userId, 
          role: newRole as "user" | "admin" | "pastor" | "senior_pastor" | "founder" | "registration" | "accounts" | "sunday_school" | "teacher" | "it" | "media" | "marketing"
        });

      if (insertError) {
        await logSystemEvent(
          'role_update_failed',
          `Failed to assign new role '${newRole}' to user ${userName}: ${insertError.message}`,
          'error',
          { 
            target_user_id: userId,
            target_user_name: userName,
            new_role: newRole,
            departments: departments,
            admin_user_id: currentUser.data.user?.id,
            error: insertError 
          }
        );
        throw insertError;
      }

      // Log successful role change
      await logSystemEvent(
        'user_role_updated',
        `Successfully updated role for user ${userName} to '${newRole}'${departments.length > 0 ? ` with departments: ${departments.join(', ')}` : ''}`,
        'info',
        { 
          target_user_id: userId,
          target_user_name: userName,
          new_role: newRole,
          departments: departments,
          admin_user_id: currentUser.data.user?.id
        }
      );

      toast({
        title: "Success",
        description: `User role updated successfully to ${newRole}`,
      });
      
      fetchUsers(); // Refresh the list
      
    } catch (error: any) {
      await logSystemEvent(
        'role_update_critical_error',
        `Critical error during role update for user ID ${userId}: ${error.message}`,
        'error',
        { 
          target_user_id: userId,
          error: error.message,
          stack: error.stack
        }
      );
      
      toast({
        title: "Error",
        description: "Failed to update user role. This has been logged for IT review.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const getUserRoles = (user: UserProfile) => {
    return user.user_roles?.map(role => role.role) || ["user"];
  };

  const getStatusBadge = (roles: string[]) => {
    const primaryRole = roles[0] || "user";
    
    const roleColors: { [key: string]: string } = {
      founder: "bg-gold-500 hover:bg-gold-600",
      senior_pastor: "bg-violet-500 hover:bg-violet-600",
      admin: "bg-red-500 hover:bg-red-600",
      pastor: "bg-purple-500 hover:bg-purple-600", 
      it: "bg-blue-500 hover:bg-blue-600",
      accounts: "bg-green-500 hover:bg-green-600",
      registration: "bg-yellow-500 hover:bg-yellow-600",
      sunday_school: "bg-pink-500 hover:bg-pink-600",
      teacher: "bg-indigo-500 hover:bg-indigo-600",
      media: "bg-orange-500 hover:bg-orange-600",
      marketing: "bg-teal-500 hover:bg-teal-600",
      user: "bg-gray-500 hover:bg-gray-600"
    };

    return (
      <Badge className={`${roleColors[primaryRole]} text-white`}>
        {primaryRole.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts and assign departmental access
          </p>
        </div>
        <Button onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="role-management" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>
                View and manage all users who have joined the church family
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Loading users...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const roles = getUserRoles(user);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.county}</div>
                              <div className="text-muted-foreground text-xs">
                                {user.address}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(roles)}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     setSelectedUserId(user.user_id);
                                     setSelectedRole(roles[0] || "user");
                                     setSelectedDepartments([]);
                                   }}
                                 >
                                   <Briefcase className="h-4 w-4 mr-1" />
                                   Change Role
                                 </Button>
                              </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                 <DialogHeader>
                                   <DialogTitle>Update User Role & Department Access</DialogTitle>
                                   <DialogDescription>
                                     Change the role and department access for {user.first_name} {user.last_name}
                                   </DialogDescription>
                                 </DialogHeader>
                                 <div className="space-y-6">
                                   <div className="space-y-2">
                                     <Label>Select New Role</Label>
                                     <Select value={selectedRole} onValueChange={setSelectedRole}>
                                       <SelectTrigger>
                                         <SelectValue placeholder="Select a role" />
                                       </SelectTrigger>
                                       <SelectContent>
                                         {roleOptions.map((role) => (
                                           <SelectItem key={role.value} value={role.value}>
                                             <div>
                                               <div className="font-medium">{role.label}</div>
                                               <div className="text-sm text-muted-foreground">
                                                 {role.description}
                                               </div>
                                             </div>
                                           </SelectItem>
                                         ))}
                                       </SelectContent>
                                     </Select>
                                   </div>

                                   {departments.length > 0 && (
                                     <div className="space-y-3">
                                       <div className="flex items-center gap-2">
                                         <Building2 className="h-4 w-4" />
                                         <Label>Department Access (Optional)</Label>
                                       </div>
                                       <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                                         {departments.map((dept) => (
                                           <div key={dept.id} className="flex items-center space-x-2 p-2 border rounded">
                                             <Checkbox
                                               id={`dept-${dept.id}`}
                                               checked={selectedDepartments.includes(dept.id)}
                                               onCheckedChange={(checked) => {
                                                 if (checked) {
                                                   setSelectedDepartments(prev => [...prev, dept.id]);
                                                 } else {
                                                   setSelectedDepartments(prev => prev.filter(id => id !== dept.id));
                                                 }
                                               }}
                                             />
                                             <label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer">
                                               <div className="font-medium">{dept.name}</div>
                                               <div className="text-xs text-muted-foreground">{dept.description}</div>
                                             </label>
                                           </div>
                                         ))}
                                       </div>
                                       <p className="text-xs text-muted-foreground">
                                         Select departments this user should have access to manage or coordinate.
                                       </p>
                                     </div>
                                   )}

                                   <div className="flex gap-2">
                                     <Button
                                       onClick={() => updateUserRole(selectedUserId, selectedRole, selectedDepartments)}
                                       className="flex-1"
                                       disabled={isUpdating}
                                     >
                                       {isUpdating ? "Updating..." : "Update Role & Access"}
                                     </Button>
                                   </div>
                                 </div>
                               </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role-management" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roleOptions.map((role) => (
              <Card key={role.value}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{role.label}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(user => 
                      getUserRoles(user).includes(role.value)
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    active users
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};