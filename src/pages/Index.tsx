
import { Hero } from "@/components/Hero";
import { ServiceTimes } from "@/components/ServiceTimes";
import { LatestSermon } from "@/components/LatestSermon";
import { Announcements } from "@/components/Announcements";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/AIAssistant";
import { Suspense, lazy, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load non-critical components
const UpcomingEvents = lazy(() => import("@/components/UpcomingEvents"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const ConnectSection = lazy(() => import("@/components/ConnectSection"));
const GivingSection = lazy(() => import("@/components/GivingSection"));

const ComponentLoader = memo(() => (
  <div className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-64 mx-auto mb-4" />
      <Skeleton className="h-4 w-96 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  </div>
));

const Index = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ServiceTimes />
      <LatestSermon />
      <Announcements />
      
      <Suspense fallback={<ComponentLoader />}>
        <UpcomingEvents />
      </Suspense>
      
      <Suspense fallback={<ComponentLoader />}>
        <Testimonials showOnlyFeatured={true} maxItems={3} />
      </Suspense>
      
      <Suspense fallback={<ComponentLoader />}>
        <ConnectSection />
      </Suspense>
      
      <Suspense fallback={<ComponentLoader />}>
        <GivingSection />
      </Suspense>
      
      <Footer />
      
      {/* AI Assistant */}
      <AIAssistant 
        welcomeMessage="Welcome to TOT Int! How can I assist you today?"
        // apiEndpoint="/api/chat" // Uncomment and configure your API endpoint
        // onSendMessage={async (message) => { // Or use custom handler
        //   const response = await fetch('/your-api', { method: 'POST', body: JSON.stringify({ message }) });
        //   return (await response.json()).reply;
        // }}
      />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
