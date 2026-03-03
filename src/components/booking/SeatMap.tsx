import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Monitor, Tag, Gift, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBookingDiscounts } from "@/hooks/useBookingDiscounts";
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

  const getSeatPrice = (seat: Seat) => {
    return Math.round(showtime.price * seat.price_multiplier);
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
  };

  const {
    promoCode,
    setPromoCode,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    isApplyingPromo,
    loyaltyInfo,
    calculateFinalAmount,
  } = useBookingDiscounts({
    userId: user?.id,
    ticketCount: selectedSeats.length,
    totalAmount: getTotalPrice(),
    bookingType: "movie",
  });

  const discounts = calculateFinalAmount();

  useEffect(() => {
    const fetchSeatsAndBookings = async () => {
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
      const { subtotal, promoDiscount, loyaltyDiscount, finalAmount } = discounts;

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          showtime_id: showtime.id,
          booking_type: "movie",
          total_amount: subtotal,
          discount_amount: promoDiscount + loyaltyDiscount,
          final_amount: finalAmount,
          promo_code: appliedPromo?.code || null,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "demo",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

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

      await supabase
        .from("showtimes")
        .update({ available_seats: showtime.halls.capacity - bookedSeatIds.size - selectedSeats.length })
        .eq("id", showtime.id);

      if (appliedPromo) {
        await supabase
          .from("promo_codes")
          .update({ used_count: (appliedPromo as any).used_count + 1 })
          .eq("id", appliedPromo.id);
      }

      toast.success(`Successfully booked ${selectedSeats.length} seat(s) for ${movie.title}!`);
      navigate(`/booking/${booking.id}`);
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
    <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
      {/* Seat Map */}
      <div className="lg:col-span-2">
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-3 md:p-6">
            {/* Screen */}
            <div className="relative mb-6 md:mb-8">
              <div className="w-full h-1.5 md:h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-2" />
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs md:text-sm">
                <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>SCREEN</span>
              </div>
            </div>

            {/* Seats - pinch-zoomable container on mobile */}
            <div className="overflow-x-auto pb-4 -mx-3 px-3 md:mx-0 md:px-0">
              <div className="flex flex-col items-center gap-1 md:gap-2 min-w-fit">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-0.5 md:gap-1">
                    <span className="w-5 md:w-6 text-center text-[10px] md:text-sm font-medium text-muted-foreground">
                      {row}
                    </span>
                    <div className="flex gap-0.5 md:gap-1">
                      {seatsByRow[row].map((seat) => {
                        const isBooked = bookedSeatIds.has(seat.id);
                        const isSelected = selectedSeats.find((s) => s.id === seat.id);
                        
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            disabled={isBooked}
                            className={`
                              w-6 h-6 md:w-7 md:h-7 rounded-t-md md:rounded-t-lg text-[9px] md:text-xs font-medium transition-all active:scale-90
                              ${isBooked ? "seat-sold" : isSelected ? "seat-selected" : `seat-available ${getSeatTypeColor(seat.seat_type)} hover:opacity-80`}
                            `}
                            title={`${seat.row_label}${seat.seat_number} - ${seat.seat_type} - ৳${getSeatPrice(seat)}`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-5 md:w-6 text-center text-[10px] md:text-sm font-medium text-muted-foreground">
                      {row}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-t-md md:rounded-t-lg bg-secondary" />
                <span className="text-[10px] md:text-sm text-muted-foreground">Standard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-t-md md:rounded-t-lg bg-amber-600" />
                <span className="text-[10px] md:text-sm text-muted-foreground">Premium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-t-md md:rounded-t-lg bg-purple-600" />
                <span className="text-[10px] md:text-sm text-muted-foreground">VIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-t-md md:rounded-t-lg bg-primary" />
                <span className="text-[10px] md:text-sm text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-t-md md:rounded-t-lg bg-muted opacity-50" />
                <span className="text-[10px] md:text-sm text-muted-foreground">Booked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      <div>
        <Card className="glass-card lg:sticky lg:top-24">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <p className="font-semibold text-sm md:text-base">{movie.title}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{showtime.halls?.name}</p>
            </div>

            {/* Loyalty Status */}
            {user && (
              <div className="p-2.5 md:p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Gift className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {loyaltyInfo.isEligibleForFreeTickets ? (
                      <span className="text-primary font-semibold">🎉 You get 2 FREE tickets!</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {4 - loyaltyInfo.completedBookings} more booking{4 - loyaltyInfo.completedBookings !== 1 ? "s" : ""} until 2 free tickets
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {selectedSeats.length > 0 ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-muted-foreground">Selected Seats:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats
                      .sort((a, b) => a.row_label.localeCompare(b.row_label) || a.seat_number - b.seat_number)
                      .map((seat) => (
                        <Badge key={seat.id} variant="secondary" className="text-xs">
                          {seat.row_label}{seat.seat_number}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {seat.row_label}{seat.seat_number} ({seat.seat_type})
                      </span>
                      <span>৳{getSeatPrice(seat)}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Promo Code
                  </p>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-xs md:text-sm text-green-400 font-medium">{appliedPromo.code}</span>
                      <Button variant="ghost" size="sm" onClick={removePromoCode} className="h-7 w-7 p-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button 
                        variant="outline" 
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="h-9 text-sm"
                      >
                        {isApplyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>৳{discounts.subtotal}</span>
                  </div>
                  {discounts.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Loyalty ({discounts.freeTicketsApplied} free)</span>
                      <span>-৳{discounts.loyaltyDiscount}</span>
                    </div>
                  )}
                  {discounts.promoDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Promo ({appliedPromo?.code})</span>
                      <span>-৳{discounts.promoDiscount}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3 md:pt-4 flex justify-between">
                  <span className="font-semibold text-sm md:text-base">Total</span>
                  <span className="text-lg md:text-xl font-bold text-primary">৳{discounts.finalAmount}</span>
                </div>

                <Button 
                  className="w-full h-11 md:h-12 text-base" 
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
              <p className="text-muted-foreground text-center py-6 md:py-8 text-sm">
                Select seats to continue
              </p>
            )}

            <Button variant="outline" className="w-full h-10" onClick={onBack}>
              Change Showtime
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
