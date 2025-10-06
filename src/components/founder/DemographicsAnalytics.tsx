import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, MapPin, Briefcase } from "lucide-react";
import { LocationAnalytics } from "./LocationAnalytics";
import { OccupationAnalytics } from "./OccupationAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DemographicsAnalytics = () => {
  const [timeRange, setTimeRange] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [occupationData, setOccupationData] = useState<any[]>([]);
  const [departmentCorrelation, setDepartmentCorrelation] = useState<any[]>([]);

  useEffect(() => {
    fetchDemographicsData();
  }, [timeRange, status]);

  const fetchDemographicsData = async () => {
    setLoading(true);
    try {
      // Build date filter
      let dateFilter = null;
      if (timeRange !== "all") {
        const months = parseInt(timeRange);
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        dateFilter = date.toISOString();
      }

      // Fetch applications with filters
      let query = supabase
        .from("join_family_applications")
        .select("county, occupation, status, application_date");

      if (dateFilter) {
        query = query.gte("application_date", dateFilter);
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data: applications, error } = await query;

      if (error) throw error;

      // Process location data
      const countyCount: Record<string, number> = {};
      const occupationCount: Record<string, number> = {};

      applications?.forEach((app) => {
        if (app.county) {
          countyCount[app.county] = (countyCount[app.county] || 0) + 1;
        }
        if (app.occupation) {
          occupationCount[app.occupation] = (occupationCount[app.occupation] || 0) + 1;
        }
      });

      // Convert to array format with percentages
      const totalCounty = Object.values(countyCount).reduce((sum, count) => sum + count, 0);
      const locationDataArray = Object.entries(countyCount)
        .map(([county, count]) => ({
          county,
          count,
          percentage: (count / totalCounty) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      const totalOccupation = Object.values(occupationCount).reduce((sum, count) => sum + count, 0);
      const occupationDataArray = Object.entries(occupationCount)
        .map(([occupation, count]) => ({
          occupation,
          count,
          percentage: (count / totalOccupation) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      setLocationData(locationDataArray);
      setOccupationData(occupationDataArray);

      // Fetch department correlation
      const { data: serveApps } = await supabase
        .from("serve_applications")
        .select("user_id, department_id");

      if (serveApps) {
        const correlation: Record<string, Record<string, number>> = {};
        
        for (const app of serveApps) {
          const userApp = applications?.find(a => a.occupation);
          if (userApp?.occupation) {
            if (!correlation[userApp.occupation]) {
              correlation[userApp.occupation] = {};
            }
            correlation[userApp.occupation][app.department_id] = 
              (correlation[userApp.occupation][app.department_id] || 0) + 1;
          }
        }

        const correlationArray = Object.entries(correlation).map(([occupation, depts]) => {
          const topDept = Object.entries(depts).sort((a, b) => b[1] - a[1])[0];
          return {
            occupation,
            department: topDept[0],
            count: topDept[1],
          };
        }).slice(0, 10);

        setDepartmentCorrelation(correlationArray);
      }

    } catch (error: any) {
      console.error("Error fetching demographics:", error);
      toast.error("Failed to load demographics data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      "Location Data",
      "County,Count,Percentage",
      ...locationData.map(d => `${d.county},${d.count},${d.percentage.toFixed(2)}`),
      "",
      "Occupation Data",
      "Occupation,Count,Percentage",
      ...occupationData.map(d => `${d.occupation},${d.count},${d.percentage.toFixed(2)}`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demographics-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="border-2 border-black">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-black">DEMOGRAPHICS ANALYTICS</CardTitle>
              <p className="text-gray-600 mt-1">Member distribution by location and occupation</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="3">Last 3 Months</SelectItem>
                  <SelectItem value="6">Last 6 Months</SelectItem>
                  <SelectItem value="12">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportData} className="font-bold">
                <Download className="h-4 w-4 mr-2" />
                EXPORT
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="location" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="location" className="font-bold">
            <MapPin className="h-4 w-4 mr-2" />
            LOCATION
          </TabsTrigger>
          <TabsTrigger value="occupation" className="font-bold">
            <Briefcase className="h-4 w-4 mr-2" />
            OCCUPATION
          </TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="space-y-6">
          <LocationAnalytics data={locationData} loading={loading} />
        </TabsContent>

        <TabsContent value="occupation" className="space-y-6">
          <OccupationAnalytics 
            data={occupationData} 
            departmentCorrelation={departmentCorrelation}
            loading={loading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
