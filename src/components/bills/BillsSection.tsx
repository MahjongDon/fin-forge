
import { useState, useEffect } from "react";
import { format, isSameDay, isToday, isWithinInterval, addDays, isBefore, compareAsc, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { toast } from "sonner";
import { Bill, CATEGORIES } from "./types";
import { BillCard } from "./BillCard";
import { AddBillDialog } from "./AddBillDialog";
import { BillListView } from "./BillListView";
import { BillCalendarView } from "./BillCalendarView";
import { Button } from "@/components/ui/button";

export default function BillsSection() {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bills');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((bill: any) => ({
        ...bill,
        dueDate: new Date(bill.dueDate),
      }));
    }
    
    return [
      {
        id: "1",
        name: "Rent",
        amount: 1200,
        dueDate: addDays(new Date(), 5),
        isPaid: false,
        isRecurring: true,
        recurringType: "monthly",
        category: "Housing"
      },
      {
        id: "2",
        name: "Electricity",
        amount: 85,
        dueDate: addDays(new Date(), 12),
        isPaid: false,
        isRecurring: true,
        recurringType: "monthly",
        category: "Utilities"
      },
      {
        id: "3",
        name: "Internet",
        amount: 60,
        dueDate: addDays(new Date(), 8),
        isPaid: false,
        isRecurring: true,
        recurringType: "monthly",
        category: "Utilities"
      },
      {
        id: "4",
        name: "Car Insurance",
        amount: 150,
        dueDate: addDays(new Date(), 15),
        isPaid: false,
        isRecurring: true,
        recurringType: "monthly",
        category: "Insurance"
      },
      {
        id: "5",
        name: "Netflix",
        amount: 15.99,
        dueDate: addDays(new Date(), 20),
        isPaid: false,
        isRecurring: true,
        recurringType: "monthly",
        category: "Subscriptions"
      }
    ];
  });
  
  const [newBill, setNewBill] = useState<Omit<Bill, "id">>({
    name: "",
    amount: 0,
    dueDate: new Date(),
    isPaid: false,
    isRecurring: false,
    category: "Other"
  });
  
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
    
    const today = new Date();
    const dueSoon = bills.filter(bill => 
      !bill.isPaid && 
      isWithinInterval(bill.dueDate, {
        start: today,
        end: addDays(today, 3)
      })
    );
    
    if (dueSoon.length > 0) {
      dueSoon.forEach(bill => {
        if (isToday(bill.dueDate)) {
          console.log(`Bill due today: ${bill.name}`);
        }
      });
    }
  }, [bills]);

  const upcomingBills = [...bills]
    .filter(bill => !bill.isPaid && isBefore(bill.dueDate, addDays(new Date(), 30)))
    .sort((a, b) => compareAsc(a.dueDate, b.dueDate));

  const overdueBills = [...bills]
    .filter(bill => !bill.isPaid && isBefore(bill.dueDate, new Date()))
    .sort((a, b) => compareAsc(a.dueDate, b.dueDate));
  
  const todayBills = upcomingBills.filter(bill => isToday(bill.dueDate));
  
  const paidBills = [...bills]
    .filter(bill => bill.isPaid)
    .sort((a, b) => compareAsc(b.dueDate, a.dueDate));
  
  const handleAddBill = (billData: Omit<Bill, "id">) => {
    if (!billData.name || billData.amount <= 0) {
      toast.error("Please enter a bill name and a valid amount");
      return;
    }
    
    const newBillWithId: Bill = {
      ...billData,
      id: crypto.randomUUID(),
      dueDate: billData.dueDate || new Date()
    };
    
    setBills([...bills, newBillWithId]);
    toast.success(`Added new bill: ${newBillWithId.name}`);
  };

  const handleEditBill = (editedBill: Bill) => {
    setBills(bills.map(bill => 
      bill.id === editedBill.id ? editedBill : bill
    ));
    
    toast.success(`Updated bill: ${editedBill.name}`);
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id));
    toast.success("Bill deleted");
  };

  const handleTogglePaid = (id: string) => {
    setBills(bills.map(bill => {
      if (bill.id === id) {
        const updated = { ...bill, isPaid: !bill.isPaid };
        if (updated.isPaid) {
          toast.success(`Marked "${bill.name}" as paid`);
        } else {
          toast.info(`Marked "${bill.name}" as unpaid`);
        }
        return updated;
      }
      return bill;
    }));
  };

  const handleAddBillWithDate = (date: Date) => {
    setNewBill({
      ...newBill,
      dueDate: date
    });
    setSelectedDate(date);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Bills & Reminders</h1>
          <p className="text-muted-foreground">Keep track of your recurring and one-time bills.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-gray-800 border border-border rounded-md p-1 flex">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              type="button"
            >
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              type="button"
            >
              Calendar
            </Button>
          </div>
          
          <AddBillDialog 
            onAddBill={handleAddBill}
            selectedDate={viewMode === "calendar" ? selectedDate : undefined}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <BillCard 
          title="Due Today" 
          amount={todayBills.reduce((sum, bill) => sum + bill.amount, 0)}
          count={todayBills.length}
        />
        
        <BillCard 
          title="Upcoming (30 days)" 
          amount={upcomingBills.reduce((sum, bill) => sum + bill.amount, 0)}
          count={upcomingBills.length}
        />
        
        <BillCard 
          title="Overdue" 
          amount={overdueBills.reduce((sum, bill) => sum + bill.amount, 0)}
          count={overdueBills.length}
          variant="danger"
        />
        
        <BillCard 
          title="Paid This Month" 
          amount={paidBills
            .filter(bill => isSameMonth(bill.dueDate, new Date()))
            .reduce((sum, bill) => sum + bill.amount, 0)}
          count={paidBills.filter(bill => isSameMonth(bill.dueDate, new Date())).length}
          variant="success"
        />
      </div>

      {viewMode === "list" ? (
        <BillListView 
          upcomingBills={upcomingBills}
          overdueBills={overdueBills}
          paidBills={paidBills}
          onTogglePaid={handleTogglePaid}
          onEdit={handleEditBill}
          onDelete={handleDeleteBill}
          onAddBill={() => handleAddBillWithDate(new Date())}
        />
      ) : (
        <BillCalendarView 
          bills={bills}
          onAddBill={handleAddBillWithDate}
          onTogglePaid={handleTogglePaid}
          onEdit={handleEditBill}
          onDelete={handleDeleteBill}
        />
      )}
    </div>
  );
}
