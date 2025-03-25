
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Trash2, Save, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { EditBillDialogProps } from "./types";

export function EditBillDialog({ bill, setBill, onSave, onDelete, categories }: EditBillDialogProps) {
  if (!bill) return null;
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Bill</DialogTitle>
        <DialogDescription>
          Update your bill details.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-bill-name">Bill Name</Label>
          <Input
            id="edit-bill-name"
            value={bill.name}
            onChange={(e) => setBill({...bill, name: e.target.value})}
            placeholder="e.g., Rent, Electricity, Netflix"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-bill-amount">Amount ($)</Label>
          <Input
            id="edit-bill-amount"
            type="number"
            min="0"
            step="0.01"
            value={bill.amount || ''}
            onChange={(e) => setBill({...bill, amount: parseFloat(e.target.value) || 0})}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-bill-date">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="justify-start text-left font-normal"
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bill.dueDate ? (
                  format(bill.dueDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={bill.dueDate}
                onSelect={(date) => setBill({...bill, dueDate: date || new Date()})}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-bill-category">Category</Label>
          <select
            id="edit-bill-category"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={bill.category}
            onChange={(e) => setBill({...bill, category: e.target.value})}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="edit-bill-recurring"
            checked={bill.isRecurring}
            onCheckedChange={(checked) => setBill({...bill, isRecurring: checked})}
          />
          <Label htmlFor="edit-bill-recurring">Recurring Bill</Label>
        </div>
        {bill.isRecurring && (
          <div className="grid gap-2">
            <Label htmlFor="edit-bill-recurrence">Recurrence</Label>
            <select
              id="edit-bill-recurrence"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={bill.recurringType || "monthly"}
              onChange={(e) => setBill({
                ...bill, 
                recurringType: e.target.value as "monthly" | "yearly"
              })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="edit-bill-notes">Notes (Optional)</Label>
          <Input
            id="edit-bill-notes"
            value={bill.notes || ''}
            onChange={(e) => setBill({...bill, notes: e.target.value})}
            placeholder="Add any additional information"
          />
        </div>
      </div>
      <DialogFooter className="flex justify-between sm:justify-between">
        <Button 
          variant="destructive" 
          type="button"
          onClick={() => onDelete(bill.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button 
            type="button"
            onClick={onSave}
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
