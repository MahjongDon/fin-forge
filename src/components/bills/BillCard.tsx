
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BillCardProps } from "./types";

export function BillCard({ title, amount, count, variant = "default" }: BillCardProps) {
  return (
    <Card className="finance-card">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <div className={cn(
          "text-2xl font-bold",
          variant === "success" && "text-finance-green",
          variant === "danger" && "text-finance-red"
        )}>
          ${amount.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          {count} bill{count !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
}
