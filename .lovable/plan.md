

## Plan: Kindle-like In-App Ebook Reader

### What Changes

Transform the current download-only digital book system into an in-browser reading experience. Users who purchase ebooks can read them directly in the app, with reading progress saved automatically.

### Overview

1. **Add a PDF reader component** using `react-pdf` (renders PDFs page-by-page in-browser)
2. **Create a `reading_progress` database table** to persist page position per user per book
3. **Add a `read_file` action to the edge function** that streams file content for in-browser viewing (without counting against download limits)
4. **Update MyDownloads** to show a "Read" button alongside "Download", and render the reader inline
5. **Rename the tab** from "My Downloads" to "My Library" for a Kindle-like feel

### Database Changes

**New table: `reading_progress`**
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users, not null)
- `product_id` (uuid, references media_content, not null)
- `current_page` (integer, default 1)
- `total_pages` (integer, nullable)
- `last_read_at` (timestamptz, default now())
- `created_at` / `updated_at`
- Unique constraint on (user_id, product_id)
- RLS: users can only read/write their own rows

### New Components

**`src/components/reader/EbookReader.tsx`**
- Full-screen overlay PDF reader using `react-pdf`
- Top bar: book title, close button, page indicator (e.g. "Page 12 of 145")
- Navigation: previous/next page buttons, page number input for jumping
- Auto-saves reading progress every page turn (debounced)
- Resumes from last-read page on reopen
- Responsive: works on desktop and mobile

### Edge Function Update

**`deliver-digital-product/index.ts`** -- new action `read_file`:
- Similar to `download_file` but does NOT increment download count
- Returns file with `Content-Type: application/pdf` (inline, not attachment)
- Validates access token, checks expiry (but not download limit since reading is unlimited)

### MyDownloads Updates

- Add "Read" button next to "Download" for each purchased book
- Clicking "Read" opens the EbookReader overlay
- Show reading progress bar on each book card (e.g. "62% complete")
- Show "Continue Reading" badge on books with saved progress

### Technical Details

- **Library**: `react-pdf` (wraps PDF.js, well-maintained, React-native rendering)
- **Progress persistence**: Upsert to `reading_progress` on each page turn, debounced 2 seconds
- **File streaming**: The edge function streams the PDF blob; the reader creates an object URL for `react-pdf`'s `Document` component
- **No format conversion needed**: Current system already stores PDFs; `react-pdf` handles them natively
- **Access model**: Reading is unlimited (no download count decrement); downloading still has the 5-download/30-day limit

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/reader/EbookReader.tsx` | Create - PDF reader component |
| `src/components/dashboard/MyDownloads.tsx` | Modify - add Read button, progress display, rename to Library |
| `supabase/functions/deliver-digital-product/index.ts` | Modify - add `read_file` action |
| Migration SQL | Create `reading_progress` table with RLS |

