import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";

const registrationSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  county: z.string().trim().max(100).optional(),
  number_of_attendees: z.number().min(1).max(50),
  special_requirements: z.string().trim().max(500).optional(),
});

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  maxAttendees?: number;
  currentAttendees?: number;
  registrationDeadline?: string;
  customFields?: any[];
}

export const EventRegistrationForm = ({
  eventId,
  eventTitle,
  maxAttendees,
  currentAttendees = 0,
  registrationDeadline,
  customFields = [],
}: EventRegistrationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [registrationFor, setRegistrationFor] = useState<'self' | 'behalf_of_other'>('self');
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    county: "",
    number_of_attendees: 1,
    special_requirements: "",
    custom_fields: {} as Record<string, any>,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const spotsAvailable = maxAttendees ? maxAttendees - currentAttendees : null;
  const isFull = spotsAvailable !== null && spotsAvailable <= 0;
  const deadlinePassed = registrationDeadline && new Date(registrationDeadline) < new Date();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      // Try to fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Try to fetch from join_family_applications if profile is incomplete
      const { data: application } = await supabase
        .from('join_family_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Pre-fill form with available data
      if (profile || application) {
        setFormData(prev => ({
          ...prev,
          first_name: application?.first_name || profile?.first_name || "",
          last_name: application?.last_name || profile?.last_name || "",
          email: application?.email || user.email || "",
          phone: application?.phone || profile?.phone || "",
          county: application?.county || profile?.county || "",
        }));
      }
    }
  };

  const handleRegistrationTypeChange = (forSelf: boolean) => {
    if (forSelf) {
      setRegistrationFor('self');
      fetchUserData(); // Re-fetch and pre-fill
    } else {
      setRegistrationFor('behalf_of_other');
      // Clear form for someone else
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        county: "",
        number_of_attendees: 1,
        special_requirements: "",
        custom_fields: {},
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFull) {
      toast({
        title: "Event Full",
        description: "This event has reached maximum capacity.",
        variant: "destructive",
      });
      return;
    }

    if (deadlinePassed) {
      toast({
        title: "Registration Closed",
        description: "The registration deadline has passed.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate form data
      registrationSchema.parse(formData);

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: registrationFor === 'self' ? user?.id : null,
          registered_by: user?.id || null,
          registration_type: registrationFor,
          ...formData,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error("You've already registered for this event with this email.");
        }
        throw error;
      }

      toast({
        title: "Registration Successful!",
        description: `You've successfully registered for ${eventTitle}. Check your email for confirmation.`,
      });

      navigate('/events');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isFull) {
    return (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Event Full</h3>
        <p className="text-muted-foreground">
          This event has reached maximum capacity. Please check back later or contact us for more information.
        </p>
      </Card>
    );
  }

  if (deadlinePassed) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Registration Closed</h3>
        <p className="text-muted-foreground">
          The registration deadline for this event has passed.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Register for {eventTitle}</h3>
          {spotsAvailable !== null && (
            <p className="text-sm text-muted-foreground">
              {spotsAvailable} spots remaining
            </p>
          )}
        </div>

        {user && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <Label htmlFor="registration-type">Registering for myself</Label>
            <Switch
              id="registration-type"
              checked={registrationFor === 'self'}
              onCheckedChange={handleRegistrationTypeChange}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              value={formData.county}
              onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="number_of_attendees">Number of Attendees *</Label>
          <Input
            id="number_of_attendees"
            type="number"
            min="1"
            max={spotsAvailable || 50}
            value={formData.number_of_attendees}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              number_of_attendees: parseInt(e.target.value) 
            }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_requirements">Special Requirements</Label>
          <Textarea
            id="special_requirements"
            value={formData.special_requirements}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              special_requirements: e.target.value 
            }))}
            placeholder="Any dietary restrictions, accessibility needs, etc."
            maxLength={500}
          />
        </div>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Additional Information</h4>
            {customFields.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label} {field.required && '*'}
                </Label>
                
                {field.type === 'text' && (
                  <Input
                    id={field.id}
                    value={formData.custom_fields[field.id] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      custom_fields: { ...prev.custom_fields, [field.id]: e.target.value }
                    }))}
                    required={field.required}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.id}
                    value={formData.custom_fields[field.id] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      custom_fields: { ...prev.custom_fields, [field.id]: e.target.value }
                    }))}
                    required={field.required}
                  />
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={field.id}
                      checked={formData.custom_fields[field.id] || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        custom_fields: { ...prev.custom_fields, [field.id]: e.target.checked }
                      }))}
                      required={field.required}
                      className="rounded"
                    />
                    <Label htmlFor={field.id} className="font-normal">{field.label}</Label>
                  </div>
                )}
                
                {field.type === 'select' && (
                  <select
                    id={field.id}
                    value={formData.custom_fields[field.id] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      custom_fields: { ...prev.custom_fields, [field.id]: e.target.value }
                    }))}
                    required={field.required}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option: string) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options?.map((option: string) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`${field.id}-${option}`}
                          name={field.id}
                          value={option}
                          checked={formData.custom_fields[field.id] === option}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            custom_fields: { ...prev.custom_fields, [field.id]: e.target.value }
                          }))}
                          required={field.required}
                        />
                        <Label htmlFor={`${field.id}-${option}`} className="font-normal">{option}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Registration
        </Button>
      </form>
    </Card>
  );
};
