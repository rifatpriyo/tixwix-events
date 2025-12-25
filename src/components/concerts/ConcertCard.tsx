import { Link } from "react-router-dom";
import { Calendar, MapPin, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface Concert {
  id: string;
  title: string;
  artist: string;
  poster: string;
  date: string;
  venue: string;
  priceRange: { min: number; max: number };
  status: "upcoming" | "sold_out" | "few_left";
}

interface ConcertCardProps {
  concert: Concert;
}

export const ConcertCard = ({ concert }: ConcertCardProps) => {
  const statusStyles = {
    upcoming: "bg-accent text-accent-foreground",
    sold_out: "bg-destructive text-destructive-foreground",
    few_left: "bg-primary text-primary-foreground",
  };

  const statusLabels = {
    upcoming: "Available",
    sold_out: "Sold Out",
    few_left: "Few Left",
  };

  return (
    <Link
      to={`/concerts/${concert.id}`}
      className="group block rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Poster */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={concert.poster}
          alt={concert.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={statusStyles[concert.status]}>
            {statusLabels[concert.status]}
          </Badge>
        </div>

        {/* Date Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {format(new Date(concert.date), "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {concert.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Music className="w-3 h-3" />
            {concert.artist}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{concert.venue}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">From</span>
            <p className="text-sm font-semibold text-primary">৳{concert.priceRange.min}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};
