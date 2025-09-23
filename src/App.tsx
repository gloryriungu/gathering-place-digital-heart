
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import About from "./pages/About";
import Watch from "./pages/Watch";
import Events from "./pages/Events";
import Give from "./pages/Give";
import Shop from "./pages/Shop";
import VisitUs from "./pages/VisitUs";
import AdminDashboard from "./pages/AdminDashboard";
import PastorsDashboard from "./pages/PastorsDashboard";
import RequisitionsPage from "./pages/RequisitionsPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import JoinTheFamily from "./pages/JoinTheFamily";
import ServeWithUs from "./pages/ServeWithUs";
import Ministries from "./pages/Ministries";
import Partners from "./pages/Partners";
import Baptism from "./pages/Baptism";
import BabyDedication from "./pages/BabyDedication";
import PropheticSchool from "./pages/PropheticSchool";
import CounselingMentalHealth from "./pages/CounselingMentalHealth";
import Newsletter from "./pages/Newsletter";
import NoticeOfFilming from "./pages/NoticeOfFilming";
import MediaDashboard from "./pages/MediaDashboard";
import MarketingDashboard from "./pages/MarketingDashboard";
import RegistrationDashboard from "./pages/RegistrationDashboard";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/events" element={<Events />} />
          <Route path="/give" element={<Give />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/visit-us" element={<VisitUs />} />
          <Route path="/auth" element={<Auth />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
