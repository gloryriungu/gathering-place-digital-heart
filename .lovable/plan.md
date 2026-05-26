# Migrate to a New Supabase Project Using Codebase Migrations

Since the old project's data is inaccessible (no password, expired connection), we cannot dump existing rows. The good news: the entire schema lives in `supabase/migrations/` (68 files, ~169 KB) and all 11 edge functions are in source. We can rebuild the database structurally; **row data will start empty** and be reseeded via the app (registrations, content via admin dashboards, etc.).

## What we can recover from the codebase
- All tables, columns, enums, RLS policies, triggers, functions (68 migration files)
- All 11 edge functions (auto-deployed by Lovable on connect)
- App code already references the schema correctly

## What we CANNOT recover
- Row data (members, contributions, events, content, uploaded files in Storage)
- `auth.users` (every user must sign up again or be re-imported)
- Edge function secrets (Paystack keys, Resend key, etc. — re-add after connect)
- Google OAuth provider config (must reconfigure in new project)
- Storage bucket contents (buckets get recreated by migrations; files are gone)

## Plan

### Step 1 — Create the new Supabase project
You create a brand-new project at supabase.com. Note the new project ref, URL, and anon key.

### Step 2 — Run the consolidated schema in the new project's SQL Editor
I'll generate one combined SQL file by concatenating all 68 migrations in order. You paste it into the new project's SQL Editor and run it once. This rebuilds:
- All tables + enums + indexes
- All RLS policies
- All database functions + triggers
- All storage buckets (empty)

```text
supabase/migrations/*.sql  →  /mnt/documents/full_schema.sql  →  paste into new SQL Editor
```

### Step 3 — Reconnect Lovable to the new Supabase project
In the Cloud panel: Disconnect current Supabase → Connect new project. Lovable will:
- Auto-update `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID)
- Auto-update `src/integrations/supabase/client.ts`
- Auto-deploy all 11 edge functions

### Step 4 — Re-add edge function secrets
After connect, re-add via Lovable's secret tool:
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`
- Any others surfaced when functions are first invoked

### Step 5 — Reconfigure Auth in the new Supabase dashboard
- Site URL: `https://stg.tot.co.ke`
- Redirect URLs: `https://stg.tot.co.ke/**`, `https://stg.tot.co.ke/auth/complete-profile`
- Enable Google provider with your Google OAuth client (same client ID/secret works; add new Supabase callback URL to Google Cloud Console)

### Step 6 — Reconfigure external webhooks
Update Paystack and Resend dashboards to point webhooks at the **new** project's edge function URLs (the function names stay the same, only the project ref in the URL changes).

### Step 7 — Seed essentials
Since rows are gone, the founder account must:
1. Sign up fresh, then I'll insert a `user_roles` row granting `founder`
2. Use the admin dashboards to recreate hero content, events, ministries, shop products, etc.
3. Re-upload storage assets (images, ebooks, sermon thumbnails)

## What I'll produce in build mode
1. `/mnt/documents/full_schema.sql` — concatenated migrations, ready to paste
2. `/mnt/documents/MIGRATION_STEPS.md` — checklist with exact dashboard URLs and SQL snippets (e.g., the founder-role insert template)
3. After you reconnect: update any hardcoded references and verify the app loads against the empty DB

## Risks / things to confirm
- **No row data is recoverable.** If there's any chance of regaining access to the old project (password reset on the Supabase dashboard login, not the DB), that's worth trying first — even one `pg_dump` would save weeks of re-entry.
- Storage files (sermons, ebooks, product images) must be re-uploaded manually.
- All users must register again; existing emails in `newsletter_subscribers` can be re-imported via CSV if you have an export.

Confirm to proceed and I'll generate the combined schema file and step-by-step guide.
