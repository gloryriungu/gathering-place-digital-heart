import { useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Globe } from "lucide-react";

interface FlagRow {
  key: string;
  label: string;
  path: string | null;
  category: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  nav_primary: "Main menu links",
  nav_dropdown: "Get Involved menu",
  auth_button: "Sign in button",
  page_route: "Pages",
};

export const SiteVisibilityManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["site-feature-flags-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_feature_flags")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FlagRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ key, is_active }: { key: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("site_feature_flags")
        .update({ is_active })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["site-feature-flags-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-feature-flags"] });
      toast({
        title: vars.is_active ? "Now visible to the public" : "Hidden from the public",
        description: vars.is_active
          ? "Visitors can see and open this straight away."
          : "Visitors see a 'launching soon' message. IT and Founder accounts still have full access.",
      });
    },
    onError: () =>
      toast({
        title: "Could not save the change",
        description: "Please try again, or contact support at info@tot.co.ke.",
        variant: "destructive",
      }),
  });

  const grouped = useMemo(() => {
    const map: Record<string, FlagRow[]> = {};
    (data ?? []).forEach((f) => {
      (map[f.category] ||= []).push(f);
    });
    return map;
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const activeCount = (data ?? []).filter((f) => f.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Site Visibility
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose what the public can see. Anything switched off shows a
            "launching soon" message to visitors, while your team can still open it.
          </p>
        </div>
        <Badge variant="secondary">{activeCount} of {(data ?? []).length} live</Badge>
      </div>

      {Object.entries(grouped).map(([category, rows]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{CATEGORY_LABELS[category] ?? category}</CardTitle>
            <CardDescription>
              {rows.length} item{rows.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((flag) => (
              <div
                key={flag.key}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {flag.is_active ? (
                      <Eye className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium truncate">{flag.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground break-words">
                    {flag.description ?? flag.path ?? flag.key}
                  </p>
                </div>
                <Switch
                  checked={flag.is_active}
                  disabled={toggle.isPending}
                  onCheckedChange={(checked) =>
                    toggle.mutate({ key: flag.key, is_active: checked })
                  }
                  aria-label={`Show ${flag.label} to the public`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SiteVisibilityManager;
