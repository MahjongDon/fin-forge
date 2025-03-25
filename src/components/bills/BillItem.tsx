
import { format, isToday, isWithinInterval, addDays, isBefore } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BillItemProps } from "./types";
import { EditBillDialog } from "./EditBillDialog";
import { CATEGORIES } from "./types";

export function BillItem({ 
  bill, 
  onEdit, 
  onTogglePaid, 
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingBill,
  setEditingBill,
  onEditSave,
  onDelete,
  variant = "default" 
}: BillItemProps) {
  const isOverdue = variant === "overdue" || (!bill.isPaid && isBefore(bill.dueDate, new Date()));
  const isDueToday = !bill.isPaid && isToday(bill.dueDate);
  const isDueSoon = !bill.isPaid && isWithinInterval(bill.dueDate, {
    start: new Date(),
    end: addDays(new Date(), 3)
  });

  return (
    <div 
      key={bill.id} 
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg",
        variant === "overdue" && "border-finance-red/30 bg-finance-red/5",
        variant === "paid" && "opacity-80 border-border",
        variant === "default" && "border-border"
      )}
    >
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={bill.isPaid}
          onChange={() => onTogglePaid(bill.id)}
          className="form-checkbox h-5 w-5 text-finance-indigo rounded border-gray-300 focus:ring-finance-indigo"
        />
        <div>
          <div className={cn(
            "font-medium",
            bill.isPaid && "line-through",
            variant === "overdue" && "flex items-center gap-2"
          )}>
            <span>{bill.name}</span>
            {variant === "overdue" && (
              <span className="text-xs px-2 py-0.5 bg-finance-red/10 text-finance-red rounded-full">Overdue</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {variant === "paid" ? (
              <>Paid on {format(bill.dueDate, "PP")}</>
            ) : isOverdue ? (
              <>Due {format(bill.dueDate, "PP")}</>
            ) : isDueToday ? (
              <span className="text-finance-red font-medium">Due today</span>
            ) : (
              <>Due {format(bill.dueDate, "PP")}</>
            )}
            {" • "}{bill.category}
            {bill.isRecurring && " • Recurring"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">${bill.amount.toFixed(2)}</div>
          {variant === "paid" ? (
            <div className="text-xs text-finance-green">Paid</div>
          ) : variant === "overdue" ? (
            <div className="text-xs text-finance-red">
              {Math.floor((new Date().getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24))} days late
            </div>
          ) : isDueToday ? (
            <div className="text-xs text-muted-foreground">Today</div>
          ) : isDueSoon ? (
            <div className="text-xs text-finance-yellow">{format(bill.dueDate, "ccc")}</div>
          ) : (
            <div className="text-xs text-muted-foreground">{format(bill.dueDate, "ccc, MMM d")}</div>
          )}
        </div>
        <Dialog 
          open={isEditDialogOpen && editingBill?.id === bill.id} 
          onOpenChange={(open) => {
            if (!open) setEditingBill(null);
            setIsEditDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditingBill(bill)}
              type="button"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <EditBillDialog
              bill={editingBill}
              setBill={setEditingBill}
              onSave={onEditSave}
              onDelete={onDelete}
              categories={CATEGORIES}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
