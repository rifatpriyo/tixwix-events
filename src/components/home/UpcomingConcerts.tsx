import { ConcertCard } from "@/components/concerts/ConcertCard";
import { concerts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music } from "lucide-react";
import { Link } from "react-router-dom";

export const UpcomingConcerts = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Upcoming <span className="text-gradient-gold">Concerts</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Live performances at our Convention Hall
              </p>
            </div>
          </div>
          <Link to="/concerts" className="hidden md:block">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Concerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concerts.slice(0, 2).map((concert, index) => (
            <div
              key={concert.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ConcertCard concert={concert} />
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/concerts">
            <Button variant="outline" className="gap-2">
              View All Concerts
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
