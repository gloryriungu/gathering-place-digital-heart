import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { MapPin, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface LocationData {
  county: string;
  count: number;
  percentage: number;
}

interface LocationAnalyticsProps {
  data: LocationData[];
  timeSeriesData?: { month: string; [key: string]: any }[];
  loading?: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const LocationAnalytics = ({ data, timeSeriesData, loading }: LocationAnalyticsProps) => {
  if (loading) {
    return (
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            LOCATION ANALYTICS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading location data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topLocations = data.slice(0, 5);
  const totalMembers = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Top Locations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-600">TOP LOCATION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{topLocations[0]?.county || 'N/A'}</div>
            <p className="text-sm text-gray-600">{topLocations[0]?.count || 0} members ({topLocations[0]?.percentage?.toFixed(1) || 0}%)</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-600">TOTAL LOCATIONS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{data.length}</div>
            <p className="text-sm text-gray-600">Counties represented</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              COVERAGE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{totalMembers}</div>
            <p className="text-sm text-gray-600">Members across all counties</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">MEMBERS BY COUNTY</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Members",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="county" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">DISTRIBUTION BREAKDOWN</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                percentage: {
                  label: "Percentage",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topLocations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ county, percentage }) => `${county}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {topLocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend */}
      {timeSeriesData && timeSeriesData.length > 0 && (
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">LOCATION GROWTH TRENDS</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                growth: {
                  label: "Members",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {Object.keys(timeSeriesData[0])
                    .filter(key => key !== 'month')
                    .map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
