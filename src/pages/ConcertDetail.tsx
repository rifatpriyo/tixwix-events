import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Concert {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  poster_url: string | null;
  date: string;
  venue_name: string;
  total_tickets: number;
  available_tickets: number;
  price_min: number;
  price_max: number;
  status: string | null;
}

interface ConcertSection {
  id: string;
  name: string;
  price: number;
  total_tickets: number;
  available_tickets: number;
}

const ConcertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [concert, setConcert] = useState<Concert | null>(null);
  const [sections, setSections] = useState<ConcertSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<ConcertSection | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchConcertAndSections = async () => {
      if (!id) return;

      // Fetch concert
      const { data: concertData, error: concertError } = await supabase
        .from("concerts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (concertError) {
        console.error("Error fetching concert:", concertError);
        navigate("/concerts");
        return;
      }

      if (!concertData) {
        navigate("/concerts");
        return;
      }

      setConcert(concertData);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("concert_sections")
        .select("*")
        .eq("concert_id", id)
        .order("price");

      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
      } else {
        setSections(sectionsData || []);
      }

      setLoading(false);
    };

    fetchConcertAndSections();
  }, [id, navigate]);

  const handleBookTickets = async () => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }

    if (!selectedSection || !concert) return;

    if (ticketCount > selectedSection.available_tickets) {
      toast.error("Not enough tickets available");
      return;
    }

    setIsBooking(true);

    try {
      const totalAmount = selectedSection.price * ticketCount;
      
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          concert_id: concert.id,
          concert_section_id: selectedSection.id,
          booking_type: "concert",
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
      const bookingItems = Array.from({ length: ticketCount }, () => ({
        booking_id: booking.id,
        ticket_type: selectedSection.name,
        price: selectedSection.price,
      }));

      const { error: itemsError } = await supabase
        .from("booking_items")
        .insert(bookingItems);

      if (itemsError) throw itemsError;

      // Update available tickets
      await supabase
        .from("concert_sections")
        .update({ available_tickets: selectedSection.available_tickets - ticketCount })
        .eq("id", selectedSection.id);

      toast.success("Tickets booked successfully!");
      navigate("/profile");
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

  if (!concert) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Concert not found</p>
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
            src={concert.poster_url || "/placeholder.svg"}
            alt={concert.title}
            className="w-full h-full object-cover opacity-40"
          />
          
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 z-20"
            onClick={() => navigate("/concerts")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Concert Info */}
        <div className="container mx-auto px-4 -mt-40 relative z-20">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={concert.poster_url || "/placeholder.svg"}
                alt={concert.title}
                className="w-64 h-80 object-cover rounded-xl shadow-2xl mx-auto md:mx-0"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <Badge variant="secondary" className="mb-4">
                {concert.status === "upcoming" ? "Upcoming" : concert.status}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
                {concert.title}
              </h1>
              
              <p className="text-xl text-primary mb-6">{concert.artist}</p>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{format(new Date(concert.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{format(new Date(concert.date), "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{concert.venue_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>{concert.available_tickets} tickets available</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 max-w-2xl">
                {concert.description}
              </p>

              <p className="text-2xl font-bold text-gradient-gold">
                ৳{concert.price_min} - ৳{concert.price_max}
              </p>
            </div>
          </div>

          {/* Ticket Sections */}
          <div className="mt-12 mb-20">
            <h2 className="text-2xl font-display font-bold mb-6">Select Tickets</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Sections */}
              <div className="space-y-4">
                {sections.map((section) => (
                  <Card 
                    key={section.id} 
                    className={`glass-card cursor-pointer transition-all ${
                      selectedSection?.id === section.id 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedSection(section)}
                  >
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <h3 className="font-semibold text-lg">{section.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {section.available_tickets} tickets available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">৳{section.price}</p>
                        <p className="text-sm text-muted-foreground">per ticket</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Booking Summary */}
              <Card className="glass-card h-fit sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSection ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Section</span>
                        <span className="font-medium">{selectedSection.name}</span>
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
                            onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                            disabled={ticketCount >= Math.min(10, selectedSection.available_tickets)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per ticket</span>
                        <span>৳{selectedSection.price}</span>
                      </div>
                      <div className="border-t border-border pt-4 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          ৳{selectedSection.price * ticketCount}
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
                          "Book Now"
                        )}
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Select a section to continue
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

export default ConcertDetail;
