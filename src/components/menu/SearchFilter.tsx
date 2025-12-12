import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const filters = [
  { id: "vegetarian", label: "Vegetariano", icon: "🥬" },
  { id: "seafood", label: "Mariscos", icon: "🦐" },
  { id: "kids", label: "Infantil", icon: "👶" },
];

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterToggle,
}: SearchFilterProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar no menu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-10 py-6 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-full focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Filter className="w-5 h-5 text-muted-foreground mr-1 hidden md:block" />
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilters.includes(filter.id) ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-4 py-2 text-sm transition-all duration-300",
                activeFilters.includes(filter.id)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card border-border hover:border-primary/50 hover:bg-secondary"
              )}
              onClick={() => onFilterToggle(filter.id)}
            >
              <span className="mr-1">{filter.icon}</span>
              {filter.label}
            </Badge>
          ))}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => activeFilters.forEach((f) => onFilterToggle(f))}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
