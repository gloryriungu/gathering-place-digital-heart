
import { Hero } from "@/components/Hero";
import { ServiceTimes } from "@/components/ServiceTimes";
import { LatestSermon } from "@/components/LatestSermon";
import { Announcements } from "@/components/Announcements";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { Testimonials } from "@/components/Testimonials";
import { ConnectSection } from "@/components/ConnectSection";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
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
      <Announcements />
      <UpcomingEvents />
      <Testimonials showOnlyFeatured={true} maxItems={3} />
      <ConnectSection />
      
      {/* Newsletter Signup Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup />
        </div>
      </section>
      
      <GivingSection />
      <Footer />
    </div>
  );
};

export default Index;
