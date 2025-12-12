import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { restaurantInfo } from "@/data/menuData";
import { cn } from "@/lib/utils";

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

  const handleSendWhatsApp = () => {
    let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
    
    items.forEach((cartItem) => {
      const price = typeof cartItem.item.price === "number" 
        ? formatPrice(cartItem.item.price * cartItem.quantity)
        : cartItem.item.price + " MT";
      message += `• ${cartItem.quantity}x ${cartItem.item.name} - ${price}\n`;
    });
    
    message += `\n📋 Total: ${formatPrice(totalPrice)}\n\nPor favor, confirme a disponibilidade. Obrigado!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${restaurantInfo.whatsapp}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Seu Pedido
            {totalItems > 0 && (
              <span className="text-sm font-body text-muted-foreground">
                ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-body text-lg">
              O seu carrinho está vazio
            </p>
            <p className="text-muted-foreground/70 font-body text-sm mt-2">
              Adicione itens do menu para começar
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
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
            </ScrollArea>

            <div className="pt-4 space-y-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-body">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                onClick={clearCart}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Carrinho
              </Button>

              <Button
                onClick={handleSendWhatsApp}
                className={cn(
                  "w-full h-14 text-lg font-semibold",
                  "bg-green-600 text-white hover:bg-green-700",
                  "transition-all duration-300 hover:scale-[1.02]"
                )}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Enviar Pedido via WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default OrderCart;
