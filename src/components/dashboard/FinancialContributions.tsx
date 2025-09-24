import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import jsPDF from "jspdf";

const mockContributions = [
  { id: 1, date: "2024-01-07", type: "tithe", amount: 500, service: "Sunday Morning Service" },
  { id: 2, date: "2024-01-07", type: "offering", amount: 150, service: "Evening Service" },
  { id: 3, date: "2024-01-07", type: "gift1", amount: 200, service: "Wednesday Prayer Service" },
  { id: 4, date: "2024-01-07", type: "gift2", amount: 100, service: "Friday Youth Service" },
];

export const FinancialContributions = () => {
  const [contributions, setContributions] = useState(mockContributions);
  const [newContribution, setNewContribution] = useState({
    type: "offering",
    amount: "",
    service: "",
    date: new Date().toISOString().split('T')[0]
  });

  const contributionTypes = [
    { value: "offering", label: "Offering", color: "bg-blue-100 text-blue-800" },
    { value: "tithe", label: "Tithe", color: "bg-green-100 text-green-800" },
    { value: "gift1", label: "Gift 1", color: "bg-purple-100 text-purple-800" },
    { value: "gift2", label: "Gift 2", color: "bg-orange-100 text-orange-800" },
  ];

  const addContribution = () => {
    if (newContribution.amount && newContribution.service) {
      const contribution = {
        id: Date.now(),
        ...newContribution,
        amount: parseFloat(newContribution.amount)
      };
      setContributions(prev => [contribution, ...prev]);
      setNewContribution({
        type: "offering",
        amount: "",
        service: "",
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

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(`Financial Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`, 20, 20);
    
    // Summary
    doc.setFontSize(12);
    const totalAmount = filteredData.reduce((sum, c) => sum + c.amount, 0);
    const totalTransactions = filteredData.length;
    
    doc.text(`Generated: ${today.toLocaleDateString()}`, 20, 40);
    doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 20, 50);
    doc.text(`Total Amount: $${totalAmount.toLocaleString()}`, 20, 60);
    doc.text(`Total Transactions: ${totalTransactions}`, 20, 70);
    
    // By Type Summary
    doc.setFontSize(14);
    doc.text('Summary by Type:', 20, 90);
    
    let yPosition = 105;
    doc.setFontSize(10);
    
    contributionTypes.forEach(type => {
      const typeAmount = filteredData.filter(c => c.type === type.value).reduce((sum, c) => sum + c.amount, 0);
      const typeCount = filteredData.filter(c => c.type === type.value).length;
      doc.text(`${type.label}: $${typeAmount.toLocaleString()} (${typeCount} transactions)`, 30, yPosition);
      yPosition += 8;
    });
    
    // Transactions List
    yPosition += 20;
    doc.setFontSize(14);
    doc.text('Transaction Details:', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(9);
    filteredData.forEach((contribution, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const typeInfo = contributionTypes.find(t => t.value === contribution.type);
      doc.text(`${contribution.date} - ${typeInfo?.label} - ${contribution.service} - $${contribution.amount.toLocaleString()}`, 20, yPosition);
      yPosition += 8;
    });
    
    doc.save(`financial-report-${period}-${today.toISOString().split('T')[0]}.pdf`);
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
                  <Label htmlFor="service">Service Name</Label>
                  <Input
                    id="service"
                    placeholder="Enter service name"
                    value={newContribution.service}
                    onChange={(e) => setNewContribution(prev => ({ ...prev, service: e.target.value }))}
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
                          <p className="font-medium">{contribution.service}</p>
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