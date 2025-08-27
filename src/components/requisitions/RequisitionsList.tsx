import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, Clock, CheckCircle, XCircle, 
  Eye, DollarSign, Calendar, User, Building2 
} from "lucide-react";

interface RequisitionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Requisition {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  priority: string;
  dateNeeded: string;
  justification: string;
  totalAmount: number;
  items: RequisitionItem[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export const RequisitionsList = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('requisitions') || '[]');
    setRequisitions(stored);
  }, []);

  const handleApprove = (id: string) => {
    const updated = requisitions.map(req => 
      req.id === id 
        ? { 
            ...req, 
            status: 'approved' as const,
            reviewedBy: 'Accounts Manager',
            reviewedAt: new Date().toISOString(),
            comments: 'Approved by accounts department'
          }
        : req
    );
    setRequisitions(updated);
    localStorage.setItem('requisitions', JSON.stringify(updated));
  };

  const handleReject = (id: string) => {
    const updated = requisitions.map(req => 
      req.id === id 
        ? { 
            ...req, 
            status: 'rejected' as const,
            reviewedBy: 'Accounts Manager',
            reviewedAt: new Date().toISOString(),
            comments: 'Rejected - insufficient budget allocation'
          }
        : req
    );
    setRequisitions(updated);
    localStorage.setItem('requisitions', JSON.stringify(updated));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequisitions = requisitions.filter(req => 
    filter === 'all' || req.status === filter
  );

  const pendingCount = requisitions.filter(r => r.status === 'pending').length;
  const approvedCount = requisitions.filter(r => r.status === 'approved').length;
  const rejectedCount = requisitions.filter(r => r.status === 'rejected').length;

  if (requisitions.length === 0) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">No Requisitions Yet</h3>
          <p className="text-gray-500 text-center">
            Requisitions submitted by departments will appear here for review and approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-xl font-black">REQUISITIONS MANAGEMENT</CardTitle>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              All ({requisitions.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedCount})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedCount})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.map((requisition) => (
          <Card key={requisition.id} className="border-2 border-black">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">{requisition.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getPriorityColor(requisition.priority)}>
                      {requisition.priority?.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(requisition.status)}>
                      {getStatusIcon(requisition.status)}
                      <span className="ml-1">{requisition.status?.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${requisition.totalAmount?.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Department:</span>
                    <span>{requisition.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Requested By:</span>
                    <span>{requisition.requestedBy}</span>
                  </div>
                  {requisition.dateNeeded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Date Needed:</span>
                      <span>{new Date(requisition.dateNeeded).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Submitted:</span>
                    <span>{new Date(requisition.submittedAt).toLocaleDateString()}</span>
                  </div>
                  {requisition.reviewedAt && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Reviewed:</span>
                      <span>{new Date(requisition.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h4 className="font-bold">Items Requested:</h4>
                <div className="space-y-2">
                  {requisition.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.description}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium">${item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {requisition.justification && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-bold mb-2">Justification:</h4>
                    <p className="text-gray-700">{requisition.justification}</p>
                  </div>
                </>
              )}

              {requisition.comments && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-bold mb-2">Review Comments:</h4>
                    <p className="text-gray-700">{requisition.comments}</p>
                    <p className="text-sm text-gray-500 mt-1">- {requisition.reviewedBy}</p>
                  </div>
                </>
              )}

              {requisition.status === 'pending' && (
                <>
                  <Separator className="my-4" />
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleApprove(requisition.id)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      APPROVE
                    </Button>
                    <Button 
                      onClick={() => handleReject(requisition.id)}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      REJECT
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};