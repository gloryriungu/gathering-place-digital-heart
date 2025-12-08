import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  Calendar, 
  DollarSign, 
  Gift, 
  Users, 
  Building, 
  Globe,
  CheckCircle,
  Lock
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const Partners = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [partnershipType, setPartnershipType] = useState("");
  const [frequency, setFrequency] = useState("");
  const [amount, setAmount] = useState("");

  // Show auth required card if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-full">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">BECOME A PARTNER</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join us in advancing God's kingdom through regular giving.
            </p>
          </div>
          
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                To become a partner, you need to be signed in. 
                This allows us to track your partnership and provide you with updates on your impact.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => navigate("/auth")}>
                Sign In to Continue
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account? You can create one when you sign in.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  const [customAmount, setCustomAmount] = useState("");

  const partnershipBenefits = [
    "Monthly partnership newsletter",
    "Special partner prayer requests",
    "Access to partner-only events",
    "Financial reports and ministry updates",
    "Recognition in annual partner appreciation",
    "Special church events priority invitations"
  ];

  const givingAreas = [
    {
      id: "general",
      name: "General Fund",
      description: "Support overall church operations and ministries",
      icon: Building,
    },
    {
      id: "missions",
      name: "Global Missions",
      description: "Support missionary work and evangelism worldwide",
      icon: Globe,
    },
    {
      id: "building",
      name: "Building Fund",
      description: "Help expand and maintain our church facilities",
      icon: Building,
    },
    {
      id: "community",
      name: "Community Outreach",
      description: "Support local community service and aid programs",
      icon: Users,
    },
  ];

  const suggestedAmounts = [
    { label: "KSh 3,250", value: "3250" },
    { label: "KSh 6,500", value: "6500" },
    { label: "KSh 13,000", value: "13000" },
    { label: "KSh 32,500", value: "32500" },
    { label: "KSh 65,000", value: "65000" },
    { label: "Custom", value: "custom" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Partnership form submitted:", {
      partnershipType,
      frequency,
      amount: amount === "custom" ? customAmount : amount,
    });
    // This will be connected to Supabase later
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            BECOME A PARTNER
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join us in advancing God's kingdom through regular giving. Your partnership 
            enables us to reach more lives, strengthen our community, and expand our ministry impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Partnership Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gift className="h-6 w-6" />
                  Partnership Information
                </CardTitle>
                <CardDescription>
                  Choose your partnership level and giving frequency that works best for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Giving Area Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Choose Your Giving Focus
                    </Label>
                    <RadioGroup 
                      value={partnershipType} 
                      onValueChange={setPartnershipType}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {givingAreas.map((area) => {
                        const IconComponent = area.icon;
                        return (
                          <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={area.id} id={area.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                                <Label htmlFor={area.id} className="font-medium">
                                  {area.name}
                                </Label>
                              </div>
                              <p className="text-sm text-gray-600">{area.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Frequency Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Partnership Frequency
                    </Label>
                    <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Daily
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Weekly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Monthly
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Partnership Amount
                    </Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {suggestedAmounts.map((suggestion) => (
                        <Button
                          key={suggestion.value}
                          type="button"
                          variant={amount === suggestion.value ? "default" : "outline"}
                          onClick={() => setAmount(suggestion.value)}
                          className="w-full"
                        >
                          {suggestion.label}
                        </Button>
                      ))}
                    </div>
                    
                    {amount === "custom" && (
                      <div>
                        <Label htmlFor="custom-amount">Custom Amount</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="custom-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                    BECOME A PARTNER
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Partnership Benefits Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Partner Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {partnershipBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Impact Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  "Your faithful partnership enables us to reach thousands of lives each month 
                  through our various ministries and outreach programs."
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lives Impacted Monthly:</span>
                    <span className="font-semibold">2,500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Partners:</span>
                    <span className="font-semibold">850+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Community Programs:</span>
                    <span className="font-semibold">15</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about partnership or giving? We're here to help!
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Finance Team
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Schedule a Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Partners;