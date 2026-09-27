import { ReactNode } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";

interface FeatureRouteGuardProps {
  /** Key in site_feature_flags controlling this route. */
  featureKey: string;
  children: ReactNode;
}

/**
 * Blocks public access to routes the IT team has not activated yet.
 * IT / founder accounts see the live page with a staff preview notice so they
 * can finish configuring it before launch.
 */
export const FeatureRouteGuard = ({ featureKey, children }: FeatureRouteGuardProps) => {
  const { loading, isActive, canBypass, flags } = useFeatureFlags();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  const active = isActive(featureKey);

  if (active) return <>{children}</>;

  if (canBypass) {
    return (
      <>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg">
          <Eye className="h-3.5 w-3.5" />
          Staff preview — this page is hidden from the public
        </div>
        {children}
      </>
    );
  }

  const label = flags.find((f) => f.key === featureKey)?.label;
  return <ComingSoon title={label} />;
};

export default FeatureRouteGuard;
