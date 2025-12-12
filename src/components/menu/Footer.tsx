import { MapPin, Phone, Clock } from "lucide-react";
import { restaurantInfo } from "@/data/menuData";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Logo and Name */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary mb-4">
            <span className="text-3xl">🏰</span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-gold text-shadow-gold">
            {restaurantInfo.name}
          </h3>
          <p className="font-body text-muted-foreground text-sm mt-2">
            {restaurantInfo.tagline}
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Location */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-2">
              Localização
            </h4>
            <a
              href={restaurantInfo.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              {restaurantInfo.address}
            </a>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-2">
              Contacto
            </h4>
            <a
              href={`tel:+258${restaurantInfo.phone.replace(/\s/g, "")}`}
              className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
            >
              +258 {restaurantInfo.phone}
            </a>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-2">
              Horário
            </h4>
            <p className="font-body text-sm text-muted-foreground">
              {restaurantInfo.hours}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-border" />
          <span className="text-xl text-primary">✦</span>
          <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} {restaurantInfo.name}. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Feito com ❤️ em Maputo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
