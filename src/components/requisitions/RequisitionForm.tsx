import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, Send, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequisitionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const RequisitionForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    requestedBy: "",
    priority: "",
    dateNeeded: "",
    justification: "",
    totalAmount: 0
  });
  
  const [items, setItems] = useState<RequisitionItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  const departments = [
    "Worship & Music",
    "Children's Ministry", 
    "Youth Ministry",
    "Hospitality & Welcome",
    "Counseling & Care",
    "Education & Teaching",
    "Audio/Visual Tech",
    "Community Outreach"
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  const addItem = () => {
    const newItem: RequisitionItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof RequisitionItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requisitionData = {
      ...formData,
      items,
      totalAmount: calculateTotal(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Store in localStorage for demo purposes
    const existingRequisitions = JSON.parse(localStorage.getItem('requisitions') || '[]');
    const newRequisition = {
      ...requisitionData,
      id: Date.now().toString()
    };
    
    localStorage.setItem('requisitions', JSON.stringify([...existingRequisitions, newRequisition]));
    
    toast({
      title: "Requisition Submitted",
      description: `Your requisition "${formData.title}" has been sent to accounts for approval.`,
    });

    // Reset form
    setFormData({
      title: "",
      department: "",
      requestedBy: "",
      priority: "",
      dateNeeded: "",
      justification: "",
      totalAmount: 0
    });
    setItems([{ id: "1", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  return (
    <Card className="border-2 border-black">
      <CardHeader>
        <CardTitle className="text-xl font-black flex items-center gap-2">
          <FileText className="h-6 w-6" />
          NEW REQUISITION REQUEST
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Requisition Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Sound Equipment Purchase"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData({...formData, department: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                value={formData.requestedBy}
                onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateNeeded">Date Needed</Label>
              <Input
                id="dateNeeded"
                type="date"
                value={formData.dateNeeded}
                onChange={(e) => setFormData({...formData, dateNeeded: e.target.value})}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Requisition Items</h3>
              <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-5">
                  <Label>Item Description *</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Describe the item needed"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Unit Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Total</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
                
                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-right">
              <div className="text-lg font-bold">
                Total Amount: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">Justification & Purpose *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData({...formData, justification: e.target.value})}
              placeholder="Please explain why this requisition is needed, how it will benefit the ministry, and any other relevant details..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full font-bold flex items-center gap-2">
            <Send className="h-4 w-4" />
            SUBMIT REQUISITION
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};