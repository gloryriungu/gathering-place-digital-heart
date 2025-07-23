import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock } from "lucide-react";

const Watch = () => {
  const sermons = [
    {
      title: "The Power of Faith",
      date: "January 21, 2024",
      duration: "45 min",
      description: "Discovering the transformative power of unwavering faith in God's promises."
    },
    {
      title: "Walking in Purpose",
      date: "January 14, 2024", 
      duration: "52 min",
      description: "Understanding your divine calling and stepping into your God-given destiny."
    },
    {
      title: "Breakthrough and Victory",
      date: "January 7, 2024",
      duration: "48 min", 
      description: "Breaking through barriers and walking in supernatural victory."
    },
    {
      title: "The Heart of Worship",
      date: "December 31, 2023",
      duration: "41 min",
      description: "Cultivating a heart of true worship that pleases God."
    },
    {
      title: "Divine Restoration",
      date: "December 24, 2023",
      duration: "39 min",
      description: "God's power to restore what was lost and make all things new."
    },
    {
      title: "Prophetic Vision",
      date: "December 17, 2023",
      duration: "56 min",
      description: "Receiving and walking in God's prophetic vision for your life."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6">WATCH ONLINE</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
                Experience God's presence from anywhere. Watch our live services and catch up on recent messages.
              </p>
              <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4">
                <Play className="mr-2 h-5 w-5" />
                WATCH LIVE
              </Button>
            </div>
          </div>
        </section>

        {/* Live Service */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Join Us Live</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Every Sunday at 11:00 AM PST - Experience the power of corporate worship and life-changing messages.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-8">
                <div className="text-center text-white">
                  <Play className="h-20 w-20 mx-auto mb-4 opacity-60" />
                  <p className="text-xl">Live Stream Player</p>
                  <p className="text-gray-400">Service starts at 11:00 AM PST</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold text-black mb-2">Service Times</h3>
                  <p className="text-gray-700">Sundays at 11:00 AM PST</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold text-black mb-2">Duration</h3>
                  <p className="text-gray-700">Approximately 90 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sermons */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Recent Messages</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Catch up on recent sermons and dive deeper into God's word.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sermons.map((sermon, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-60" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-black mb-2">{sermon.title}</h3>
                    <p className="text-gray-700 mb-4">{sermon.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{sermon.date}</span>
                      <span>{sermon.duration}</span>
                    </div>
                    <Button className="w-full bg-black text-white hover:bg-gray-800">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                View All Messages
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Watch;