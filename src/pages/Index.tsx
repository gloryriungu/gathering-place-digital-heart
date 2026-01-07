/**
 * TOT INTERNATIONAL - MAIN LANDING PAGE
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Provides static typing for better code quality and developer experience
 * - React: Component-based JavaScript library for building user interfaces
 * - TSX: TypeScript + JSX syntax for writing React components with type safety
 * 
 * FUNCTIONALITY:
 * This is the main landing/home page component that serves as the entry point for website visitors.
 * It displays comprehensive information about TOT International church including:
 * - Hero section with welcoming message and primary calls-to-action
 * - Service times and schedule information
 * - Latest sermon/message from the church
 * - Current announcements and news
 * - Upcoming events calendar
 * - Member testimonials
 * - Ways to connect with the church community
 * - Giving/donation section
 * - AI chatbot assistant for visitor support
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Uses React.lazy() and Suspense for code-splitting and lazy loading of non-critical components
 * - This improves initial page load time by only loading essential components first
 * - Implements ComponentLoader as fallback UI while lazy components are being fetched
 * 
 * SEO FEATURES:
 * - Includes structured data (Schema.org) for church organization
 * - Meta tags for search engine optimization
 * - Semantic HTML for better crawlability
 */
import { Hero } from "@/components/Hero";
import { ServiceTimes } from "@/components/ServiceTimes";
import { LatestSermon } from "@/components/LatestSermon";
import { Announcements } from "@/components/Announcements";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/AIAssistant";
import { SEO } from "@/components/SEO";
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Church",
    "name": "TOT International",
    "url": "https://stg.tot.co.ke",
    "logo": "https://stg.tot.co.ke/favicon.png",
    "description": "A church community focused on transforming lives through God's Word, building faith, and serving our community with love.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE"
    },
    "sameAs": [
      "https://facebook.com/totint",
      "https://twitter.com/totint",
      "https://instagram.com/totint"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Transforming Lives Through God's Word"
        description="Join TOT Int - A church community focused on transforming lives through God's Word, building faith, and serving our community with love."
        canonical="/"
        keywords="church, worship, faith, community, TOT International, christian ministry, bible teaching"
        structuredData={organizationSchema}
      />
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
      
      {/* AI Assistant - Temporarily disabled
      <AIAssistant 
        welcomeMessage="Welcome to TOT Int! I can help you with questions, generate assessments, and create content. What would you like to know?"
        apiEndpoint="https://web-production-61663.up.railway.app/process/"
      />
      */}
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
