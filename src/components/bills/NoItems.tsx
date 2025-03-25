
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoItemsProps {
  message: string;
  actionLabel?: string;
  showAction?: boolean;
  onAction?: () => void;
}

export function NoItems({ message, actionLabel = "Add a Bill", showAction = true, onAction }: NoItemsProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">{message}</p>
      {showAction && onAction && (
        <Button className="mt-2" onClick={onAction} type="button">
          <Plus className="mr-2 h-4 w-4" /> {actionLabel}
        </Button>
      )}
    </div>
  );
}
