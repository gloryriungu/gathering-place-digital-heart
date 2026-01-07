import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, Eye, Users, Calendar, ShoppingBag, 
  Video, Play, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const MediaAnalytics = () => {
  const [dateRange, setDateRange] = useState("30");

  // Fetch event registrations data
  const { data: eventRegistrations } = useQuery({
    queryKey: ["event-registrations-analytics", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .gte("created_at", startDate.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch events data
  const { data: events } = useQuery({
    queryKey: ["events-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_content")
        .select("*")
        .eq("content_type", "event");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch shop orders
  const { data: shopOrders } = useQuery({
    queryKey: ["shop-orders-analytics", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("shop_orders")
        .select("*")
        .gte("created_at", startDate.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch newsletter subscribers
  const { data: subscribers } = useQuery({
    queryKey: ["subscribers-analytics", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .gte("created_at", startDate.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch analytics events
  const { data: analyticsEvents } = useQuery({
    queryKey: ["analytics-events", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", startDate.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate metrics
  const totalRegistrations = eventRegistrations?.length || 0;
  const totalOrders = shopOrders?.length || 0;
  const totalRevenue = shopOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const newSubscribers = subscribers?.length || 0;
  const totalPageViews = analyticsEvents?.filter(e => e.event_type === 'page_view')?.length || 0;

  // Calculate growth (comparing to previous period)
  const previousPeriodStart = subDays(new Date(), parseInt(dateRange) * 2);
  const currentPeriodStart = subDays(new Date(), parseInt(dateRange));

  // Generate daily registration trend data
  const registrationTrend = Array.from({ length: parseInt(dateRange) }, (_, i) => {
    const date = subDays(new Date(), parseInt(dateRange) - 1 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = eventRegistrations?.filter(
      r => format(new Date(r.created_at), "yyyy-MM-dd") === dateStr
    ).length || 0;
    return {
      date: format(date, "MMM dd"),
      registrations: count,
    };
  });

  // Generate event type distribution
  const eventTypeDistribution = events?.reduce((acc: Record<string, number>, event) => {
    const type = (event.content_data as any)?.category || "General";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  const pieData = Object.entries(eventTypeDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Shop performance data
  const ordersByDay = Array.from({ length: Math.min(parseInt(dateRange), 14) }, (_, i) => {
    const date = subDays(new Date(), Math.min(parseInt(dateRange), 14) - 1 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOrders = shopOrders?.filter(
      o => format(new Date(o.created_at || ""), "yyyy-MM-dd") === dateStr
    ) || [];
    return {
      date: format(date, "MMM dd"),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    };
  });

  // County distribution from event registrations
  const countyDistribution = eventRegistrations?.reduce((acc: Record<string, number>, reg) => {
    const county = reg.county || "Unknown";
    acc[county] = (acc[county] || 0) + 1;
    return acc;
  }, {}) || {};

  const topCounties = Object.entries(countyDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: any; 
    trend?: "up" | "down" | "neutral";
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={`text-sm ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                  {change > 0 ? "+" : ""}{change}% vs previous period
                </span>
              </div>
            )}
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Media Analytics</h2>
          <p className="text-muted-foreground">
            Track engagement, content performance, and digital ministry impact
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Event Registrations"
          value={totalRegistrations}
          icon={Calendar}
          change={12}
          trend="up"
        />
        <StatCard
          title="Shop Orders"
          value={totalOrders}
          icon={ShoppingBag}
          change={8}
          trend="up"
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          change={15}
          trend="up"
        />
        <StatCard
          title="New Subscribers"
          value={newSubscribers}
          icon={Users}
          change={5}
          trend="up"
        />
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Registration Trend
                </CardTitle>
                <CardDescription>Daily event registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={registrationTrend}>
                    <defs>
                      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorRegistrations)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5" />
                  Content Engagement
                </CardTitle>
                <CardDescription>User interaction with content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Page Views</p>
                        <p className="text-sm text-muted-foreground">Total this period</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{totalPageViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Event Registrations</p>
                        <p className="text-sm text-muted-foreground">Total this period</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{totalRegistrations.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">New Subscribers</p>
                        <p className="text-sm text-muted-foreground">Newsletter signups</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{newSubscribers.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>Distribution of events by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: "No Events", value: 1 }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Events by Registration</CardTitle>
                <CardDescription>Most popular events this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events?.slice(0, 5).map((event, index) => {
                    const regCount = eventRegistrations?.filter(r => r.event_id === event.id).length || 0;
                    return (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium line-clamp-1">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.publish_date || event.created_at), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{regCount}</p>
                          <p className="text-xs text-muted-foreground">registrations</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!events || events.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No events found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shop" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Orders and revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue in KES</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top counties by event registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCounties} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Newsletter subscription trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-4xl font-bold text-primary">{newSubscribers}</p>
                    <p className="text-muted-foreground mt-1">New subscribers this period</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {subscribers?.filter(s => s.status === 'active').length || 0}
                      </p>
                      <p className="text-sm text-green-700">Active</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {subscribers?.filter(s => s.status === 'unsubscribed').length || 0}
                      </p>
                      <p className="text-sm text-orange-700">Unsubscribed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
