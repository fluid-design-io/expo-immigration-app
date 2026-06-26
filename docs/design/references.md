# Reference log — collected patterns

> Per screen: the references you liked + the **pattern we'll adopt** (not the pixels). I fill the "Pattern we like / Adopt" cells as you paste screenshots. Image column points to a file in `references/` when you drop one.
> Status: **empty — awaiting your first Mobbin batch.**

## ⭐ Filing wizard (most important)

**User direction (2026-06-22): pics 1–2 = wizard INTRO / disclaimer; pics 3–5 = the question/choosing screens to take inspiration from.**

### Intro / disclaimer screen
| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **MacroFactor** | Big title + a **horizontal step roadmap** (icons + connector, current active); section heading + short explainer; full-width dark "Begin" | I-765 intro: step roadmap (Basics → Eligibility → Details → Documents → Review) + short explainer + "Begin" | `references/wizard-intro-macrofactor.png` |
| **Monzo** | Friendly illustration; warm title; **reassurance** ("~15 min · you'll need photo ID · we save your progress"); primary button | Our intro reassurance: time estimate · "what you'll need" · **"we save your progress"** · the **"not legal advice"** disclaimer | `references/wizard-intro-monzo.png` |

### Question / choosing screens
| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Hypelist (gender)** | Big question + one-line helper; **single-select cards** (selected = filled dark + ✓); top **progress bar**; back; bottom **Continue** | Simple single-choice / yes-no questions, one per screen | `references/wizard-select-hypelist.png` |
| **ElevenReader (Import)** | **2×2 grid of choice cards** (icon + label) | "How do you want to add this document?" → Scan / Upload / From vault | `references/wizard-grid-elevenreader.png` |
| **Hypelist (recs)** | **Radio list with descriptions** + a "Recommended" badge | **Eligibility category pick (c8/c9/c33)** — each needs a description; badge the most common; disclaimer-gated | `references/wizard-radio-hypelist.png` |
| **Whatnot** | **Single-select list** (ranges); helper subtitle; bottom progress + Next | Single choice from a longer set (radio on the right) | `references/wizard-list-whatnot.png` |
| **Photoroom** | **Multi-select checkboxes** ("choose all that suit"); includes a **"Something else"** escape | Multi-select questions; always offer an "Other / none" escape | `references/wizard-multi-photoroom.png` |
| **Superpower (Add Address)** | Typed form: labeled fields, optional marked, **inline State picker (wheel)** | Address & personal-info entry — grouped labeled fields + native pickers | `references/wizard-form-superpower.png` |

**Adopt for the wizard:** intro with a step roadmap + reassurance (time · what you'll need · save-progress · not-legal-advice) · **one question per screen** · top progress bar + back · selection via **single-select cards** / **choice grid** / **radio + descriptions** as the question demands · bottom **Continue, disabled until answered** · autosave drafts. **Divide questions wisely — one topic per screen; group only tightly-related fields (e.g. a whole address); never overwhelm.** Selection toolkit: single-select cards · choice grid · radio + descriptions · single-select list (ranges) · multi-select checkboxes (+ "Other/none" escape) · typed fields + native pickers.

## Home (deadlines)

**User vision (2026-06-22): very simple, rounded corners. Sections: (1) a live CASE-TRACKING hero card like NordVPN; (2) UPCOMING — next deadline + recent immigration news; (3) YOUR FORMS — current drafts + previous applications.**

| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **NordVPN** | Big **hero status card** (visual + clear status "Secured" + primary action + "…"); dismissible promo; "Recents / All locations >" row | Our **case-status hero** (current application + status + primary action); "View all >" section headers | `references/home-nordvpn.png` |
| **Fabric** | Friendly greeting; filter chips; "Recent items >" horizontal cards; rounded everything | Optional greeting; "View all >" sections; rounded cards | `references/home-fabric.png` |
| **Granola** | Sectioned list — "Coming up" (calendar-date chip + title + time) + "Earlier today"; clean rounded rows | **"Upcoming"** section with a calendar-date chip; clean rounded rows | `references/home-granola.png` |

**Adopt for home:** rounded cards, generous spacing · **hero case-status card** (status dot, application name, key fact, primary action, "…") · **Upcoming** section (next deadline w/ date chip + a recent-news item) · **Your forms** section (draft w/ "Continue" + previous applications) · "View all >" section headers · 5-tab bar.

## Document vault
| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| _tbd_ | | | |

## Onboarding & sign in

**Welcome-screen direction (user pick, 2026-06-22): clean & simple, with either a subtle textured/"paper" background OR a small animated centerpiece. Big friendly headline, generous space, primary action anchored at the bottom.**

| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Liven** | Calm sky-gradient bg + gentle animated leaves in a corner; centered logo + one-line tagline; two **stacked** buttons (filled primary + outlined "I already have an account") | Our welcome layout: calm full-bleed bg, small animated accent, centered logo + tagline, stacked **Get started / I already have an account** | `references/welcome-liven.png` |
| **Vocabulary** | Warm "paper" bg; bold display headline; **social-proof stats row** (350M · 4.8★ · 14M); full-pill primary button | Warm-neutral bg option; a trust/social-proof line once we have real numbers; bold plain-language value headline | `references/welcome-vocabulary.png` |
| **Superpower** | Bold headline + a **comparison card** (Standard vs With Superpower); single dark pill CTA | Reuse the **comparison-card** pattern later (e.g. "alone vs with the app"), not on the welcome screen | `references/welcome-superpower.png` |

**Adopt for our welcome screen:** clean & simple · calm bg (warm-paper *or* cool-blue — deciding) · small animated accent OR textured bg · centered logo + one-line value headline (plain language, e.g. *"Renew your work permit — without the stress"*) · two stacked buttons (filled **Get started** + outlined **I already have an account**) · optional trust line.

### Sign up / sign in (user pick, 2026-06-22): simple, clean, modern — clean **white** functional screens (vs the branded welcome). Email + password for v1; **leave room for Apple/Google later**.

| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Fabric** | Bold "Sign up" title; social buttons (Apple/Google) + "or" divider; filled inputs; full-width dark button; "Already have an account? Sign in"; footer legal links | Same layout, social buttons **stubbed for later** | `references/signup-fabric.png` |
| **ChatGPT** | Centered logo; "Create your account" + one-line subtitle; clean inputs w/ floating labels; **inline password rule with a live ✓**; full-width dark "Continue"; Terms/Privacy footer | Inline password validation; calm one-line subtitle | `references/signup-chatgpt.png` |
| **ElevenReader** | Labeled Name/Email/Password; **password rules with checkmarks**; consent checkboxes (marketing opt-in **separate** from Terms); primary **disabled until valid** | Password checklist; separate consents; disabled-until-valid button | `references/signup-elevenreader.png` |

**Adopt for sign up / sign in:** clean white screen · bold title · email + password (v1) with **Apple/Google placeholders for later** · labeled clean inputs · **inline password rules with checkmarks** · show/hide eye · full-width primary, **disabled until valid** · "Already have an account? Sign in" link · Terms/Privacy footer · marketing opt-in kept separate from the Terms agreement.

## Case tracker / status timeline
| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| _tbd_ | | | |

## Calendar / deadlines

**User vision (2026-06-22, "the calendar screen I'm thinking"): a month grid showing which days have deadlines + an agenda of what's upcoming.**

| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Hypelist (Diary)** | **Month grid**; days with entries get a thumbnail + colored underline; a 'Stats' summary below | Month grid with **deadline markers** (colored dot per kind); today highlighted | `references/cal-hypelist.png` |
| **Fixtured** | **Date-grouped agenda** (Mon 16, Tue 17…) with cards; a 'now' timeline line | Agenda list **grouped by date**; a 'today' anchor | `references/cal-fixtured.png` |
| **Apple Store** | Horizontal **week strip** + clean event rows (title · time · place) | Optional week strip; deadline rows (what · when · days-left) | `references/cal-apple.png` |

**Adopt for calendar:** a **month grid with colored deadline markers** (file-by / expiry / biometrics / RFE) + today highlighted · an **Upcoming agenda grouped by date** (deadline · days-left · linked case) · tap a day → its deadlines. Calm, not cramped.

## Profile / personal-info form & destructive actions
| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Linktree (Delete)** | **Destructive confirm**: "Are you sure?" + permanent-consequence text + **red "Yes, delete"** + outlined **Cancel** | Account/data **deletion** flow (store-required) — clear warning, red destructive primary, easy cancel | `references/delete-linktree.png` |

_Profile / personal-info form layout: reuse the typed-form pattern (Superpower) — labeled grouped fields + native pickers. Collect PII lazily (see DATA-MODEL minimization)._

## Empty states

**User pick (2026-06-22): when empty → a simple centered graphic + short heading + one line underneath. Simple. (Optional + FAB.)**

| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Journal (Apple)** | Centered graphic; "No Entries" + one-line hint; single + FAB | Centered illustration + short heading + one-line hint; optional + FAB | `references/empty-journal.png` |
| **Vocabulary** | Centered isometric illustration; big friendly "You don't have any favorites yet"; warm paper bg | Friendly graphic + one warm line; lots of breathing room | `references/empty-vocabulary.png` |

**Adopt for empty states:** centered illustration · short heading · one helpful line · generous whitespace · one clear way to add. No clutter.

## Dashboard & data viz

**User pick (2026-06-22): dashboard shows only USEFUL info — not cramped. Use cool visualization where it genuinely helps (purposeful, not decorative). Curate ruthlessly.**

| Source app | Pattern we like | Adopt in our app | Image |
|---|---|---|---|
| **Fi** | Big focal metric + clean ring/gauge; period tabs; one simple bar chart; tidy metric trio | A focal number + status ring (e.g. "on track"); a clean chart only where it adds insight | `references/dash-fi.png` |
| **Linktree** | Metric-card row; one clear activity chart; an AI prompt chip | Metric cards for at-a-glance; one purposeful chart; restraint | `references/dash-linktree.png` |

**Adopt:** focal numbers · **one purposeful chart max** per screen · metric cards for at-a-glance · period filter when relevant · ruthless curation. Best-fit viz for us = a **processing-time context** bar ("cases like yours typically take X; you're at week Y") + a status ring — both come from the manual tracker, no PII needed.
