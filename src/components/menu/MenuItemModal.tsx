import { useState } from "react";
import { MenuItem } from "@/data/menuData";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { cn } from "@/lib/utils";

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const placeholderImages: Record<string, string> = {
  entradas: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&h=400&fit=crop",
  hamburgueres: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
  petiscos: "https://images.unsplash.com/photo-1585325701165-351af916e581?w=600&h=400&fit=crop",
  sopas: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
  "pratos-principais": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
  tabuas: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop",
  pizzas: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  massas: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop",
  wraps: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop",
  sobremesas: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop",
  "menu-infantil": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&h=400&fit=crop",
  bebidas: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop",
  "vinhos-cocktails": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
};

const formatPrice = (price: number | string) => {
  if (typeof price === "string") return price + " MT";
  return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const MenuItemModal = ({ item, isOpen, onClose }: MenuItemModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useOrder();

  if (!item) return null;

  const imageUrl = item.image || placeholderImages[item.category] || placeholderImages.entradas;

  const handleAddToCart = () => {
    addItem(item, quantity);
    setQuantity(1);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(1);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
        {/* Image */}
        <div className="relative h-56 sm:h-64">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {item.isVegetarian && (
              <Badge className="bg-green-600/90 text-white">🥬 Vegetariano</Badge>
            )}
            {item.isSeafood && (
              <Badge className="bg-blue-600/90 text-white">🦐 Marisco</Badge>
            )}
            {item.isKidsFriendly && (
              <Badge className="bg-pink-600/90 text-white">👶 Kids</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogTitle className="font-display text-2xl text-primary mb-2">
            {item.name}
          </DialogTitle>
          
          <p className="text-2xl font-bold text-foreground mb-4">
            {formatPrice(item.price)}
          </p>

          {item.description && (
            <p className="font-body text-muted-foreground mb-6">
              {item.description}
            </p>
          )}

          {item.subcategory && (
            <Badge variant="outline" className="mb-6 border-border text-muted-foreground">
              {item.subcategory}
            </Badge>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="text-3xl font-bold text-foreground w-12 text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className={cn(
              "w-full h-14 text-lg font-semibold",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "transition-all duration-300 hover:scale-[1.02]"
            )}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adicionar ao Pedido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal;
