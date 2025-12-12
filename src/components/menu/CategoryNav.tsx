import { useRef, useEffect, useState } from "react";
import { menuCategories } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryClick }: CategoryNavProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (categoryId: string) => {
    onCategoryClick(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 160;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isSticky ? "bg-background/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-body text-sm transition-all duration-300",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card hover:bg-secondary text-foreground border border-border hover:border-primary/50"
              )}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
