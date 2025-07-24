
import { Button } from "@/components/ui/button";
import { Play, Calendar, User, ArrowRight } from "lucide-react";

export const LatestSermon = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                LATEST MESSAGE
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Be transformed by God's Word through our biblical, practical, and life-changing messages that equip you for victorious living.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                "Champions of Faith: Living Above Limitations"
              </h3>
              
              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">Pastor Timothy Kitui</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">January 21, 2024</span>
                </div>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed">
                In this powerful message, Pastor Timothy teaches us how to rise above every limitation through faith in God's promises and live as the champions we are called to be in Christ Jesus.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold">
                  <Play className="h-5 w-5 mr-2" />
                  WATCH NOW
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black font-bold">
                  ALL MESSAGES
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden group cursor-pointer">
              <div 
                className="w-full h-full bg-cover bg-center relative"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-black ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-bold">
                  52:30
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
