

## Plan: Separate Cash Contributions from Online Giving

### Problem
The "Record Giving" tab in the account portal records **cash money counted separately** (manual/physical contributions), but currently mixes it with Paystack online payments in the same history, stats, and reports. The user needs these tracked independently. Additionally, service name should be optional and a "Banked By" field is needed.

### Database Change
Add a `banked_by` column to the `contributions` table to track who deposited the cash:

```sql
ALTER TABLE public.contributions ADD COLUMN banked_by text;
```

### Code Changes

**File: `src/components/dashboard/FinancialContributions.tsx`**

1. **Add "Banked By" field** to the contribution form state and UI (text input for the person's name who banked the cash).

2. **Make Service Name optional** — remove the validation requiring it. Update placeholder to say "Optional - e.g. Sunday Service".

3. **Filter data to cash-only contributions** — all stats, history, and reports in this component will only show contributions where `payment_method` is `'manual'` or `'cash'` (excluding Paystack entries which have `payment_method` = `'mpesa'`, `'card'`, etc. or have a `paystack_reference`).
   - `loadContributions` query: add `.in('payment_method', ['manual', 'cash'])` or `.is('paystack_reference', null)` filter
   - Stats cards, summary, history, and PDF reports will automatically reflect only cash data

4. **Store `banked_by`** in the insert call when adding a contribution. Display it in history items and include it in PDF reports as a column.

5. **Update PDF table headers** to include "Banked By" column.

6. **Update heading/descriptions** to clarify this section is for "Cash Contributions" (e.g., "Cash Giving Records", "Track and manage physical cash contributions").

**File: `src/components/accounts/GivingAnalysis.tsx`** (Accounts portal)

Apply the same separation:
- The analytics/stats queries should distinguish between cash (manual) and online (Paystack) contributions
- Add a "Banked By" field to the "Record Contribution" dialog
- Make service/notes optional
- Consider adding a tab or toggle to view "Cash" vs "Online" vs "All" contributions

### Summary of Fields in "Add Contribution" Form (after changes)

| Field | Required | Notes |
|---|---|---|
| Contribution Type | Yes | Dropdown |
| Amount (KES) | Yes | Number |
| Service Name | No | Now optional |
| Date | Yes | Date picker |
| M-Pesa Code | No | Optional |
| Banked By | No | Name of person who banked the cash |

