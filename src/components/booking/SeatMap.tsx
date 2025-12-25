import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Seat {
  id: string;
  row_label: string;
  seat_number: number;
  seat_type: string;
  price_multiplier: number;
  is_booked?: boolean;
}

interface SeatMapProps {
  showtime: {
    id: string;
    price: number;
    hall_id: string;
    halls: {
      id: string;
      name: string;
      capacity: number;
    };
  };
  movie: {
    id: string;
    title: string;
  };
  onBack: () => void;
}

export const SeatMap = ({ showtime, movie, onBack }: SeatMapProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<string>>(new Set());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchSeatsAndBookings = async () => {
      // Fetch seats for the hall
      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .select("*")
        .eq("hall_id", showtime.hall_id)
        .eq("is_active", true)
        .order("row_label")
        .order("seat_number");

      if (seatsError) {
        console.error("Error fetching seats:", seatsError);
        return;
      }

      setSeats(seatsData || []);

      // Fetch booked seats for this showtime
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_items (seat_id)
        `)
        .eq("showtime_id", showtime.id)
        .in("status", ["confirmed", "pending"]);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
      } else {
        const bookedIds = new Set<string>();
        bookingsData?.forEach((booking) => {
          booking.booking_items?.forEach((item: any) => {
            if (item.seat_id) bookedIds.add(item.seat_id);
          });
        });
        setBookedSeatIds(bookedIds);
      }

      setLoading(false);
    };

    fetchSeatsAndBookings();
  }, [showtime.hall_id, showtime.id]);

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const rows = Object.keys(seatsByRow).sort();

  const toggleSeat = (seat: Seat) => {
    if (bookedSeatIds.has(seat.id)) return;
    
    if (selectedSeats.find((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 10) {
        toast.error("Maximum 10 seats can be selected");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatPrice = (seat: Seat) => {
    return Math.round(showtime.price * seat.price_multiplier);
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
  };

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case "vip":
        return "bg-purple-600";
      case "premium":
        return "bg-amber-600";
      default:
        return "bg-secondary";
    }
  };

  const handleBookSeats = async () => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setIsBooking(true);

    try {
      const totalAmount = getTotalPrice();

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          showtime_id: showtime.id,
          booking_type: "movie",
          total_amount: totalAmount,
          final_amount: totalAmount,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "demo",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create booking items
      const bookingItems = selectedSeats.map((seat) => ({
        booking_id: booking.id,
        seat_id: seat.id,
        ticket_type: seat.seat_type,
        price: getSeatPrice(seat),
      }));

      const { error: itemsError } = await supabase
        .from("booking_items")
        .insert(bookingItems);

      if (itemsError) throw itemsError;

      // Update available seats in showtime
      await supabase
        .from("showtimes")
        .update({ available_seats: showtime.halls.capacity - bookedSeatIds.size - selectedSeats.length })
        .eq("id", showtime.id);

      toast.success(`Successfully booked ${selectedSeats.length} seat(s) for ${movie.title}!`);
      navigate("/profile");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Failed to book seats. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Seat Map */}
      <div className="lg:col-span-2">
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-6">
            {/* Screen */}
            <div className="relative mb-8">
              <div className="w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-2" />
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Monitor className="w-4 h-4" />
                <span>SCREEN</span>
              </div>
            </div>

            {/* Seats */}
            <div className="flex flex-col items-center gap-2 overflow-x-auto pb-4">
              {rows.map((row) => (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                    {row}
                  </span>
                  <div className="flex gap-1">
                    {seatsByRow[row].map((seat) => {
                      const isBooked = bookedSeatIds.has(seat.id);
                      const isSelected = selectedSeats.find((s) => s.id === seat.id);
                      
                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat)}
                          disabled={isBooked}
                          className={`
                            w-7 h-7 rounded-t-lg text-xs font-medium transition-all
                            ${isBooked ? "seat-sold" : isSelected ? "seat-selected" : `seat-available ${getSeatTypeColor(seat.seat_type)} hover:opacity-80`}
                          `}
                          title={`${seat.row_label}${seat.seat_number} - ${seat.seat_type} - ৳${getSeatPrice(seat)}`}
                        >
                          {seat.seat_number}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                    {row}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg bg-secondary" />
                <span className="text-sm text-muted-foreground">Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg bg-amber-600" />
                <span className="text-sm text-muted-foreground">Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg bg-purple-600" />
                <span className="text-sm text-muted-foreground">VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg bg-primary" />
                <span className="text-sm text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg bg-muted opacity-50" />
                <span className="text-sm text-muted-foreground">Booked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      <div>
        <Card className="glass-card sticky top-24">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">{movie.title}</p>
              <p className="text-sm text-muted-foreground">{showtime.halls?.name}</p>
            </div>

            {selectedSeats.length > 0 ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Selected Seats:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats
                      .sort((a, b) => a.row_label.localeCompare(b.row_label) || a.seat_number - b.seat_number)
                      .map((seat) => (
                        <Badge key={seat.id} variant="secondary">
                          {seat.row_label}{seat.seat_number}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {seat.row_label}{seat.seat_number} ({seat.seat_type})
                      </span>
                      <span>৳{getSeatPrice(seat)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">৳{getTotalPrice()}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleBookSeats}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? "s" : ""}`
                  )}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select seats to continue
              </p>
            )}

            <Button variant="outline" className="w-full" onClick={onBack}>
              Change Showtime
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
