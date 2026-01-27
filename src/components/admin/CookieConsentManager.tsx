import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { 
  BarChart3, 
  Settings, 
  FileText, 
  Download, 
  RefreshCw,
  Cookie,
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ConsentRecord {
  id: string;
  user_id: string | null;
  session_id: string;
  consent_given: boolean;
  consent_type: string;
  analytics_consent: boolean;
  marketing_consent: boolean;
  functional_consent: boolean;
  created_at: string;
  user_agent: string | null;
}

interface CookieSettings {
  id: string;
  popup_title: string;
  popup_description: string;
  policy_text: string;
  show_detailed_options: boolean;
  button_accept_text: string;
  button_reject_text: string;
  button_customize_text: string;
  is_active: boolean;
}

interface Analytics {
  totalConsents: number;
  acceptAll: number;
  rejectAll: number;
  customized: number;
  essentialOnly: number;
  analyticsConsent: number;
  marketingConsent: number;
  functionalConsent: number;
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

export const CookieConsentManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalConsents: 0,
    acceptAll: 0,
    rejectAll: 0,
    customized: 0,
    essentialOnly: 0,
    analyticsConsent: 0,
    marketingConsent: 0,
    functionalConsent: 0,
  });
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchConsents(), fetchSettings()]);
    setLoading(false);
  };

  const fetchConsents = async () => {
    try {
      const { data, error } = await supabase
        .from("cookie_consents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setConsents(data || []);
      calculateAnalytics(data || []);
    } catch (err) {
      console.error("Error fetching consents:", err);
      toast({
        title: "Error",
        description: "Failed to fetch consent records",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("cookie_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const calculateAnalytics = (data: ConsentRecord[]) => {
    const stats: Analytics = {
      totalConsents: data.length,
      acceptAll: data.filter((c) => c.consent_type === "all").length,
      rejectAll: data.filter((c) => c.consent_type === "rejected").length,
      customized: data.filter((c) => c.consent_type === "custom").length,
      essentialOnly: data.filter((c) => c.consent_type === "essential").length,
      analyticsConsent: data.filter((c) => c.analytics_consent).length,
      marketingConsent: data.filter((c) => c.marketing_consent).length,
      functionalConsent: data.filter((c) => c.functional_consent).length,
    };
    setAnalytics(stats);
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("cookie_settings")
        .update({
          ...settings,
          updated_by: user?.id,
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Cookie consent settings have been updated successfully.",
      });
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Session ID",
      "User ID",
      "Consent Type",
      "Analytics",
      "Marketing",
      "Functional",
    ];
    
    const rows = consents.map((c) => [
      format(new Date(c.created_at), "yyyy-MM-dd HH:mm:ss"),
      c.session_id,
      c.user_id || "Anonymous",
      c.consent_type,
      c.analytics_consent ? "Yes" : "No",
      c.marketing_consent ? "Yes" : "No",
      c.functional_consent ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cookie-consents-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Cookie consent data has been exported to CSV.",
    });
  };

  const filteredConsents = consents.filter((c) => {
    const matchesFilter = filterType === "all" || c.consent_type === filterType;
    const matchesSearch = 
      c.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.user_id && c.user_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pieData = [
    { name: "Accept All", value: analytics.acceptAll },
    { name: "Reject All", value: analytics.rejectAll },
    { name: "Customized", value: analytics.customized },
    { name: "Essential Only", value: analytics.essentialOnly },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "Analytics", consent: analytics.analyticsConsent, total: analytics.totalConsents },
    { name: "Marketing", consent: analytics.marketingConsent, total: analytics.totalConsents },
    { name: "Functional", consent: analytics.functionalConsent, total: analytics.totalConsents },
  ];

  const getConsentBadge = (type: string) => {
    switch (type) {
      case "all":
        return <Badge className="bg-green-600">Accept All</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "custom":
        return <Badge className="bg-blue-600">Customized</Badge>;
      case "essential":
        return <Badge variant="secondary">Essential Only</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cookie className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Cookie Consent Manager</h2>
            <p className="text-muted-foreground">
              Manage cookie preferences and view consent analytics
            </p>
          </div>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Records
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Consents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{analytics.totalConsents}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Accept Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold">
                    {analytics.totalConsents > 0
                      ? Math.round((analytics.acceptAll / analytics.totalConsents) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reject Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold">
                    {analytics.totalConsents > 0
                      ? Math.round((analytics.rejectAll / analytics.totalConsents) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{analytics.customized}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Consent Distribution</CardTitle>
                <CardDescription>Breakdown by consent type</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No consent data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookie Category Consent</CardTitle>
                <CardDescription>Users who enabled each category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consent" fill="#22c55e" name="Consented" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Consent Records</CardTitle>
                  <CardDescription>
                    View and export all cookie consent records
                  </CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                  placeholder="Search by session or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="all">Accept All</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="custom">Customized</SelectItem>
                    <SelectItem value="essential">Essential Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Analytics</TableHead>
                      <TableHead>Marketing</TableHead>
                      <TableHead>Functional</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsents.slice(0, 50).map((consent) => (
                      <TableRow key={consent.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(consent.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-[120px] truncate">
                          {consent.session_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{getConsentBadge(consent.consent_type)}</TableCell>
                        <TableCell>
                          {consent.analytics_consent ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {consent.marketing_consent ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {consent.functional_consent ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredConsents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No consent records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredConsents.length > 50 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 50 of {filteredConsents.length} records. Export to see all.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cookie Banner Settings</CardTitle>
                    <CardDescription>
                      Customize the cookie consent popup appearance and text
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="is-active">Banner Active</Label>
                    <Switch
                      id="is-active"
                      checked={settings.is_active}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => prev ? { ...prev, is_active: checked } : null)
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banner Content */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Banner Content</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="popup-title">Popup Title</Label>
                      <Input
                        id="popup-title"
                        value={settings.popup_title}
                        onChange={(e) =>
                          setSettings((prev) => 
                            prev ? { ...prev, popup_title: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="show-details">Show Detailed Options</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          id="show-details"
                          checked={settings.show_detailed_options}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => 
                              prev ? { ...prev, show_detailed_options: checked } : null
                            )
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {settings.show_detailed_options ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-description">Popup Description</Label>
                    <Textarea
                      id="popup-description"
                      value={settings.popup_description}
                      onChange={(e) =>
                        setSettings((prev) => 
                          prev ? { ...prev, popup_description: e.target.value } : null
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policy-text">Policy Text (Footer)</Label>
                    <Textarea
                      id="policy-text"
                      value={settings.policy_text}
                      onChange={(e) =>
                        setSettings((prev) => 
                          prev ? { ...prev, policy_text: e.target.value } : null
                        )
                      }
                      rows={3}
                    />
                  </div>
                </div>

                {/* Button Text */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Button Text</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="accept-text">Accept Button</Label>
                      <Input
                        id="accept-text"
                        value={settings.button_accept_text}
                        onChange={(e) =>
                          setSettings((prev) => 
                            prev ? { ...prev, button_accept_text: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reject-text">Reject Button</Label>
                      <Input
                        id="reject-text"
                        value={settings.button_reject_text}
                        onChange={(e) =>
                          setSettings((prev) => 
                            prev ? { ...prev, button_reject_text: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customize-text">Customize Button</Label>
                      <Input
                        id="customize-text"
                        value={settings.button_customize_text}
                        onChange={(e) =>
                          setSettings((prev) => 
                            prev ? { ...prev, button_customize_text: e.target.value } : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </h3>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{settings.popup_title}</CardTitle>
                      <CardDescription>{settings.popup_description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm">{settings.button_accept_text}</Button>
                        <Button size="sm" variant="outline">{settings.button_reject_text}</Button>
                        {settings.show_detailed_options && (
                          <Button size="sm" variant="secondary">{settings.button_customize_text}</Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{settings.policy_text}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CookieConsentManager;
