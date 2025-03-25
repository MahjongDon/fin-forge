
import { useState, useEffect } from "react";
import { AlertTriangle, Edit, Plus, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define budget category type
interface BudgetCategory {
  id: string;
  name: string;
  value: number;
  spent: number;
  color: string;
}

const COLORS = ['#38B2AC', '#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];

export default function BudgetSection() {
  const [categories, setCategories] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('budgetCategories');
    if (saved) return JSON.parse(saved);
    
    // Default categories
    return [
      { id: '1', name: 'Housing', value: 1200, spent: 800, color: '#38B2AC' },
      { id: '2', name: 'Food', value: 500, spent: 350, color: '#4F46E5' },
      { id: '3', name: 'Transportation', value: 300, spent: 180, color: '#10B981' },
      { id: '4', name: 'Entertainment', value: 200, spent: 220, color: '#EF4444' },
      { id: '5', name: 'Utilities', value: 150, spent: 120, color: '#F59E0B' },
      { id: '6', name: 'Savings', value: 400, spent: 400, color: '#3B82F6' },
    ];
  });
  
  const [newCategory, setNewCategory] = useState<Omit<BudgetCategory, 'id'>>({
    name: '',
    value: 0,
    spent: 0,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  });
  
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Calculate total budget and spending
  const totalBudget = categories.reduce((sum, category) => sum + category.value, 0);
  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
  const budgetProgress = (totalSpent / totalBudget) * 100;

  // Handle adding expense to a category
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('budgetCategories', JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategory.name || newCategory.value <= 0) {
      toast.error("Please enter a category name and a valid budget amount");
      return;
    }
    
    const newCategoryWithId: BudgetCategory = {
      ...newCategory,
      id: crypto.randomUUID(),
    };
    
    setCategories([...categories, newCategoryWithId]);
    setNewCategory({
      name: '',
      value: 0,
      spent: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
    
    setIsAddDialogOpen(false);
    toast.success(`Added new budget category: ${newCategoryWithId.name}`);
  };

  const handleEditCategory = () => {
    if (!editingCategory) return;
    
    setCategories(categories.map(category => 
      category.id === editingCategory.id ? editingCategory : category
    ));
    
    setIsEditDialogOpen(false);
    toast.success(`Updated budget category: ${editingCategory.name}`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
    toast.success("Budget category deleted");
  };

  const handleAddExpense = () => {
    if (!expenseCategory || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      toast.error("Please select a category and enter a valid amount");
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    
    setCategories(categories.map(category => {
      if (category.id === expenseCategory) {
        return {
          ...category,
          spent: category.spent + amount
        };
      }
      return category;
    }));
    
    setExpenseCategory('');
    setExpenseAmount('');
    setIsExpenseDialogOpen(false);
    toast.success(`Added expense of $${amount.toFixed(2)}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Budget Planning</h1>
          <p className="text-muted-foreground">Create and manage your budget categories and spending limits.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Expense</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add an Expense</DialogTitle>
                <DialogDescription>
                  Record a new expense in one of your budget categories.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-finance-indigo hover:bg-finance-indigo/90">
                <Plus className="mr-2 h-4 w-4" /> New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Budget Category</DialogTitle>
                <DialogDescription>
                  Add a new category to track your spending.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., Groceries, Rent, Entertainment"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget Amount ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="10"
                    value={newCategory.value || ''}
                    onChange={(e) => setNewCategory({...newCategory, value: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-full border-2",
                          newCategory.color === color ? "border-gray-900 dark:border-gray-100" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory({...newCategory, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>Create Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Track your overall budget progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
              <p className="text-3xl font-bold">${totalBudget.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
              <p className="text-3xl font-bold">${totalSpent.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
              <p className="text-3xl font-bold">${(totalBudget - totalSpent).toLocaleString()}</p>
            </div>
            
            <div className="col-span-full mt-2">
              <div className="flex justify-between mb-2">
                <span className="text-sm">${totalSpent.toLocaleString()} spent</span>
                <span className="text-sm">${totalBudget.toLocaleString()} budget</span>
              </div>
              <Progress value={budgetProgress} className="h-3" />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-medium">{budgetProgress.toFixed(1)}% used</span>
                {budgetProgress > 90 && (
                  <div className="flex items-center text-finance-yellow text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>Approaching limit</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts & Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>How your budget is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Budget']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Breakdown */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>How much you've spent in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories.filter(cat => cat.spent > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="spent"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories List */}
      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>Manage your budget categories and track spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const percentage = (category.spent / category.value) * 100;
              const isOverBudget = percentage > 100;
              
              return (
                <div key={category.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={isEditDialogOpen && editingCategory?.id === category.id} 
                              onOpenChange={(open) => {
                                if (!open) setEditingCategory(null);
                                setIsEditDialogOpen(open);
                              }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Budget Category</DialogTitle>
                            <DialogDescription>
                              Make changes to your budget category.
                            </DialogDescription>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Category Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({
                                    ...editingCategory,
                                    name: e.target.value
                                  })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-budget">Budget Amount ($)</Label>
                                <Input
                                  id="edit-budget"
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={editingCategory.value || ''}
                                  onChange={(e) => setEditingCategory({
                                    ...editingCategory,
                                    value: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-spent">Spent Amount ($)</Label>
                                <Input
                                  id="edit-spent"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editingCategory.spent || ''}
                                  onChange={(e) => setEditingCategory({
                                    ...editingCategory,
                                    spent: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-color">Color</Label>
                                <div className="flex gap-2">
                                  {COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      className={cn(
                                        "w-6 h-6 rounded-full border-2",
                                        editingCategory.color === color ? "border-gray-900 dark:border-gray-100" : "border-transparent"
                                      )}
                                      style={{ backgroundColor: color }}
                                      onClick={() => setEditingCategory({
                                        ...editingCategory,
                                        color
                                      })}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                if (editingCategory) {
                                  handleDeleteCategory(editingCategory.id);
                                  setIsEditDialogOpen(false);
                                }
                              }}
                              className="mr-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleEditCategory}>
                              <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-1 text-sm">
                    <span className={cn(isOverBudget ? "text-finance-red" : "")}>
                      ${category.spent.toLocaleString()} spent
                    </span>
                    <span>${category.value.toLocaleString()} budget</span>
                  </div>
                  
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={cn("h-2", isOverBudget ? "bg-finance-red/20" : "")} 
                    indicatorClassName={isOverBudget ? "bg-finance-red" : ""}
                  />
                  
                  <div className="flex justify-between mt-1">
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% used
                    </div>
                    <div className="text-xs">
                      {isOverBudget ? (
                        <span className="text-finance-red">
                          Over budget by ${(category.spent - category.value).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-finance-green">
                          ${(category.value - category.spent).toLocaleString()} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {categories.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No budget categories yet.</p>
                <Button className="mt-2" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Category
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
