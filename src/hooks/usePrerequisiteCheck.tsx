import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrerequisiteStatus {
  hasApprovedFamilyApplication: boolean;
  loading: boolean;
  error: string | null;
}

export const usePrerequisiteCheck = (): PrerequisiteStatus => {
  const [hasApprovedFamilyApplication, setHasApprovedFamilyApplication] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkPrerequisites();
  }, []);

  const checkPrerequisites = async () => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        setError("User not authenticated");
        return;
      }

      // Check if user has an approved join family application
      const { data: familyApp, error: familyError } = await supabase
        .from('join_family_applications')
        .select('id, status')
        .eq('user_id', user.data.user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (familyError) {
        console.error("Error checking family application:", familyError);
        setError(familyError.message);
        return;
      }

      setHasApprovedFamilyApplication(!!familyApp);
      
    } catch (err: any) {
      console.error("Error in prerequisite check:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showPrerequisiteError = (featureName: string) => {
    toast({
      title: "Access Restricted",
      description: `You must complete and have an approved "Join Family" application before accessing ${featureName}.`,
      variant: "destructive"
    });
  };

  return {
    hasApprovedFamilyApplication,
    loading,
    error
  };
};

export const usePrerequisiteGuard = (featureName: string) => {
  const { hasApprovedFamilyApplication, loading } = usePrerequisiteCheck();
  const { toast } = useToast();

  const checkAccess = () => {
    if (!hasApprovedFamilyApplication && !loading) {
      toast({
        title: "Access Restricted",
        description: `You must complete and have an approved "Join Family" application before accessing ${featureName}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    hasAccess: hasApprovedFamilyApplication,
    loading,
    checkAccess
  };
};