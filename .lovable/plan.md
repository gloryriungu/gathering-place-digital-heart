
# Fix: Horizontal Scrollbar Overlapping Category Tabs on Shop Page

## Problem
The horizontal scrollbar in the Shop page's category filter section is visually overlapping and obstructing the category buttons (All Products, Books & Devotionals, Apparel, etc.).

## Solution
Hide the horizontal scrollbar on the Shop page's category ScrollArea since the user can already scroll by dragging/swiping the category buttons. The scrollbar is unnecessary here and causes visual obstruction.

## Technical Details

**File: `src/pages/Shop.tsx`**
- Add a `className` to the `ScrollBar` component to hide it visually, or replace `ScrollArea`/`ScrollBar` with a simple horizontally scrollable `div` using `overflow-x-auto` and hiding the scrollbar with Tailwind's `scrollbar-hide` utility (or CSS `scrollbar-width: none`).
- The simplest approach: add `className="hidden"` to the `<ScrollBar orientation="horizontal" />` element so the grey scrollbar line disappears entirely, while keeping the scroll functionality intact via touch/drag.

This is a one-line change in `src/pages/Shop.tsx` at line 422.
