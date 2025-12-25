import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Film, Music, Ticket, DollarSign, TrendingUp, Users, 
  BarChart3, LogOut, Loader2, Calendar
} from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface MovieStats {
  id: string;
  title: string;
  tickets_sold: number;
  total_revenue: number;
}

interface ConcertStats {
  id: string;
  title: string;
  artist: string;
  tickets_sold: number;
  total_revenue: number;
}

interface OverviewStats {
  totalRevenue: number;
  totalBookings: number;
  movieBookings: number;
  concertBookings: number;
  totalUsers: number;
}

const COLORS = ['#D4AF37', '#FFD700', '#C5A028', '#B8860B', '#DAA520', '#F0E68C'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  
  const [overview, setOverview] = useState<OverviewStats>({
    totalRevenue: 0,
    totalBookings: 0,
    movieBookings: 0,
    concertBookings: 0,
    totalUsers: 0,
  });
  const [movieStats, setMovieStats] = useState<MovieStats[]>([]);
  const [concertStats, setConcertStats] = useState<ConcertStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all bookings with confirmed status
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'confirmed');

      if (bookingsError) throw bookingsError;

      // Calculate overview stats
      const movieBookingsData = bookings?.filter(b => b.booking_type === 'movie') || [];
      const concertBookingsData = bookings?.filter(b => b.booking_type === 'concert') || [];
      
      const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.final_amount), 0) || 0;
      
      setOverview({
        totalRevenue,
        totalBookings: bookings?.length || 0,
        movieBookings: movieBookingsData.length,
        concertBookings: concertBookingsData.length,
        totalUsers: new Set(bookings?.map(b => b.user_id)).size,
      });

      // Fetch movie stats
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select('id, title');
      
      if (moviesError) throw moviesError;

      const movieStatsData: MovieStats[] = movies?.map(movie => {
        const movieBookings = movieBookingsData.filter(b => {
          // We need to check showtime to get movie_id
          return true; // Will be refined with showtime data
        });
        const revenue = movieBookingsData.reduce((sum, b) => sum + Number(b.final_amount), 0);
        return {
          id: movie.id,
          title: movie.title,
          tickets_sold: Math.floor(movieBookingsData.length / (movies?.length || 1)),
          total_revenue: revenue / (movies?.length || 1),
        };
      }) || [];

      // Get booking items count for more accurate ticket counts
      const { data: bookingItems, error: itemsError } = await supabase
        .from('booking_items')
        .select('booking_id');

      // Calculate per-movie stats from showtimes
      const { data: showtimes, error: showtimesError } = await supabase
        .from('showtimes')
        .select('id, movie_id');

      if (!showtimesError && showtimes) {
        const refinedMovieStats: MovieStats[] = movies?.map(movie => {
          const movieShowtimeIds = showtimes
            .filter(s => s.movie_id === movie.id)
            .map(s => s.id);
          
          const relatedBookings = movieBookingsData.filter(b => 
            movieShowtimeIds.includes(b.showtime_id || '')
          );
          
          const ticketCount = bookingItems?.filter(item => 
            relatedBookings.some(b => b.id === item.booking_id)
          ).length || relatedBookings.length;

          return {
            id: movie.id,
            title: movie.title,
            tickets_sold: ticketCount,
            total_revenue: relatedBookings.reduce((sum, b) => sum + Number(b.final_amount), 0),
          };
        }).filter(m => m.tickets_sold > 0) || [];

        setMovieStats(refinedMovieStats);
      } else {
        setMovieStats(movieStatsData);
      }

      // Fetch concert stats
      const { data: concerts, error: concertsError } = await supabase
        .from('concerts')
        .select('id, title, artist');
      
      if (concertsError) throw concertsError;

      const concertStatsData: ConcertStats[] = concerts?.map(concert => {
        const relatedBookings = concertBookingsData.filter(b => b.concert_id === concert.id);
        const ticketCount = bookingItems?.filter(item => 
          relatedBookings.some(b => b.id === item.booking_id)
        ).length || relatedBookings.length;

        return {
          id: concert.id,
          title: concert.title,
          artist: concert.artist,
          tickets_sold: ticketCount,
          total_revenue: relatedBookings.reduce((sum, b) => sum + Number(b.final_amount), 0),
        };
      }).filter(c => c.tickets_sold > 0) || [];

      setConcertStats(concertStatsData);

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const chartConfig = {
    tickets: { label: "Tickets Sold", color: "hsl(var(--primary))" },
    revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  };

  const pieData = [
    { name: 'Movies', value: overview.movieBookings },
    { name: 'Concerts', value: overview.concertBookings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gradient-gold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">TixWix Analytics</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-gold">
                ৳{overview.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From all confirmed bookings</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {overview.movieBookings} movies, {overview.concertBookings} concerts
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movie Sales</CardTitle>
              <Film className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.movieBookings}</div>
              <p className="text-xs text-muted-foreground">Confirmed bookings</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concert Sales</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.concertBookings}</div>
              <p className="text-xs text-muted-foreground">Confirmed bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Tabs */}
        <Tabs defaultValue="movies" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="concerts" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Concerts
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  Movie Sales Report
                </CardTitle>
                <CardDescription>
                  Tickets sold and revenue by movie
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : movieStats.length > 0 ? (
                  <div className="space-y-6">
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={movieStats}>
                          <XAxis 
                            dataKey="title" 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="tickets_sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Movie</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Tickets Sold</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movieStats.map((movie, index) => (
                            <tr key={movie.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary/30'}>
                              <td className="px-4 py-3 text-sm">{movie.title}</td>
                              <td className="px-4 py-3 text-sm text-right">{movie.tickets_sold}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-primary">
                                ৳{movie.total_revenue.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No movie sales data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concerts">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  Concert Sales Report
                </CardTitle>
                <CardDescription>
                  Tickets sold and revenue by concert
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : concertStats.length > 0 ? (
                  <div className="space-y-6">
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={concertStats}>
                          <XAxis 
                            dataKey="title" 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="tickets_sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Concert</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Artist</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Tickets Sold</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {concertStats.map((concert, index) => (
                            <tr key={concert.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary/30'}>
                              <td className="px-4 py-3 text-sm">{concert.title}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{concert.artist}</td>
                              <td className="px-4 py-3 text-sm text-right">{concert.tickets_sold}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-primary">
                                ৳{concert.total_revenue.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No concert sales data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Sales Distribution</CardTitle>
                  <CardDescription>Movies vs Concerts</CardDescription>
                </CardHeader>
                <CardContent>
                  {pieData[0].value + pieData[1].value > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No sales data available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-sm">Unique Customers</span>
                    </div>
                    <span className="font-bold">{overview.totalUsers}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-sm">Avg. Booking Value</span>
                    </div>
                    <span className="font-bold">
                      ৳{overview.totalBookings > 0 
                        ? Math.round(overview.totalRevenue / overview.totalBookings).toLocaleString() 
                        : 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm">Report Generated</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  <Button onClick={fetchStats} variant="outline" className="w-full mt-4">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
