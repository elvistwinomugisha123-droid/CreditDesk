# PRD: CreditDesk — Personal Debt & Credit Tracker

## 1. Problem Statement

Across Uganda and much of Africa, informal lending is a daily reality. Shopkeepers sell goods on credit, friends lend each other money, service providers work before being paid. All of this is tracked in exercise books, WhatsApp messages, phone notes, or just memory.

This leads to:
- Forgotten debts and lost money
- Disputes over amounts and dates
- No visibility into who owes you vs. who you owe
- No interest tracking on informal loans
- Lost revenue for small businesses extending credit

**CreditDesk replaces the notebook** with a structured, mobile-first digital ledger.

## 2. Product Vision

A simple, fast, mobile-first PWA where anyone can record debts and credits, log payments, calculate interest, and see their net financial position in seconds. Built for low-bandwidth, mobile-first users in East Africa.

## 3. Target Users

### Primary: Everyday Ugandans (Personal Mode)
- People who lend money to friends/family and want to track it
- People who borrow and want to stay accountable
- Age 18-45, smartphone users, mostly Android
- Comfortable with mobile money but not necessarily "tech-savvy"

### Secondary (Future): Small business owners
- Shopkeepers, pharmacies, salons, mechanics who sell on credit
- Need per-customer credit tracking and running balances
- **Not in MVP scope** — will be added as "Business Mode" in Phase 2

## 4. MVP Feature Set

### 4.1 Authentication
- Email + password signup/login via Supabase Auth
- Auto-create user profile on signup (DB trigger)
- Session persistence (stay logged in)
- Protected dashboard routes

### 4.2 Dashboard (Home)
- **Net Position Card**: Large green gradient card showing net position (receivables - payables). Label: "You are a net creditor" or "You owe more than you're owed."
- **Stat Grid** (2×2):
  - Total owed to you (green, TrendingUp icon)
  - Total you owe (red, TrendingDown icon)
  - Overdue count (amber, AlertTriangle icon)
  - Settled count (gray, CheckCircle icon)
- **Recent Activity**: Last 5 ledger entries with contact name, amount, type, date
- **FAB** (Floating Action Button): Green "+" button bottom-right to quickly add a new entry

### 4.3 Receivables Page (Money Owed TO You)
- Summary banner: total outstanding receivables, count of active records
- List of all RECEIVABLE ledger entries, newest first
- Each entry shows: contact avatar initial, contact name, description, date, outstanding amount (green), status badge, payment progress bar (if partially paid)

### 4.4 Payables Page (Money YOU Owe)
- Same layout as receivables but with red accent colors
- Summary banner: total outstanding payables

### 4.5 Contacts Page
- Alphabetical list of all contacts
- Each contact shows: avatar initial, name, phone number, count of active entries
- Tapping a contact shows their detail (future: all entries with that person)

### 4.6 New Entry Flow
- Select or create a contact (name + phone number)
- Choose type: "They owe me" (RECEIVABLE) or "I owe them" (PAYABLE)
- Enter amount (numeric keypad, UGX)
- Optional: description/reason (free text, max 300 chars)
- Optional: interest rate (%) + type (Flat or Monthly)
- Optional: due date
- Submit → creates ledger entry + contact (if new)

### 4.7 Entry Detail Page (`/entry/[id]`)
- Full entry info: contact, type, principal, interest details, due date, status
- Calculated fields: interest accrued, total owed, total paid, outstanding balance
- **Payment History**: chronological list of all payments logged against this entry
- **Add Payment Form**: amount + optional note + date (defaults to today)
- **Actions**: Mark as settled, Cancel entry
- When outstanding reaches 0 after a payment, prompt to mark as settled

### 4.8 Interest Calculation
- **Flat**: One-time percentage of principal. `interest = principal × rate / 100`
- **Monthly**: Simple interest per month elapsed. `interest = principal × rate × months_since_creation / 100`
- Interest is always calculated on-the-fly, never stored
- Outstanding = principal + interest - sum(payments)

### 4.9 PWA Capabilities
- Installable on Android/iOS home screen
- App shell caches offline (loads without network)
- Standalone display mode (no browser chrome)
- Theme color: #2EA92E (brand green)

## 5. User Flows

### Flow 1: First-time user
1. Lands on `/` → sees hero page with "Get Started" CTA
2. Taps "Get Started" → `/signup`
3. Fills name, email, password → account created
4. Redirected to `/dashboard` → empty state with prompts to add first entry
5. Taps FAB (+) → new entry form
6. Fills in contact name, phone, amount, type → entry created
7. Sees entry on dashboard + receivables/payables page

### Flow 2: Logging a payment
1. User on `/receivables` → taps an entry card
2. Opens `/entry/[id]` → sees full details
3. Scrolls to "Add Payment" → enters amount
4. Submits → payment logged, progress bar updates, outstanding recalculates
5. If outstanding = 0, toast suggests marking as settled

### Flow 3: Checking position
1. User opens app → `/dashboard` loads
2. Sees net position, totals, overdue count at a glance
3. Taps "Owed to me" in bottom nav → full receivables list
4. Can filter mentally by scanning status badges (Active, Overdue, Settled)

## 6. Data Model

```
┌──────────┐       ┌────────────┐       ┌────────────────┐       ┌───────────┐
│  users   │──1:N──│  contacts  │──1:N──│ ledger_entries  │──1:N──│ payments  │
└──────────┘       └────────────┘       └────────────────┘       └───────────┘
```

- A user has many contacts
- A contact has many ledger entries
- A ledger entry has many payments
- All tables scoped to user_id via RLS

See CLAUDE.md for full schema details.

## 7. Security Requirements

- Row Level Security on ALL tables — users can only read/write their own data
- Supabase Auth handles password hashing, session tokens, email verification
- No sensitive data in client-side storage (no localStorage for financial data)
- All mutations via Server Actions (server-side only)
- Input validation with Zod on both client and server
- CSRF protection via Next.js built-in mechanisms

## 8. Performance Requirements

- First Contentful Paint < 2s on 3G
- App shell loads offline after first visit
- Dashboard data fetched server-side (no loading spinners for initial render)
- Prisma queries use appropriate indexes (user_id, status, type)

## 9. Non-Functional Requirements

- Mobile-first responsive design (375px minimum)
- Accessible: proper labels, focus states, semantic HTML
- UGX currency formatting with no decimal places
- Dates formatted as "MMM d, yyyy" (e.g., "Mar 22, 2026")

## 10. Success Metrics

- User creates first entry within 2 minutes of signup
- 50% of users return within 7 days
- Average 3+ entries per active user per month

## 11. Future Roadmap (NOT in MVP)

| Phase | Feature | Why |
|-------|---------|-----|
| 2 | SMS/WhatsApp payment reminders | #1 retention driver — social pressure drives repayment |
| 2 | Business Mode (customer credit profiles, credit limits) | Unlocks SME market and higher-tier pricing |
| 2 | Export to PDF/Excel | Record-keeping for tax/legal |
| 2 | Shared records (both parties confirm debt) | Reduces disputes |
| 3 | Mobile Money auto-logging (MTN MoMo, Airtel Money APIs) | Removes manual payment entry friction |
| 3 | Credit scoring (internal repayment score) | The real moat — data no bank has |
| 3 | Marketplace lending signals | Monetization via partnerships with MFIs |

## 12. Business Model

| Tier | Price | Features |
|------|-------|----------|
| Free | UGX 0 | Up to 10 active debt records, basic dashboard |
| Personal Pro | ~UGX 5,000–10,000/mo | Unlimited records, reminders, interest calc, export |
| Business | ~UGX 20,000–50,000/mo | Everything + customer credit profiles, multi-user, reports |

MVP launches as fully free with no paywall. Monetization gating added in Phase 2.

## 13. Design Reference

See the uploaded inspiration image (`64647.jpg`). Key design decisions:
- Green-dominant fintech aesthetic
- Card-based UI with generous rounded corners
- Bottom tab navigation (4 tabs)
- Gradient summary cards
- Clean typography (DM Sans)
- Minimal, uncluttered mobile layout
- White/light gray backgrounds with colored accents
