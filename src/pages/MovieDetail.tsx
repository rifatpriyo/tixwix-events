import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Calendar, Play, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { SeatMap } from "@/components/booking/SeatMap";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  genre: string[];
  duration: number;
  rating: number | null;
  release_date: string;
  language: string | null;
  director: string | null;
  cast_members: string[] | null;
  age_rating: string | null;
  status: string | null;
}

interface Showtime {
  id: string;
  start_time: string;
  end_time: string;
  price: number;
  format: string | null;
  available_seats: number;
  hall_id: string;
  halls: {
    id: string;
    name: string;
    capacity: number;
  };
}

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      if (!id) return;

      // Fetch movie
      const { data: movieData, error: movieError } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (movieError) {
        console.error("Error fetching movie:", movieError);
        navigate("/movies");
        return;
      }

      if (!movieData) {
        navigate("/movies");
        return;
      }

      setMovie(movieData);

      // Fetch showtimes with hall info
      const { data: showtimesData, error: showtimesError } = await supabase
        .from("showtimes")
        .select(`
          id, start_time, end_time, price, format, available_seats, hall_id,
          halls (id, name, capacity)
        `)
        .eq("movie_id", id)
        .eq("is_active", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time");

      if (showtimesError) {
        console.error("Error fetching showtimes:", showtimesError);
      } else {
        setShowtimes(showtimesData as Showtime[] || []);
      }

      setLoading(false);
    };

    fetchMovieAndShowtimes();
  }, [id, navigate]);

  // Get available dates from showtimes
  const availableDates = [...new Set(showtimes.map((st) => format(new Date(st.start_time), "yyyy-MM-dd")))];
  
  // Filter showtimes by selected date
  const filteredShowtimes = showtimes.filter(
    (st) => format(new Date(st.start_time), "yyyy-MM-dd") === selectedDate
  );

  const handleSelectShowtime = (showtime: Showtime) => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }
    setSelectedShowtime(showtime);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!movie) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Movie not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-20">
        {/* Hero Banner */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
          <img
            src={movie.poster_url || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover opacity-30"
          />
          
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 z-20"
            onClick={() => navigate("/movies")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Movie Info */}
        <div className="container mx-auto px-4 -mt-40 relative z-20">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.poster_url || "/placeholder.svg"}
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-xl shadow-2xl mx-auto md:mx-0"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))}
                {movie.age_rating && (
                  <Badge variant="outline" className="border-primary text-primary">
                    {movie.age_rating}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                {movie.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-semibold text-foreground">{movie.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(movie.release_date), "MMM d, yyyy")}</span>
                </div>
                {movie.language && <span>{movie.language}</span>}
              </div>

              <p className="text-muted-foreground mb-6 max-w-2xl">
                {movie.description}
              </p>

              {movie.director && (
                <p className="mb-2">
                  <span className="text-muted-foreground">Director:</span>{" "}
                  <span className="font-medium">{movie.director}</span>
                </p>
              )}

              {movie.cast_members && movie.cast_members.length > 0 && (
                <p className="mb-6">
                  <span className="text-muted-foreground">Cast:</span>{" "}
                  <span className="font-medium">{movie.cast_members.join(", ")}</span>
                </p>
              )}

            </div>
          </div>

          {/* Showtimes Section */}
          {selectedShowtime ? (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold">Select Your Seats</h2>
                <Button variant="outline" onClick={() => setSelectedShowtime(null)}>
                  Change Showtime
                </Button>
              </div>
              <SeatMap 
                showtime={selectedShowtime} 
                movie={movie}
                onBack={() => setSelectedShowtime(null)}
              />
            </div>
          ) : (
            <div className="mt-12 mb-20">
              <h2 className="text-2xl font-display font-bold mb-6">Book Tickets</h2>

              {availableDates.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No showtimes available at the moment</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Date Selection */}
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                    {availableDates.slice(0, 7).map((date) => {
                      const dateObj = new Date(date);
                      return (
                        <Button
                          key={date}
                          variant={selectedDate === date ? "default" : "outline"}
                          className="flex-shrink-0 flex-col h-auto py-3 px-4"
                          onClick={() => setSelectedDate(date)}
                        >
                          <span className="text-xs">{format(dateObj, "EEE")}</span>
                          <span className="text-lg font-bold">{format(dateObj, "d")}</span>
                          <span className="text-xs">{format(dateObj, "MMM")}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Showtimes Grid */}
                  <div className="grid gap-4">
                    {filteredShowtimes.length === 0 ? (
                      <Card className="glass-card">
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground">No showtimes available for this date</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredShowtimes.map((showtime) => (
                        <Card key={showtime.id} className="glass-card hover:border-primary/50 transition-colors">
                          <CardContent className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-2xl font-bold">
                                  {format(new Date(showtime.start_time), "h:mm a")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {showtime.halls?.name}
                                </p>
                              </div>
                              <Badge variant="secondary">{showtime.format}</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">৳{showtime.price}</p>
                                <p className="text-sm text-muted-foreground">
                                  {showtime.available_seats} seats left
                                </p>
                              </div>
                              <Button 
                                onClick={() => handleSelectShowtime(showtime)}
                                disabled={showtime.available_seats === 0}
                              >
                                {showtime.available_seats === 0 ? "Sold Out" : "Select"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MovieDetail;
