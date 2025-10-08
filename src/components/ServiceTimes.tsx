
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Video } from "lucide-react";
import { Link } from "react-router-dom";

export const ServiceTimes = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-black tracking-tight">
            WORSHIP WITH US
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the presence of God through powerful worship, life-changing messages, and genuine fellowship with believers who are passionate about Jesus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* In-Person Services */}
          <Card className="border-2 border-black hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-black" />
              <CardTitle className="text-2xl md:text-3xl font-black text-black">
                IN-PERSON WORSHIP
              </CardTitle>
              <p className="text-gray-600">TOT International Church</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">SUNDAY SERVICES</h4>
                    <p className="text-gray-600">Two powerful services</p>
                  </div>
                  <Clock className="h-6 w-6 text-black" />
                </div>
              </div>
              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center py-2 bg-black text-white px-4 rounded">
                  <span className="font-bold text-lg">9:00 AM</span>
                  <span>First Service</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-black text-white px-4 rounded">
                  <span className="font-bold text-lg">11:00 AM</span>
                  <span>Second Service</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-lg">WEDNESDAY</span>
                  <span className="text-gray-600">Bible Study - 7:00 PM</span>
                </div>
              </div>
              <Button asChild className="w-full mt-6 bg-black text-white hover:bg-gray-800 font-bold py-3">
                <Link to="/visit-us">PLAN YOUR VISIT</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Online Services */}
          <Card className="border-2 border-black hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <Video className="h-12 w-12 mx-auto mb-4 text-black" />
              <CardTitle className="text-2xl md:text-3xl font-black text-black">
                ONLINE WORSHIP
              </CardTitle>
              <p className="text-gray-600">Join us from anywhere in the world</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">LIVE STREAMING</h4>
                    <p className="text-gray-600">All services broadcast live</p>
                  </div>
                  <Video className="h-6 w-6 text-black" />
                </div>
              </div>
              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center py-2 bg-black text-white px-4 rounded">
                  <span className="font-bold text-lg">9:00 AM</span>
                  <span>Live Stream</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-black text-white px-4 rounded">
                  <span className="font-bold text-lg">11:00 AM</span>
                  <span>Live Stream</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-lg">CATCH UP</span>
                  <span className="text-gray-600">Previous Messages</span>
                </div>
              </div>
              <Button asChild className="w-full mt-6 bg-black text-white hover:bg-gray-800 font-bold py-3">
                <Link to="/watch">WATCH ONLINE</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
