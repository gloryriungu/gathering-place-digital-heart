

# Security Fixes & Multi-Department User Management Plan

## Summary

There are **4 security findings** to fix (code-side) plus **SQL you'll run manually** in the Supabase SQL Editor. I'll also handle multi-department user display in admin.

---

## Part 1: SQL You Run Manually

Go to your **Supabase SQL Editor** and run this SQL. I will provide the exact script during implementation:

1. **Fix cookie_consents RLS tautology** - Drop the broken SELECT policy (`session_id = session_id` always TRUE) and replace with a proper owner-scoped policy
2. **Add INSERT/UPDATE/DELETE restrictions on pastor_roles** - Restrict to admin/IT roles only to prevent privilege escalation
3. **Enable leaked password protection** - This is a Supabase dashboard setting under Authentication > Settings

---

## Part 2: Code Changes I'll Make

### A. CORS Hardening on Edge Functions (10 functions)

Replace wildcard `'*'` CORS origin with a dynamic allowlist helper across all edge functions:
- `initialize-payment`, `initialize-shop-payment`, `verify-payment`, `verify-shop-payment`, `deliver-digital-product`, `send-campaign`, `send-email`, `send-session-reminders`, `handle-bounce`, `process-recurring-payments`

For `webhook-paystack`: remove CORS headers entirely (server-to-server).

### B. Server-Side Role Validation in Admin Edge Functions

Add JWT-based role checking to `send-campaign` and other admin-only edge functions so they can't be called by non-admin users even if they bypass the UI.

### C. Multi-Department User Display in Admin

Review and ensure the admin user management interface properly shows users with multiple department/role assignments as badges, with the ability to manage them via multi-select.

---

## Part 3: Security Findings I'll Mark

After fixes are applied, I'll update the security scan findings to reflect resolved issues.

---

## Steps

| # | Action | Who |
|---|--------|-----|
| 1 | I provide the SQL script for RLS fixes | You run in SQL Editor |
| 2 | Fix CORS in all 10 edge functions | I code |
| 3 | Remove CORS from webhook-paystack | I code |
| 4 | Add server-side role checks to admin edge functions | I code |
| 5 | Verify multi-department admin UI | I code (if needed) |
| 6 | Enable leaked password protection | You toggle in Supabase Auth settings |
| 7 | Mark security findings as fixed | I update scan results |

