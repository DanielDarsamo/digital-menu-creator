import { useState, useEffect, useMemo } from "react";
import { menuCategories } from "@/data/menuData";
import HeroSection from "@/components/menu/HeroSection";
import CategoryNav from "@/components/menu/CategoryNav";
import SearchFilter from "@/components/menu/SearchFilter";
import MenuSection from "@/components/menu/MenuSection";
import WhatsAppButton from "@/components/menu/WhatsAppButton";
import Footer from "@/components/menu/Footer";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const category of menuCategories) {
        const element = document.getElementById(category.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveCategory(category.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredCategories = useMemo(() => {
    return menuCategories.map((category) => {
      let items = category.items;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter((item) =>
          item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)
        );
      }
      if (activeFilters.length > 0) {
        items = items.filter((item) => {
          if (activeFilters.includes("vegetarian") && item.isVegetarian) return true;
          if (activeFilters.includes("seafood") && item.isSeafood) return true;
          if (activeFilters.includes("kids") && item.isKidsFriendly) return true;
          return false;
        });
      }
      return { ...category, filteredItems: items };
    });
  }, [searchQuery, activeFilters]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) => prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]);
  };

  const totalFilteredItems = filteredCategories.reduce((acc, cat) => acc + cat.filteredItems.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <CategoryNav activeCategory={activeCategory} onCategoryClick={setActiveCategory} />
      <SearchFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} activeFilters={activeFilters} onFilterToggle={handleFilterToggle} />
      {totalFilteredItems === 0 && (
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-body text-lg">Nenhum item encontrado.</p>
        </div>
      )}
      <main>
        {filteredCategories.map((category) => (
          <MenuSection key={category.id} category={category} filteredItems={category.filteredItems} />
        ))}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
