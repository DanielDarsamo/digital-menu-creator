import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { restaurantInfo } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CustomerInfoDialog from "./CustomerInfoDialog";
import { OrderService } from "@/services/orderService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderStatus from "@/components/menu/OrderStatus";
import OrderHistory from "@/components/menu/OrderHistory";
import { useSession } from "@/contexts/SessionContext";

interface OrderCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const placeholderImages: Record<string, string> = {
  entradas: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=100&h=100&fit=crop",
  hamburgueres: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop",
  petiscos: "https://images.unsplash.com/photo-1585325701165-351af916e581?w=100&h=100&fit=crop",
  sopas: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop",
  "pratos-principais": "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop",
  tabuas: "https://images.unsplash.com/photo-1558030006-450675393462?w=100&h=100&fit=crop",
  pizzas: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop",
  massas: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=100&h=100&fit=crop",
  wraps: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=100&h=100&fit=crop",
  sobremesas: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100&h=100&fit=crop",
  "menu-infantil": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=100&h=100&fit=crop",
  bebidas: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&h=100&fit=crop",
  "vinhos-cocktails": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&h=100&fit=crop",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const OrderCart = ({ isOpen, onClose }: OrderCartProps) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useOrder();
  const { session } = useSession();
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomerInfoSubmit = async (customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    table?: string;
    notes?: string;
    sendToAdmin: boolean;
  }) => {
    setIsSubmitting(true);

    try {
      const orderItems = items.map(cartItem => ({
        id: cartItem.item.id,
        name: cartItem.item.name,
        quantity: cartItem.quantity,
        price: cartItem.item.price,
        category: cartItem.item.category,
      }));

      // Create order in the system
      const order = await OrderService.createOrder(
        orderItems,
        totalPrice,
        {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          table: customerInfo.table,
          notes: customerInfo.notes,
        },
        customerInfo.sendToAdmin,
        session?.id // Pass session ID
      );


      if (!order) {
        toast.error("Erro ao criar pedido", {
          description: "Por favor, tente novamente.",
        });
        setIsSubmitting(false);
        return;
      }


      // Show success message
      toast.success(`Pedido #${order.orderNumber} criado com sucesso!`, {
        description: "Seu pedido está sendo processado.",
        duration: 5000,
      });

      // Clear cart and close dialogs
      clearCart();
      setIsCustomerDialogOpen(false);
      onClose();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Erro ao processar pedido", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    setIsCustomerDialogOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border flex flex-col h-full overflow-hidden">
        <SheetHeader className="shrink-0 mb-4">
          <SheetTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Seu Pedido
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="cart" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-2 shrink-0">
            <TabsTrigger value="cart">Carrinho</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="py-4 space-y-6">
                {/* Active Order Status */}
                <OrderStatus />

                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-body text-lg">
                      O seu carrinho está vazio
                    </p>
                    <p className="text-muted-foreground/70 font-body text-sm mt-2">
                      Adicione itens do menu para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold">Itens no Carrinho</h3>
                    {items.map((cartItem) => {
                      const imageUrl = cartItem.item.image || placeholderImages[cartItem.item.category] || placeholderImages.entradas;
                      const itemPrice = typeof cartItem.item.price === "number" ? cartItem.item.price : 0;

                      return (
                        <div
                          key={cartItem.item.id}
                          className="flex gap-4 p-3 rounded-lg bg-secondary/50 animate-fade-up"
                        >
                          <img
                            src={imageUrl}
                            alt={cartItem.item.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-foreground font-medium truncate">
                              {cartItem.item.name}
                            </h4>
                            <p className="text-primary font-semibold mt-1">
                              {formatPrice(itemPrice * cartItem.quantity)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 mt-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-border"
                                onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-foreground font-medium w-6 text-center">
                                {cartItem.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-border"
                                onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(cartItem.item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {items.length > 0 && (
              <div className="pt-4 space-y-4 border-t border-border mt-auto shrink-0 bg-card">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-body">Total Compra</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                    onClick={clearCart}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>

                  <Button
                    onClick={handleSendWhatsApp}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full font-semibold",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">Enviando...</span>
                    ) : (
                      "Finalizar"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto -mx-6 px-6 data-[state=inactive]:hidden">
            <div className="py-4">
              <OrderHistory />
            </div>
          </TabsContent>
        </Tabs>

        <CustomerInfoDialog
          isOpen={isCustomerDialogOpen}
          onClose={() => setIsCustomerDialogOpen(false)}
          onSubmit={handleCustomerInfoSubmit}
          session={session}
        />
      </SheetContent>
    </Sheet>
  );
};

export default OrderCart;
