## Goal

Make linked email-and-Google accounts behave correctly, allow profile completion to save, and stop trapping users on the completion page.

## Confirmed causes

- The `profiles` save is rejected because its access rules evaluate `has_role`, but `authenticated` users currently have no permission to execute that function.
- An account that originally used email/password can gain a Google identity. The current provider check scans every identity, so that linked account is incorrectly treated as a Google-only signup requiring profile completion.
- `ProfileCompletionGuard` redirects incomplete Google users back to `/auth/complete-profile` from almost every page. This conflicts with the chosen behavior: users may continue anywhere and complete their profile later.

## Changes

1. **Repair the database permission safely**
   - Grant only signed-in users permission to execute `public.has_role(uuid, app_role)`.
   - Keep anonymous access revoked.
   - Retain the function's fixed search path and security-definer behavior so role-based access rules work without exposing the roles table.

2. **Distinguish new Google accounts from linked accounts**
   - Update the profile-completion decision to use the account's primary sign-in provider rather than treating the presence of any Google identity as proof that the account is Google-only.
   - Email/password accounts linked to Google will not be forced into profile completion.
   - Google-primary accounts with missing phone, address, or county will still be offered the existing completion form.

3. **Remove forced navigation lock-in**
   - Stop the global guard from forcing incomplete users back to the completion page.
   - Keep the Google callback landing on the existing completion page, but allow all navigation and dashboard access before completion.
   - Add a clear “Complete later” action on the form so users can leave intentionally.

4. **Keep completion state accurate**
   - Refresh the profile-completion status immediately after a successful save so the form does not remain logically incomplete during the same session.
   - Preserve existing email/password, password recovery, role, and portal-switching behavior.

5. **Verify the complete flow**
   - Confirm the profile update succeeds as an authenticated user without the `has_role` error.
   - Confirm an email account later linked to Google is not forced to complete the profile.
   - Confirm a new Google-primary account reaches the form but can complete it or continue elsewhere.
   - Confirm anonymous callers still cannot execute the role-check function.
