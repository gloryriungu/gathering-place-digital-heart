import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, ArrowUpCircle, ArrowDownCircle, Edit } from "lucide-react";

interface InventoryItem {
  id: string;
  department_id: string;
  item_name: string;
  description: string | null;
  category: string | null;
  quantity_available: number;
  unit_value: number | null;
  location: string | null;
  condition: string | null;
  created_at: string;
}

interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: string;
  quantity: number;
  event_name: string | null;
  event_date: string | null;
  notes: string | null;
  created_at: string;
}

interface DepartmentInventoryProps {
  departmentId: string;
  departmentName: string;
}

export const DepartmentInventory = ({ departmentId, departmentName }: DepartmentInventoryProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, [departmentId]);

  const fetchInventoryData = async () => {
    try {
      // Fetch inventory items
      const { data: itemsData, error: itemsError } = await supabase
        .from('department_inventory')
        .select('*')
        .eq('department_id', departmentId)
        .order('item_name');

      if (itemsError) throw itemsError;

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          department_inventory!inner(department_id)
        `)
        .eq('department_inventory.department_id', departmentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      setItems(itemsData || []);
      setTransactions(transactionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (formData: FormData) => {
    try {
      const { error } = await supabase
        .from('department_inventory')
        .insert({
          department_id: departmentId,
          item_name: formData.get('item_name') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          quantity_available: parseInt(formData.get('quantity') as string),
          unit_value: parseFloat(formData.get('unit_value') as string) || null,
          location: formData.get('location') as string,
          condition: formData.get('condition') as string
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added to inventory"
      });

      setIsAddItemOpen(false);
      fetchInventoryData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTransaction = async (formData: FormData) => {
    if (!selectedItem) return;

    try {
      const transactionType = formData.get('transaction_type') as string;
      const quantity = parseInt(formData.get('quantity') as string);
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          inventory_item_id: selectedItem.id,
          transaction_type: transactionType,
          quantity: quantity,
          event_name: formData.get('event_name') as string,
          event_date: formData.get('event_date') as string || null,
          notes: formData.get('notes') as string,
          handled_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (transactionError) throw transactionError;

      // Update inventory quantity
      const newQuantity = transactionType === 'out' 
        ? selectedItem.quantity_available - quantity
        : selectedItem.quantity_available + quantity;

      const { error: updateError } = await supabase
        .from('department_inventory')
        .update({ quantity_available: Math.max(0, newQuantity) })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Transaction recorded successfully`
      });

      setIsTransactionOpen(false);
      setSelectedItem(null);
      fetchInventoryData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{departmentName} Inventory</h2>
          <p className="text-muted-foreground">Manage department items and track movements</p>
        </div>
        
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>Add a new item to the department inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAddItem(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name</Label>
                <Input name="item_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input name="category" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input name="quantity" type="number" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_value">Unit Value</Label>
                  <Input name="unit_value" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input name="location" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select name="condition">
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.category || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.quantity_available > 0 ? "default" : "destructive"}>
                      {item.quantity_available}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.condition || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsTransactionOpen(true);
                        }}
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>
              Record movement for: {selectedItem?.item_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleTransaction(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select name="transaction_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Items In</SelectItem>
                  <SelectItem value="out">Items Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input name="quantity" type="number" min="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_name">Event/Reason</Label>
              <Input name="event_name" placeholder="e.g., Sunday Service, Youth Event" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input name="event_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea name="notes" placeholder="Additional notes..." />
            </div>
            <Button type="submit" className="w-full">Record Transaction</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge variant={transaction.transaction_type === 'in' ? "default" : "secondary"}>
                      {transaction.transaction_type === 'in' ? (
                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownCircle className="h-3 w-3 mr-1" />
                      )}
                      {transaction.transaction_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{transaction.event_name || '-'}</TableCell>
                  <TableCell>
                    {transaction.event_date 
                      ? new Date(transaction.event_date).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{transaction.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};