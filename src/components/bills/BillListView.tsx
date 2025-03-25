
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bill } from "./types";
import { BillItem } from "./BillItem";
import { NoItems } from "./NoItems";
import { EditBillDialog } from "./EditBillDialog";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CATEGORIES } from "./types";

interface BillListViewProps {
  upcomingBills: Bill[];
  overdueBills: Bill[];
  paidBills: Bill[];
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onAddBill: () => void;
}

export function BillListView({ 
  upcomingBills, 
  overdueBills, 
  paidBills, 
  onTogglePaid,
  onEdit,
  onDelete,
  onAddBill
}: BillListViewProps) {
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditBill = () => {
    if (!editingBill) return;
    onEdit(editingBill);
  };

  return (
    <Tabs defaultValue="upcoming" className="finance-card">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="overdue">Overdue</TabsTrigger>
        <TabsTrigger value="paid">Paid</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="p-4">
        <div className="space-y-4">
          {upcomingBills.length > 0 ? (
            upcomingBills.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onEdit={setEditingBill}
                onTogglePaid={onTogglePaid}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                editingBill={editingBill}
                setEditingBill={setEditingBill}
                onEditSave={handleEditBill}
                onDelete={onDelete}
              />
            ))
          ) : (
            <NoItems 
              message="No upcoming bills." 
              actionLabel="Add a Bill" 
              onAction={onAddBill}
            />
          )}
        </div>
      </TabsContent>
      <TabsContent value="overdue" className="p-4">
        <div className="space-y-4">
          {overdueBills.length > 0 ? (
            overdueBills.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onEdit={setEditingBill}
                onTogglePaid={onTogglePaid}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                editingBill={editingBill}
                setEditingBill={setEditingBill}
                onEditSave={handleEditBill}
                onDelete={onDelete}
                variant="overdue"
              />
            ))
          ) : (
            <NoItems 
              message="No overdue bills. Great job!" 
              showAction={false}
            />
          )}
        </div>
      </TabsContent>
      <TabsContent value="paid" className="p-4">
        <div className="space-y-4">
          {paidBills.length > 0 ? (
            paidBills.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onEdit={setEditingBill}
                onTogglePaid={onTogglePaid}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                editingBill={editingBill}
                setEditingBill={setEditingBill}
                onEditSave={handleEditBill}
                onDelete={onDelete}
                variant="paid"
              />
            ))
          ) : (
            <NoItems 
              message="No paid bills yet." 
              showAction={false}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
