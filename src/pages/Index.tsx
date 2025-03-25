
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import BudgetSection from "@/components/BudgetSection";
import BillsSection from "@/components/bills/BillsSection";
import CurrencySection from "@/components/CurrencySection";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <Layout>
      {path === "/" && <Dashboard />}
      {path === "/budget" && <BudgetSection />}
      {path === "/bills" && <BillsSection />}
      {path === "/currency" && <CurrencySection />}
      {path === "/reports" && <Dashboard />}
      {path === "/settings" && <Dashboard />}
    </Layout>
  );
};

export default Index;
