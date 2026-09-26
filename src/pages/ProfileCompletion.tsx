import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Phone, User, Camera, AlertCircle, LifeBuoy } from "lucide-react";
import { getProfileSaveErrorMessage, SUPPORT_EMAIL, type FriendlyError } from "@/lib/authErrors";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Kenya counties list
const kenyaCounties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
  "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
  "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira",
  "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

const ProfileCompletion = () => {
  const { user, isAuthenticated, needsProfileCompletion, refreshProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<FriendlyError | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    county: '',
    photographyConsent: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!needsProfileCompletion) {
      navigate('/dashboard');
      return;
    }

    // Pre-fill name from Google profile if available
    if (user?.user_metadata) {
      setProfileForm(prev => ({
        ...prev,
        firstName: user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.given_name || '',
        lastName: user.user_metadata.family_name || user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [isAuthenticated, needsProfileCompletion, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError(null);

    try {
      // Update or insert profile data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          address: profileForm.address,
          county: profileForm.county,
          photography_consent: profileForm.photographyConsent,
          photography_consent_date: profileForm.photographyConsent ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        const friendly = getProfileSaveErrorMessage(error);
        setSaveError(friendly);
        toast({
          title: friendly.title,
          description: friendly.description,
          variant: "destructive"
        });
      } else {
        await refreshProfileCompletion();
        toast({
          title: "Profile Complete",
          description: "Welcome to our church family!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      const friendly = getProfileSaveErrorMessage(error);
      setSaveError(friendly);
      toast({
        title: friendly.title,
        description: friendly.description,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !needsProfileCompletion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
            <p className="text-muted-foreground mt-2">
              Just a few more details to join our church family
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-card/95 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">Profile Information</CardTitle>
              <CardDescription className="text-center">
                Help us get to know you better and stay connected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      <User className="inline h-4 w-4 mr-1" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Your residential address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County (Kenya)</Label>
                  <Select 
                    value={profileForm.county} 
                    onValueChange={(value) => setProfileForm({ ...profileForm, county: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyaCounties.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start space-x-3 rounded-md border border-border p-3">
                      <Checkbox
                        id="profilePhotographyConsent"
                        checked={profileForm.photographyConsent}
                        onCheckedChange={(checked) => setProfileForm({ ...profileForm, photographyConsent: checked === true })}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="profilePhotographyConsent" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          Photography & Videography Consent
                          <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          I consent to being photographed and/or recorded during church services and events. 
                          Images and videos may be used for church communications, social media, and promotional materials 
                          in accordance with Kenya's Data Protection Act, 2019.
                        </p>
                      </div>
                    </div>

                {saveError && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 space-y-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">{saveError.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{saveError.description}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a href={`mailto:${SUPPORT_EMAIL}?subject=Help%20completing%20my%20profile`}>
                        <LifeBuoy className="h-4 w-4 mr-2" />
                        Contact support
                      </a>
                    </Button>
                  </div>
                )}


                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Completing Profile..." : "Complete Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Complete Later
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              This information helps us serve you better and stay in touch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;