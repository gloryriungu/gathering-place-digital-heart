import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

const mockContributions = [
  { id: 1, date: "2024-01-07", type: "tithe", amount: 500, member: "John Smith" },
  { id: 2, date: "2024-01-07", type: "offering", amount: 150, member: "Sarah Johnson" },
  { id: 3, date: "2024-01-07", type: "gift1", amount: 200, member: "Michael Brown" },
  { id: 4, date: "2024-01-07", type: "gift2", amount: 100, member: "Emily Davis" },
];

export const FinancialContributions = () => {
  const [contributions, setContributions] = useState(mockContributions);
  const [newContribution, setNewContribution] = useState({
    type: "offering",
    amount: "",
    member: "",
    date: new Date().toISOString().split('T')[0]
  });

  const contributionTypes = [
    { value: "offering", label: "Offering", color: "bg-blue-100 text-blue-800" },
    { value: "tithe", label: "Tithe", color: "bg-green-100 text-green-800" },
    { value: "gift1", label: "Gift 1", color: "bg-purple-100 text-purple-800" },
    { value: "gift2", label: "Gift 2", color: "bg-orange-100 text-orange-800" },
  ];

  const addContribution = () => {
    if (newContribution.amount && newContribution.member) {
      const contribution = {
        id: Date.now(),
        ...newContribution,
        amount: parseFloat(newContribution.amount)
      };
      setContributions(prev => [contribution, ...prev]);
      setNewContribution({
        type: "offering",
        amount: "",
        member: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const getTotalByType = (type: string) => {
    return contributions
      .filter(c => c.type === type)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const getDailyTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return contributions
      .filter(c => c.date === today)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const getWeeklyTotal = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return contributions
      .filter(c => new Date(c.date) >= weekAgo)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const getMonthlyTotal = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return contributions
      .filter(c => {
        const date = new Date(c.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const exportData = (period: string) => {
    let filteredData = contributions;
    const today = new Date();

    switch (period) {
      case 'daily':
        filteredData = contributions.filter(c => c.date === today.toISOString().split('T')[0]);
        break;
      case 'weekly':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = contributions.filter(c => new Date(c.date) >= weekAgo);
        break;
      case 'monthly':
        filteredData = contributions.filter(c => {
          const date = new Date(c.date);
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        });
        break;
    }

    const data = {
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAmount: filteredData.reduce((sum, c) => sum + c.amount, 0),
        totalTransactions: filteredData.length,
        byType: contributionTypes.map(type => ({
          type: type.label,
          amount: filteredData.filter(c => c.type === type.value).reduce((sum, c) => sum + c.amount, 0),
          count: filteredData.filter(c => c.type === type.value).length
        }))
      },
      transactions: filteredData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${period}-${today.toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Contributions</h2>
          <p className="text-muted-foreground">Track and manage church contributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Total</p>
                <p className="text-2xl font-bold">${getDailyTotal().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">${getWeeklyTotal().toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${getMonthlyTotal().toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{contributions.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">Add Contribution</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Contribution</CardTitle>
              <CardDescription>Record a new financial contribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contribution Type</Label>
                  <Select 
                    value={newContribution.type} 
                    onValueChange={(value) => setNewContribution(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contributionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newContribution.amount}
                    onChange={(e) => setNewContribution(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member">Member Name</Label>
                  <Input
                    id="member"
                    placeholder="Enter member name"
                    value={newContribution.member}
                    onChange={(e) => setNewContribution(prev => ({ ...prev, member: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contributionDate">Date</Label>
                  <Input
                    id="contributionDate"
                    type="date"
                    value={newContribution.date}
                    onChange={(e) => setNewContribution(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addContribution} className="w-full">
                Add Contribution
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contribution Types Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contributionTypes.map(type => (
                  <div key={type.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={type.color}>{type.label}</Badge>
                    </div>
                    <span className="font-semibold">${getTotalByType(type.value).toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Export</CardTitle>
                <CardDescription>Download reports for different periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportData('daily')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Daily Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportData('weekly')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Weekly Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportData('monthly')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Monthly Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
              <CardDescription>Latest financial contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contributions.map(contribution => {
                  const typeInfo = contributionTypes.find(t => t.value === contribution.type);
                  return (
                    <div key={contribution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={typeInfo?.color}>{typeInfo?.label}</Badge>
                        <div>
                          <p className="font-medium">{contribution.member}</p>
                          <p className="text-sm text-muted-foreground">{contribution.date}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-lg">${contribution.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Reports</CardTitle>
              <CardDescription>Generate detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Quarterly Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Semi-Annual Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Annual Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};