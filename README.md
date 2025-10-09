TOT Int – Gathering Place Digital Heart

Modern React + Vite web app for a church community hub: public site, member portal, and role‑based operational dashboards (media, marketing, registration, admin, pastors, founder). Built with TypeScript, React Router, TanStack Query, Tailwind, and Supabase.

Features

- Public site
  - Hero, latest sermon, announcements, upcoming events, testimonials, connect, giving
  - Pages: About, Watch, Events (+ registration), Give, Shop, Visit Us, Ministries, Partners, Newsletter, FAQ, Notice of Filming, Baptism, Baby Dedication, Prophetic School, Counseling & Mental Health
- Authentication & profiles
  - Supabase email/password and Google OAuth
  - Persistent sessions, profile completion flow
- Member dashboard
  - Overview, Give, Profile, Newsletter
  - Role‑aware tabs and redirects
- Role‑based operational dashboards
  - Media, Marketing, Registration, Admin, Pastors, Founder
  - Inventory, ministries, serve management, applications, reports, analytics, user management, IT sections
- Forms & workflows
  - Event registration, Join the Family, Serve with Us, Requisitions
- AI Assistant (optional)
  - Floating assistant component with pluggable backend endpoint
- Performance
  - Route‑level and component‑level lazy loading, React.Suspense with skeletons, sensible query caching

Tech stack

- App: React 18, TypeScript, Vite 5 (SWC)
- Routing: React Router v6
- Data: TanStack Query (staleTime/gcTime tuned, retries)
- UI: Tailwind CSS, shadcn/ui (Radix), Lucide icons, tailwindcss-animate
- Forms & Validation: React Hook Form, Zod, @hookform/resolvers
- Charts: Recharts
- Auth/Backend: Supabase JS v2 (auth, tables, RLS)
- Utilities: date-fns, clsx/cva, embla carousel, sonner/toaster for notifications
- Tooling: ESLint 9, TypeScript 5

Project structure (key paths)

```
src/
  main.tsx               # App bootstrap
  App.tsx                # Providers, router, routes
  components/            # UI and feature components
    auth/                # AuthProvider, guards
    dashboard/           # Member dashboard widgets
    admin/               # Admin/founder/media/etc modules
    ui/                  # shadcn/ui primitives
  pages/                 # Route components (Index, Auth, Dashboard, ...)
  hooks/                 # Custom hooks (toast, debounce, mobile, checks)
  integrations/supabase/ # Supabase client + types
  lib/utils.ts           # Utilities (cn, etc.)
```

Routing

- Defined in `src/App.tsx` using `BrowserRouter`, `Routes`, `Route`
- All major pages are lazy‑loaded; unknown routes fall back to `NotFound`
- Role‑based redirects in `pages/Dashboard.tsx` send users to the correct dashboard

Authentication

- `src/components/auth/AuthProvider.tsx` manages Supabase session, user, and role
- Roles stored in `user_roles` table; provider prioritizes founder → senior_pastor → admin → it → media → marketing → registration → accounts → sunday_school → teacher → pastor → user
- Keeps session in localStorage, auto‑refreshes tokens, subscribes to role changes

Supabase configuration

- Client is created in `src/integrations/supabase/client.ts`
- For production, prefer using environment variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and import them in the client; ensure RLS is enabled server‑side

UI/UX patterns

- shadcn/ui components with Tailwind
- Skeleton loaders shown via Suspense fallbacks for large sections
- Toasts provided via `Toaster` and `Sonner`

Getting started

1. Prerequisites
   - Node.js 18+ (recommended) and npm or bun
2. Install
   - npm: `npm install`
   - bun: `bun install`
3. Configure (optional but recommended)
   - Create `.env` with:
     - `VITE_SUPABASE_URL=...`
     - `VITE_SUPABASE_ANON_KEY=...`
   - Update `src/integrations/supabase/client.ts` to read from `import.meta.env`
4. Develop
   - `npm run dev` → http://localhost:8080
5. Build & preview
   - `npm run build`
   - `npm run preview`

Scripts

- `dev`: start Vite dev server (port 8080)
- `build`: production build
- `build:dev`: development‑mode build
- `preview`: preview built app
- `lint`: run ESLint

Deployment

- Static hosting compatible (Vite build output)
- `public/_redirects` provided (Netlify‑style SPA redirect) – ensure a catch‑all to `index.html` for client routing

Notable components

- `AIAssistant` (`src/components/AIAssistant.tsx`) – accepts `welcomeMessage`, optional `apiEndpoint` or `onSendMessage` callback
- `AuthProvider` – wraps app, exposes auth methods and role state
- `Dashboard` – renders role‑aware tabs and handles redirects

Contributing

- Follow existing code style, prefer descriptive names and small components
- Keep comments focused on non‑obvious rationale; avoid catching errors without handling

License

- Private project. All rights reserved.
