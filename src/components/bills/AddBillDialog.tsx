
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Bill, CATEGORIES } from "./types";
import { toast } from "sonner";

interface AddBillDialogProps {
  onAddBill: (bill: Omit<Bill, "id">) => void;
  selectedDate?: Date;
}

export function AddBillDialog({ onAddBill, selectedDate }: AddBillDialogProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBill, setNewBill] = useState<Omit<Bill, "id">>({
    name: "",
    amount: 0,
    dueDate: selectedDate || new Date(),
    isPaid: false,
    isRecurring: false,
    category: "Other"
  });

  const handleAddBill = () => {
    if (!newBill.name || newBill.amount <= 0) {
      toast.error("Please enter a bill name and a valid amount");
      return;
    }
    
    onAddBill(newBill);
    setNewBill({
      name: "",
      amount: 0,
      dueDate: selectedDate || new Date(),
      isPaid: false,
      isRecurring: false,
      category: "Other"
    });
    
    setIsAddDialogOpen(false);
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-finance-indigo hover:bg-finance-indigo/90" type="button">
          <Plus className="mr-2 h-4 w-4" /> Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Bill</DialogTitle>
          <DialogDescription>
            Enter the details of your bill or payment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bill-name">Bill Name</Label>
            <Input
              id="bill-name"
              value={newBill.name}
              onChange={(e) => setNewBill({...newBill, name: e.target.value})}
              placeholder="e.g., Rent, Electricity, Netflix"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bill-amount">Amount ($)</Label>
            <Input
              id="bill-amount"
              type="number"
              min="0"
              step="0.01"
              value={newBill.amount || ''}
              onChange={(e) => setNewBill({...newBill, amount: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bill-date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="justify-start text-left font-normal"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBill.dueDate ? (
                    format(newBill.dueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newBill.dueDate}
                  onSelect={(date) => setNewBill({...newBill, dueDate: date || new Date()})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bill-category">Category</Label>
            <select
              id="bill-category"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={newBill.category}
              onChange={(e) => setNewBill({...newBill, category: e.target.value})}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="bill-recurring"
              checked={newBill.isRecurring}
              onCheckedChange={(checked) => setNewBill({...newBill, isRecurring: checked})}
            />
            <Label htmlFor="bill-recurring">Recurring Bill</Label>
          </div>
          {newBill.isRecurring && (
            <div className="grid gap-2">
              <Label htmlFor="bill-recurrence">Recurrence</Label>
              <select
                id="bill-recurrence"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newBill.recurringType || "monthly"}
                onChange={(e) => setNewBill({
                  ...newBill, 
                  recurringType: e.target.value as "monthly" | "yearly"
                })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="bill-notes">Notes (Optional)</Label>
            <Input
              id="bill-notes"
              value={newBill.notes || ''}
              onChange={(e) => setNewBill({...newBill, notes: e.target.value})}
              placeholder="Add any additional information"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} type="button">
            Cancel
          </Button>
          <Button onClick={handleAddBill} type="button">Add Bill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
