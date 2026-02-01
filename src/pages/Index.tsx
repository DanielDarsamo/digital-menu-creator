import { useState, useEffect, useMemo } from "react";
// import { menuCategories } from "@/data/menuData"; // Deprecated
import { MenuService } from "@/services/menuService";
import { toast } from "sonner";
import HeroSection from "@/components/menu/HeroSection";
import CategoryNav from "@/components/menu/CategoryNav";
import SearchFilter from "@/components/menu/SearchFilter";
import MenuSection from "@/components/menu/MenuSection";

import LocationButton from "@/components/menu/LocationButton";
import Footer from "@/components/menu/Footer";
import CartButton from "@/components/menu/CartButton";
import OrderCart from "@/components/menu/OrderCart";
import { OrderProvider } from "@/contexts/OrderContext";

const IndexContent = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await MenuService.getFullMenu();
        setMenuCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load menu", error);
        toast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredCategories = useMemo(() => {
    return menuCategories.map((category) => {
      let items = category.items;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter((item: any) =>
          item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)
        );
      }
      if (activeFilters.length > 0) {
        items = items.filter((item: any) => {
          if (activeFilters.includes("vegetarian") && item.isVegetarian) return true;
          if (activeFilters.includes("seafood") && item.isSeafood) return true;
          if (activeFilters.includes("kids") && item.isKidsFriendly) return true;
          return false;
        });
      }
      return { ...category, filteredItems: items };
    });
  }, [searchQuery, activeFilters, menuCategories]);

  // Scroll spy (needs to re-run when categories change/load)
  useEffect(() => {
    if (loading) return;

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
  }, [loading, menuCategories]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) => prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]);
  };

  const totalFilteredItems = filteredCategories.reduce((acc, cat) => acc + cat.filteredItems.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-muted-foreground">Loading Menu...</div>
      </div>
    );
  }

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
      <CartButton onClick={() => setIsCartOpen(true)} />

      <LocationButton />
      <OrderCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

import { SessionProvider } from "@/contexts/SessionContext";
import EntryDialog from "@/components/menu/EntryDialog";

const Index = () => {
  return (
    <SessionProvider>
      <OrderProvider>
        <IndexContent />
        <EntryDialog />
      </OrderProvider>
    </SessionProvider>
  );
};

export default Index;
