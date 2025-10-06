import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Users, Music, Book, Church, Mic, Camera, Shield } from "lucide-react";

export const JoinFamilyForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    county: "",
    occupation: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    baptismStatus: "",
    previousChurch: "",
    ministryInterests: [] as string[],
    volunteerInterests: [] as string[],
    testimony: ""
  });

  const ministryOptions = [
    { id: "youth", name: "Youth Ministry", icon: Users },
    { id: "worship", name: "Worship Team", icon: Music },
    { id: "bible_study", name: "Bible Study Groups", icon: Book },
    { id: "prayer", name: "Prayer Ministry", icon: Church },
    { id: "media", name: "Media Ministry", icon: Camera }
  ];

  const volunteerOptions = [
    { id: "security", name: "Security Team", icon: Shield },
    { id: "registration", name: "Registration/Welcome", icon: Users },
    { id: "media", name: "Media/Technology", icon: Camera },
    { id: "sound", name: "Sound Team", icon: Mic },
    { id: "children", name: "Children's Ministry", icon: Heart }
  ];

  const handleMinistryInterestChange = (ministryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      ministryInterests: checked 
        ? [...prev.ministryInterests, ministryId]
        : prev.ministryInterests.filter(id => id !== ministryId)
    }));
  };

  const handleVolunteerInterestChange = (volunteerId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      volunteerInterests: checked 
        ? [...prev.volunteerInterests, volunteerId]
        : prev.volunteerInterests.filter(id => id !== volunteerId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('join_family_applications')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          county: formData.county,
          occupation: formData.occupation,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          baptism_status: formData.baptismStatus,
          previous_church: formData.previousChurch,
          ministry_interests: formData.ministryInterests,
          volunteer_interests: formData.volunteerInterests,
          testimony: formData.testimony
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your Join Family application has been submitted successfully. You'll be contacted soon!",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: user?.email || "",
        phone: "",
        address: "",
        county: "",
        occupation: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        baptismStatus: "",
        previousChurch: "",
        ministryInterests: [],
        volunteerInterests: [],
        testimony: ""
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Join the Family Application
        </CardTitle>
        <CardDescription>
          Complete this form to become part of our church family. This is required before joining ministries or serve departments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="county">County/Region</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                placeholder="e.g., Nairobi, Kiambu, Mombasa"
              />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation/Profession</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="e.g., Teacher, Engineer, Student"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
              />
            </div>
          </div>

          {/* Spiritual Information */}
          <div>
            <Label htmlFor="baptismStatus">Baptism Status *</Label>
            <Select value={formData.baptismStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, baptismStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your baptism status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baptized">I am baptized</SelectItem>
                <SelectItem value="not_baptized">I am not baptized</SelectItem>
                <SelectItem value="interested">I'm interested in baptism</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="previousChurch">Previous Church (if applicable)</Label>
            <Input
              id="previousChurch"
              value={formData.previousChurch}
              onChange={(e) => setFormData(prev => ({ ...prev, previousChurch: e.target.value }))}
            />
          </div>

          {/* Ministry Interests */}
          <div>
            <Label>Ministry Interests</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {ministryOptions.map((ministry) => {
                const IconComponent = ministry.icon;
                return (
                  <div key={ministry.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ministry-${ministry.id}`}
                      checked={formData.ministryInterests.includes(ministry.id)}
                      onCheckedChange={(checked) => handleMinistryInterestChange(ministry.id, checked as boolean)}
                    />
                    <Label htmlFor={`ministry-${ministry.id}`} className="flex items-center gap-2 text-sm">
                      <IconComponent className="h-4 w-4" />
                      {ministry.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volunteer Interests */}
          <div>
            <Label>Volunteer/Serve Interests</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {volunteerOptions.map((volunteer) => {
                const IconComponent = volunteer.icon;
                return (
                  <div key={volunteer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`volunteer-${volunteer.id}`}
                      checked={formData.volunteerInterests.includes(volunteer.id)}
                      onCheckedChange={(checked) => handleVolunteerInterestChange(volunteer.id, checked as boolean)}
                    />
                    <Label htmlFor={`volunteer-${volunteer.id}`} className="flex items-center gap-2 text-sm">
                      <IconComponent className="h-4 w-4" />
                      {volunteer.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimony */}
          <div>
            <Label htmlFor="testimony">Your Testimony (Optional)</Label>
            <Textarea
              id="testimony"
              placeholder="Share your faith journey or how God has worked in your life..."
              value={formData.testimony}
              onChange={(e) => setFormData(prev => ({ ...prev, testimony: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};