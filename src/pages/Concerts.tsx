import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { ConcertCard } from "@/components/concerts/ConcertCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

const Concerts = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchConcerts = async () => {
      const { data, error } = await supabase
        .from("concerts")
        .select("id, title, artist, poster_url, date, venue_name, price_min, price_max, status")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching concerts:", error);
      } else {
        setConcerts(data || []);
      }
      setLoading(false);
    };

    fetchConcerts();
  }, []);

  // Filter concerts
  const filteredConcerts = concerts.filter((concert) => {
    const matchesSearch = 
      concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Transform to ConcertCard format
  const transformedConcerts = filteredConcerts.map((concert) => ({
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
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient-gold">Concerts</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience live music with your favorite artists
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search concerts or artists..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Concerts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredConcerts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No concerts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedConcerts.map((concert, index) => (
              <div
                key={concert.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ConcertCard concert={concert} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Concerts;
