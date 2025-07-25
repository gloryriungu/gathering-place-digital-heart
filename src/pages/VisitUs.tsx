
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Car, Users, Coffee, Heart } from "lucide-react";

const VisitUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <div className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6">VISIT US</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              We'd love to meet you! Join us for worship, fellowship, and experience the love of Christ in community.
            </p>
            <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4">
              PLAN YOUR VISIT
            </Button>
          </div>
        </div>

        {/* Service Times */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">SERVICE TIMES</h2>
              <p className="text-xl text-gray-600">Join us for worship every week</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Clock className="h-12 w-12 mx-auto mb-4 text-black" />
                  <CardTitle className="text-xl">SUNDAY SERVICE</CardTitle>
                  <CardDescription>Main Worship Service</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-black">9:00 AM</p>
                  <p className="text-gray-600 mt-2">Every Sunday</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Clock className="h-12 w-12 mx-auto mb-4 text-black" />
                  <CardTitle className="text-xl">MIDWEEK SERVICE</CardTitle>
                  <CardDescription>Bible Study & Prayer</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-black">6:00 PM</p>
                  <p className="text-gray-600 mt-2">Every Wednesday</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Clock className="h-12 w-12 mx-auto mb-4 text-black" />
                  <CardTitle className="text-xl">YOUTH SERVICE</CardTitle>
                  <CardDescription>Young Champions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-black">4:00 PM</p>
                  <p className="text-gray-600 mt-2">Every Saturday</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">FIND US</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Our Location</h3>
                      <p className="text-gray-600">
                        TOT International Church<br />
                        Nairobi, Kenya<br />
                        East Africa
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Phone</h3>
                      <p className="text-gray-600">+254 700 123 456</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Email</h3>
                      <p className="text-gray-600">info@totinternational.org</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Car className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Parking</h3>
                      <p className="text-gray-600">Free parking available on-site</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">WHAT TO EXPECT</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Users className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Welcoming Community</h3>
                      <p className="text-gray-600">
                        Our friendly welcome team will greet you and help you find your way around.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Coffee className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Refreshments</h3>
                      <p className="text-gray-600">
                        Enjoy tea, coffee, and light snacks after the service.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Heart className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Casual Atmosphere</h3>
                      <p className="text-gray-600">
                        Come as you are! We believe church should be comfortable and welcoming.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Users className="h-6 w-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Children's Ministry</h3>
                      <p className="text-gray-600">
                        Age-appropriate programs for children during the main service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6">READY TO VISIT?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              We can't wait to meet you! Let us know you're coming so we can prepare a special welcome.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4">
                PLAN YOUR VISIT
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black font-bold text-lg px-8 py-4">
                CONTACT US
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitUs;
