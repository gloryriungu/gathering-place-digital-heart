

## Plan: Standalone Day Report

### What
Add a dedicated "Day Report" feature with a date picker that generates a comprehensive PDF for a specific day, including all contributions, breakdown by type, and a grand total.

### Changes to `src/components/dashboard/FinancialContributions.tsx`

1. **Add a `dayReportDate` state** defaulting to today's date.

2. **Add a new "Day Report" card** in the Reports tab (above or alongside the Custom Filtered Report card) with:
   - A date picker to select the specific day
   - A preview showing: number of records found, grand total for that day
   - A "Generate Day Report" button

3. **Create a `generateDayReport` function** that:
   - Filters `completed` contributions to the selected date
   - Calls a dedicated PDF generator (`generateDayReportPDF`) that produces a more detailed, standalone report

4. **The Day Report PDF will include**:
   - Header with logo, "DAILY CONTRIBUTIONS REPORT", and the selected date (formatted nicely, e.g. "Saturday, 8 March 2026")
   - **Summary box**: Grand Total (KES), Total Transactions count
   - **Breakdown by contribution type**: Each type with its subtotal and transaction count
   - **Full transactions table**: Date, Donor/Recorded By, Type, Service/Notes, M-Pesa Code, Banked By, Amount (KES)
   - **Grand Total row** at the bottom of the table (bold)
   - Standard branded footer with watermark

### UI Placement
The Day Report card will be the first card in the Reports tab, making it prominent and easy to access. It will have a distinct visual treatment (e.g., a highlighted border) to stand out as the primary daily workflow tool.

