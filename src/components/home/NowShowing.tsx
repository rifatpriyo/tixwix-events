import { useState, useEffect } from "react";
import { MovieCard } from "@/components/movies/MovieCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Movie {
  id: string;
  title: string;
  poster_url: string | null;
  genre: string[];
  rating: number | null;
  duration: number;
  release_date: string;
  status: string | null;
}

export const NowShowing = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, poster_url, genre, rating, duration, release_date, status")
        .eq("status", "now_showing")
        .order("release_date", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching movies:", error);
      } else {
        setMovies(data || []);
      }
      setLoading(false);
    };

    fetchMovies();
  }, []);

  // Transform to MovieCard format
  const transformedMovies = movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster_url || "/placeholder.svg",
    genre: movie.genre,
    rating: movie.rating || 0,
    duration: `${movie.duration} min`,
    releaseDate: movie.release_date,
    status: movie.status as "now_showing" | "coming_soon",
  }));

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Now <span className="text-gradient-gold">Showing</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Catch the latest blockbusters in our premium halls
            </p>
          </div>
          <Link to="/movies" className="hidden md:block">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {transformedMovies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/movies">
            <Button variant="outline" className="gap-2">
              View All Movies
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
