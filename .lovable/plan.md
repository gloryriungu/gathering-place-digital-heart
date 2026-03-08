

## Plan: Remove Breakdown by Contribution Type from Day Report PDF

### Change
Remove the "Breakdown by Contribution Type" section (lines 430-452) from the `generateDayReportPDF` function in `src/components/dashboard/FinancialContributions.tsx`. The Transaction Details table will move up to start directly after the summary boxes, eliminating the redundant breakdown.

### File: `src/components/dashboard/FinancialContributions.tsx`
- Delete lines 430-452 (the breakdown section including the heading, loop, and type subtotal rows)
- Set `y` for the Transaction Details heading to start right after the summary boxes (around y = 82 instead of the dynamic `y` from the breakdown)

