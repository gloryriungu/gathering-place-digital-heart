import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, TrendingUp, Users, DollarSign, FileText, BarChart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Report = Database['public']['Tables']['reports']['Row'];

export const ReportsOverview = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "attendance": return <Users className="h-5 w-5" />;
      case "financial": return <DollarSign className="h-5 w-5" />;
      case "membership": return <TrendingUp className="h-5 w-5" />;
      case "analytics": return <BarChart className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>;
      case "generating":
        return <Badge variant="secondary">Generating...</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const generateReport = async (type: string, period: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reports')
        .insert({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          description: `${period.charAt(0).toUpperCase() + period.slice(1)} ${type} report`,
          type,
          period,
          status: 'generating',
          generated_by: user.id
        });

      if (error) throw error;
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const downloadReport = (reportId: string) => {
    console.log(`Downloading report ${reportId}`);
    // This would download the actual report file
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports Overview</h2>
          <p className="text-muted-foreground">Generate and manage church reports</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready to Download</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'ready').length}</p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Generating</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'generating').length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading reports...</p>
                ) : reports.length === 0 ? (
                  <p className="text-muted-foreground">No reports available</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getReportIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(report.status)}
                        {report.status === 'ready' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadReport(report.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create custom reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full"
                onClick={() => generateReport(selectedType, selectedPeriod)}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Attendance Summary
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Financial Overview
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Growth Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Event Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};