import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Users, Globe } from "lucide-react";

const Give = () => {
  const givingOptions = [
    {
      title: "Tithes & Offerings",
      description: "Honor God with your first fruits and support the ongoing ministry of our church.",
      icon: Heart,
      amount: "Any Amount"
    },
    {
      title: "Building Fund",
      description: "Help us expand our facilities to reach more people with the Gospel.",
      icon: Gift,
      amount: "Any Amount"
    },
    {
      title: "Missions Support", 
      description: "Partner with us in spreading the Gospel around the world.",
      icon: Globe,
      amount: "Any Amount"
    },
    {
      title: "Community Outreach",
      description: "Support our local community programs and charitable initiatives.",
      icon: Users,
      amount: "Any Amount"
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
              <h1 className="text-4xl md:text-6xl font-black mb-6">GIVE</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
                Partner with us in advancing God's kingdom through your generous giving.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4">
                  Give Online Now
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black font-bold text-lg px-8 py-4">
                  Learn About Giving
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why We Give */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Why We Give</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Giving is not just about supporting the church—it's about partnering with God in His work 
                and experiencing the joy of generosity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto mb-6 text-black" />
                <h3 className="text-xl font-bold text-black mb-4">Honor God</h3>
                <p className="text-gray-700">
                  Giving is an act of worship that honors God and acknowledges Him as the source of all blessings.
                </p>
              </div>
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-6 text-black" />
                <h3 className="text-xl font-bold text-black mb-4">Build Community</h3>
                <p className="text-gray-700">
                  Your giving helps build a strong church family and supports fellow believers in their journey.
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-16 w-16 mx-auto mb-6 text-black" />
                <h3 className="text-xl font-bold text-black mb-4">Spread the Gospel</h3>
                <p className="text-gray-700">
                  Together we can reach more people with the life-changing message of Jesus Christ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Giving Options */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Ways to Give</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Choose the giving option that aligns with your heart and how God is leading you to give.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {givingOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="flex items-center mb-6">
                      <IconComponent className="h-10 w-10 text-black mr-4" />
                      <h3 className="text-2xl font-bold text-black">{option.title}</h3>
                    </div>
                    <p className="text-gray-700 mb-6">{option.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-black">{option.amount}</span>
                      <Button className="bg-black text-white hover:bg-gray-800">
                        Give Now
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Scripture Section */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">What God Says About Giving</h2>
            <blockquote className="text-xl md:text-2xl italic mb-6">
              "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, 
              will be poured into your lap. For with the measure you use, it will be measured to you."
            </blockquote>
            <p className="text-lg text-gray-300">— Luke 6:38</p>
          </div>
        </section>

        {/* Giving Methods */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">How to Give</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                We've made it easy and secure for you to give in whatever way is most convenient for you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="font-bold text-black mb-2">Online</h3>
                <p className="text-gray-700 text-sm">Secure online giving with credit/debit cards</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🏦</span>
                </div>
                <h3 className="font-bold text-black mb-2">Bank Transfer</h3>
                <p className="text-gray-700 text-sm">Direct bank transfers and ACH</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-bold text-black mb-2">Mobile App</h3>
                <p className="text-gray-700 text-sm">Give on the go with our mobile app</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-black mb-2">In Person</h3>
                <p className="text-gray-700 text-sm">Cash or check during service</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Questions About Giving?</h2>
            <p className="text-lg text-gray-700 mb-8">
              We're here to help you understand how your giving makes a difference and answer any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-black text-white hover:bg-gray-800">
                Contact Finance Team
              </Button>
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                View Financial Reports
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Give;