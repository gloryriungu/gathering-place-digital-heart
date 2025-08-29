import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, Shield, RefreshCw, CheckCircle, XCircle, Briefcase } from "lucide-react";
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

export const ITUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { toast } = useToast();

  const roleOptions = [
    { value: "user", label: "User", description: "General access" },
    { value: "admin", label: "Admin", description: "Full system access" },
    { value: "pastor", label: "Pastor", description: "Content management & ministry oversight" },
    { value: "registration", label: "Registration", description: "Attendance tracking" },
    { value: "accounts", label: "Accounts", description: "Financial management & requisitions" },
    { value: "sunday_school", label: "Sunday School", description: "Manage children's ministry" },
    { value: "teacher", label: "Teacher", description: "Class management & attendance" },
    { value: "it", label: "IT", description: "System administration & support" }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
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
    } catch (error) {
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // First remove existing roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Then add the new role with proper type casting
      const { error } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: userId, 
          role: newRole as "user" | "admin" | "pastor" | "registration" | "accounts" | "sunday_school" | "teacher" | "it"
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserRoles = (user: UserProfile) => {
    return user.user_roles?.map(role => role.role) || ["user"];
  };

  const getStatusBadge = (roles: string[]) => {
    const primaryRole = roles[0] || "user";
    
    const roleColors: { [key: string]: string } = {
      admin: "bg-red-500 hover:bg-red-600",
      pastor: "bg-purple-500 hover:bg-purple-600", 
      it: "bg-blue-500 hover:bg-blue-600",
      accounts: "bg-green-500 hover:bg-green-600",
      registration: "bg-yellow-500 hover:bg-yellow-600",
      sunday_school: "bg-pink-500 hover:bg-pink-600",
      teacher: "bg-indigo-500 hover:bg-indigo-600",
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
                                  }}
                                >
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  Change Role
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update User Role</DialogTitle>
                                  <DialogDescription>
                                    Change the role for {user.first_name} {user.last_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
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
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateUserRole(selectedUserId, selectedRole)}
                                      className="flex-1"
                                    >
                                      Update Role
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