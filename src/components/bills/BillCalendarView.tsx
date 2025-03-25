
import { useState } from "react";
import { format, isEqual, isToday, isBefore, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Bill, CATEGORIES } from "./types";
import { Badge } from "@/components/ui/badge";
import { EditBillDialog } from "./EditBillDialog";
import { AddBillDialog } from "./AddBillDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { NoItems } from "./NoItems";

interface BillCalendarViewProps {
  bills: Bill[];
  onAddBill: (date: Date) => void;
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function BillCalendarView({ bills, onAddBill, onTogglePaid, onEdit, onDelete }: BillCalendarViewProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  
  const handleDateSelect = (day: Date | undefined) => {
    setSelectedDate(day);
  };
  
  const billsForSelectedDate = selectedDate 
    ? bills.filter(bill => isEqual(new Date(bill.dueDate).setHours(0, 0, 0, 0), new Date(selectedDate).setHours(0, 0, 0, 0)))
    : [];
    
  // Get all days with bills for the current month
  const currentMonthStart = startOfMonth(date);
  const currentMonthEnd = endOfMonth(date);
  
  // Create a mapping of dates to bill counts
  const daysWithBills: Record<number, { count: number, overdue: boolean }> = {};
  
  bills.forEach(bill => {
    if (isSameMonth(bill.dueDate, date)) {
      const day = bill.dueDate.getDate();
      if (!daysWithBills[day]) {
        daysWithBills[day] = { count: 0, overdue: false };
      }
      daysWithBills[day].count++;
      
      if (!bill.isPaid && isBefore(bill.dueDate, new Date())) {
        daysWithBills[day].overdue = true;
      }
    }
  });
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[350px_1fr]">
        <Card className="finance-card">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={date}
              onMonthChange={setDate}
              className="p-3"
              components={{
                DayContent: (props) => {
                  const day = props.date.getDate();
                  const hasBills = daysWithBills[day];
                  const isOverdue = hasBills && hasBills.overdue;
                  
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {props.date.getDate()}
                      {hasBills && (
                        <span className={cn(
                          "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                          isOverdue ? "bg-finance-red" : "bg-finance-indigo"
                        )}></span>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardContent className="p-6">
            {selectedDate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {isToday(selectedDate) ? "Today's Bills" : `Bills for ${format(selectedDate, 'MMMM d, yyyy')}`}
                  </h3>
                  <Button onClick={() => onAddBill(selectedDate)} size="sm" type="button">
                    <Plus className="h-4 w-4 mr-1" /> Add Bill
                  </Button>
                </div>
                
                {billsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {billsForSelectedDate.map(bill => (
                      <div 
                        key={bill.id}
                        className={cn(
                          "p-3 border rounded-lg flex items-center justify-between gap-4",
                          bill.isPaid 
                            ? "bg-muted border-transparent" 
                            : isBefore(bill.dueDate, new Date())
                              ? "border-finance-red/30 bg-finance-red/5"
                              : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={cn(
                              "w-3 h-3 rounded-full",
                              bill.isPaid ? "bg-finance-green" : isBefore(bill.dueDate, new Date()) ? "bg-finance-red" : "bg-finance-indigo"
                            )}
                          />
                          <div>
                            <div className="font-medium flex gap-2 items-center">
                              {bill.name}
                              {bill.isRecurring && (
                                <Badge variant="outline" className="text-xs">Recurring</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {bill.category} • ${bill.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={bill.isPaid ? "outline" : "default"}
                            className={bill.isPaid ? "" : ""}
                            onClick={() => onTogglePaid(bill.id)}
                            type="button"
                          >
                            {bill.isPaid ? "Unpaid" : "Paid"}
                          </Button>
                          
                          <EditBillDialog 
                            bill={bill} 
                            setBill={setEditingBill}
                            onSave={() => onEdit(bill)} 
                            onDelete={onDelete}
                            categories={CATEGORIES}
                          />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive" type="button">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the bill "{bill.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(bill.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <NoItems 
                    message="No bills for this date." 
                    actionLabel="Add a Bill"
                    onAction={() => onAddBill(selectedDate)}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a date to view or add bills.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
