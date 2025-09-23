import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

export const ITSystemMonitoring = () => {
  const { toast } = useToast();
  const [systemMetrics, setSystemMetrics] = useState({
    servers: [
      { name: 'Web Server', status: 'online', cpu: 45, memory: 67, disk: 23, uptime: '15 days' },
      { name: 'Database Server', status: 'online', cpu: 78, memory: 85, disk: 45, uptime: '15 days' },
      { name: 'Backup Server', status: 'maintenance', cpu: 12, memory: 34, disk: 89, uptime: '2 hours' }
    ],
    services: [
      { name: 'User Authentication', status: 'healthy', responseTime: '120ms', lastCheck: '2 min ago' },
      { name: 'Payment Gateway', status: 'healthy', responseTime: '350ms', lastCheck: '1 min ago' },
      { name: 'Email Service', status: 'warning', responseTime: '1200ms', lastCheck: '30 sec ago' },
      { name: 'Backup Service', status: 'offline', responseTime: 'N/A', lastCheck: '10 min ago' }
    ],
    security: {
      threats: 0,
      blockedAttempts: 23,
      lastScan: '2 hours ago',
      firewallStatus: 'active'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📊 ITSystemMonitoring: Component mounted, starting initial fetch');
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    console.log('📊 ITSystemMonitoring: Starting to fetch system metrics...');
    setLoading(true);
    setError(null);
    try {
      console.log('📊 ITSystemMonitoring: Making Supabase query to system_metrics table');
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ ITSystemMonitoring: Supabase error:', error);
        throw error;
      }

      console.log('✅ ITSystemMonitoring: Successfully fetched metrics:', data?.length || 0, 'records');
      
      // Process the metrics data to update system status
      if (data && data.length > 0) {
        console.log('📊 ITSystemMonitoring: Processing latest metrics data:', data[0]);
        const latestMetrics = data[0];
        const metrics = latestMetrics.metric_value as any;
        
        // Update system metrics based on real data
        setSystemMetrics(prev => ({
          ...prev,
          servers: prev.servers.map(server => ({
            ...server,
            cpu: metrics.cpu || server.cpu,
            memory: metrics.memory || server.memory,
            disk: metrics.disk || server.disk,
            status: metrics.status || server.status
          }))
        }));
        console.log('📊 ITSystemMonitoring: Updated system metrics with real data');
        
        toast({
          title: "Metrics Updated",
          description: `System monitoring data refreshed`,
        });
      } else {
        console.log('📊 ITSystemMonitoring: No metrics data found, using default values');
        toast({
          title: "No Data",
          description: "Using simulated monitoring data",
        });
      }
    } catch (error) {
      console.error('❌ ITSystemMonitoring: Error fetching system metrics:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMsg);
      
      toast({
        title: "Error Loading Metrics",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('📊 ITSystemMonitoring: Fetch operation completed');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'default',
      healthy: 'default',
      offline: 'destructive',
      maintenance: 'secondary',
      warning: 'secondary'
    } as const;
    
    const colors = {
      online: 'bg-green-500',
      healthy: 'bg-green-500',
      offline: 'bg-red-500',
      maintenance: 'bg-yellow-500',
      warning: 'bg-orange-500'
    } as const;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors]}`} />
        <Badge variant={variants[status as keyof typeof variants]}>
          {status.toUpperCase()}
        </Badge>
      </div>
    );
  };

  const getMetricColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
            <Activity className="h-4 w-4" />
            <span className="text-sm">
              {loading ? 'Monitoring...' : error ? 'Monitor Error' : 'System Active'}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              loading ? 'bg-yellow-500 animate-pulse' : 
              error ? 'bg-red-500' : 
              'bg-green-500'
            }`} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchSystemMetrics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load system metrics: {error}. Showing default monitoring data.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">2/3</div>
            <p className="text-xs text-muted-foreground">Servers online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">3/4</div>
            <p className="text-xs text-muted-foreground">Services healthy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">0</div>
            <p className="text-xs text-muted-foreground">Active threats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="servers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="servers">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemMetrics.servers.map((server, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    {getStatusBadge(server.status)}
                  </div>
                  <CardDescription>
                    Uptime: {server.uptime}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        CPU
                      </div>
                      <span>{server.cpu}%</span>
                    </div>
                    <Progress value={server.cpu} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4" />
                        Memory
                      </div>
                      <span>{server.memory}%</span>
                    </div>
                    <Progress value={server.memory} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Disk
                      </div>
                      <span>{server.disk}%</span>
                    </div>
                    <Progress value={server.disk} className="h-2" />
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Service Health Monitor
              </CardTitle>
              <CardDescription>
                Monitor application services and response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {service.status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {service.status === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        {service.status === 'offline' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        <span className="font-medium">{service.name}</span>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Response: {service.responseTime}</span>
                      <span>Last check: {service.lastCheck}</span>
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Threats</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{systemMetrics.security.threats}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Blocked Attempts (24h)</span>
                  <span className="font-medium">{systemMetrics.security.blockedAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Firewall Status</span>
                  <Badge variant="default">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Security Scan</span>
                  <span className="text-sm text-muted-foreground">{systemMetrics.security.lastScan}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Security scan completed</p>
                      <p className="text-xs text-muted-foreground">No threats detected - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Multiple failed login attempts</p>
                      <p className="text-xs text-muted-foreground">IP blocked automatically - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Firewall rules updated</p>
                      <p className="text-xs text-muted-foreground">New security policies applied - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Network Status
              </CardTitle>
              <CardDescription>
                Network connectivity and bandwidth monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Internet Connection</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Internal Network</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DNS Resolution</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Download Speed</span>
                    <span className="text-sm font-medium">100 Mbps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Upload Speed</span>
                    <span className="text-sm font-medium">50 Mbps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latency</span>
                    <span className="text-sm font-medium">15ms</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connected Devices</span>
                    <span className="text-sm font-medium">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bandwidth Usage</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Usage</span>
                    <span className="text-sm font-medium">89%</span>
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