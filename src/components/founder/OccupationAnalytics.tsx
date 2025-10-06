import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Briefcase, Users, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface OccupationData {
  occupation: string;
  count: number;
  percentage: number;
}

interface DepartmentCorrelation {
  occupation: string;
  department: string;
  count: number;
}

interface OccupationAnalyticsProps {
  data: OccupationData[];
  departmentCorrelation?: DepartmentCorrelation[];
  loading?: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const OccupationAnalytics = ({ data, departmentCorrelation, loading }: OccupationAnalyticsProps) => {
  if (loading) {
    return (
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            OCCUPATION ANALYTICS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading occupation data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topOccupations = data.slice(0, 5);
  const totalWithOccupation = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Top Occupation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-600">TOP OCCUPATION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{topOccupations[0]?.occupation || 'N/A'}</div>
            <p className="text-sm text-gray-600">{topOccupations[0]?.count || 0} members ({topOccupations[0]?.percentage?.toFixed(1) || 0}%)</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              UNIQUE OCCUPATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{data.length}</div>
            <p className="text-sm text-gray-600">Different professions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              PROFESSIONAL DIVERSITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{totalWithOccupation}</div>
            <p className="text-sm text-gray-600">Members with occupation data</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">TOP OCCUPATIONS</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Members",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOccupations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="occupation" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">OCCUPATION DISTRIBUTION</CardTitle>
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
                    data={topOccupations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ occupation, percentage }) => `${occupation}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {topOccupations.map((entry, index) => (
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

      {/* Department Correlation Table */}
      {departmentCorrelation && departmentCorrelation.length > 0 && (
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">OCCUPATION × DEPARTMENT CORRELATION</CardTitle>
            <p className="text-sm text-gray-600">Which occupations tend to join which departments</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-black">OCCUPATION</TableHead>
                  <TableHead className="font-black">TOP DEPARTMENT</TableHead>
                  <TableHead className="font-black text-right">COUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentCorrelation.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.occupation}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
