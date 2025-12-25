import { Gift, Ticket, Percent } from "lucide-react";

export const SpecialOffers = () => {
  const offers = [
    {
      icon: Gift,
      title: "Buy 4 Get 1 Free",
      description: "Watch 4 shows in a month and get your 5th ticket absolutely free!",
      gradient: "from-primary/20 to-accent/20",
    },
    {
      icon: Ticket,
      title: "FIRSTORDER - 10% Off",
      description: "Use code FIRSTORDER on your first booking to get 10% discount.",
      gradient: "from-accent/20 to-primary/20",
    },
    {
      icon: Percent,
      title: "Special Promo",
      description: "Use code Priyorchotobhai for an exclusive 90% discount!",
      gradient: "from-destructive/20 to-primary/20",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Special <span className="text-gradient-gold">Offers</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Don't miss out on these amazing deals and save on your next movie or concert experience
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl p-6 border border-border/50 bg-gradient-to-br ${offer.gradient} hover:border-primary/50 transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <offer.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-display font-semibold mb-2">
                  {offer.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {offer.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
