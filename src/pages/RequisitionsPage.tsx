import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { RequisitionForm } from "@/components/requisitions/RequisitionForm";
import { RequisitionsList } from "@/components/requisitions/RequisitionsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Plus, Clock, CheckCircle, XCircle,
  DollarSign, TrendingUp, Users, Calendar 
} from "lucide-react";

const RequisitionsPage = () => {
  const [userRole, setUserRole] = useState<string>('');
  const [requisitions, setRequisitions] = useState<any[]>([]);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
    
    // Load requisitions
    const stored = JSON.parse(localStorage.getItem('requisitions') || '[]');
    setRequisitions(stored);
  }, []);

  const stats = {
    total: requisitions.length,
    pending: requisitions.filter(r => r.status === 'pending').length,
    approved: requisitions.filter(r => r.status === 'approved').length,
    rejected: requisitions.filter(r => r.status === 'rejected').length,
    totalAmount: requisitions.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    approvedAmount: requisitions
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  };

  const isAccountsRole = userRole === 'accounts' || userRole === 'admin';
  const canCreateRequisition = !isAccountsRole; // All roles except accounts can create requisitions

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-black text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black">
                  {isAccountsRole ? 'REQUISITIONS MANAGEMENT' : 'DEPARTMENT REQUISITIONS'}
                </h1>
                <p className="text-gray-300 mt-2">
                  {isAccountsRole 
                    ? 'Review and approve department requisition requests'
                    : 'Submit requisitions for department needs and purchases'
                  }
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Role: {userRole.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-black">
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requisitions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-black">
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-yellow-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-black">
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-black">
              <CardContent className="flex items-center p-6">
                <DollarSign className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Amount</p>
                  <p className="text-2xl font-bold">${stats.approvedAmount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          {isAccountsRole ? (
            // Accounts Role - View and manage requisitions
            <RequisitionsList />
          ) : (
            // Other roles - Create requisitions and view their own
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Requisition
                </TabsTrigger>
                <TabsTrigger value="view" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  My Requisitions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="mt-6">
                <RequisitionForm />
              </TabsContent>
              
              <TabsContent value="view" className="mt-6">
                <RequisitionsList />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequisitionsPage;
