import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number | null;
  max_discount: number | null;
  applicable_to: string[] | null;
}

interface UseBookingDiscountsProps {
  userId: string | undefined;
  ticketCount: number;
  totalAmount: number;
  bookingType: "movie" | "concert";
}

interface DiscountResult {
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: PromoCode | null;
  applyPromoCode: () => Promise<void>;
  removePromoCode: () => void;
  isApplyingPromo: boolean;
  loyaltyInfo: {
    completedBookings: number;
    freeTicketsEarned: number;
    isEligibleForFreeTickets: boolean;
  };
  calculateFinalAmount: () => {
    subtotal: number;
    promoDiscount: number;
    loyaltyDiscount: number;
    finalAmount: number;
    freeTicketsApplied: number;
  };
  loading: boolean;
}

export const useBookingDiscounts = ({
  userId,
  ticketCount,
  totalAmount,
  bookingType,
}: UseBookingDiscountsProps): DiscountResult => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user's completed bookings count for loyalty system
  useEffect(() => {
    const fetchBookingCount = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "confirmed");

      if (error) {
        console.error("Error fetching bookings:", error);
      } else {
        // Count completed bookings (cycle resets after 5th booking)
        const count = (data?.length || 0) % 5;
        setCompletedBookings(count);
      }
      setLoading(false);
    };

    fetchBookingCount();
  }, [userId]);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);

    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Invalid promo code");
        setIsApplyingPromo(false);
        return;
      }

      // Check validity dates
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = new Date(data.valid_until);

      if (now < validFrom || now > validUntil) {
        toast.error("This promo code has expired or is not yet valid");
        setIsApplyingPromo(false);
        return;
      }

      // Check if applicable to this booking type
      if (data.applicable_to && !data.applicable_to.includes(bookingType)) {
        toast.error(`This promo code is not valid for ${bookingType} bookings`);
        setIsApplyingPromo(false);
        return;
      }

      // Check minimum purchase
      if (data.min_purchase && totalAmount < data.min_purchase) {
        toast.error(`Minimum purchase of ৳${data.min_purchase} required for this promo`);
        setIsApplyingPromo(false);
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast.error("This promo code has reached its usage limit");
        setIsApplyingPromo(false);
        return;
      }

      setAppliedPromo(data);
      toast.success(`Promo code "${data.code}" applied!`);
    } catch (error) {
      console.error("Error applying promo:", error);
      toast.error("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
    toast.info("Promo code removed");
  };

  // Loyalty: After 4 bookings, 5th booking gets 2 free tickets
  const isEligibleForFreeTickets = completedBookings === 4;
  const freeTicketsEarned = isEligibleForFreeTickets ? Math.min(2, ticketCount) : 0;

  const calculateFinalAmount = () => {
    const pricePerTicket = ticketCount > 0 ? totalAmount / ticketCount : 0;
    
    // Apply loyalty discount first (2 free tickets on 5th booking)
    const loyaltyDiscount = freeTicketsEarned * pricePerTicket;
    const afterLoyalty = totalAmount - loyaltyDiscount;

    // Then apply promo discount
    let promoDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.discount_type === "percentage") {
        promoDiscount = (afterLoyalty * appliedPromo.discount_value) / 100;
        // Cap at max_discount if specified
        if (appliedPromo.max_discount && promoDiscount > appliedPromo.max_discount) {
          promoDiscount = appliedPromo.max_discount;
        }
      } else {
        // Fixed amount discount
        promoDiscount = Math.min(appliedPromo.discount_value, afterLoyalty);
      }
    }

    const finalAmount = Math.max(0, afterLoyalty - promoDiscount);

    return {
      subtotal: totalAmount,
      promoDiscount: Math.round(promoDiscount),
      loyaltyDiscount: Math.round(loyaltyDiscount),
      finalAmount: Math.round(finalAmount),
      freeTicketsApplied: freeTicketsEarned,
    };
  };

  return {
    promoCode,
    setPromoCode,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    isApplyingPromo,
    loyaltyInfo: {
      completedBookings,
      freeTicketsEarned,
      isEligibleForFreeTickets,
    },
    calculateFinalAmount,
    loading,
  };
};
