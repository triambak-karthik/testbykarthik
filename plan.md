# EMI Calculator Plan

Status: calculator built, **all 11 test cases passed**. Do not publish a public HTML page until you say yes.

## Goal

A simple website where a user can calculate EMI for a loan and see:

- monthly EMI
- total interest
- total amount payable
- a principal vs interest chart
- a month-by-month amortization table

## Approach chosen

Option A: vanilla HTML, CSS, and JavaScript in `frontend/`. No backend.

## Dependencies

Approved:

- Chart.js 4.4.9 from CDN, only for the doughnut chart

Not used:

- React, Vite, npm packages, Node server, database

## Files

| File | Role |
| --- | --- |
| `frontend/index.html` | Page layout and form |
| `frontend/style.css` | Styling |
| `frontend/emi.js` | EMI math, validation, schedule, chart data |
| `frontend/script.js` | Form submit, results, Chart.js rendering |
| `frontend/emi.test.js` | Test scenarios |
| `frontend/run-tests.sh` | Runs the tests on macOS |
| `backend/` | Unused for now |
| `plan.md` | This plan |

## How the calculator works

EMI formula:

`EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)`

- `P` = loan amount
- `r` = annual interest rate / 12 / 100
- `n` = years * 12 + extra months

If interest is 0%, EMI is `P / n`.

The last schedule row adjusts so the remaining balance is 0.

## How to open locally

From the project root:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/frontend/`

You can also open `frontend/index.html` directly in a browser.

## Test instructions

Run this from the project root:

```sh
sh frontend/run-tests.sh
```

That concatenates `emi.js` and `emi.test.js` and runs them with macOS JavaScriptCore. No Node.js install is required.

Expected result: **11 passed, 0 failed**.

Do not publish the page if any test fails. Fix the math in `frontend/emi.js`, re-run the tests, and only continue when all cases pass.

## Test scenarios

| ID | Scenario | Expected result | Status |
| --- | --- | --- | --- |
| TC01 | Standard reducing-balance EMI | Matches the closed-form EMI formula | PASS |
| TC02 | Default demo loan: ₹5,00,000, 8.5%, 5 years | EMI about ₹10,258; total payable about ₹6,15,496 | PASS |
| TC03 | Zero interest: ₹1,20,000 over 12 months | EMI = ₹10,000; interest = ₹0 | PASS |
| TC04 | Tenure of 1 year + 6 extra months | 18 monthly payments | PASS |
| TC05 | Full amortization for the demo loan | 60 rows; last balance is ₹0 | PASS |
| TC06 | Principal recovered over the schedule | Sum of principal paid equals the loan amount | PASS |
| TC07 | Interest totals | Sum of interest rows equals total interest | PASS |
| TC08 | Chart data | Principal + interest = total payable | PASS |
| TC09 | One-month loan at 12% | EMI = principal + one month of interest; balance 0 | PASS |
| TC10 | Invalid inputs: 0/- principal, negative rate, 0 tenure, extra months 12 or -1 | Validation fails | PASS |
| TC11 | Valid short loan: 0 years and 1 extra month | Validation passes; tenure = 1 month | PASS |

Latest run:

```
PASS  TC01
PASS  TC02
PASS  TC03
PASS  TC04
PASS  TC05
PASS  TC06
PASS  TC07
PASS  TC08
PASS  TC09
PASS  TC10
PASS  TC11
11 passed, 0 failed, 11 total
```

## Gate before a public HTML page

Tests have passed. The next step is optional publishing, for example:

- GitHub Pages
- Netlify Drop
- Any static host that serves `frontend/index.html`

Do **not** publish until the user explicitly says to proceed with a public HTML page.

## After publishing (only if approved)

1. Put the public site files from `frontend/` on the host.
2. Confirm Chart.js still loads from the CDN.
3. Re-run `sh frontend/run-tests.sh`.
4. Open the public URL and calculate the demo loan once.
