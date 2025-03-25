
import { ArrowDown, ArrowUp, ChevronRight, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

// Sample data for visualization
const COLORS = ['#38B2AC', '#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

const initialBudgetData = [
  { name: 'Housing', value: 1200, spent: 800, color: '#38B2AC' },
  { name: 'Food', value: 500, spent: 350, color: '#4F46E5' },
  { name: 'Transportation', value: 300, spent: 180, color: '#10B981' },
  { name: 'Entertainment', value: 200, spent: 220, color: '#EF4444' },
  { name: 'Savings', value: 400, spent: 400, color: '#F59E0B' },
];

const initialTransactions = [
  { id: 1, description: 'Grocery Shopping', amount: -120, date: '2023-08-01', category: 'Food' },
  { id: 2, description: 'Salary Deposit', amount: 3500, date: '2023-08-01', category: 'Income' },
  { id: 3, description: 'Rent Payment', amount: -1200, date: '2023-08-02', category: 'Housing' },
  { id: 4, description: 'Coffee Shop', amount: -5.75, date: '2023-08-03', category: 'Food' },
  { id: 5, description: 'Gas Station', amount: -45.50, date: '2023-08-03', category: 'Transportation' },
];

const initialSpendingData = [
  { name: 'Jan', amount: 1200 },
  { name: 'Feb', amount: 1100 },
  { name: 'Mar', amount: 1300 },
  { name: 'Apr', amount: 900 },
  { name: 'May', amount: 1500 },
  { name: 'Jun', amount: 1200 },
];

export default function Dashboard() {
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem('budgetData');
    return saved ? JSON.parse(saved) : initialBudgetData;
  });
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  
  const [spendingData, setSpendingData] = useState(() => {
    const saved = localStorage.getItem('spendingData');
    return saved ? JSON.parse(saved) : initialSpendingData;
  });

  useEffect(() => {
    localStorage.setItem('budgetData', JSON.stringify(budgetData));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('spendingData', JSON.stringify(spendingData));
  }, [budgetData, transactions, spendingData]);

  // Calculate total budget
  const totalBudget = budgetData.reduce((sum, category) => sum + category.value, 0);
  const totalSpent = budgetData.reduce((sum, category) => sum + category.spent, 0);
  const budgetProgress = (totalSpent / totalBudget) * 100;

  // Get recent transactions
  const recentTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Financial Overview</h1>
          <p className="text-muted-foreground">Track your spending, manage budgets, and plan for the future.</p>
        </div>
        <Button className="bg-finance-indigo hover:bg-finance-indigo/90">
          <Plus className="mr-2 h-4 w-4" /> New Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="finance-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly allocation</p>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent So Far</CardTitle>
            <ArrowDown className="h-4 w-4 text-finance-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <div className="mt-2">
              <Progress value={budgetProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {budgetProgress.toFixed(0)}% of monthly budget used
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <ArrowUp className="h-4 w-4 text-finance-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBudget - totalSpent).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Left to spend this month</p>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
            <span className="font-medium text-xs px-2 py-1 rounded-full bg-finance-yellow/20 text-finance-yellow">3 Due</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$750.00</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="finance-card md:col-span-1">
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
            <CardDescription>Your budget allocation by category</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Budget']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="finance-card md:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
            <CardDescription>Your spending trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Spending']} />
                  <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card className="finance-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Track your spending by category</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetData.map((category, index) => {
              const percentage = (category.spent / category.value) * 100;
              const isOverBudget = percentage > 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={cn(isOverBudget ? "text-finance-red" : "")}>
                        ${category.spent.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        /${category.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className={cn("h-2", isOverBudget ? "bg-finance-red/20" : "")} 
                    indicatorClassName={isOverBudget ? "bg-finance-red" : ""} />
                  {isOverBudget && (
                    <p className="text-xs text-finance-red">
                      Over budget by ${(category.spent - category.value).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="finance-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    transaction.amount > 0 ? "bg-finance-green/10" : "bg-finance-red/10"
                  )}>
                    {transaction.amount > 0 ? (
                      <ArrowUp className="h-5 w-5 text-finance-green" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-finance-red" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.category} • {transaction.date}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "font-medium",
                  transaction.amount > 0 ? "text-finance-green" : "text-finance-red"
                )}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
