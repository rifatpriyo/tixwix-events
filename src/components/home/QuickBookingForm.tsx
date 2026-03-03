import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Film, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Movie {
  id: string;
  title: string;
  status: string | null;
}

export const QuickBookingForm = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, status")
        .eq("status", "now_showing")
        .order("title");

      if (!error && data) {
        setMovies(data);
      }
    };

    fetchMovies();
  }, []);
  
  const handleBookNow = () => {
    if (selectedMovie && selectedMovie !== "all") {
      navigate(`/movies/${selectedMovie}`);
    } else {
      navigate("/movies");
    }
  };

  return (
    <section className="relative -mt-12 md:-mt-16 z-20 container mx-auto px-4">
      <div className="glass-card rounded-2xl p-4 md:p-8 cinema-glow">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 items-end">
          {/* Location */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1.5 md:gap-2">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              Location
            </label>
            <Select defaultValue="dhaka">
              <SelectTrigger className="bg-secondary border-border h-10 md:h-10 text-sm">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dhaka">Dhaka, Bangladesh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1.5 md:gap-2">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              Date
            </label>
            <Select defaultValue="today">
              <SelectTrigger className="bg-secondary border-border h-10 md:h-10 text-sm">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="jan5">Jan 05, 2026</SelectItem>
                <SelectItem value="jan6">Jan 06, 2026</SelectItem>
                <SelectItem value="jan7">Jan 07, 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Movie */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1.5 md:gap-2">
              <Film className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              Movie
            </label>
            <Select value={selectedMovie} onValueChange={setSelectedMovie}>
              <SelectTrigger className="bg-secondary border-border h-10 md:h-10 text-sm">
                <SelectValue placeholder="All Movies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movies</SelectItem>
                {movies.map((movie) => (
                  <SelectItem key={movie.id} value={movie.id}>
                    {movie.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* People */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1.5 md:gap-2">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              People
            </label>
            <Select defaultValue="2">
              <SelectTrigger className="bg-secondary border-border h-10 md:h-10 text-sm">
                <SelectValue placeholder="Number of people" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Person</SelectItem>
                <SelectItem value="2">2 People</SelectItem>
                <SelectItem value="3">3 People</SelectItem>
                <SelectItem value="4">4 People</SelectItem>
                <SelectItem value="5">5+ People</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Book Now Button */}
          <Button onClick={handleBookNow} size="lg" className="w-full gap-2 h-10 md:h-10 col-span-2 md:col-span-1 text-base md:text-sm">
            <Search className="w-4 h-4" />
            Book Now
          </Button>
        </div>
      </div>
    </section>
  );
};
