import { useState } from "react";
import { MenuCategory, MenuItem } from "@/data/menuData";
import MenuCard from "./MenuCard";
import MenuItemModal from "./MenuItemModal";

interface MenuSectionProps {
  category: MenuCategory;
  filteredItems: MenuCategory["items"];
}

const MenuSection = ({ category, filteredItems }: MenuSectionProps) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  if (filteredItems.length === 0) return null;

  return (
    <section id={category.id} className="py-12 scroll-mt-40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">{category.icon}</span>
          <div className="flex-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {category.name}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent mt-2 rounded-full" />
          </div>
          <span className="font-body text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Item Modal */}
      <MenuItemModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
};

export default MenuSection;
