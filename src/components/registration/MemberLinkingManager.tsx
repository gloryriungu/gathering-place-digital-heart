import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link2, Users, UserCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { findDuplicates } from "@/utils/duplicateDetection";

interface UnlinkedMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string;
  created_at: string;
  suggested_matches?: any[];
}

export const MemberLinkingManager = () => {
  const [unlinkedMembers, setUnlinkedMembers] = useState<UnlinkedMember[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch members without user_id
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .is('user_id', null)
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;

      // Fetch registered users without member records
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, phone')
        .not('user_id', 'in', `(SELECT user_id FROM members WHERE user_id IS NOT NULL)`);

      if (profilesError) throw profilesError;

      setRegisteredUsers(profilesData || []);

      // Find suggested matches for each unlinked member
      const membersWithMatches = (membersData || []).map(member => {
        const matches = findDuplicates(member, [], profilesData || []);
        return {
          ...member,
          suggested_matches: matches.filter(m => m.confidence >= 70)
        };
      });

      setUnlinkedMembers(membersWithMatches);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load linking data');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (memberId: string, userId: string, memberName: string, userName: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({
          user_id: userId,
          source: 'conversion',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`Successfully linked ${memberName} to ${userName}`);
      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Error linking member:', error);
      toast.error('Failed to link member');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const membersWithSuggestions = unlinkedMembers.filter(m => m.suggested_matches && m.suggested_matches.length > 0);
  const membersWithoutSuggestions = unlinkedMembers.filter(m => !m.suggested_matches || m.suggested_matches.length === 0);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Manual Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlinkedMembers.length}</div>
            <p className="text-xs text-muted-foreground">Without user accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredUsers.length}</div>
            <p className="text-xs text-muted-foreground">Without member records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Suggested Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersWithSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">High confidence matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Matches */}
      {membersWithSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Suggested Matches
            </CardTitle>
            <CardDescription>
              High confidence matches between manual members and registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manual Member</TableHead>
                    <TableHead>Registered User</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Match Reason</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersWithSuggestions.map((member) => {
                    const topMatch = member.suggested_matches![0];
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.phone || member.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {topMatch.first_name} {topMatch.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {topMatch.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              topMatch.confidence >= 95
                                ? 'bg-green-100 text-green-800'
                                : topMatch.confidence >= 85
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {topMatch.confidence}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {topMatch.matchReasons[0]}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleLink(
                                member.id,
                                topMatch.id,
                                `${member.first_name} ${member.last_name}`,
                                `${topMatch.first_name} ${topMatch.last_name}`
                              )
                            }
                            disabled={processing}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Link
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Members Without Suggestions */}
      {membersWithoutSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manual Members Without Matches
            </CardTitle>
            <CardDescription>
              These members don't have any suggested matches with registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                These members will need to manually register or be linked when they sign up
              </AlertDescription>
            </Alert>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersWithoutSuggestions.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.phone || member.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.source}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {unlinkedMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold mb-2">All Members Linked</h3>
            <p className="text-sm text-muted-foreground text-center">
              All manual members have been linked to user accounts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
