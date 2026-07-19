
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProfileCompletionGuard } from "@/components/auth/ProfileCompletionGuard";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieConsent from "@/components/CookieConsent";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HelmetProvider } from 'react-helmet-async';

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Watch = lazy(() => import("./pages/Watch"));
const Events = lazy(() => import("./pages/Events"));
const EventRegistration = lazy(() => import("./pages/EventRegistration"));
const Give = lazy(() => import("./pages/Give"));
const Shop = lazy(() => import("./pages/Shop"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const VisitUs = lazy(() => import("./pages/VisitUs"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PastorsDashboard = lazy(() => import("./pages/PastorsDashboard"));
const RequisitionsPage = lazy(() => import("./pages/RequisitionsPage"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JoinTheFamily = lazy(() => import("./pages/JoinTheFamily"));
const ServeWithUs = lazy(() => import("./pages/ServeWithUs"));
const Ministries = lazy(() => import("./pages/Ministries"));
const Partners = lazy(() => import("./pages/Partners"));
const Baptism = lazy(() => import("./pages/Baptism"));
const BabyDedication = lazy(() => import("./pages/BabyDedication"));
const PropheticSchool = lazy(() => import("./pages/PropheticSchool"));
const CounselingMentalHealth = lazy(() => import("./pages/CounselingMentalHealth"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const NoticeOfFilming = lazy(() => import("./pages/NoticeOfFilming"));
const MediaDashboard = lazy(() => import("./pages/MediaDashboard"));
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const RegistrationDashboard = lazy(() => import("./pages/RegistrationDashboard"));
const ProfileCompletion = lazy(() => import("./pages/ProfileCompletion"));
const FAQ = lazy(() => import("./pages/FAQ"));
const GiveVerify = lazy(() => import("./pages/GiveVerify"));
const GivingHistory = lazy(() => import("./pages/GivingHistory"));
const ShopVerify = lazy(() => import("./pages/ShopVerify"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PortalAccessManagement = lazy(() => import("./pages/PortalAccessManagement"));

// Optimized loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <WhatsAppButton />
            <CookieConsent />
            <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId/register" element={<EventRegistration />} />
              <Route path="/give" element={<Give />} />
              <Route path="/give/verify" element={<GiveVerify />} />
              <Route path="/giving-history" element={<GivingHistory />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/verify" element={<ShopVerify />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/visit-us" element={<VisitUs />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/complete-profile" element={<ProfileCompletion />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/pastors" element={<PastorsDashboard />} />
              <Route path="/media-dashboard" element={<MediaDashboard />} />
              <Route path="/marketing-dashboard" element={<MarketingDashboard />} />
              <Route path="/registration-dashboard" element={<RegistrationDashboard />} />
              <Route path="/requisitions" element={<RequisitionsPage />} />
              
              <Route path="/join-the-family" element={<JoinTheFamily />} />
              <Route path="/serve-with-us" element={<ServeWithUs />} />
              <Route path="/ministries" element={<Ministries />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/baptism" element={<Baptism />} />
              <Route path="/baby-dedication" element={<BabyDedication />} />
              <Route path="/prophetic-school" element={<PropheticSchool />} />
              <Route path="/counseling-mental-health" element={<CounselingMentalHealth />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/notice-of-filming" element={<NoticeOfFilming />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/admin/portal-access" element={<PortalAccessManagement />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
