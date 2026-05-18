/**
 * Portal Access Management (IT-only)
 *
 * Lets IT assign or remove multi-department portal access for any staff
 * member without touching the database directly. Each toggle adds or
 * removes a row in `user_roles` for that user.
 */
import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

type RoleKey =
  | "founder" | "senior_pastor" | "admin" | "it" | "media" | "marketing"
  | "registration" | "accounts" | "sunday_school" | "teacher" | "pastor"
  | "user";

const PORTAL_ROLES: { value: RoleKey; label: string; description: string }[] = [
  { value: "founder", label: "Founder", description: "Top-level oversight" },
  { value: "senior_pastor", label: "Senior Pastor", description: "Senior leadership" },
  { value: "admin", label: "Admin", description: "Full system access" },
  { value: "it", label: "IT", description: "System administration" },
  { value: "media", label: "Media", description: "Content & media" },
  { value: "marketing", label: "Marketing", description: "Outreach & campaigns" },
  { value: "registration", label: "Registration", description: "Attendance & members" },
  { value: "accounts", label: "Accounts", description: "Finance & requisitions" },
  { value: "sunday_school", label: "Sunday School", description: "Children's ministry" },
  { value: "teacher", label: "Teacher", description: "Class management" },
  { value: "pastor", label: "Pastor", description: "Ministry oversight" },
];

interface StaffUser {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
  roles: RoleKey[];
}

const PortalAccessManagementInner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("user_id, first_name, last_name").order("first_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (pErr || rErr) {
      toast({ title: "Failed to load users", description: pErr?.message || rErr?.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const rolesByUser = new Map<string, RoleKey[]>();
    (roles || []).forEach((r: any) => {
      const list = rolesByUser.get(r.user_id) || [];
      list.push(r.role as RoleKey);
      rolesByUser.set(r.user_id, list);
    });

    const merged: StaffUser[] = (profiles || []).map((p: any) => ({
      user_id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      roles: rolesByUser.get(p.user_id) || [],
    }));

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => {
      const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return name.includes(q) || u.user_id.toLowerCase().includes(q);
    });
  }, [search, users]);

  const toggleRole = async (target: StaffUser, role: RoleKey, checked: boolean) => {
    const key = `${target.user_id}:${role}`;
    setSavingKey(key);

    // Prevent IT from removing their own 'it' role (lockout safety).
    if (!checked && role === "it" && target.user_id === user?.id) {
      toast({
        title: "Action blocked",
        description: "You can't remove your own IT access. Ask another IT user to do this.",
        variant: "destructive",
      });
      setSavingKey(null);
      return;
    }

    if (checked) {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: target.user_id, role });
      if (error) {
        toast({ title: "Failed to assign role", description: error.message, variant: "destructive" });
        setSavingKey(null);
        return;
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", target.user_id)
        .eq("role", role);
      if (error) {
        toast({ title: "Failed to remove role", description: error.message, variant: "destructive" });
        setSavingKey(null);
        return;
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.user_id !== target.user_id) return u;
      const next = checked
        ? Array.from(new Set([...u.roles, role]))
        : u.roles.filter(r => r !== role);
      return { ...u, roles: next };
    }));

    toast({
      title: checked ? "Portal access granted" : "Portal access removed",
      description: `${role.replace(/_/g, " ")} for ${target.first_name || "user"} ${target.last_name || ""}`.trim(),
    });
    setSavingKey(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Portal Access Management</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Assign or remove department portal access for staff. Changes take effect on the user's next page load.
        </p>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" /> Find a staff member
            </CardTitle>
            <CardDescription>Search by name or user ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              No users found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((u) => (
              <Card key={u.user_id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        {u.first_name || "Unnamed"} {u.last_name || ""}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs">{u.user_id}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? (
                        <Badge variant="outline">No roles</Badge>
                      ) : u.roles.map(r => (
                        <Badge key={r} variant="secondary" className="capitalize">
                          {r.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PORTAL_ROLES.map(role => {
                      const checked = u.roles.includes(role.value);
                      const key = `${u.user_id}:${role.value}`;
                      const saving = savingKey === key;
                      return (
                        <label
                          key={role.value}
                          className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                            checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                          } ${saving ? "opacity-60 pointer-events-none" : ""}`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggleRole(u, role.value, Boolean(v))}
                            disabled={saving}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

const PortalAccessManagement = () => (
  <AuthGuard requiredRole="it">
    <PortalAccessManagementInner />
  </AuthGuard>
);

export default PortalAccessManagement;
