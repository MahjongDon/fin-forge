import { useState, useEffect } from "react";
import { AlertTriangle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Plus, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, isSameDay, isToday, isWithinInterval, addDays, addMonths, isAfter, isBefore, compareAsc, startOfMonth, endOfMonth, eachDayOfInterval, getDate, isSameMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import * as React from "react";

interface CustomDayProps extends React.HTMLProps<HTMLButtonElement> {
  date: Date;
  displayMonth: Date;
  selected?: boolean;
  disabled?: boolean;
  outside?: boolean;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  isRecurring: boolean;
  recurringType?: "monthly" | "yearly";
  category: string;
  notes?: string;
}

const CATEGORIES = [
  "Housing",
  "Utilities",
  "Transportation",
  "Insurance",
  "Subscriptions",
  "Healthcare",
  "Debt",
  "Other"
];

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
  
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

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
  
  const selectedDateBills = selectedDate 
    ? bills.filter(bill => isSameDay(bill.dueDate, selectedDate))
    : [];
  
  const daysWithBills = eachDayOfInterval({
    start: startOfMonth(calendarDate),
    end: endOfMonth(calendarDate)
  }).filter(day => 
    bills.some(bill => isSameDay(bill.dueDate, day))
  );

  const handleAddBill = () => {
    if (!newBill.name || newBill.amount <= 0) {
      toast.error("Please enter a bill name and a valid amount");
      return;
    }
    
    const newBillWithId: Bill = {
      ...newBill,
      id: crypto.randomUUID(),
      dueDate: newBill.dueDate || new Date()
    };
    
    setBills([...bills, newBillWithId]);
    setNewBill({
      name: "",
      amount: 0,
      dueDate: new Date(),
      isPaid: false,
      isRecurring: false,
      category: "Other"
    });
    
    setIsAddDialogOpen(false);
    toast.success(`Added new bill: ${newBillWithId.name}`);
  };

  const handleEditBill = () => {
    if (!editingBill) return;
    
    setBills(bills.map(bill => 
      bill.id === editingBill.id ? editingBill : bill
    ));
    
    setIsEditDialogOpen(false);
    toast.success(`Updated bill: ${editingBill.name}`);
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id));
    setIsEditDialogOpen(false);
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
            >
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </Button>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-finance-indigo hover:bg-finance-indigo/90">
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBill}>Add Bill</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="finance-card">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">${todayBills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{todayBills.length} bill{todayBills.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Upcoming (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">${upcomingBills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{upcomingBills.length} bill{upcomingBills.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-finance-red">${overdueBills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overdueBills.length} bill{overdueBills.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold text-finance-green">
              ${paidBills
                .filter(bill => isSameMonth(bill.dueDate, new Date()))
                .reduce((sum, bill) => sum + bill.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidBills.filter(bill => isSameMonth(bill.dueDate, new Date())).length} bill{paidBills.filter(bill => isSameMonth(bill.dueDate, new Date())).length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {viewMode === "list" ? (
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
                  <div key={bill.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={bill.isPaid}
                        onChange={() => handleTogglePaid(bill.id)}
                        className="form-checkbox h-5 w-5 text-finance-indigo rounded border-gray-300 focus:ring-finance-indigo"
                      />
                      <div>
                        <div className="font-medium">{bill.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {isToday(bill.dueDate) ? (
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
                        <div className="text-xs text-muted-foreground">
                          {isToday(bill.dueDate) ? (
                            "Today"
                          ) : isWithinInterval(bill.dueDate, {
                            start: new Date(),
                            end: addDays(new Date(), 3)
                          }) ? (
                            <span className="text-finance-yellow">{format(bill.dueDate, "ccc")}</span>
                          ) : (
                            format(bill.dueDate, "ccc, MMM d")
                          )}
                        </div>
                      </div>
                      <Dialog open={isEditDialogOpen && editingBill?.id === bill.id} 
                              onOpenChange={(open) => {
                                if (!open) setEditingBill(null);
                                setIsEditDialogOpen(open);
                              }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingBill(bill)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <EditBillDialog
                            bill={editingBill}
                            setBill={setEditingBill}
                            onSave={handleEditBill}
                            onDelete={handleDeleteBill}
                            categories={CATEGORIES}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming bills.</p>
                  <Button className="mt-2" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add a Bill
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="overdue" className="p-4">
            <div className="space-y-4">
              {overdueBills.length > 0 ? (
                overdueBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border border-finance-red/30 bg-finance-red/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={bill.isPaid}
                        onChange={() => handleTogglePaid(bill.id)}
                        className="form-checkbox h-5 w-5 text-finance-indigo rounded border-gray-300 focus:ring-finance-indigo"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bill.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-finance-red/10 text-finance-red rounded-full">Overdue</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Due {format(bill.dueDate, "PP")} • {bill.category}
                          {bill.isRecurring && " • Recurring"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${bill.amount.toFixed(2)}</div>
                        <div className="text-xs text-finance-red">
                          {Math.floor((new Date().getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24))} days late
                        </div>
                      </div>
                      <Dialog open={isEditDialogOpen && editingBill?.id === bill.id} 
                              onOpenChange={(open) => {
                                if (!open) setEditingBill(null);
                                setIsEditDialogOpen(open);
                              }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingBill(bill)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <EditBillDialog
                            bill={editingBill}
                            setBill={setEditingBill}
                            onSave={handleEditBill}
                            onDelete={handleDeleteBill}
                            categories={CATEGORIES}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No overdue bills. Great job!</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="paid" className="p-4">
            <div className="space-y-4">
              {paidBills.length > 0 ? (
                paidBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border border-border rounded-lg opacity-80">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={bill.isPaid}
                        onChange={() => handleTogglePaid(bill.id)}
                        className="form-checkbox h-5 w-5 text-finance-indigo rounded border-gray-300 focus:ring-finance-indigo"
                      />
                      <div>
                        <div className="font-medium line-through">{bill.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Paid on {format(bill.dueDate, "PP")} • {bill.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${bill.amount.toFixed(2)}</div>
                        <div className="text-xs text-finance-green">Paid</div>
                      </div>
                      <Dialog open={isEditDialogOpen && editingBill?.id === bill.id} 
                              onOpenChange={(open) => {
                                if (!open) setEditingBill(null);
                                setIsEditDialogOpen(open);
                              }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingBill(bill)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <EditBillDialog
                            bill={editingBill}
                            setBill={setEditingBill}
                            onSave={handleEditBill}
                            onDelete={handleDeleteBill}
                            categories={CATEGORIES}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No paid bills yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="finance-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar View</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarDate(addMonths(calendarDate, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(calendarDate, "MMMM yyyy")}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={calendarDate}
                  onMonthChange={setCalendarDate}
                  className="rounded-md border"
                  components={{
                    Day: (props: CustomDayProps) => {
                      const { date, disabled, outside } = props;
                      const hasBills = bills.some(bill => isSameDay(bill.dueDate, date));
                      const hasOverdueBills = bills.some(bill => 
                        !bill.isPaid && isSameDay(bill.dueDate, date) && isBefore(date, new Date())
                      );
                      const hasDueTodayBills = bills.some(bill => 
                        !bill.isPaid && isSameDay(bill.dueDate, date) && isToday(date)
                      );
                      
                      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                      
                      return (
                        <div className="relative">
                          {hasBills && !isSelected && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full absolute -top-0.5 right-0",
                              hasOverdueBills ? "bg-finance-red" : hasDueTodayBills ? "bg-finance-yellow" : "bg-finance-indigo"
                            )} />
                          )}
                          <button
                            type="button"
                            className={cn(
                              "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                              buttonVariants({ variant: "ghost" }),
                              hasBills && !hasOverdueBills && !hasDueTodayBills && "!bg-finance-indigo/10 text-finance-indigo hover:bg-finance-indigo/20 focus:bg-finance-indigo/20",
                              hasOverdueBills && "!bg-finance-red/10 text-finance-red hover:bg-finance-red/20 focus:bg-finance-red/20",
                              hasDueTodayBills && "!bg-finance-yellow/10 text-finance-yellow hover:bg-finance-yellow/20 focus:bg-finance-yellow/20",
                              isSelected && "!bg-finance-indigo text-white hover:!bg-finance-indigo hover:text-white focus:!bg-finance-indigo focus:text-white",
                              outside && "text-muted-foreground opacity-50",
                              disabled && "text-muted-foreground opacity-50 cursor-not-allowed"
                            )}
                            disabled={disabled}
                            {...props}
                          >
                            {format(date, "d")}
                          </button>
                        </div>
                      );
                    },
                  }}
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-4">
                  {selectedDate ? (
                    `Bills for ${format(selectedDate, "MMMM d, yyyy")}`
                  ) : (
                    "Select a date to view bills"
                  )}
                </h3>
                
                {selectedDate && selectedDateBills.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateBills.map((bill) => (
                      <div key={bill.id} className={cn(
                        "p-4 border rounded-lg flex items-center justify-between",
                        bill.isPaid 
                          ? "opacity-80 border-border" 
                          : isToday(bill.dueDate)
                          ? "border-finance-yellow/30 bg-finance-yellow/5"
                          : isBefore(bill.dueDate, new Date())
                          ? "border-finance-red/30 bg-finance-red/5"
                          : "border-finance-indigo/30 bg-finance-indigo/5"
                      )}>
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={bill.isPaid}
                            onChange={() => handleTogglePaid(bill.id)}
                            className="form-checkbox h-5 w-5 text-finance-indigo rounded border-gray-300 focus:ring-finance-indigo"
                          />
                          <div>
                            <div className={cn("font-medium", bill.isPaid && "line-through")}>
                              {bill.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {bill.category}
                              {bill.isRecurring && " • Recurring"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">${bill.amount.toFixed(2)}</div>
                          <Dialog open={isEditDialogOpen && editingBill?.id === bill.id} 
                                  onOpenChange={(open) => {
                                    if (!open) setEditingBill(null);
                                    setIsEditDialogOpen(open);
                                  }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingBill(bill)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <EditBillDialog
                                bill={editingBill}
                                setBill={setEditingBill}
                                onSave={handleEditBill}
                                onDelete={handleDeleteBill}
                                categories={CATEGORIES}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No bills for this date.</p>
                    <Button 
                      className="mt-2" 
                      onClick={() => {
                        setNewBill({
                          ...newBill,
                          dueDate: selectedDate
                        });
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add a Bill
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">Select a date on the calendar to view bills.</p>
                  </div>
                )}
                
                {selectedDate && isWithinInterval(selectedDate, {
                  start: new Date(),
                  end: addDays(new Date(), 7)
                }) && selectedDateBills.some(bill => !bill.isPaid) && (
                  <div className="mt-4 p-3 bg-finance-yellow/10 border border-finance-yellow/20 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-finance-yellow" />
                    <p className="text-sm">You have unpaid bills coming up soon.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface EditBillDialogProps {
  bill: Bill | null;
  setBill: React.Dispatch<React.SetStateAction<Bill | null>>;
  onSave: () => void;
  onDelete: (id: string) => void;
  categories: string[];
}

function EditBillDialog({ bill, setBill, onSave, onDelete, categories }: EditBillDialogProps) {
  if (!bill) return null;
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Bill</DialogTitle>
        <DialogDescription>
          Make changes to your bill or payment.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-name">Bill Name</Label>
          <Input
            id="edit-name"
            value={bill.name}
            onChange={(e) => setBill({...bill, name: e.target.value})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-amount">Amount ($)</Label>
          <Input
            id="edit-amount"
            type="number"
            min="0"
            step="0.01"
            value={bill.amount || ''}
            onChange={(e) => setBill({...bill, amount: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-date">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="justify-start text-left font-normal"
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
          <Label htmlFor="edit-category">Category</Label>
          <select
            id="edit-category"
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
            id="edit-recurring"
            checked={bill.isRecurring}
            onCheckedChange={(checked) => setBill({...bill, isRecurring: checked})}
          />
          <Label htmlFor="edit-recurring">Recurring Bill</Label>
        </div>
        {bill.isRecurring && (
          <div className="grid gap-2">
            <Label htmlFor="edit-recurrence">Recurrence</Label>
            <select
              id="edit-recurrence"
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
          <Label htmlFor="edit-notes">Notes (Optional)</Label>
          <Input
            id="edit-notes"
            value={bill.notes || ''}
            onChange={(e) => setBill({...bill, notes: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="edit-paid"
            checked={bill.isPaid}
            onCheckedChange={(checked) => setBill({...bill, isPaid: checked})}
          />
          <Label htmlFor="edit-paid">{bill.isPaid ? "Marked as paid" : "Mark as paid"}</Label>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="destructive"
          onClick={() => onDelete(bill.id)}
          className="mr-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </DialogFooter>
    </>
  );
}

