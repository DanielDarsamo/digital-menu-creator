import { restaurantInfo } from "@/data/menuData";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border border-primary rounded-full" />
        <div className="absolute bottom-40 right-20 w-48 h-48 border border-primary rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-primary/50 rounded-full" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-up">
          <img 
            src={logo} 
            alt="Fortaleza de Sabores Logo" 
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto mb-6"
          />
        </div>
        
        {/* Restaurant Name */}
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-gold mb-4 animate-fade-up text-shadow-gold" style={{ animationDelay: "0.1s" }}>
          {restaurantInfo.name}
        </h1>
        
        {/* Tagline */}
        <p className="font-body text-lg md:text-xl text-muted-foreground mb-12 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {restaurantInfo.tagline}
        </p>
        
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-primary" />
          <span className="text-2xl">✦</span>
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary" />
        </div>
        
        {/* Story */}
        <div className="max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">Nossa História</h2>
          <p className="font-body text-muted-foreground leading-relaxed text-sm md:text-base">
            {restaurantInfo.story}
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <div className="inline-flex flex-col items-center text-muted-foreground">
            <span className="text-xs mb-2 font-body">Explorar Menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
