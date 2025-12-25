import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Movie {
  id: string;
  title: string;
  poster: string;
  genre: string[];
  rating: number;
  duration: string;
  releaseDate: string;
  status: "now_showing" | "coming_soon";
}

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={movie.status === "now_showing" ? "default" : "secondary"}
            className={movie.status === "now_showing" ? "bg-primary text-primary-foreground" : ""}
          >
            {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-xs font-medium">{movie.rating.toFixed(1)}</span>
        </div>

        {/* Book Now Button - appears on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary text-primary-foreground text-center py-2 rounded-lg font-medium text-sm">
            Book Now
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{movie.genre.slice(0, 2).join(", ")}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.duration}
          </span>
        </div>
      </div>
    </Link>
  );
};
