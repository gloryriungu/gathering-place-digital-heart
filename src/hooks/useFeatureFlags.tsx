import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export interface SiteFeatureFlag {
  key: string;
  label: string;
  path: string | null;
  category: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

const fetchFlags = async (): Promise<SiteFeatureFlag[]> => {
  const { data, error } = await supabase
    .from("site_feature_flags")
    .select("key, label, path, category, description, display_order, is_active")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SiteFeatureFlag[];
};

/**
 * Reads the site-wide visibility configuration that the IT team controls.
 * Staff with the `it` or `founder` role bypass every restriction so they can
 * preview and test pages that are still hidden from the public.
 */
export const useFeatureFlags = () => {
  const { userRoles, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["site-feature-flags"],
    queryFn: fetchFlags,
    staleTime: 60 * 1000,
  });

  const flags = data ?? [];
  const canBypass = userRoles.includes("it") || userRoles.includes("founder");

  const isActive = (key: string) => {
    const flag = flags.find((f) => f.key === key);
    // Unknown keys default to visible so new pages are never accidentally hidden.
    return flag ? flag.is_active : true;
  };

  const isVisible = (key: string) => canBypass || isActive(key);

  const flagForPath = (path: string) =>
    flags.find((f) => f.path && f.path === path);

  return {
    flags,
    loading: isLoading || authLoading,
    canBypass,
    isActive,
    isVisible,
    flagForPath,
  };
};
