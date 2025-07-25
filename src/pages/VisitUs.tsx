
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Car, Users } from "lucide-react";

const VisitUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-20 bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              VISIT <span className="text-blue-400">TOT INTERNATIONAL</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              We would love to meet you! Join us for an unforgettable worship experience.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Service Times */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Service Times</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sunday Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">First Service</span>
                  <span>7:00 AM - 9:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Second Service</span>
                  <span>9:30 AM - 11:30 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Third Service</span>
                  <span>12:00 PM - 2:00 PM</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Weekday Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tuesday Prayer</span>
                  <span>6:00 PM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Thursday Bible Study</span>
                  <span>6:00 PM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Saturday Youth</span>
                  <span>4:00 PM - 6:00 PM</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Location & Contact</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Address</h3>
                  <p className="text-gray-600">
                    123 Church Street<br />
                    Nairobi, Kenya<br />
                    00100
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-600">+254 700 123 456</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-600">info@totinternational.org</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">What to Expect</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Warm Welcome</h3>
                  <p className="text-gray-600">
                    Our friendly ushers will greet you and help you find the perfect seat.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Car className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Parking</h3>
                  <p className="text-gray-600">
                    Free parking is available on-site with dedicated spaces for visitors.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Service Duration</h3>
                  <p className="text-gray-600">
                    Services typically last 1.5-2 hours with powerful worship and teaching.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the presence of God and connect with our amazing community of believers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Directions
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VisitUs;
