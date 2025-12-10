import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Gift, Users, Globe, Sprout, Package, Edit, Smartphone, CreditCard, Shield, Lock, CheckCircle, TrendingUp, DollarSign, HandHeart, ChevronDown } from "lucide-react";
import { GivingForm } from "@/components/giving/GivingForm";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
const Give = () => {
  const [showGivingForm, setShowGivingForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const handleGiveClick = (type?: string) => {
    setSelectedType(type);
    setShowGivingForm(true);
  };
  const contributionTypes = [{
    type: "Tithe",
    title: "Tithe",
    description: "Honor God with your first fruits and faithful stewardship",
    icon: Heart,
    color: "text-red-600"
  }, {
    type: "Offering",
    title: "Offering",
    description: "Support ongoing ministry operations and programs",
    icon: Gift,
    color: "text-blue-600"
  }, {
    type: "Seed",
    title: "Seed",
    description: "Sow a seed of faith for your future harvest",
    icon: Sprout,
    color: "text-green-600"
  }, {
    type: "Mission",
    title: "Missions",
    description: "Partner in church planting across East Africa & beyond",
    icon: Globe,
    color: "text-purple-600"
  }, {
    type: "Gift",
    title: "Special Gift",
    description: "One-time special gift to bless the ministry",
    icon: Package,
    color: "text-orange-600"
  }, {
    type: "Thanksgiving",
    title: "Thanksgiving",
    description: "Express gratitude to God through generous giving",
    icon: HandHeart,
    color: "text-pink-600"
  }, {
    type: "Others",
    title: "Custom Contribution",
    description: "Building fund, youth ministry, or specify your own",
    icon: Edit,
    color: "text-indigo-600"
  }];
  const impactAllocations = [{
    percentage: "35%",
    title: "MISSIONS",
    description: "Global missions & church planting",
    icon: Globe
  }, {
    percentage: "30%",
    title: "MINISTRY",
    description: "Life-changing programs & events",
    icon: Users
  }, {
    percentage: "20%",
    title: "COMMUNITY",
    description: "Outreach & feeding initiatives",
    icon: Heart
  }, {
    percentage: "15%",
    title: "OPERATIONS",
    description: "Facilities & staff support",
    icon: TrendingUp
  }];
  const testimonials = [{
    quote: "Giving has transformed my life. I've experienced God's faithfulness in ways I never imagined.",
    name: "Sarah M.",
    role: "TOT Member"
  }, {
    quote: "When I started tithing faithfully, God opened doors I didn't know existed. He is truly faithful.",
    name: "John K.",
    role: "Ministry Partner"
  }, {
    quote: "Supporting missions through my giving has given me purpose. I'm part of something bigger than myself.",
    name: "Grace N.",
    role: "Missions Supporter"
  }];
  const faqs = [{
    question: "How do I get a receipt for my contribution?",
    answer: "All contributions are automatically recorded in your giving history. Authenticated users can view and download receipts from their dashboard. Receipts are sent via email immediately after successful payment."
  }, {
    question: "Can I set up recurring giving?",
    answer: "Recurring giving is coming soon! For now, you can make one-time contributions anytime through our secure platform. We're working on automated recurring options for monthly tithes and offerings."
  }, {
    question: "How do I view my giving history?",
    answer: "Log in to your account and navigate to your dashboard. Click on 'My Giving' to see all your past contributions, generate reports, and download receipts for tax purposes."
  }, {
    question: "Is my donation tax-deductible?",
    answer: "Yes! TOT International is a registered religious organization. All contributions are tax-deductible. You'll receive proper documentation for tax purposes with each contribution."
  }, {
    question: "What payment methods do you accept?",
    answer: "We accept M-Pesa (mobile money) and all major credit/debit cards (Visa, Mastercard) through our secure Paystack integration. All transactions are encrypted and protected."
  }, {
    question: "How long does it take to process my payment?",
    answer: "M-Pesa payments are instant. Card payments are processed immediately, and you'll receive confirmation within seconds. Your contribution is recorded in real-time and you'll get instant email confirmation."
  }];
  return <div className="min-h-screen bg-background">
      <SEO title="Give - Partner with TOT International" description="Support missions, ministries, and community outreach through faithful giving. Multiple secure payment options available including M-Pesa and card payments." />
      <Navigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fade-in">
                GIVE WITH IMPACT
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-4xl mx-auto mb-8">
                Partner with us in advancing God's kingdom. Your faithful giving transforms lives across East Africa and beyond.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">500+</div>
                  <div className="text-sm text-primary-foreground/70">Active Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">35%</div>
                  <div className="text-sm text-primary-foreground/70">Goes to Missions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold">100%</div>
                  <div className="text-sm text-primary-foreground/70">Goes to Ministry</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button onClick={() => handleGiveClick()} size="lg" className="bg-background text-foreground hover:bg-background/90 font-bold text-lg px-8 py-6">
                  Give Now
                </Button>
                <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold text-lg px-8 py-6" onClick={() => document.getElementById('impact')?.scrollIntoView({
                behavior: 'smooth'
              })}>
                  See Your Impact
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>SSL Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Paystack Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>100% Secure</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Allocation Section */}
        <section id="impact" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Where Your Giving Goes
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Every contribution is strategically allocated to maximize kingdom impact
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {impactAllocations.map((allocation, index) => {
              const IconComponent = allocation.icon;
              return <Card key={index} className="p-8 text-center hover:shadow-lg transition-all">
                    <div className="mb-4">
                      <IconComponent className="h-12 w-12 mx-auto text-primary" />
                    </div>
                    <div className="text-5xl font-black text-primary mb-2">
                      {allocation.percentage}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {allocation.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {allocation.description}
                    </p>
                  </Card>;
            })}
            </div>

            <div className="text-center mt-8">
              
            </div>
          </div>
        </section>

        {/* Contribution Types Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Choose Your Contribution Type
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Select the giving option that aligns with how God is leading you
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributionTypes.map((type, index) => {
              const IconComponent = type.icon;
              return <Card key={index} className="p-6 hover:shadow-xl transition-all cursor-pointer group" onClick={() => handleGiveClick(type.type)}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`${type.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {type.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Any Amount
                      </span>
                      <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground" onClick={e => {
                    e.stopPropagation();
                    handleGiveClick(type.type);
                  }}>
                        Give {type.title}
                      </Button>
                    </div>
                  </Card>;
            })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Simple, secure, and instant giving process
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-bold text-foreground mb-2">Choose Type</h3>
                <p className="text-sm text-muted-foreground">
                  Select your contribution type and amount
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-bold text-foreground mb-2">Select Method</h3>
                <p className="text-sm text-muted-foreground">
                  Pick M-Pesa or card payment
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-bold text-foreground mb-2">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your encrypted transaction
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-bold text-foreground mb-2">Get Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  Receive instant email receipt
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 text-center">
                <Smartphone className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-2xl font-bold text-foreground mb-2">M-Pesa</h3>
                <p className="text-muted-foreground mb-4">
                  Instant mobile money via STK push. No card needed.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Instant Processing</span>
                </div>
              </Card>
              <Card className="p-8 text-center">
                <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Card Payment</h3>
                <p className="text-muted-foreground mb-4">
                  Visa/Mastercard accepted. Powered by Paystack.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>256-bit Encryption</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Why We Give */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Why We Give
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Giving is worship, partnership with God, and a pathway to experiencing His abundant provision
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center">
                <Heart className="h-16 w-16 mx-auto mb-6 text-red-600" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Honor God</h3>
                <p className="text-muted-foreground">
                  Giving is an act of worship that honors God and acknowledges Him as the source of all blessings.
                </p>
              </Card>
              <Card className="p-8 text-center">
                <Users className="h-16 w-16 mx-auto mb-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Build Kingdom</h3>
                <p className="text-muted-foreground">
                  Your giving helps build God's kingdom, supporting ministries that transform lives and communities.
                </p>
              </Card>
              <Card className="p-8 text-center">
                <Globe className="h-16 w-16 mx-auto mb-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Reach Nations</h3>
                <p className="text-muted-foreground">
                  Together we reach more people with the Gospel and plant churches across East Africa and beyond.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/30">
          
        </section>

        {/* Scripture Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <svg className="h-12 w-12 mx-auto text-primary-foreground/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              What God Says About Giving
            </h2>
            <blockquote className="text-2xl md:text-3xl font-light mb-6 leading-relaxed">
              "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, 
              will be poured into your lap. For with the measure you use, it will be measured to you."
            </blockquote>
            <p className="text-xl text-primary-foreground/80">— Luke 6:38 NIV</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about giving
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your faithful giving enables us to fulfill our mission of reaching nations and transforming lives
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button onClick={() => handleGiveClick()} size="lg" className="font-bold text-lg px-8 py-6">
                <DollarSign className="mr-2 h-5 w-5" />
                Give Now
              </Button>
              <Button variant="outline" size="lg" className="font-bold text-lg px-8 py-6" onClick={() => window.location.href = '/giving-history'}>
                View Giving History
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Contact Finance Team
              </button>
              <span className="text-muted-foreground/30">|</span>
              <button className="hover:text-foreground transition-colors">
                View Financial Reports
              </button>
              <span className="text-muted-foreground/30">|</span>
              <button className="hover:text-foreground transition-colors">
                Download Tax Receipt
              </button>
            </div>
          </div>
        </section>
      </div>

      <GivingForm open={showGivingForm} onOpenChange={setShowGivingForm} defaultContributionType={selectedType} />
      <Footer />
    </div>;
};
export default Give;