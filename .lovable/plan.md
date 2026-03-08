

## Plan: Add Interactive Period Selectors to GivingAnalysis Stats & Restrict Access

### Two Changes

**1. Replace static stats cards with interactive period selectors**

In `src/components/accounts/GivingAnalysis.tsx`:

- Add state for user-selected periods: `statsYear` (default current year), `statsWeekDate` (date to calculate the week from), `statsMonthDate` (month+year).
- Replace the hardcoded "This Week" / "This Month" / Q1-Q4 / Half / Year stats with interactive cards that let the user pick:
  - **Weekly**: date picker → shows total for that week
  - **Monthly**: month + year selectors → shows total for that month
  - **Quarterly**: Q1-Q4 + year selectors → shows totals per quarter
  - **Semi-Annual**: H1/H2 + year → shows half-year total
  - **Annual**: year selector → shows full year total
- Update `calculateStats` to use the selected year/periods instead of always `new Date().getFullYear()`.
- Year selector range: 2020 to current year.
- Layout: Keep the 5-card top row but add small selectors (dropdowns/inputs) inside each card. Remove the separate "Quarterly Breakdown" section below and merge Q1-Q4 into the selectable stats.

**2. Restrict the "Giving Analysis" tab to accounts role only**

In `src/pages/Dashboard.tsx`:
- The tab trigger for "giving-analysis" should only render for users with `accounts`, `it`, or `founder` roles (matching the existing RLS on contributions).
- Check how existing tabs are gated (likely by `userRole`) and apply the same pattern.

### File Changes

- `src/components/accounts/GivingAnalysis.tsx` — Add year/period state, update `calculateStats` to be dynamic, replace static cards with interactive selector cards, remove redundant quarterly breakdown section.
- `src/pages/Dashboard.tsx` — Conditionally render the "giving-analysis" tab trigger based on role (accounts/it/founder only).

