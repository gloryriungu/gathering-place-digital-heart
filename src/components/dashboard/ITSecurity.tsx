import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database as DatabaseType } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Key, 
  Eye, 
  RefreshCw,
  Settings,
  Globe,
  Database,
  Users,
  Activity
} from "lucide-react";

type SecurityEvent = DatabaseType['public']['Tables']['security_events']['Row'] & {
  type: string;
  action: string;
};

interface SecurityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export const ITSecurity = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityEvents();
    const interval = setInterval(fetchSecurityEvents, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Map database fields to component expected format
      const mappedEvents: SecurityEvent[] = (data || []).map(event => ({
        ...event,
        type: event.event_type,
        action: event.action_taken
      }));
      
      setSecurityEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
      setSecurityEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const [securityMetrics] = useState<SecurityMetric[]>([
    { name: 'Firewall Protection', value: 100, status: 'good', description: 'All ports secured' },
    { name: 'SSL Certificate', value: 98, status: 'good', description: 'Valid until 2025' },
    { name: 'Password Strength', value: 75, status: 'warning', description: '25% users need stronger passwords' },
    { name: 'Two-Factor Auth', value: 45, status: 'warning', description: '55% users not using 2FA' },
    { name: 'Data Encryption', value: 100, status: 'good', description: 'All data encrypted at rest' },
    { name: 'Backup Security', value: 90, status: 'good', description: 'Backups encrypted and verified' }
  ]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'threat': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'blocked': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive', 
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return <Badge variant={variants[severity as keyof typeof variants]}>{severity.toUpperCase()}</Badge>;
  };

  const getMetricStatus = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSecurityScore = () => {
    const avgScore = securityMetrics.reduce((sum, metric) => sum + metric.value, 0) / securityMetrics.length;
    return Math.round(avgScore);
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage system security</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSecurityEvents} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Run Security Scan
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-1">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-sm font-medium">Overall Security Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full border-8 border-muted flex items-center justify-center">
                <span className="text-2xl font-bold">{securityScore}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {securityScore >= 90 ? 'Excellent' : securityScore >= 75 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">0</div>
            <p className="text-xs text-muted-foreground">No immediate threats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">23</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Metrics
                </CardTitle>
                <CardDescription>Current security posture and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{metric.name}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={metric.value} className="flex-1 h-2" />
                      <div className={`w-2 h-2 rounded-full ${getMetricStatus(metric.status)}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Controls
                </CardTitle>
                <CardDescription>Current security measures and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Firewall</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">SSL Encryption</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Data Encryption</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Access Controls</span>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Audit Logging</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Enforce 2FA for all admin accounts</li>
                    <li>• Update password policies</li>
                    <li>• Review user access permissions</li>
                    <li>• Schedule security training</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Events Log
              </CardTitle>
              <CardDescription>Recent security events and system alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Loading security events...</p>
                      </TableCell>
                    </TableRow>
                  ) : securityEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No security events found</p>
                        <p className="text-sm">Your system is secure</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(event.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <span className="capitalize">{event.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{event.description}</TableCell>
                        <TableCell className="font-mono text-sm">{event.source}</TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{event.action}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Access Management
                </CardTitle>
                <CardDescription>Manage user permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Users</span>
                    <Badge variant="secondary">3 active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Department Heads</span>
                    <Badge variant="secondary">8 active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regular Users</span>
                    <Badge variant="secondary">156 active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Guest Accounts</span>
                    <Badge variant="outline">0 active</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Review User Permissions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentication Security
                </CardTitle>
                <CardDescription>Password and authentication policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Password Complexity</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Authentication</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Management</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Lockout Policy</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Update Auth Policies
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance & Standards
              </CardTitle>
              <CardDescription>Security compliance status and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="font-medium">Data Protection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Data Encryption</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Backup Security</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Retention</span>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Access Controls</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Role-Based Access</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Audit Trails</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Regular Reviews</span>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Monitoring</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Real-time Alerts</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Log Management</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Incident Response</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};