
import { Hero } from "@/components/Hero";
import { ServiceTimes } from "@/components/ServiceTimes";
import { LatestSermon } from "@/components/LatestSermon";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { ConnectSection } from "@/components/ConnectSection";
import { GivingSection } from "@/components/GivingSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ServiceTimes />
      <LatestSermon />
      <UpcomingEvents />
      <ConnectSection />
      <GivingSection />
      <Footer />
    </div>
  );
};

export default Index;
