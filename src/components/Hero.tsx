
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen bg-primary text-primary-foreground overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        {/* Fallback image if video fails to load */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
          }}
        ></div>
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
            WELCOME TO<br />
            <span className="text-primary-foreground">TOT INTERNATIONAL</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            A ministry committed to raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="bg-white text-black font-bold px-8 py-4 text-lg shadow-lg">
              JOIN US THIS SUNDAY
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent font-bold px-8 py-4 text-lg whitespace-nowrap shadow-lg">
              <Play className="h-5 w-5 mr-2" />
              WATCH LIVE
            </Button>
          </div>
        </div>
      </div>

      {/* Service Times Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-background text-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-2xl font-bold">NEXT SERVICE</h3>
              <p className="text-lg">Sunday 9:00 AM & 11:00 AM</p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-wide font-medium">JOIN US</p>
              <p className="text-xl font-bold">EVERY SUNDAY</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
