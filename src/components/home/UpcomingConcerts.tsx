import { useState, useEffect } from "react";
import { ConcertCard } from "@/components/concerts/ConcertCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Concert {
  id: string;
  title: string;
  artist: string;
  poster_url: string | null;
  date: string;
  venue_name: string;
  price_min: number;
  price_max: number;
  status: string | null;
}

export const UpcomingConcerts = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      const { data, error } = await supabase
        .from("concerts")
        .select("id, title, artist, poster_url, date, venue_name, price_min, price_max, status")
        .order("date", { ascending: true })
        .limit(2);

      if (error) {
        console.error("Error fetching concerts:", error);
      } else {
        setConcerts(data || []);
      }
      setLoading(false);
    };

    fetchConcerts();
  }, []);

  // Transform to ConcertCard format
  const transformedConcerts = concerts.map((concert) => ({
    id: concert.id,
    title: concert.title,
    artist: concert.artist,
    poster: concert.poster_url || "/placeholder.svg",
    date: concert.date,
    venue: concert.venue_name,
    priceRange: { min: concert.price_min, max: concert.price_max },
    status: (concert.status === "upcoming" ? "upcoming" : concert.status === "sold_out" ? "sold_out" : "few_left") as "upcoming" | "sold_out" | "few_left",
  }));

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transformedConcerts.map((concert, index) => (
              <div
                key={concert.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ConcertCard concert={concert} />
              </div>
            ))}
          </div>
        )}

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
