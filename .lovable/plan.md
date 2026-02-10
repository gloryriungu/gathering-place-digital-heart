

# Footer Content Management for Marketing

## Overview

Allow Marketing team to edit footer content (church description, contact info, service times, and bottom bar links) through the Marketing Dashboard, using the existing `page_content` CMS table.

## What Changes

### 1. New Component: Footer Manager
**File: `src/components/marketing/FooterManager.tsx`**

A form-based editor with editable fields for all footer sections:
- **Church Info**: Church name, tagline/description
- **Contact Info**: Phone number, email address, location text
- **Service Times**: Editable list of service days/times (add/remove entries)
- **Bottom Bar**: Copyright text, Privacy Policy URL, Terms of Service URL, Contact Us URL

Data is stored in the `page_content` table with `page_name = 'footer'` and individual `section_name` keys (e.g., `footer_church_name`, `footer_phone`, `footer_service_times` as JSON, etc.).

### 2. Update Footer Component
**File: `src/components/Footer.tsx`**

Modify to fetch content from `page_content` table (page_name = 'footer') on mount, with current hardcoded values as fallback defaults. Service times will be parsed from a JSON string stored in the database.

### 3. Add to Marketing Dashboard
**File: `src/pages/MarketingDashboard.tsx`**

- Add a "Footer" menu item with an icon in the sidebar
- Add a card on the overview page
- Add a `TabsContent` rendering the new `FooterManager`

### 4. Seed Default Footer Content (Migration)

Insert default values into `page_content` matching current hardcoded content so existing footer appearance is preserved immediately.

## Technical Details

### Database Records (page_content table)

No schema changes needed -- reuses the existing `page_content` table. New rows inserted:

| page_name | section_name | content | content_type |
|-----------|-------------|---------|-------------|
| footer | church_name | TOT INTERNATIONAL | text |
| footer | church_description | Raising champions for Christ... | text |
| footer | phone | +254 700 000 000 | text |
| footer | email | info@tot.co.ke | text |
| footer | location | Nairobi, Kenya\nEast Africa | text |
| footer | service_times | (JSON array of day/times) | json |
| footer | privacy_policy_url | # | text |
| footer | terms_url | # | text |
| footer | contact_url | # | text |
| footer | copyright_text | 2025 TOT International... | text |

### Files to Create
- `src/components/marketing/FooterManager.tsx`

### Files to Modify
- `src/components/Footer.tsx` (fetch from DB, use fallback defaults)
- `src/pages/MarketingDashboard.tsx` (add menu item and tab)

### Migration
- Seed default footer content into `page_content` table

The copyright attribution line ("Created by nafarrosolutions.com") will remain hardcoded and non-editable per project requirements.

