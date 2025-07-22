
import { Button } from "@/components/ui/button";
import { Play, Clock, MapPin } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to TOT Int
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Transforming lives through the power of God's Word and building a community of faith, hope, and love
          </p>
          
          {/* Service Countdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Next Service</span>
            </div>
            <div className="text-2xl font-bold mb-1">Sunday 10:00 AM</div>
            <div className="text-sm opacity-75">in 2 days, 14 hours</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              <MapPin className="h-5 w-5 mr-2" />
              Plan Your Visit
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Play className="h-5 w-5 mr-2" />
              Watch Live
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
