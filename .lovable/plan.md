

## Plan: Add Date/Year Selectors to Preset Reports

### What
Replace the current one-click preset report buttons with interactive selectors so users can specify:
- **Daily**: pick a specific date
- **Weekly**: pick a start date (report covers 7 days from that date)
- **Monthly**: pick a month and year
- **Quarterly**: pick a quarter (Q1–Q4) and year
- **Semi-Annual**: pick a half (H1/H2) and year
- **Annual**: pick a year

### Changes to `src/components/dashboard/FinancialContributions.tsx`

1. **New state variables**:
   - `presetDaily: string` (date, default today)
   - `presetWeeklyStart: string` (date, default today)
   - `presetMonth: string` (1–12, default current)
   - `presetMonthYear: string` (year, default current)
   - `presetQuarter: string` (Q1–Q4, default current)
   - `presetQuarterYear: string`
   - `presetHalf: string` (H1/H2, default current)
   - `presetHalfYear: string`
   - `presetAnnualYear: string`

2. **Update `generatePresetReport`** to accept the user-selected values instead of always using `new Date()`.

3. **Replace the button grid** (lines 842–856) with 6 cards/sections, each containing:
   - **Daily**: Date input + Generate button
   - **Weekly**: Date input (start of week) + Generate button
   - **Monthly**: Month select + Year select + Generate button
   - **Quarterly**: Quarter select (Q1–Q4) + Year select + Generate button
   - **Semi-Annual**: Half select (H1/H2) + Year select + Generate button
   - **Annual**: Year select + Generate button

   Each card keeps the icon and label, with compact inline selectors.

4. **Year options**: Generate a range from 2020 to current year for all year selectors using `<Select>`.

### UI Layout
Each preset report becomes a small card with its icon, label, selector controls, and a "Generate" button — arranged in a 2- or 3-column grid, keeping the layout compact.

