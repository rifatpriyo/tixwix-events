import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Calendar, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface MLSMatch {
  id: string;
  home_team: string;
  away_team: string;
  home_logo_url: string | null;
  away_logo_url: string | null;
  match_date: string;
  venue: string;
  status: string | null;
  available_tickets: number;
  total_tickets: number;
  description: string | null;
}

const MLSMatches = () => {
  const [matches, setMatches] = useState<MLSMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("mls_matches")
        .select("*")
        .order("match_date", { ascending: true });

      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setMatches(data || []);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const filtered = matches.filter(
    (m) =>
      m.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.away_team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient-gold">MLS Soccer</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Book your tickets for upcoming MLS matches with an interactive 3D stadium view
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No matches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((match, index) => (
              <Link key={match.id} to={`/mls/${match.id}`}>
                <Card
                  className="glass-card hover:border-primary/50 transition-all cursor-pointer group animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    {/* Match header bar */}
                    <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-700/20 px-6 py-3 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        >
                          MLS
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {match.available_tickets.toLocaleString()} tickets left
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Teams */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1">
                          <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-2 text-2xl">
                            ⚽
                          </div>
                          <p className="font-bold text-sm">{match.home_team}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Home</p>
                        </div>

                        <div className="px-4 text-center">
                          <p className="text-2xl font-display font-bold text-primary">VS</p>
                        </div>

                        <div className="text-center flex-1">
                          <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-2 text-2xl">
                            ⚽
                          </div>
                          <p className="font-bold text-sm">{match.away_team}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Away</p>
                        </div>
                      </div>

                      {/* Date & Venue */}
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {format(new Date(match.match_date), "EEEE, MMMM d, yyyy • h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{match.venue}</span>
                        </div>
                      </div>

                      {match.description && (
                        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                          {match.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MLSMatches;
