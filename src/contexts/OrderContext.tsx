import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { MenuItem } from "@/data/menuData";
import { useSession } from "./SessionContext";
import { OrderService } from "@/services/orderService";
import { toast } from "sonner";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface OrderContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isAnimating: boolean;
  animatingItemId: string | null;
  activeOrders: any[]; // Add active orders
  refreshOrders: () => void; // Add manual refresh
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("fortaleza-cart");
    return saved ? JSON.parse(saved) : [];
  });
  const { session } = useSession();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("fortaleza-cart", JSON.stringify(items));
  }, [items]);

  // Computed values
  const totalItems = items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  const totalPrice = items.reduce((sum, cartItem) => {
    const price = typeof cartItem.item.price === "number" ? cartItem.item.price : 0;
    return sum + price * cartItem.quantity;
  }, 0);

  const refreshOrders = useCallback(async () => {
    if (session?.id) {
      const orders = await OrderService.getOrdersBySession(session.id);
      setActiveOrders(orders);
    } else {
      setActiveOrders([]);
    }
  }, [session?.id]);

  // Initial fetch and polling
  useEffect(() => {
    refreshOrders();

    // Optional: Poll every 30 seconds to keep status updated
    const interval = setInterval(refreshOrders, 30000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  const addItem = useCallback((item: MenuItem, quantity = 1) => {
    setAnimatingItemId(item.id);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setAnimatingItemId(null);
    }, 600);

    setItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.item.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { item, quantity }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((cartItem) => cartItem.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((cartItem) =>
        cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("fortaleza-cart");
  }, []);

  return (
    <OrderContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isAnimating,
        animatingItemId,
        activeOrders,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
