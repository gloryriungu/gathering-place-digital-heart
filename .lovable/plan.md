

# Cookie Consent System Implementation Plan

## Overview

This plan implements a professional cookie consent popup for website visitors along with an admin management interface for IT and Marketing roles to view consent analytics and customize the cookie policy.

## Components to Create

### 1. Database Schema

**New Table: `cookie_consents`**
- `id` (uuid, primary key)
- `user_id` (uuid, nullable - for authenticated users)
- `session_id` (text - for anonymous visitors)
- `ip_address` (text, nullable)
- `user_agent` (text, nullable)
- `consent_given` (boolean)
- `consent_type` (enum: 'all' | 'essential' | 'rejected')
- `analytics_consent` (boolean)
- `marketing_consent` (boolean)
- `functional_consent` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**New Table: `cookie_settings`**
- `id` (uuid, primary key)
- `policy_text` (text - the cookie policy content)
- `popup_title` (text)
- `popup_description` (text)
- `show_detailed_options` (boolean - whether to show granular cookie options)
- `button_accept_text` (text)
- `button_reject_text` (text)
- `button_customize_text` (text)
- `is_active` (boolean)
- `updated_by` (uuid)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Cookie Consent Banner Component

**File: `src/components/CookieConsent.tsx`**

A professional, accessible popup that:
- Displays at the bottom of the screen for first-time visitors
- Checks localStorage for existing consent
- Offers three options: Accept All, Reject All, Customize
- Customize expands to show granular options:
  - Essential cookies (always on, cannot disable)
  - Analytics cookies (optional)
  - Marketing cookies (optional)
  - Functional cookies (optional)
- Saves consent to database for logged-in users
- Saves consent to localStorage for anonymous visitors
- Stores session_id for anonymous tracking in database
- Smooth animations using existing animation utilities
- Responsive design that works on mobile and desktop
- Follows existing dark/light theme

### 3. Cookie Consent Manager Component (Admin)

**File: `src/components/admin/CookieConsentManager.tsx`**

Management interface for IT and Marketing roles with:

**Analytics Tab:**
- Total consents given (all time)
- Consent breakdown by type (Accept All, Essential Only, Rejected)
- Consent rate (percentage who accepted)
- Trend chart showing consents over time
- Breakdown by cookie category (Analytics, Marketing, Functional)

**Consent Records Tab:**
- Searchable, paginated table of all consent records
- Columns: Date, User (if logged in) or Session ID, Consent Type, Details
- Filter by date range, consent type
- Export to CSV functionality

**Settings Tab:**
- Edit popup title and description
- Customize button text
- Toggle whether to show detailed options
- Edit cookie policy text (rich text)
- Preview functionality
- Save changes with audit trail

### 4. Integration Points

**App.tsx:**
- Add `CookieConsent` component at the root level, rendering after AuthProvider
- Component self-manages visibility based on localStorage/database state

**Dashboard.tsx:**
- Add "Cookie Consent" tab for IT role under their existing menu items
- Add "Cookie Consent" tab for Marketing role (or add to Marketing Dashboard)

**MarketingDashboard.tsx:**
- Add "Cookie Consent" menu item and tab content
- Use the shared CookieConsentManager component

## Technical Details

### Cookie Consent Banner Logic

```text
On mount:
1. Check localStorage for 'cookie_consent' key
2. If found and valid, do not show banner
3. If not found:
   - Fetch cookie_settings from database to get custom text
   - Show banner with appropriate options
   
On consent:
1. Save to localStorage (for immediate effect)
2. If user is authenticated, save to cookie_consents table
3. If anonymous, generate session_id and save to database
4. Log analytics event
5. Close banner with animation
```

### Data Flow for Consent Records

```text
User visits site
       |
       v
Cookie banner appears (if no prior consent)
       |
       v
User makes selection
       |
       v
+------------------+------------------+
|                  |                  |
v                  v                  v
Accept All     Essential Only    Customize
       |              |               |
       +-------+------+---------------+
               |
               v
Save to localStorage + database
               |
               v
IT/Marketing can view in dashboard
```

### RLS Policies

**cookie_consents table:**
- SELECT: Allow IT, Marketing, Admin, Founder roles (using has_role function)
- INSERT: Allow public (for anonymous users) and authenticated
- UPDATE: Allow users to update their own consent

**cookie_settings table:**
- SELECT: Allow public (for displaying the banner)
- INSERT/UPDATE/DELETE: Allow IT, Marketing, Admin roles only

## Files to Create

1. `src/components/CookieConsent.tsx` - The visitor-facing consent banner
2. `src/components/admin/CookieConsentManager.tsx` - Admin management interface
3. Database migration for tables and RLS policies

## Files to Modify

1. `src/App.tsx` - Add CookieConsent component
2. `src/pages/Dashboard.tsx` - Add Cookie Consent tab for IT role
3. `src/pages/MarketingDashboard.tsx` - Add Cookie Consent tab and menu item
4. `src/integrations/supabase/types.ts` - Will be auto-updated after migration

## User Experience

### For Visitors
1. First visit: See professional cookie consent popup at bottom of page
2. Choose to Accept All, Reject All, or Customize preferences
3. If Customize: See detailed breakdown of cookie types with toggles
4. After selection: Banner closes smoothly, preference is remembered
5. Return visits: No banner shown (preference stored)

### For IT/Marketing Staff
1. Navigate to Dashboard or Marketing Dashboard
2. Click "Cookie Consent" in the sidebar menu
3. View analytics: consent rates, trends, breakdowns
4. View individual consent records with search/filter
5. Edit cookie banner text and settings
6. Preview changes before saving
7. Export data for reporting

---

## Technical Notes

### Session ID Generation
For anonymous users, generate a UUID-based session ID stored in localStorage. This allows tracking consent even without authentication while respecting privacy.

### Performance Considerations
- Cookie settings will be cached in localStorage after first fetch
- Banner only fetches settings when it needs to display
- Admin analytics queries will use appropriate indexes

### Accessibility
- Banner will include proper ARIA labels
- Keyboard navigation support
- Focus management when banner appears
- Color contrast following WCAG guidelines

