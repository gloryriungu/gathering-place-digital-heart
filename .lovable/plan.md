
# Seed Content into the New Supabase Project

`full_schema_v3.sql` is in. Now produce a **separate, seed-only** file that inserts starter content into the tables that already exist. Keeping seeds in their own file means you can re-run them safely without touching schema.

## Deliverable
`/mnt/documents/seed_data.sql` — single idempotent script to paste into the SQL Editor after the schema is live.

## Structure

Wrapped in `DO $seed$ BEGIN ... END $seed$;` with `RAISE NOTICE` per section. Every section guarded by `IF to_regclass('public.<table>') IS NOT NULL THEN ...` so missing tables are skipped, not fatal.

### 1. Config (required for app to boot correctly)
- `department_tab_visibility` — default rows for every tab key the UI checks (giving, shop, counseling, events, ministries, baptism, dedication, prophetic, serve, etc.), all visible
- `cookie_categories` — necessary, analytics, marketing, preferences (+ descriptions)
- `activity_log_visibility` — founder-only default
- `join_family_visibility` — founder-only default
- `page_content` — `privacy_policy` and `terms_of_service` rows matching the DEFAULT_CONTENT already in `PrivacyPolicy.tsx` / `TermsOfService.tsx`

### 2. CMS placeholders (public site renders non-empty)
- `hero_content` — one default hero
- `service_times` — Sunday 9am, Sunday 11am, Wednesday 6pm
- `announcements` — one welcome announcement
- `faqs` — 5 starter Q&As (membership, giving, baptism, counseling, contact)
- `footer_links` — Quick Links, Connect, Legal groupings
- `about_us`, `visit_us`, `give_page`, `counseling_page`, `notice_filming` — one published row each
- `testimonials` — 2 sample testimonials, not featured
- `social_media_links` — empty/inactive rows for Facebook, Instagram, YouTube, TikTok
- `watch_page` — placeholder staff label rows

### 3. Catalog samples (QA-friendly, inactive by default)
- `ministries` — Worship, Youth, Outreach
- `events` — 2 upcoming events (`now() + interval '30 days'` / `'60 days'`)
- `shop_products` — 2 physical + 1 digital ebook (inactive)
- `media_content` / `sermons` — 2 sample entries (inactive)
- `giving_contribution_types` — `tithe`, `offering`, `gift_1`, `gift_2`, `building_fund`, `missions` (snake_case, per memory)

### 4. Founder bootstrap (commented, run after signup)
Appended as a clearly labelled comment block — not auto-executed:
```sql
/* Replace email, then run:
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'founder'::app_role FROM auth.users
   WHERE email = 'founder@tot.co.ke'
   ON CONFLICT (user_id, role) DO NOTHING;
*/
```

## Idempotency rules
- Tables with a natural unique key (slug/name/key) → `ON CONFLICT (<key>) DO NOTHING`
- Tables without one → `INSERT ... SELECT ... WHERE NOT EXISTS (SELECT 1 FROM <table> WHERE <marker>)`
- `created_by` / `updated_by` set to `NULL` (no fake auth.users FKs)
- All timestamps via `now()`; future dates via `now() + interval`
- Schema-qualified (`public.<table>`) everywhere

## Approach
Before writing inserts, I'll quickly inspect the actual columns of each target table via `supabase--read_query` against `information_schema.columns` so every INSERT matches the real schema (column names, NOT NULL, defaults). If a table is structured differently from expectations, that subsection is adjusted or skipped with a `RAISE NOTICE`.

## Out of scope
- No schema changes
- No edits to `src/`
- No row data referencing real users (founder grant is the manual step at the end)

After you approve, switch to build mode and I'll inspect schemas, generate `/mnt/documents/seed_data.sql`, and link the SQL Editor.
