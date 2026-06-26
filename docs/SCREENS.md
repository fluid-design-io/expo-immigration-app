# Screen Inventory — v1 (I-765 spine)

> Every page the v1 app needs, grouped by flow. Doubles as (a) the **Mobbin reference-collection checklist** and (b) the **build map** for Phase 6.
> **P1** = collect Mobbin references now (the screens that make or break the app). **P2** = standard, collect later or reuse a P1 pattern.
> Tick `[x]` when you've saved 3–5 references for that screen to your `Immigration v1` Mobbin collection.

## A. Onboarding & auth

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 1 | Welcome / value intro (1–3 slides) | P1 | `onboarding`, `welcome` | banking, health apps |
| [ ] | 2 | Sign up | P1 | `sign up`, `register` | any fintech |
| [ ] | 3 | Sign in | P1 | `login`, `sign in` | any fintech |
| [ ] | 4 | Forgot / reset password | P2 | `forgot password` | any |
| [ ] | 5 | Notification permission priming | P1 | `notification permission`, `push opt-in` | habit/health apps |

## B. Home

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 6 | Home — next deadline + "Start renewal" | P1 | `home`, `dashboard`, `status` | banking home, insurance |
| [ ] | 7 | Home — empty (no filings yet) | P1 | `empty state` | any |

## C. ⭐ Filing wizard (I-765) — the heart of the app

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 8 | Wizard intro — "what you'll need" + disclaimer | P1 | `get started`, `before you begin` | tax apps, insurance quotes |
| [ ] | 9 | Eligibility category pick (c8/c9/c33) | P1 | `choose option`, `select plan`, `radio list` | insurance, banking KYC |
| [ ] | 10 | Generic question step (1 question / screen) | P1 | `multi-step form`, `stepper`, `onboarding flow` | **TurboTax / tax apps** |
| [ ] | 11 | Progress indicator (top of wizard) | P1 | `progress steps`, `stepper` | checkout flows |
| [ ] | 12 | Form fields + inline validation errors | P1 | `form`, `input`, `validation` | any |
| [ ] | 13 | Date picker (for DOB / dates) | P1 | `date picker`, `calendar` | travel/booking apps |
| [ ] | 14 | Attach documents step | P1 | `upload document`, `add file` | password mgrs, Dropbox |
| [ ] | 15 | Save & exit / draft state | P2 | `save draft`, `autosave` | docs/notes apps |
| [ ] | 16 | Review & verify before export | P1 | `review`, `summary`, `confirm` | checkout flows |
| [ ] | 17 | Success — PDF ready to download | P1 | `success`, `complete`, `done` | any |
| [ ] | 18 | "Not legal advice" disclaimer surface | P1 | `disclaimer`, `terms`, `consent` | finance/health apps |

## D. Document vault

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 19 | Vault list (cards + expiry badges) | P1 | `documents`, `wallet`, `files` | Apple Wallet, 1Password |
| [ ] | 20 | Add document (type, dates, photo) | P1 | `add document`, `upload`, `add card` | wallet/scanner apps |
| [ ] | 21 | Document detail | P2 | `document detail`, `file detail` | Dropbox, Files |

## E. Case tracker

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 22 | Tracker list (cases) | P2 | `list`, `orders` | delivery/package apps |
| [ ] | 23 | Add a case (receipt # entry) | P1 | `add`, `enter code`, `tracking number` | package tracking |
| [ ] | 24 | Case detail — status timeline | P1 | `order tracking`, `status timeline`, `progress tracker` | **Shop / UPS, food delivery** |
| [ ] | 25 | Tracker — empty | P1 | `empty state` | any |

## F. Calendar & deadlines

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 26 | Upcoming deadlines / countdown | P1 | `calendar`, `reminders`, `countdown` | calendar/reminder apps |
| [ ] | 27 | Deadline detail + reminder settings | P2 | `reminder`, `event detail` | reminder apps |

## G. Profile & settings

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 28 | Profile home (info + vault entry) | P2 | `profile`, `account` | any |
| [ ] | 29 | Edit personal info (form, grouped) | P1 | `personal information`, `edit profile` | bank KYC, tax apps |
| [ ] | 30 | Settings (notifications, language en/es) | P2 | `settings` | any |
| [ ] | 31 | Account: delete + export data | P2 | `delete account`, `privacy settings` | any (required by stores) |

## H. Cross-cutting states (collect a few, reuse everywhere)

| ✓ | # | Screen | Pri | Search in Mobbin | Borrow from |
|---|---|--------|-----|------------------|-------------|
| [ ] | 32 | Empty states (general) | P1 | `empty state` | any |
| [ ] | 33 | Loading / skeletons | P2 | `loading`, `skeleton` | any |
| [ ] | 34 | Error / something went wrong | P2 | `error state` | any |
| [ ] | 35 | Bottom sheet / confirm dialog | P2 | `bottom sheet`, `action sheet` | any |

---

## Collect this first (the P1 short list — ~14 screens)

If you only do a few, do these: **1 welcome · 2/3 sign up+in · 6 home · 10+11 wizard step+progress · 12 form fields · 16 review · 17 success · 19 vault list · 24 status timeline · 26 calendar · 29 profile form · 32 empty state.**

Target: **3–5 references each**, one note per save ("like how the progress bar sits at the top").

*v1.1 (not now): forum threads, news feed — we'll collect those later.*
