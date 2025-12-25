import { Button } from "@/components/ui/button";
import { Play, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop"
          alt="Cinema"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Now Booking</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
            Get your tickets <br />
            to the show:{" "}
            <span className="text-gradient-gold">Book your movie experience now!</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-muted-foreground max-w-lg">
            Experience the magic of cinema with premium seats, latest blockbusters, and unforgettable concert nights at TixWix.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/movies">
              <Button size="lg" className="gap-2 cinema-glow">
                <Ticket className="w-5 h-5" />
                Book Movie Tickets
              </Button>
            </Link>
            <Link to="/concerts">
              <Button size="lg" variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10">
                <Play className="w-5 h-5" />
                Explore Concerts
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-8">
            <div>
              <p className="text-3xl font-display font-bold text-primary">6</p>
              <p className="text-sm text-muted-foreground">Cinema Halls</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-primary">1</p>
              <p className="text-sm text-muted-foreground">Convention Hall</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Online Booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Movie Posters */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3">
        <div className="relative">
          <div className="absolute -top-20 right-20 w-48 rounded-xl overflow-hidden shadow-2xl rotate-6 animate-float">
            <img
              src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop"
              alt="Movie Poster"
              className="w-full"
            />
          </div>
          <div className="absolute top-20 right-60 w-40 rounded-xl overflow-hidden shadow-2xl -rotate-6 animate-float" style={{ animationDelay: "1s" }}>
            <img
              src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop"
              alt="Movie Poster"
              className="w-full"
            />
          </div>
          <div className="absolute top-60 right-32 w-44 rounded-xl overflow-hidden shadow-2xl rotate-3 animate-float" style={{ animationDelay: "2s" }}>
            <img
              src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop"
              alt="Movie Poster"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Cinema Seats Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
