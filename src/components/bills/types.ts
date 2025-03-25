
import { ReactNode } from "react";

export interface Bill {
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

export const CATEGORIES = [
  "Housing",
  "Utilities",
  "Transportation",
  "Insurance",
  "Subscriptions",
  "Healthcare",
  "Debt",
  "Other"
];

export interface BillCardProps {
  title: string;
  amount: number;
  count: number;
  variant?: "default" | "success" | "danger";
}

export interface EditBillDialogProps {
  bill: Bill | null;
  setBill: React.Dispatch<React.SetStateAction<Bill | null>>;
  onSave: () => void;
  onDelete: (id: string) => void;
  categories: string[];
}

export interface BillItemProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onTogglePaid: (id: string) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingBill: Bill | null;
  setEditingBill: React.Dispatch<React.SetStateAction<Bill | null>>;
  onEditSave: () => void;
  onDelete: (id: string) => void;
  variant?: "default" | "overdue" | "paid";
}

export interface CustomDayProps extends React.HTMLProps<HTMLButtonElement> {
  date: Date;
  displayMonth: Date;
  selected?: boolean;
  disabled?: boolean;
  outside?: boolean;
}
