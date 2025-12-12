import { useState } from "react";
import { MenuItem } from "@/data/menuData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrder } from "@/contexts/OrderContext";

interface MenuCardProps {
  item: MenuItem;
  index: number;
  onClick: () => void;
}

const placeholderImages: Record<string, string> = {
  entradas: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop",
  hamburgueres: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  petiscos: "https://images.unsplash.com/photo-1585325701165-351af916e581?w=400&h=300&fit=crop",
  sopas: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
  "pratos-principais": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
  tabuas: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
  pizzas: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
  massas: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
  wraps: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
  sobremesas: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
  "menu-infantil": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop",
  bebidas: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
  "vinhos-cocktails": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
};

const formatPrice = (price: number | string) => {
  if (typeof price === "string") return price + " MT";
  return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const MenuCard = ({ item, index, onClick }: MenuCardProps) => {
  const imageUrl = item.image || placeholderImages[item.category] || placeholderImages.entradas;
  const { addItem, animatingItemId } = useOrder();
  const [isAdding, setIsAdding] = useState(false);

  const isCurrentlyAnimating = animatingItemId === item.id;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addItem(item, 1);
    setTimeout(() => setIsAdding(false), 400);
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 cursor-pointer",
        "animate-fade-up",
        isCurrentlyAnimating && "animate-item-added"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Quick Add Button */}
        <Button
          onClick={handleQuickAdd}
          size="icon"
          className={cn(
            "absolute bottom-3 right-3 h-10 w-10 rounded-full",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            "hover:scale-110 shadow-lg",
            isAdding && "scale-125"
          )}
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {item.isVegetarian && (
            <Badge className="bg-green-600/90 text-white text-xs">🥬 Veg</Badge>
          )}
          {item.isSeafood && (
            <Badge className="bg-blue-600/90 text-white text-xs">🦐 Marisco</Badge>
          )}
          {item.isKidsFriendly && (
            <Badge className="bg-pink-600/90 text-white text-xs">👶 Kids</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {item.name}
          </h3>
          <span className="font-body text-primary font-bold whitespace-nowrap text-sm">
            {formatPrice(item.price)}
          </span>
        </div>
        
        {item.description && (
          <p className="font-body text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {item.subcategory && (
          <Badge variant="outline" className="mt-3 text-xs border-border text-muted-foreground">
            {item.subcategory}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuCard;
