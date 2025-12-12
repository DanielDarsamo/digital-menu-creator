import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/contexts/OrderContext";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  onClick: () => void;
}

const CartButton = ({ onClick }: CartButtonProps) => {
  const { totalItems, isAnimating } = useOrder();

  if (totalItems === 0) return null;

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-xl",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "transition-all duration-300",
        isAnimating && "animate-cart-shake"
      )}
    >
      <ShoppingCart className="h-6 w-6" />
      
      {/* Badge */}
      <span
        className={cn(
          "absolute -top-1 -right-1 h-6 w-6 rounded-full",
          "bg-destructive text-destructive-foreground text-sm font-bold",
          "flex items-center justify-center",
          isAnimating && "animate-cart-pulse"
        )}
      >
        {totalItems}
      </span>
    </Button>
  );
};

export default CartButton;
