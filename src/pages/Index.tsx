import { Layout } from "@/components/layout";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickBookingForm } from "@/components/home/QuickBookingForm";
import { NowShowing } from "@/components/home/NowShowing";
import { UpcomingConcerts } from "@/components/home/UpcomingConcerts";
import { SpecialOffers } from "@/components/home/SpecialOffers";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <QuickBookingForm />
      <NowShowing />
      <UpcomingConcerts />
      <SpecialOffers />
    </Layout>
  );
};

export default Index;
