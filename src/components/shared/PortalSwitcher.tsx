/**
 * PortalSwitcher
 *
 * A compact dropdown that lets staff who belong to MORE THAN ONE department
 * jump straight from one portal/dashboard to another without signing out
 * or contacting an admin to change their role.
 *
 * Visibility rules:
 * - Hidden for unauthenticated users.
 * - Hidden when the user only has access to a single portal (no point showing it).
 * - Shows the user's currently active portal and lets them switch to any other
 *   portal they have been assigned to via the IT Department.
 *
 * Switching the active role updates AuthProvider state (and persists to
 * localStorage), then navigates to the matching dashboard route.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type PortalDef = {
  role: string;
  label: string;
  path: string;
};

// Map each role -> the dashboard route it owns.
// "user" is the personal dashboard everyone has.
const PORTALS: PortalDef[] = [
  { role: "founder", label: "Founder Portal", path: "/admin" },
  { role: "senior_pastor", label: "Senior Pastor Portal", path: "/pastors" },
  { role: "admin", label: "Admin Dashboard", path: "/admin" },
  { role: "it", label: "IT Dashboard", path: "/admin" },
  { role: "media", label: "Media Dashboard", path: "/media-dashboard" },
  { role: "marketing", label: "Marketing Dashboard", path: "/marketing-dashboard" },
  { role: "registration", label: "Registration Dashboard", path: "/registration-dashboard" },
  { role: "accounts", label: "Accounts Dashboard", path: "/admin" },
  { role: "sunday_school", label: "Sunday School", path: "/dashboard" },
  { role: "teacher", label: "Teacher Portal", path: "/dashboard" },
  { role: "pastor", label: "Pastor Portal", path: "/pastors" },
  { role: "sound", label: "Sound Team", path: "/dashboard" },
  { role: "security", label: "Security Team", path: "/dashboard" },
  { role: "user", label: "My Dashboard", path: "/dashboard" },
];

interface PortalSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

export const PortalSwitcher = ({ variant = "outline", className }: PortalSwitcherProps) => {
  const { isAuthenticated, userRoles, userRole, switchActiveRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // Build the list of portals the user can access (deduped by path+role).
  const seen = new Set<string>();
  const availablePortals = PORTALS.filter(p => {
    if (!userRoles.includes(p.role)) return false;
    const key = `${p.role}:${p.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Nothing to switch between — hide entirely.
  if (availablePortals.length <= 1) return null;

  const activePortal =
    availablePortals.find(p => p.role === userRole) ?? availablePortals[0];

  const handleSwitch = (portal: PortalDef) => {
    switchActiveRole(portal.role);
    if (location.pathname !== portal.path) {
      navigate(portal.path);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <LayoutGrid className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{activePortal.label}</span>
          <span className="sm:hidden">Portal</span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Switch Portal</span>
          <Badge variant="secondary" className="text-xs">
            {availablePortals.length} portals
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availablePortals.map(portal => {
          const isActive = portal.role === userRole;
          return (
            <DropdownMenuItem
              key={`${portal.role}-${portal.path}`}
              onClick={() => handleSwitch(portal)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{portal.label}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {portal.role.replace(/_/g, " ")}
                  </span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PortalSwitcher;
