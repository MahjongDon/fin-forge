
import { useState } from "react";
import { format, isSameDay, isToday, isBefore, addDays, isWithinInterval, isSameMonth, addMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, AlertTriangle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Bill, CustomDayProps } from "./types";
import { EditBillDialog } from "./EditBillDialog";
import { NoItems } from "./NoItems";
import { BillItem } from "./BillItem";
import { CATEGORIES } from "./types";

interface BillCalendarViewProps {
  bills: Bill[];
  onAddBill: (date: Date) => void;
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function BillCalendarView({ bills, onAddBill, onTogglePaid, onEdit, onDelete }: BillCalendarViewProps) {
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const selectedDateBills = selectedDate 
    ? bills.filter(bill => isSameDay(bill.dueDate, selectedDate))
    : [];

  const handleEditBill = () => {
    if (!editingBill) return;
    onEdit(editingBill);
  };

  return (
    <Card className="finance-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendar View</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCalendarDate(addMonths(calendarDate, -1))}
              type="button"
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
              type="button"
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
                    variant={bill.isPaid ? "paid" : isBefore(bill.dueDate, new Date()) ? "overdue" : "default"}
                  />
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">No bills for this date.</p>
                <Button 
                  className="mt-2" 
                  onClick={() => onAddBill(selectedDate)}
                  type="button"
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
  );
}
