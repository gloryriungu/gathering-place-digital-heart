
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Watch from "./pages/Watch";
import Events from "./pages/Events";
import Give from "./pages/Give";
import Shop from "./pages/Shop";
import VisitUs from "./pages/VisitUs";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import JoinTheFamily from "./pages/JoinTheFamily";
import ServeWithUs from "./pages/ServeWithUs";
import Ministries from "./pages/Ministries";
import Partners from "./pages/Partners";
import Baptism from "./pages/Baptism";
import BabyDedication from "./pages/BabyDedication";
import PropheticSchool from "./pages/PropheticSchool";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/login" element={<AdminDashboard />} />
          <Route path="/join-the-family" element={<JoinTheFamily />} />
          <Route path="/serve-with-us" element={<ServeWithUs />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/baptism" element={<Baptism />} />
          <Route path="/baby-dedication" element={<BabyDedication />} />
          <Route path="/prophetic-school" element={<PropheticSchool />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
