import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { MovieCard } from "@/components/movies/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";
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

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, poster_url, genre, rating, duration, release_date, status")
        .order("release_date", { ascending: false });

      if (error) {
        console.error("Error fetching movies:", error);
      } else {
        setMovies(data || []);
      }
      setLoading(false);
    };

    fetchMovies();
  }, []);

  // Get unique genres
  const allGenres = movies.flatMap((movie) => movie.genre);
  const uniqueGenres = [...new Set(allGenres)];

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || movie.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  // Transform to MovieCard format
  const transformedMovies = filteredMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster_url || "/placeholder.svg",
    genre: movie.genre.join(", "),
    rating: movie.rating || 0,
    duration: movie.duration,
    releaseDate: movie.release_date,
    status: movie.status as "now_showing" | "coming_soon",
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient-gold">Movies</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and book tickets for the latest blockbusters
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedGenre === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGenre(null)}
            >
              All
            </Button>
            {uniqueGenres.slice(0, 6).map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {transformedMovies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movies;
