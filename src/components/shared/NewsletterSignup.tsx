import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterSignupProps {
  showCard?: boolean;
  className?: string;
}

export const NewsletterSignup = ({ showCard = true, className = "" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        if (existing.is_active) {
          toast({
            title: "Already Subscribed",
            description: "This email is already on our newsletter list.",
          });
          setLoading(false);
          return;
        } else {
          // Reactivate subscription
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({ 
              is_active: true,
              first_name: firstName,
              last_name: lastName,
            })
            .eq('id', existing.id);

          if (updateError) throw updateError;

          toast({
            title: "Welcome Back!",
            description: "Your newsletter subscription has been reactivated.",
          });
          setIsSubscribed(true);
          setLoading(false);
          return;
        }
      }

      // New subscription with lead capture data
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          is_active: true,
          source: 'website_form',
          tags: ['newsletter'],
          metadata: {
            subscribed_from: window.location.pathname,
            user_agent: navigator.userAgent,
          },
        });

      if (insertError) throw insertError;

      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setIsSubscribed(true);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {isSubscribed ? (
        <div className="text-center py-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">You're All Set!</h3>
          <p className="text-muted-foreground">
            Thank you for subscribing to our newsletter. You'll receive inspiring messages and updates from our church family.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subscribing...
              </div>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe to Newsletter
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center">
          <Mail className="h-5 w-5 mr-2" />
          Stay Connected
        </CardTitle>
        <CardDescription>
          Subscribe to our newsletter for weekly inspiration and church updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};