import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, DollarSign, FileText, BookOpen } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const QuickActionsCard = () => {
  const { userRole } = useAuth();

  const handleRecordAttendance = async () => {
    try {
      // Get current user's member record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!member) {
        toast.error("Member record not found");
        return;
      }

      // Check if attendance already recorded today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAttendance } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('member_id', member.id)
        .eq('service_date', today)
        .single();

      if (existingAttendance) {
        toast.info("Attendance already recorded for today");
        return;
      }

      // Record attendance
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          member_id: member.id,
          service_date: today,
          service_type: 'sunday_service'
        });

      if (error) throw error;
      toast.success("Attendance recorded successfully!");
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error("Failed to record attendance");
    }
  };

  const handleAddContribution = async () => {
    // For now, show a placeholder message
    toast.info("Contribution form coming soon!");
  };

  const handleGenerateReport = async () => {
    if (!['it', 'admin', 'accounts', 'registration'].includes(userRole || '')) {
      toast.error("You don't have permission to generate reports");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reports')
        .insert({
          title: 'Quick Dashboard Report',
          description: 'Quick report generated from dashboard',
          type: 'general',
          period: 'current',
          status: 'generating',
          generated_by: user.id
        });

      if (error) throw error;
      toast.success("Report generation started!");
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    }
  };

  const handleViewDirectory = async () => {
    toast.info("Member directory coming soon!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleRecordAttendance}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Record Today's Attendance
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleAddContribution}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Add Contribution
        </Button>
        
        {['it', 'admin', 'accounts', 'registration'].includes(userRole || '') && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleGenerateReport}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleViewDirectory}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          View Member Directory
        </Button>
      </CardContent>
    </Card>
  );
};