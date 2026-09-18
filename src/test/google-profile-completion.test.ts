import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isGoogleOnlyAccount } from "@/components/auth/AuthProvider";

const authUser = (
  provider: string,
  providers: string[],
  identityProviders: string[],
) => ({
  app_metadata: { provider, providers },
  identities: identityProviders.map((identityProvider) => ({ provider: identityProvider })),
} as User);

describe("Google profile completion eligibility", () => {
  it("requires completion for a Google-only account", () => {
    expect(isGoogleOnlyAccount(authUser("google", ["google"], ["google"]))).toBe(true);
  });

  it("does not require completion for an email account linked to Google", () => {
    expect(isGoogleOnlyAccount(authUser("google", ["email", "google"], ["email", "google"]))).toBe(false);
  });

  it("does not require completion for an email-only account", () => {
    expect(isGoogleOnlyAccount(authUser("email", ["email"], ["email"]))).toBe(false);
  });
});