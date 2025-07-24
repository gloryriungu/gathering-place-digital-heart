
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock } from "lucide-react";

const Watch = () => {
  const sermons = [
    {
      title: "Champions of Faith",
      date: "January 21, 2024",
      duration: "52 min",
      description: "Discover how to live as a champion of faith, overcoming every obstacle through God's power and promises."
    },
    {
      title: "Destined for Greatness",
      date: "January 14, 2024", 
      duration: "48 min",
      description: "Understanding your divine destiny and walking in the greatness God has planned for your life."
    },
    {
      title: "The Power of Prayer",
      date: "January 7, 2024",
      duration: "45 min", 
      description: "Unlocking the supernatural power of prayer and intercession in your daily walk with God."
    },
    {
      title: "Walking in Victory",
      date: "December 31, 2023",
      duration: "50 min",
      description: "How to maintain victory in every area of your life through faith and obedience to God's Word."
    },
    {
      title: "The Heart of Worship",
      date: "December 24, 2023",
      duration: "43 min",
      description: "Cultivating a heart of true worship that brings transformation and touches the heart of God."
    },
    {
      title: "Prophetic Destiny",
      date: "December 17, 2023",
      duration: "55 min",
      description: "Understanding and walking in your prophetic destiny as a champion raised for this generation."
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
                Experience the presence of God from anywhere in the world. Join our live services and be transformed by God's Word.
              </p>
              <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4">
                <Play className="mr-2 h-5 w-5" />
                JOIN LIVE SERVICE
              </Button>
            </div>
          </div>
        </section>

        {/* Live Service */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Worship With Us Live</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Every Sunday at 9:00 AM & 11:00 AM EAT - Experience powerful worship, life-changing messages, and the presence of God.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-8">
                <div className="text-center text-white">
                  <Play className="h-20 w-20 mx-auto mb-4 opacity-60" />
                  <p className="text-xl">TOT International Live Stream</p>
                  <p className="text-gray-400">Next service: Sunday 9:00 AM EAT</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold text-black mb-2">Service Times</h3>
                  <p className="text-gray-700">Sundays: 9:00 AM & 11:00 AM EAT</p>
                  <p className="text-gray-700">Wednesday: 7:00 PM Bible Study</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold text-black mb-2">Duration</h3>
                  <p className="text-gray-700">Approximately 2 hours</p>
                  <p className="text-gray-700">Including worship & message</p>
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
                Catch up on powerful messages from Pastor Timothy Kitui and other anointed ministers.
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
