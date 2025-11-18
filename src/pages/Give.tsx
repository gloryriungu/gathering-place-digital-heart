
/**
 * GIVING PAGE - DONATIONS & FINANCIAL PARTNERSHIP
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Type-safe component structure
 * - React: Static informational page with giving options
 * - Lucide React: Icons for visual elements
 * 
 * FUNCTIONALITY:
 * Comprehensive giving page encouraging financial partnership with the church:
 * 
 * GIVING OPTIONS:
 * 1. Tithes & Offerings:
 *    - General giving to support ongoing ministry
 *    - Honors God with first fruits
 * 
 * 2. Building Fund:
 *    - Facility expansion projects
 *    - Accommodate more people
 *    - Reach more souls
 * 
 * 3. Missions Support:
 *    - Church planting initiatives
 *    - Missions across East Africa and beyond
 *    - International ministry partnerships
 * 
 * 4. Community Outreach:
 *    - Community programs
 *    - Feeding initiatives
 *    - Charitable works and social services
 * 
 * THEOLOGICAL FOUNDATION:
 * - "Why We Give" section explains biblical purpose
 * - Three core reasons:
 *   1. Honor God - worship through giving
 *   2. Build God's Kingdom - transform lives
 *   3. Reach Nations - Gospel expansion
 * - Featured scripture: Luke 6:38 (give and it will be given to you)
 * 
 * GIVING METHODS:
 * - M-Pesa (Kenya mobile money)
 * - Bank transfer (direct deposits)
 * - Online platform (secure web giving)
 * - In-person cash offerings during services
 * 
 * KEY FEATURES:
 * - Hero section with prominent "Give Online Now" button
 * - Visual cards for each giving option
 * - Scripture quotation for biblical foundation
 * - Multiple payment method options
 * - Contact finance team button
 * - View financial reports for transparency
 * 
 * PURPOSE:
 * - Educate members about biblical giving
 * - Provide multiple convenient giving options
 * - Explain how contributions are used
 * - Encourage generous stewardship
 * - Build trust through transparency
 */
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Users, Globe } from "lucide-react";
import { GivingForm } from "@/components/giving/GivingForm";
import { useState } from "react";

const Give = () => {
  const [showGivingForm, setShowGivingForm] = useState(false);

  const givingOptions = [
    {
      title: "Tithes & Offerings",
      description: "Honor God with your first fruits and support the ongoing ministry of TOT International.",
      icon: Heart,
      amount: "Any Amount"
    },
    {
      title: "Building Fund",
      description: "Help us expand our facilities to accommodate more champions and reach more souls.",
      icon: Gift,
      amount: "Any Amount"
    },
    {
      title: "Missions Support", 
      description: "Partner with us in church planting and missions across East Africa and beyond.",
      icon: Globe,
      amount: "Any Amount"
    },
    {
      title: "Community Outreach",
      description: "Support our community programs, feeding initiatives, and charitable works.",
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
                Partner with us in advancing God's kingdom through your generous giving and faithful stewardship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowGivingForm(true)}
                  className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4"
                >
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
                Giving is not just about supporting the ministry—it's about partnering with God in His work and experiencing the joy of sowing into His kingdom.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto mb-6 text-black" />
                <h3 className="text-xl font-bold text-black mb-4">Honor God</h3>
                <p className="text-gray-700">
                  Giving is an act of worship that honors God and acknowledges Him as the source of all our blessings and provision.
                </p>
              </div>
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-6 text-black" />
                <h3 className="text-xl font-bold text-black mb-4">Build God's Kingdom</h3>
                <p className="text-gray-700">
                  Your giving helps build God's kingdom, supporting ministries that transform lives and advance the Gospel.
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-16 w-16 mx-auto mb-6 text-black" />
                <h3 className="text-xl font-bold text-black mb-4">Reach Nations</h3>
                <p className="text-gray-700">
                  Together we can reach more people with the Gospel and plant churches across East Africa and beyond.
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
                Choose the giving option that aligns with your heart and how God is leading you to sow into His kingdom.
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
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-bold text-black mb-2">M-Pesa</h3>
                <p className="text-gray-700 text-sm">Send money via M-Pesa to our Till Number</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🏦</span>
                </div>
                <h3 className="font-bold text-black mb-2">Bank Transfer</h3>
                <p className="text-gray-700 text-sm">Direct bank deposits and transfers</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="font-bold text-black mb-2">Online</h3>
                <p className="text-gray-700 text-sm">Secure online giving platform</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-black mb-2">In Person</h3>
                <p className="text-gray-700 text-sm">Cash offerings during service</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Questions About Giving?</h2>
            <p className="text-lg text-gray-700 mb-8">
              We're here to help you understand how your giving makes a difference and answer any questions you may have about stewardship.
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

      <GivingForm open={showGivingForm} onOpenChange={setShowGivingForm} />
      <Footer />
    </div>
  );
};

export default Give;
