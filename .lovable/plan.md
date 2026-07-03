## Problem

When someone signs up from **Join Us** (email + password), they fill in first/last name, phone, address, county, etc. The `handle_new_user` trigger writes all of that into `profiles`. Yet after email confirmation and first sign-in, they land on `/auth/complete-profile` and are asked to fill the same fields again.

Root cause is in `src/components/auth/AuthProvider.tsx` → `checkProfileCompletion`:

- It flags `needsProfileCompletion = true` whenever `profiles.phone / address / county` are empty **or** when the `.single()` query errors (e.g. profile row not yet created due to a slight trigger race after email confirmation).
- It makes no distinction between email sign-ups (who already supplied everything) and Google OAuth sign-ups (who legitimately need the extra step).

The `/auth/complete-profile` page is designed for Google users only — the Google callback in `signInWithGoogle` already routes there explicitly.

## Fix

Restrict the "needs profile completion" flag to **OAuth (Google) users only**. Email/password accounts must never be redirected to `ProfileCompletion`.

### Changes

**`src/components/auth/AuthProvider.tsx`**

1. In `checkProfileCompletion(userId)`, first inspect the current user's auth provider:
   - `provider = user.app_metadata?.provider` (and/or scan `user.identities` for a `google` identity).
   - If provider is `email` (or anything other than an OAuth social provider), set `needsProfileCompletion = false` and return early — regardless of what's in `profiles`.
   - Only for OAuth providers (`google`, etc.), keep the existing "phone/address/county missing" check.
2. Pass the `User` object into `checkProfileCompletion` (instead of just `userId`) so we can read `app_metadata`/`identities` without an extra round-trip. Update the two call sites in the `onAuthStateChange` listener and in the initial `getSession()` block.
3. Treat a missing `profiles` row for an email user as "not incomplete" (the row will be created by the trigger; email users supplied everything at signup, so we should not push them into the OAuth-only completion form).

**No other files need to change.** In particular:

- `src/pages/Auth.tsx` already routes to `/auth/complete-profile` only when `needsProfileCompletion` is true, so fixing the flag fixes the redirect.
- `signInWithGoogle` keeps its explicit `redirectTo: /auth/complete-profile` — Google users still see the form the first time.
- `ProfileCompletion.tsx` stays as-is; it already redirects to `/dashboard` if `needsProfileCompletion` is false, so any Google user who has already filled it won't see it again.

## Result

- **Email signup → verify email → sign in → `/dashboard`** (no extra form).
- **Google signup → `/auth/complete-profile` (once) → `/dashboard`** (unchanged behaviour).
