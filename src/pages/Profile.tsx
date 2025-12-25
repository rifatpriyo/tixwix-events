import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Ticket, Film, Music, Calendar, MapPin, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";

interface Booking {
  id: string;
  booking_type: string;
  total_amount: number;
  final_amount: number;
  status: string | null;
  booking_date: string;
  booking_items: Array<{
    id: string;
    ticket_type: string;
    price: number;
    seat_id: string | null;
  }>;
  showtimes?: {
    start_time: string;
    halls: { name: string } | null;
    movies: { title: string; poster_url: string | null } | null;
  } | null;
  concerts?: {
    title: string;
    artist: string;
    date: string;
    venue_name: string;
    poster_url: string | null;
  } | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfileAndBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchProfileAndBookings = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", user.id)
      .maybeSingle();

    setProfile(profileData);

    // Fetch bookings with related data
    const { data: bookingsData, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_type, total_amount, final_amount, status, booking_date,
        booking_items (id, ticket_type, price, seat_id),
        showtimes (
          start_time,
          halls (name),
          movies (title, poster_url)
        ),
        concerts (title, artist, date, venue_name, poster_url)
      `)
      .eq("user_id", user.id)
      .order("booking_date", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings((bookingsData as Booking[]) || []);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
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

  const movieBookings = bookings.filter((b) => b.booking_type === "movie");
  const concertBookings = bookings.filter((b) => b.booking_type === "concert");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">
                {profile?.full_name || user?.email}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{movieBookings.length}</p>
                <p className="text-sm text-muted-foreground">Movies</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{concertBookings.length}</p>
                <p className="text-sm text-muted-foreground">Concerts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">৳</span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {bookings.reduce((acc, b) => acc + b.final_amount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="concerts">Concerts</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <BookingsList bookings={bookings} />
          </TabsContent>

          <TabsContent value="movies">
            <BookingsList bookings={movieBookings} />
          </TabsContent>

          <TabsContent value="concerts">
            <BookingsList bookings={concertBookings} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const BookingsList = ({ bookings }: { bookings: Booking[] }) => {
  if (bookings.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No bookings yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="glass-card">
          <CardContent className="flex flex-col md:flex-row gap-4 py-4">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={
                  booking.booking_type === "movie"
                    ? booking.showtimes?.movies?.poster_url || "/placeholder.svg"
                    : booking.concerts?.poster_url || "/placeholder.svg"
                }
                alt="Poster"
                className="w-20 h-28 object-cover rounded-lg"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {booking.booking_type === "movie"
                      ? booking.showtimes?.movies?.title
                      : booking.concerts?.title}
                  </h3>
                  {booking.booking_type === "concert" && (
                    <p className="text-sm text-primary">{booking.concerts?.artist}</p>
                  )}
                </div>
                <Badge
                  variant={booking.status === "confirmed" ? "default" : "secondary"}
                >
                  {booking.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(
                      new Date(
                        booking.booking_type === "movie"
                          ? booking.showtimes?.start_time || booking.booking_date
                          : booking.concerts?.date || booking.booking_date
                      ),
                      "MMM d, yyyy • h:mm a"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {booking.booking_type === "movie"
                      ? booking.showtimes?.halls?.name
                      : booking.concerts?.venue_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  {booking.booking_items.slice(0, 5).map((item) => (
                    <Badge key={item.id} variant="outline" className="text-xs">
                      {item.ticket_type}
                    </Badge>
                  ))}
                  {booking.booking_items.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{booking.booking_items.length - 5}
                    </Badge>
                  )}
                </div>
                <p className="font-bold text-primary">৳{booking.final_amount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Profile;
