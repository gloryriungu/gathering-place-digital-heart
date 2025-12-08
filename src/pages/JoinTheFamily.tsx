/**
 * JOIN THE FAMILY - NEW MEMBER REGISTRATION FORM
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Complex form state management with type safety
 * - React: Dynamic form with conditional sections
 * - React Hooks: useState for form data management
 * 
 * FUNCTIONALITY:
 * Comprehensive new member onboarding form collecting detailed information:
 * 
 * PERSONAL INFORMATION SECTION:
 * - Basic details: First name, last name, email, phone
 * - Address: Street address, city, state, zip code
 * - Demographics: Birth date, marital status, occupation
 * 
 * GETTING TO KNOW YOU SECTION:
 * - How did you hear about the church? (dropdown with options)
 * - Previous church background (text area)
 * - Salvation status (Yes/No/Unsure)
 * - Baptism status (Yes/No/Interested)
 * - Areas of interest (multiple checkboxes):
 *   - Youth Ministry, Kids Ministry, Worship Team
 *   - Community Service, Bible Study, Prayer Group
 *   - Missions, Administration
 * - Personal testimony (optional text area)
 * - Prayer requests (optional)
 * 
 * CHILDREN INFORMATION SECTION:
 * - Optional expandable section for families with children
 * - Add multiple children with individual details:
 *   - Child's first and last name
 *   - Birth date (auto-calculates Sunday School age group)
 *   - Medical conditions, allergies, special needs
 *   - Emergency contact (name, phone, relationship)
 *   - Baby dedication status and interest
 * 
 * SUNDAY SCHOOL AGE GROUPS (Auto-assigned):
 * - Toppers: Ages 4-5
 * - Diamond: Ages 6-10
 * - Onyx: Ages 11-12
 * - House of Jesse: Ages 13-17
 * 
 * FEATURES:
 * - Dynamic child addition/removal
 * - Automatic age group calculation
 * - Form validation (required fields marked with *)
 * - Expandable children section
 * - Individual emergency contacts per child
 * - Baby dedication interest tracking
 * 
 * DATA STRUCTURE:
 * - Complex nested state for children array
 * - Dynamic form updates as user types
 * - Will be integrated with Supabase for data persistence
 * 
 * PURPOSE:
 * - Streamline new member onboarding
 * - Collect comprehensive member information
 * - Identify serving interests and spiritual status
 * - Facilitate family ministry and Sunday School enrollment
 * - Build community connections from day one
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Users, MapPin, Phone, Mail, Baby, Plus, Trash2, Lock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

const JoinTheFamily = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
    children: []
  });

  const [showChildrenSection, setShowChildrenSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
            <h1 className="text-5xl font-bold text-white mb-4">JOIN THE FAMILY</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're excited to welcome you into our church family!
            </p>
          </div>
          
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                To submit your application to join our family, you need to be signed in. 
                This allows us to track your application and keep you updated on its status.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your application.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from('join_family_applications')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim(),
          county: formData.state,
          occupation: formData.occupation,
          baptism_status: formData.baptized,
          previous_church: formData.previousChurch,
          ministry_interests: formData.interests,
          volunteer_interests: [],
          testimony: formData.testimony,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          notes: `How heard: ${formData.howDidYouHear}\nSalvation: ${formData.salvationDate}\nPrayer requests: ${formData.prayerRequests}\nChildren: ${JSON.stringify(formData.children)}`,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Thank you for joining our family. We'll be in touch soon!",
      });

      // Reset form
      setFormData({
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
        children: []
      });
      setShowChildrenSection(false);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const getAgeGroup = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    
    if (age >= 4 && age <= 5) return "Toppers (Age 4-5)";
    if (age >= 6 && age <= 10) return "Diamond (Age 6-10)";
    if (age >= 11 && age <= 12) return "Onyx (Age 11-12)";
    if (age >= 13 && age <= 17) return "House of Jesse (Age 13-17)";
    return "Not applicable for Sunday School";
  };

  const addChild = () => {
    const newChild = {
      id: Date.now(),
      firstName: "",
      lastName: "",
      birthDate: "",
      ageGroup: "",
      medicalConditions: "",
      allergies: "",
      specialNeeds: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      babyDedicated: "",
      interestedInDedication: false
    };
    setFormData({
      ...formData,
      children: [...formData.children, newChild]
    });
  };

  const removeChild = (childId: number) => {
    setFormData({
      ...formData,
      children: formData.children.filter(child => child.id !== childId)
    });
  };

  const updateChild = (childId: number, field: string, value: any) => {
    setFormData({
      ...formData,
      children: formData.children.map(child => 
        child.id === childId 
          ? { ...child, [field]: value, ...(field === 'birthDate' ? { ageGroup: getAgeGroup(value) } : {}) }
          : child
      )
    });
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

              {/* Children Information Section */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Baby className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Children Information</h3>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowChildrenSection(!showChildrenSection)}
                  >
                    {showChildrenSection ? "Hide Section" : "Add Children"}
                  </Button>
                </div>

                {showChildrenSection && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Sunday School Information:</strong> Children will be automatically assigned to age-appropriate groups:
                      </p>
                      <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc">
                        <li><strong>Toppers:</strong> Ages 4-5 years</li>
                        <li><strong>Diamond:</strong> Ages 6-10 years</li>
                        <li><strong>Onyx:</strong> Ages 11-12 years</li>
                        <li><strong>House of Jesse:</strong> Ages 13-17 years</li>
                      </ul>
                    </div>

                    {formData.children.map((child, index) => (
                      <Card key={child.id} className="p-6 border-2 border-dashed border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-primary">Child {index + 1}</h4>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => removeChild(child.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>First Name *</Label>
                            <Input 
                              value={child.firstName}
                              onChange={(e) => updateChild(child.id, 'firstName', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input 
                              value={child.lastName}
                              onChange={(e) => updateChild(child.id, 'lastName', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Birth Date *</Label>
                            <Input 
                              type="date"
                              value={child.birthDate}
                              onChange={(e) => updateChild(child.id, 'birthDate', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Sunday School Group</Label>
                            <Input 
                              value={child.ageGroup || "Select birth date first"}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 mb-4">
                          <div>
                            <Label>Medical Conditions/Medications</Label>
                            <Textarea 
                              value={child.medicalConditions}
                              onChange={(e) => updateChild(child.id, 'medicalConditions', e.target.value)}
                              placeholder="List any medical conditions, medications, or health concerns..."
                              className="min-h-20"
                            />
                          </div>
                          <div>
                            <Label>Allergies</Label>
                            <Textarea 
                              value={child.allergies}
                              onChange={(e) => updateChild(child.id, 'allergies', e.target.value)}
                              placeholder="Food allergies, environmental allergies, etc..."
                            />
                          </div>
                          <div>
                            <Label>Special Needs</Label>
                            <Textarea 
                              value={child.specialNeeds}
                              onChange={(e) => updateChild(child.id, 'specialNeeds', e.target.value)}
                              placeholder="Learning differences, behavioral needs, accommodations required..."
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4 mb-4">
                          <h5 className="font-medium mb-3">Emergency Contact (Other than Parents)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Emergency Contact Name</Label>
                              <Input 
                                value={child.emergencyContactName}
                                onChange={(e) => updateChild(child.id, 'emergencyContactName', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Emergency Contact Phone</Label>
                              <Input 
                                type="tel"
                                value={child.emergencyContactPhone}
                                onChange={(e) => updateChild(child.id, 'emergencyContactPhone', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Relationship</Label>
                              <Select onValueChange={(value) => updateChild(child.id, 'emergencyContactRelation', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grandparent">Grandparent</SelectItem>
                                  <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                                  <SelectItem value="family-friend">Family Friend</SelectItem>
                                  <SelectItem value="sibling">Sibling</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h5 className="font-medium mb-3">Baby Dedication</h5>
                          <RadioGroup 
                            value={child.babyDedicated}
                            onValueChange={(value) => updateChild(child.id, 'babyDedicated', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`dedicated-yes-${child.id}`} />
                              <Label htmlFor={`dedicated-yes-${child.id}`}>Yes, already dedicated</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`dedicated-no-${child.id}`} />
                              <Label htmlFor={`dedicated-no-${child.id}`}>No, not dedicated</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="interested" id={`dedicated-interested-${child.id}`} />
                              <Label htmlFor={`dedicated-interested-${child.id}`}>No, but interested in baby dedication</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </Card>
                    ))}

                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={addChild}
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Child
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-8">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "SUBMITTING..." : "JOIN OUR FAMILY"}
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