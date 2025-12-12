import { MessageCircle } from "lucide-react";
import { restaurantInfo } from "@/data/menuData";
import { cn } from "@/lib/utils";

const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/${restaurantInfo.whatsapp}?text=${encodeURIComponent(
    "Olá! Gostaria de fazer um pedido ou reserva."
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2 px-5 py-4",
        "bg-green-500 hover:bg-green-600 text-white",
        "rounded-full shadow-lg shadow-green-500/30",
        "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40",
        "group"
      )}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-body font-medium hidden sm:inline group-hover:inline">
        Pedir no WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
