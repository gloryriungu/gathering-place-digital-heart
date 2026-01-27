import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Cookie, Shield, BarChart3, Megaphone, Settings2, ChevronDown, ChevronUp, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent";
const SESSION_ID_KEY = "cookie_session_id";

interface CookieSettings {
  id: string;
  popup_title: string;
  popup_description: string;
  policy_text: string;
  show_detailed_options: boolean;
  button_accept_text: string;
  button_reject_text: string;
  button_customize_text: string;
  is_active: boolean;
}

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const CookieConsent = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [consent, setConsent] = useState<ConsentState>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate or get session ID for anonymous users
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  };

  // Check if consent has already been given
  useEffect(() => {
    const existingConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!existingConsent) {
      // Fetch settings and show banner
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("cookie_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching cookie settings:", error);
        // Use default settings
        setSettings({
          id: "",
          popup_title: "We Value Your Privacy",
          popup_description: "This website uses cookies to ensure you get the best experience.",
          policy_text: "We use cookies to enhance your browsing experience.",
          show_detailed_options: true,
          button_accept_text: "Accept All",
          button_reject_text: "Reject All",
          button_customize_text: "Customize",
          is_active: true,
        });
      } else {
        setSettings(data);
      }
      
      // Small delay for smooth entrance
      setTimeout(() => {
        setShowBanner(true);
        setIsAnimating(true);
      }, 500);
    } catch (err) {
      console.error("Failed to fetch cookie settings:", err);
    }
  };

  const saveConsent = async (consentType: "all" | "essential" | "custom" | "rejected") => {
    const sessionId = getSessionId();
    const consentData = {
      user_id: user?.id || null,
      session_id: sessionId,
      consent_given: consentType !== "rejected",
      consent_type: consentType,
      analytics_consent: consent.analytics,
      marketing_consent: consent.marketing,
      functional_consent: consent.functional,
      user_agent: navigator.userAgent,
    };

    // Save to localStorage immediately
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      type: consentType,
      ...consent,
      timestamp: new Date().toISOString(),
    }));

    // Save to database
    try {
      const { error } = await supabase
        .from("cookie_consents")
        .insert(consentData);

      if (error) {
        console.error("Error saving cookie consent:", error);
      }
    } catch (err) {
      console.error("Failed to save cookie consent:", err);
    }

    // Close banner with animation
    setIsAnimating(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleAcceptAll = () => {
    setConsent({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
    saveConsent("all");
  };

  const handleRejectAll = () => {
    setConsent({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    saveConsent("rejected");
  };

  const handleSaveCustom = () => {
    saveConsent("custom");
  };

  const handleEssentialOnly = () => {
    setConsent({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    saveConsent("essential");
  };

  if (!showBanner || !settings) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[9999] p-4 transition-all duration-300 ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <Card className="mx-auto max-w-4xl shadow-2xl border-2 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{settings.popup_title}</CardTitle>
                <CardDescription className="mt-1 max-w-2xl">
                  {settings.popup_description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEssentialOnly}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAcceptAll} className="flex-1 min-w-[140px]">
              {settings.button_accept_text}
            </Button>
            <Button variant="outline" onClick={handleRejectAll} className="flex-1 min-w-[140px]">
              {settings.button_reject_text}
            </Button>
            {settings.show_detailed_options && (
              <Button
                variant="secondary"
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 min-w-[140px]"
              >
                {settings.button_customize_text}
                {showDetails ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Detailed Cookie Options */}
          {showDetails && (
            <div className="space-y-4 pt-4 animate-in slide-in-from-top-2 duration-200">
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <Label className="font-medium">Essential Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Required for basic site functionality. Cannot be disabled.
                      </p>
                    </div>
                  </div>
                  <Switch checked={true} disabled className="data-[state=checked]:bg-green-600" />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border">
                  <div className="flex gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <Label className="font-medium">Analytics Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help us understand how visitors use our site.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={consent.analytics}
                    onCheckedChange={(checked) =>
                      setConsent((prev) => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border">
                  <div className="flex gap-3">
                    <Megaphone className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <Label className="font-medium">Marketing Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used to personalize ads and content.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={consent.marketing}
                    onCheckedChange={(checked) =>
                      setConsent((prev) => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border">
                  <div className="flex gap-3">
                    <Settings2 className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <Label className="font-medium">Functional Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable enhanced features and personalization.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={consent.functional}
                    onCheckedChange={(checked) =>
                      setConsent((prev) => ({ ...prev, functional: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveCustom}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Policy Text */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            {settings.policy_text}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
