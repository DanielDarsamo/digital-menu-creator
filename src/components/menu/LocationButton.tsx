import { MapPin } from "lucide-react";
import { restaurantInfo } from "@/data/menuData";
import { cn } from "@/lib/utils";

const LocationButton = () => {
    return (
        <a
            href={restaurantInfo.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "fixed bottom-24 right-6 z-50",
                "flex items-center gap-2 px-5 py-4",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "rounded-full shadow-lg shadow-primary/30",
                "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40",
                "group"
            )}
            aria-label="Ver localização no Google Maps"
        >
            <MapPin className="w-6 h-6" />
            <span className="font-body font-medium hidden sm:inline group-hover:inline">
                Ver Localização
            </span>
        </a>
    );
};

export default LocationButton;
