import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Users, MapPin, Phone, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const JoinTheFamily = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    birthDate: "",
    maritalStatus: "",
    occupation: "",
    howDidYouHear: "",
    previousChurch: "",
    salvationDate: "",
    baptized: "",
    interests: [],
    testimony: "",
    prayerRequests: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // This will be connected to Supabase later
  };

  const howDidYouHearOptions = [
    "Friend or Family Member",
    "Social Media",
    "Google Search",
    "Community Event",
    "Drive By",
    "Other Church",
    "Radio/TV",
    "Other"
  ];

  const interestAreas = [
    "Youth Ministry",
    "Kids Ministry",
    "Worship Team",
    "Community Service",
    "Bible Study",
    "Prayer Group",
    "Missions",
    "Administration"
  ];

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
            JOIN THE FAMILY
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're excited to welcome you into our church family! Please fill out this form 
            so we can get to know you better and help you find your place in our community.
          </p>
        </div>

        {/* Main Form */}
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Tell us about yourself so we can better serve you and your family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input 
                    id="zipCode" 
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input 
                    id="birthDate" 
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select onValueChange={(value) => setFormData({...formData, maritalStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input 
                  id="occupation" 
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                />
              </div>

              {/* Church Discovery Questions */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-6">Getting to Know You</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label>How did you hear about our church? *</Label>
                    <Select onValueChange={(value) => setFormData({...formData, howDidYouHear: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Please select" />
                      </SelectTrigger>
                      <SelectContent>
                        {howDidYouHearOptions.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="previousChurch">Previous Church Background</Label>
                    <Textarea 
                      id="previousChurch"
                      placeholder="Tell us about your previous church experience..."
                      value={formData.previousChurch}
                      onChange={(e) => setFormData({...formData, previousChurch: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Have you accepted Jesus Christ as your personal Savior?</Label>
                    <RadioGroup 
                      className="mt-2"
                      onValueChange={(value) => setFormData({...formData, salvationDate: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="salvation-yes" />
                        <Label htmlFor="salvation-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="salvation-no" />
                        <Label htmlFor="salvation-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unsure" id="salvation-unsure" />
                        <Label htmlFor="salvation-unsure">I'm not sure</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Have you been baptized?</Label>
                    <RadioGroup 
                      className="mt-2"
                      onValueChange={(value) => setFormData({...formData, baptized: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="baptized-yes" />
                        <Label htmlFor="baptized-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="baptized-no" />
                        <Label htmlFor="baptized-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="interested" id="baptized-interested" />
                        <Label htmlFor="baptized-interested">No, but I'm interested</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Areas of Interest (select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {interestAreas.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox 
                            id={interest}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData, 
                                  interests: [...formData.interests, interest]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  interests: formData.interests.filter(i => i !== interest)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={interest} className="text-sm">{interest}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="testimony">Share Your Testimony (Optional)</Label>
                    <Textarea 
                      id="testimony"
                      placeholder="We'd love to hear your story of faith..."
                      value={formData.testimony}
                      onChange={(e) => setFormData({...formData, testimony: e.target.value})}
                      className="mt-2 min-h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prayerRequests">Prayer Requests (Optional)</Label>
                    <Textarea 
                      id="prayerRequests"
                      placeholder="How can we pray for you?"
                      value={formData.prayerRequests}
                      onChange={(e) => setFormData({...formData, prayerRequests: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                  JOIN OUR FAMILY
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default JoinTheFamily;