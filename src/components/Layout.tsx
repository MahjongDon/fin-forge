
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart4, 
  CreditCard, 
  DollarSign, 
  Home, 
  PiggyBank, 
  Settings 
} from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: PiggyBank, label: "Budget", path: "/budget" },
  { icon: CreditCard, label: "Bills", path: "/bills" },
  { icon: DollarSign, label: "Currency", path: "/currency" },
  { icon: BarChart4, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-background">
      {/* Sidebar Navigation */}
      <aside className={cn(
        "bg-white dark:bg-gray-900 border-r border-border",
        isMobile ? "w-full h-16 flex-shrink-0 order-last fixed bottom-0 left-0 right-0 z-50" : "w-64 h-screen sticky top-0"
      )}>
        <div className={cn(
          "flex h-full",
          isMobile ? "flex-row justify-around items-center px-2" : "flex-col p-4"
        )}>
          {!isMobile && (
            <div className="flex items-center gap-2 py-4 mb-6">
              <div className="w-8 h-8 rounded-md bg-finance-indigo flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">FinForge</h1>
            </div>
          )}
          
          <nav className={cn(
            "flex gap-1",
            isMobile ? "flex-row w-full justify-around" : "flex-col"
          )}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return isMobile ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 rounded-md transition-colors",
                    isActive 
                      ? "text-finance-indigo" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-finance-indigo/10 text-finance-indigo font-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {!isMobile && (
            <div className="mt-auto pt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">© 2024 FinForge</span>
              <ThemeToggle />
            </div>
          )}
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={cn(
        "flex-1",
        isMobile ? "pb-20" : ""
      )}>
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-between">
            {isMobile && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-finance-indigo flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight">FinForge</h1>
              </div>
            )}
            <div className={cn("flex items-center gap-4", isMobile ? "ml-auto" : "")}>
              {!isMobile && <span className="text-sm font-medium">Welcome back!</span>}
              {isMobile && <ThemeToggle />}
            </div>
          </div>
        </header>
        
        <div className="container py-6 md:py-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
