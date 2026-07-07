/**
 * End-to-end style tests for multi-department access:
 *
 * 1. A user allocated multiple department roles sees a PortalSwitcher
 *    listing each of those portals.
 * 2. AuthGuard grants access to any dashboard whose role is in userRoles
 *    (multi-department awareness).
 * 3. Clicking a different portal in the switcher navigates to that
 *    dashboard WITHOUT calling supabase.auth.signOut — i.e. the user
 *    stays signed in and the active role is persisted to localStorage.
 * 4. A realtime user_roles change from IT (grant / revoke) is reflected
 *    live in the switcher without a page reload.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

// ---------- Mock supabase client ----------

type RoleRow = { role: string };

const state: {
  roles: RoleRow[];
  user: any;
  session: any;
  authListener: ((event: string, session: any) => void) | null;
  realtimeCallback: ((payload: any) => void) | null;
  signOutCalled: number;
} = {
  roles: [],
  user: null,
  session: null,
  authListener: null,
  realtimeCallback: null,
  signOutCalled: 0,
};

const channelMock = {
  on: vi.fn((_evt: string, _filter: any, cb: any) => {
    state.realtimeCallback = cb;
    return channelMock;
  }),
  subscribe: vi.fn(() => channelMock),
  unsubscribe: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      auth: {
        onAuthStateChange: (cb: any) => {
          state.authListener = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        },
        getSession: async () => ({ data: { session: state.session } }),
        signOut: async () => {
          state.signOutCalled += 1;
          return { error: null };
        },
        signInWithPassword: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: null }),
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => {
            if (table === "user_roles") {
              return Promise.resolve({ data: state.roles, error: null });
            }
            return {
              single: () =>
                Promise.resolve({
                  data: { phone: "x", address: "x", county: "x" },
                  error: null,
                }),
            };
          },
        }),
        insert: () => Promise.resolve({ error: null }),
      }),
      functions: { invoke: async () => ({ error: null }) },
      channel: () => channelMock,
    },
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";
import { AuthGuard } from "@/components/shared/AuthGuard";

const LocationProbe = () => {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname}</div>;
};

const SignOutProbe = () => {
  const { signOut } = useAuth();
  return <button onClick={signOut}>do-sign-out</button>;
};

const renderApp = (initialPath = "/marketing-dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <PortalSwitcher />
        <LocationProbe />
        <SignOutProbe />
        <Routes>
          <Route
            path="/marketing-dashboard"
            element={
              <AuthGuard requiredRole="marketing">
                <div>MARKETING PAGE</div>
              </AuthGuard>
            }
          />
          <Route
            path="/media-dashboard"
            element={
              <AuthGuard requiredRole="media">
                <div>MEDIA PAGE</div>
              </AuthGuard>
            }
          />
          <Route
            path="/registration-dashboard"
            element={
              <AuthGuard requiredRole="registration">
                <div>REGISTRATION PAGE</div>
              </AuthGuard>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

const fakeUser = {
  id: "user-1",
  app_metadata: { provider: "email" },
  identities: [{ provider: "email" }],
};

beforeEach(() => {
  state.roles = [];
  state.user = fakeUser;
  state.session = { user: fakeUser };
  state.authListener = null;
  state.realtimeCallback = null;
  state.signOutCalled = 0;
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Multi-department portal access", () => {
  it("shows every allocated portal in the switcher", async () => {
    state.roles = [
      { role: "media" },
      { role: "marketing" },
      { role: "registration" },
    ];

    renderApp("/marketing-dashboard");

    // AuthGuard grants access because 'marketing' is one of the user's roles
    expect(await screen.findByText("MARKETING PAGE")).toBeInTheDocument();

    // Open the switcher
    const trigger = await screen.findByRole("button", { name: /portal/i });
    await userEvent.click(trigger);

    expect(
      await screen.findByText(/Marketing Dashboard/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Media Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Registration Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/3 portals/i)).toBeInTheDocument();
  });

  it("hides the switcher when the user has a single portal", async () => {
    state.roles = [{ role: "marketing" }];
    renderApp("/marketing-dashboard");
    expect(await screen.findByText("MARKETING PAGE")).toBeInTheDocument();
    // No switch button rendered
    expect(screen.queryByRole("button", { name: /portal/i })).toBeNull();
  });

  it("AuthGuard grants access when ANY assigned role matches the required role", async () => {
    // Primary role by priority would be 'media', but user visits marketing
    state.roles = [{ role: "media" }, { role: "marketing" }];
    renderApp("/marketing-dashboard");
    expect(await screen.findByText("MARKETING PAGE")).toBeInTheDocument();
  });

  it("switching portals navigates without signing the user out", async () => {
    state.roles = [{ role: "media" }, { role: "marketing" }];
    renderApp("/marketing-dashboard");

    expect(await screen.findByText("MARKETING PAGE")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: /portal/i }));
    await userEvent.click(await screen.findByText(/Media Dashboard/i));

    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe(
        "/media-dashboard"
      )
    );
    expect(await screen.findByText("MEDIA PAGE")).toBeInTheDocument();

    // Critical: user was NOT signed out during the switch
    expect(state.signOutCalled).toBe(0);
    // Active portal is persisted for the next visit
    expect(localStorage.getItem("active_portal_role")).toBe("media");
  });

  it("realtime role grant from IT appears in the switcher without reload", async () => {
    state.roles = [{ role: "media" }];
    renderApp("/media-dashboard");

    expect(await screen.findByText("MEDIA PAGE")).toBeInTheDocument();
    // Only 1 portal so the switcher is hidden
    expect(screen.queryByRole("button", { name: /portal/i })).toBeNull();

    // IT grants marketing role -> realtime fires
    state.roles = [{ role: "media" }, { role: "marketing" }];
    await act(async () => {
      state.realtimeCallback?.({ eventType: "INSERT" });
    });

    // Switcher now visible with both portals, no sign-out involved
    const trigger = await screen.findByRole("button", { name: /portal/i });
    await userEvent.click(trigger);
    expect(await screen.findByText(/Marketing Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Media Dashboard/i)).toBeInTheDocument();
    expect(state.signOutCalled).toBe(0);
  });
});
