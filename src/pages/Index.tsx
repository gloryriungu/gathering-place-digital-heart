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
import { LiveMarquee } from "@/components/LiveMarquee";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Suspense, lazy, memo, useEffect, useState } from "react";
import { SectionLoader } from "@/components/shared/BrandLoader";
import { BrandLoader } from "@/components/shared/BrandLoader";
import { waitPageData } from "@/lib/pageReadiness";
import { cn } from "@/lib/utils";

// Lazy load non-critical components
const UpcomingEvents = lazy(() => import("@/components/UpcomingEvents"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const ConnectSection = lazy(() => import("@/components/ConnectSection"));
const GivingSection = lazy(() => import("@/components/GivingSection"));

const ComponentLoader = memo(() => (
  <div className="py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionLoader label="Loading" />
    </div>
  </div>
));

const Index = memo(() => {
  const [dataReady, setDataReady] = useState(false);
  const [overlayGone, setOverlayGone] = useState(false);

  // Hold the branded loader on screen until the homepage's CMS data (hero,
  // events, sermons) has actually loaded — or until a safety timeout — so the
  // page never flashes skeletons or fallback imagery mid-load.
  useEffect(() => {
    let alive = true;
    waitPageData(['hero', 'events', 'sermons'], 8000, 1800).then(() => {
      if (!alive) return;
      setDataReady(true);
      setTimeout(() => { if (alive) setOverlayGone(true); }, 800);
    });
    return () => { alive = false; };
  }, []);

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
    <div className="min-h-screen bg-background relative">
      <SEO 
        title="Transforming Lives Through God's Word"
        description="Join TOT Int - A church community focused on transforming lives through God's Word, building faith, and serving our community with love."
        canonical="/"
        keywords="church, worship, faith, community, TOT International, christian ministry, bible teaching"
        structuredData={organizationSchema}
      />
      <div className={cn("transition-opacity duration-700", dataReady ? "opacity-100" : "opacity-0")}>
        <Navigation />
        <Hero />
        <LiveMarquee />
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
      </div>

      {/* Branded splash — stays up until the homepage data is fully loaded */}
      {!overlayGone && (
        <div
          aria-hidden={dataReady}
          className={cn(
            "fixed inset-0 z-[80] transition-opacity duration-700",
            dataReady ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <BrandLoader />
        </div>
      )}
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
