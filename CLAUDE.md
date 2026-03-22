# CLAUDE.md — CreditDesk

## Project Overview

CreditDesk is a mobile-first PWA for tracking personal debts and credits. It replaces paper notebooks and note apps for people who lend/borrow money informally. Users record who owes them, who they owe, log partial payments, and see their net financial position at a glance.

Target market: Uganda / East Africa. Default currency is UGX. Assume mobile-first, low-bandwidth users.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript strict mode, Turbopack)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Vercel (free tier)
- **PWA**: @serwist/next for service worker + install prompt
- **Validation**: Zod
- **Date utils**: date-fns
- **Charts**: Recharts (dashboard analytics)
- **Toasts**: Sonner
- **Icons**: Lucide React

## Architecture Rules

- Use Next.js App Router with server components by default. Only add `"use client"` when the component needs interactivity (forms, click handlers, hooks).
- Use Server Actions (in `lib/actions/`) for all mutations (create, update, delete). No API routes for CRUD.
- Use Prisma for all database queries. Never query Supabase client directly for data — Supabase is only used for auth.
- All financial calculations must be derived, never stored. Outstanding balance = principal + interest - sum(payments). Never store a running balance column.
- All tables must have Row Level Security (RLS) enabled. User can only access their own data. Provide a `supabase/rls-policies.sql` file.
- Create a Supabase auth trigger that auto-creates a row in the `users` table when someone signs up (see PRD for schema).

## Database Schema

Use Prisma. Map table names to snake_case with `@@map`. Use UUID primary keys (`@default(uuid()) @db.Uuid`).

**Tables:**
- `users` — id (matches Supabase auth.users.id), email, phone, full_name, avatar_url, currency (default "UGX"), created_at, updated_at
- `contacts` — id, user_id (FK users), name, phone, email, notes, avatar_url, created_at, updated_at. Unique constraint on (user_id, phone).
- `ledger_entries` — id, user_id (FK users), contact_id (FK contacts), type (enum: RECEIVABLE | PAYABLE), description, principal_amount (Decimal 15,2), currency (default "UGX"), interest_rate (Decimal 5,2 nullable), interest_type (enum: FLAT | MONTHLY, nullable), status (enum: ACTIVE | SETTLED | OVERDUE | CANCELLED, default ACTIVE), due_date (nullable), created_at, updated_at. Indexes on user_id, (user_id, type), (user_id, status).
- `payments` — id, ledger_entry_id (FK ledger_entries), amount (Decimal 15,2), notes, paid_at (default now), created_at. Index on ledger_entry_id.

**Enums:** LedgerType (RECEIVABLE, PAYABLE), InterestType (FLAT, MONTHLY), LedgerStatus (ACTIVE, SETTLED, OVERDUE, CANCELLED).

## Project Structure

```
creditdesk/
├── app/
│   ├── layout.tsx                   # Root layout: fonts, metadata, PWA manifest, Toaster
│   ├── page.tsx                     # Landing/hero page (green gradient, CTA to signup)
│   ├── (auth)/
│   │   ├── layout.tsx               # Centered auth layout with logo
│   │   ├── login/page.tsx           # Email + password login form
│   │   └── signup/page.tsx          # Name + email + password signup form
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Dashboard shell: header + bottom nav + auth guard
│   │   ├── dashboard/page.tsx       # Overview: net position card, stat grid, recent activity
│   │   ├── receivables/page.tsx     # List of money owed TO user
│   │   ├── payables/page.tsx        # List of money USER owes
│   │   ├── contacts/page.tsx        # Contact list with active entry counts
│   │   └── entry/[id]/page.tsx      # Single debt detail: info, payment history, add payment form
│   └── api/auth/callback/route.ts   # Supabase email confirmation callback
├── components/
│   ├── ui/                          # shadcn/ui primitives (button, input, dialog, sheet, etc.)
│   ├── layout/
│   │   ├── bottom-nav.tsx           # Mobile bottom tab navigation (4 tabs: Home, Owed to me, I owe, People)
│   │   └── dashboard-header.tsx     # Sticky header with greeting, user name, logout
│   ├── dashboard/
│   │   ├── ledger-entry-card.tsx    # Card showing contact, amount, status, payment progress bar
│   │   └── recent-activity.tsx      # Recent entries feed for dashboard
│   └── forms/
│       ├── new-entry-form.tsx       # Form to create a new debt/credit record
│       ├── new-contact-form.tsx     # Form to add a new contact
│       └── add-payment-form.tsx     # Form to log a payment against an entry
├── lib/
│   ├── prisma.ts                    # Prisma client singleton
│   ├── utils.ts                     # cn() classname helper
│   ├── calculations.ts             # Interest calculation, balance derivation, dashboard summary, formatCurrency
│   ├── validations.ts              # Zod schemas for all forms (contact, ledger entry, payment, auth)
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client (createBrowserClient)
│   │   ├── server.ts               # Server Supabase client (createServerClient with cookies)
│   │   └── middleware.ts            # Auth session refresh + route protection logic
│   └── actions/
│       ├── contacts.ts             # Server actions: createContact, updateContact, deleteContact
│       ├── entries.ts              # Server actions: createEntry, updateEntry, settleEntry, cancelEntry
│       └── payments.ts            # Server actions: addPayment, deletePayment
├── prisma/
│   └── schema.prisma
├── supabase/
│   └── rls-policies.sql            # RLS policies + auth trigger SQL
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # PWA icons (192x192, 512x512)
├── middleware.ts                    # Next.js middleware entry → calls updateSession
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

## UI / Design Direction

Reference: The uploaded image (`64647.jpg`) is the design inspiration. Key visual traits to replicate:

- **Color scheme**: Rich green primary (#2EA92E brand green), white backgrounds, light gray (gray-50) dashboard bg. Green gradient cards for hero/summary sections. Red accents for payables/negative amounts.
- **Typography**: Use `DM Sans` from Google Fonts (weights 400, 500, 600, 700). Clean, modern, slightly rounded feel.
- **Cards**: Rounded corners (rounded-2xl to rounded-3xl), subtle shadows, white bg with gray-100 borders. Hover state with slightly stronger shadow.
- **Mobile-first layout**: Everything designed for 375px+ screens. Bottom tab navigation (4 items: Home, Owed to me, I owe, People). Sticky header. FAB (floating action button) for quick-add on dashboard.
- **Stat cards**: 2-column grid, each with a small colored icon + label + bold number.
- **Net position card**: Full-width green gradient card at top of dashboard showing total net position.
- **Entry cards**: Show contact avatar initial (colored circle), name, description, date on left. Amount + status badge on right. Payment progress bar below if partially paid.
- **Forms**: Clean inputs with rounded-xl, gray-50 bg, focus ring in brand green. Primary buttons are brand green rounded-xl.
- **Status badges**: Pill-shaped. Green for settled, red for overdue, amber for warning, gray for active.
- **Animations**: Subtle fade-in on page load, slide-up for cards. No heavy animations.
- **PWA feel**: No browser chrome. Safe area padding. Backdrop blur on header and bottom nav.

## Key Business Logic

### Interest Calculation (`lib/calculations.ts`)

```
FLAT interest: principal × rate / 100 (one-time)
MONTHLY interest: principal × rate × months_elapsed / 100 (simple interest)
Outstanding balance: principal + interest - sum(all payments)
```

Never allow outstanding to go below 0. When outstanding reaches 0, auto-suggest settling the entry.

### Dashboard Summary

Aggregate across all user entries:
- `totalReceivable`: sum of outstanding on RECEIVABLE entries
- `totalPayable`: sum of outstanding on PAYABLE entries  
- `netPosition`: totalReceivable - totalPayable
- `overdueCount`: active entries past due_date with outstanding > 0
- `activeCount`, `settledCount`

### Currency Formatting

Default to UGX. Use `Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", minimumFractionDigits: 0 })`. UGX has no decimal places.

## Auth Flow

1. User signs up → Supabase creates auth.users row → DB trigger creates public.users row
2. User logs in → middleware refreshes session on every request
3. Protected routes: everything under `(dashboard)` requires auth. Redirect to /login if no session.
4. Auth pages redirect to /dashboard if already logged in.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=          # Supabase pooled connection string (for Prisma)
DIRECT_URL=            # Supabase direct connection string (for migrations)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## PWA Configuration

- Use `@serwist/next` for service worker generation
- Cache app shell and static assets for offline loading
- `public/manifest.json` with name "CreditDesk", short_name "CreditDesk", theme_color "#2EA92E", background_color "#ffffff", display "standalone"
- Include 192x192 and 512x512 icons (generate simple green "CD" logo icons)

## Commands

```bash
npm install
npx prisma generate
npx prisma db push          # push schema to Supabase
# Then run supabase/rls-policies.sql in Supabase SQL Editor
npm run dev
```

## What NOT to Build (MVP Scope)

- No SMS/WhatsApp reminders
- No multi-currency (UGX only for now)
- No business mode (personal mode only)
- No credit scoring
- No shared/confirmed debts between two users
- No export to PDF/Excel
- No dark mode (light only for MVP)
