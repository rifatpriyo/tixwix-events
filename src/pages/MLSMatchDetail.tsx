import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2,
  Ticket,
  Tag,
  Gift,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useBookingDiscounts } from "@/hooks/useBookingDiscounts";
import { toast } from "sonner";
import { StadiumViewer } from "@/components/stadium/StadiumViewer";

interface MLSMatch {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  status: string | null;
  total_tickets: number;
  available_tickets: number;
  description: string | null;
}

interface StadiumSection {
  id: string;
  name: string;
  section_label: string;
  tier: string;
  price: number;
  total_seats: number;
  available_seats: number;
  color: string;
  position_x: number;
  position_y: number;
  position_z: number;
}

const tierColors: Record<string, string> = {
  vip: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  premium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  standard: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  economy: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const MLSMatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState<MLSMatch | null>(null);
  const [sections, setSections] = useState<StadiumSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<StadiumSection | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const totalAmount = selectedSection ? selectedSection.price * ticketCount : 0;

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
    ticketCount,
    totalAmount,
    bookingType: "concert", // reuse concert type for discounts
  });

  const discounts = calculateFinalAmount();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const [matchRes, sectionsRes] = await Promise.all([
        supabase.from("mls_matches").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("stadium_sections")
          .select("*")
          .eq("match_id", id)
          .order("price", { ascending: false }),
      ]);

      if (matchRes.error || !matchRes.data) {
        navigate("/mls");
        return;
      }

      setMatch(matchRes.data);
      setSections(sectionsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleBookTickets = async () => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    if (!selectedSection || !match) return;

    if (ticketCount > selectedSection.available_seats) {
      toast.error("Not enough seats available");
      return;
    }

    setIsBooking(true);

    try {
      const { subtotal, promoDiscount, loyaltyDiscount, finalAmount } = discounts;

      // Create booking (reuse bookings table with booking_type = 'mls')
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          booking_type: "mls",
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

      // Create booking items
      const bookingItems = Array.from({ length: ticketCount }, () => ({
        booking_id: booking.id,
        ticket_type: `${selectedSection.name} (${selectedSection.tier.toUpperCase()})`,
        price: selectedSection.price,
      }));

      const { error: itemsError } = await supabase
        .from("booking_items")
        .insert(bookingItems);

      if (itemsError) throw itemsError;

      // Update promo code usage
      if (appliedPromo) {
        await supabase
          .from("promo_codes")
          .update({ used_count: (appliedPromo as any).used_count + 1 })
          .eq("id", appliedPromo.id);
      }

      toast.success(
        `Successfully booked ${ticketCount} ticket(s) for ${match.home_team} vs ${match.away_team}!`
      );
      navigate(`/booking/${booking.id}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Failed to book tickets. Please try again.");
    } finally {
      setIsBooking(false);
    }
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

  if (!match) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Match not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-gradient-to-b from-emerald-900/30 to-background border-b border-border/50">
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => navigate("/mls")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              {/* Home team */}
              <div className="text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-3xl mb-2 mx-auto">
                  ⚽
                </div>
                <p className="font-bold text-lg">{match.home_team}</p>
                <p className="text-xs text-muted-foreground uppercase">Home</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-display font-bold text-primary mb-1">VS</p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  {format(new Date(match.match_date), "MMM d, yyyy • h:mm a")}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {match.venue}
                </div>
              </div>

              {/* Away team */}
              <div className="text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-3xl mb-2 mx-auto">
                  ⚽
                </div>
                <p className="font-bold text-lg">{match.away_team}</p>
                <p className="text-xs text-muted-foreground uppercase">Away</p>
              </div>
            </div>

            {match.description && (
              <p className="text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
                {match.description}
              </p>
            )}
          </div>
        </div>

        {/* Stadium & Booking */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-display font-bold mb-6">
            Select Your Section
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 3D Stadium */}
            <div className="lg:col-span-2 space-y-4">
              <StadiumViewer
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
              />

              {/* Section list */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedSection?.id === section.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: section.color }}
                      />
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${tierColors[section.tier] || ""}`}
                      >
                        {section.tier.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{section.name}</p>
                    <p className="text-xs text-primary font-semibold">
                      ৳{section.price.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {section.available_seats} seats left
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="glass-card sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">
                      {match.home_team} vs {match.away_team}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(match.match_date), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>

                  {/* Loyalty */}
                  {user && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Gift className="w-4 h-4 text-primary" />
                        <span>
                          {loyaltyInfo.isEligibleForFreeTickets ? (
                            <span className="text-primary font-semibold">
                              🎉 You get 2 FREE tickets!
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {4 - loyaltyInfo.completedBookings} more booking
                              {4 - loyaltyInfo.completedBookings !== 1 ? "s" : ""} until 2 free
                              tickets
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedSection ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Section</span>
                        <span className="font-medium">{selectedSection.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tier</span>
                        <Badge
                          variant="outline"
                          className={tierColors[selectedSection.tier] || ""}
                        >
                          {selectedSection.tier.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tickets</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                            disabled={ticketCount <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">{ticketCount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setTicketCount(
                                Math.min(10, ticketCount + 1)
                              )
                            }
                            disabled={
                              ticketCount >=
                              Math.min(10, selectedSection.available_seats)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Promo */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Promo Code
                        </p>
                        {appliedPromo ? (
                          <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <span className="text-sm text-green-400 font-medium">
                              {appliedPromo.code}
                            </span>
                            <Button variant="ghost" size="sm" onClick={removePromoCode}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={applyPromoCode}
                              disabled={isApplyingPromo || !promoCode.trim()}
                            >
                              {isApplyingPromo ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Price breakdown */}
                      <div className="space-y-2 text-sm pt-2 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>৳{discounts.subtotal.toLocaleString()}</span>
                        </div>
                        {discounts.loyaltyDiscount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>
                              Loyalty ({discounts.freeTicketsApplied} free)
                            </span>
                            <span>-৳{discounts.loyaltyDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        {discounts.promoDiscount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Promo ({appliedPromo?.code})</span>
                            <span>-৳{discounts.promoDiscount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          ৳{discounts.finalAmount.toLocaleString()}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBookTickets}
                        disabled={isBooking}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          `Book ${ticketCount} Ticket${ticketCount > 1 ? "s" : ""}`
                        )}
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Select a section from the 3D view or the list below to continue
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MLSMatchDetail;
