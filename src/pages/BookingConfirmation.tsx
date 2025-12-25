import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MapPin, Clock, Ticket, Download, Home, User, Film, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BookingDetails {
  id: string;
  booking_type: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number | null;
  status: string | null;
  booking_date: string;
  promo_code: string | null;
  booking_items: Array<{
    id: string;
    ticket_type: string;
    price: number;
    seat_id: string | null;
    seats?: {
      row_label: string;
      seat_number: number;
    } | null;
  }>;
  showtimes?: {
    start_time: string;
    format: string | null;
    halls: { name: string } | null;
    movies: { 
      title: string; 
      poster_url: string | null;
      duration: number;
    } | null;
  } | null;
  concerts?: {
    title: string;
    artist: string;
    date: string;
    venue_name: string;
    poster_url: string | null;
  } | null;
}

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && id) {
      fetchBooking();
    }
  }, [user, authLoading, id, navigate]);

  const fetchBooking = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_type, total_amount, final_amount, discount_amount, status, booking_date, promo_code,
        booking_items (
          id, ticket_type, price, seat_id,
          seats (row_label, seat_number)
        ),
        showtimes (
          start_time, format,
          halls (name),
          movies (title, poster_url, duration)
        ),
        concerts (title, artist, date, venue_name, poster_url)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching booking:", error);
      navigate("/profile");
      return;
    }

    if (!data) {
      navigate("/profile");
      return;
    }

    setBooking(data as BookingDetails);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      </Layout>
    );
  }

  const isMovie = booking.booking_type === "movie";
  const title = isMovie ? booking.showtimes?.movies?.title : booking.concerts?.title;
  const poster = isMovie ? booking.showtimes?.movies?.poster_url : booking.concerts?.poster_url;
  const venue = isMovie ? booking.showtimes?.halls?.name : booking.concerts?.venue_name;
  const eventDate = isMovie 
    ? booking.showtimes?.start_time 
    : booking.concerts?.date;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Booking <span className="text-gradient-gold">Confirmed!</span>
          </h1>
          <p className="text-muted-foreground">
            Your tickets have been booked successfully
          </p>
        </div>

        {/* Booking Card */}
        <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
          {/* Event Header */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={poster || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge variant="secondary" className="mb-2">
                {isMovie ? <Film className="w-3 h-3 mr-1" /> : <Music className="w-3 h-3 mr-1" />}
                {isMovie ? "Movie" : "Concert"}
              </Badge>
              <h2 className="text-2xl font-display font-bold">{title}</h2>
              {!isMovie && booking.concerts?.artist && (
                <p className="text-primary">{booking.concerts.artist}</p>
              )}
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Booking ID */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono font-semibold">{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                {booking.status}
              </Badge>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {eventDate ? format(new Date(eventDate), "EEEE, MMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {eventDate ? format(new Date(eventDate), "h:mm a") : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium">{venue}</p>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Tickets ({booking.booking_items.length})</h3>
              </div>
              <div className="space-y-2">
                {booking.booking_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {item.seats 
                          ? `${item.seats.row_label}${item.seats.seat_number}` 
                          : item.ticket_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {item.ticket_type}
                      </span>
                    </div>
                    <span className="font-medium">৳{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{booking.total_amount}</span>
              </div>
              {booking.discount_amount && booking.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Discount {booking.promo_code && `(${booking.promo_code})`}</span>
                  <span>-৳{booking.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total Paid</span>
                <span className="text-primary">৳{booking.final_amount}</span>
              </div>
            </div>

            {/* Booking Date */}
            <p className="text-center text-sm text-muted-foreground">
              Booked on {format(new Date(booking.booking_date), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <Link to="/profile">
              <User className="w-4 h-4" />
              View All Bookings
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default BookingConfirmation;
