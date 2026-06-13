# 💳 RewardXtra — Project Roadmap & Master Plan

> India-first browser extension jo checkout pe best card batata hai aur credit card
> bill due-dates yaad rakhta hai — bina kisi card number ya bank login ke.
> Privacy-first. Free + Premium model.

---

## 🎯 Vision (One-Liner)

> "India ka pehla privacy-first browser extension jo checkout pe sabse zyada bachat
> dene wala card batata hai aur bill due-dates bhi yaad rakhta hai — bina kisi
> card number/CVV ya bank login ke."

Ye 3 cheezon ka best ek jagah laata hai:
- Recommendation (jaise Cherry Pick)
- Reward/points tracking (jaise CardPointers)
- Bill reminders (jaise CRED)
...woh bhi **India ke liye, deeply localized.**

---

## 🧭 Core Principles (Inhe kabhi mat todna)

1. **Sensitive data store NAHI karenge** — full card number aur CVV kabhi store nahi.
   Recommendation card ke *type* pe depend karta hai, *number* pe nahi.
2. **No bank-linking** — koi net-banking login nahi. Reliability + trust = humara edge.
3. **Extension khud payment NAHI karega** — sirf reminder deta hai + "Pay Now" se
   user ko unke bank/CRED app pe bhej deta hai. Payment user ke secure environment mein.
4. **Privacy transparent** — user ko clearly dikhega: "Aapka data sirf is device pe hai,
   hamare server pe nahi."
5. **India-first** — har card ki real reward rules, caps, exclusions (rent/fuel) cover.

---

## 🗂️ Data Storage Policy (Bahut important — yahi product ki neev hai)

| Data Type                        | Store karein? | Notes                                    |
|----------------------------------|---------------|------------------------------------------|
| Card naam / type (e.g. "HDFC Regalia") | ✅ Haan   | Recommendation ke liye zaroori           |
| Reward rules (category %, caps)  | ✅ Haan       | Extension ka "brain"                      |
| Last 4 digits + nickname         | ✅ Optional   | Sirf pehchaanne ke liye ("HDFC ...4521") |
| Billing cycle + due date         | ✅ Haan       | Reminders ke liye                         |
| Full card number                 | ❌ NAHI       | Risk >> reward                            |
| CVV                              | ❌ NAHI       | PCI rules ke against, kabhi nahi          |
| Bank login / net-banking creds   | ❌ NAHI       | No bank-linking principle                 |

> Note: localStorage by default encrypted nahi hota. Agar kabhi koi semi-sensitive
> data store karein (jaise last-4), to encryption consider karein — LEKIN yaad rakhein:
> agar key bhi usi device pe ho to ye determined attacker ko fully rok nahi paata.
> **Sabse safe = sensitive data store hi mat karo.**

---

## 🏆 Our 5 Competitive Edges (Differentiators)

- **Edge #1 — India-first, deeply localized:** HDFC, ICICI, SBI, Axis, Amex India,
  IDFC ki actual reward structures, milestone benefits, quarterly category caps.
  India ke rewards complex hain (caps, exclusions) — yahi local expertise se jeet.
- **Edge #2 — Recommendation + Bill Tracking ek hi jagah:** Killer combo. Koi dhang
  se nahi karta. "Best card batao" + "bill due hai" ek hi tool mein.
- **Edge #3 — No bank-linking = no headache:** Saare paid tools bank sync pe atakte
  hain (toot-ta hai, trust issue). Hum privacy-first.
- **Edge #4 — Free ya bahut sasta:** Competitors $60-84/year lete hain. Hum free +
  optional cheap premium (₹99-299/year) se massive adoption.
- **Edge #5 — Caps & exclusions smartness:** "Is card ka ₹500 cap is mahine khatam,
  ab doosra card use karo" — koi nahi karta. Power-users ka magnet.

---

## 🧩 Tech Stack (Simple — yahi kaafi hai)

- **HTML + CSS + JavaScript** — bas itna.
- `manifest.json` — extension settings/permissions (Manifest V3)
- **Popup** (HTML/CSS/JS) — icon click pe khulne wali window (cards + recommendations)
- **Content script** — shopping site pe chalkar checkout detect karta hai (read-only)
- **Storage** — browser ka `chrome.storage.local` (cards + reward rules)
- Koi backend zaroori nahi shuru mein. (Affiliate/premium ke liye baad mein lightweight backend.)

---

## 🚀 PHASES (Priority Order)

### Phase 0 — Foundation (Week 1)
**Goal:** Extension ka skeleton khada karna.
- [ ] `manifest.json` setup (Manifest V3, permissions: storage, activeTab)
- [ ] Basic popup window (HTML + CSS) — empty shell
- [ ] `chrome.storage.local` setup + test (save/read)
- [ ] Privacy notice screen: "Data sirf is device pe rehta hai"
- [ ] Project folder structure + Git repo init

### Phase 1 — Card Wallet (Week 1-2) ⭐ User-requested feature ✅ DONE
**Goal:** User apne cards add kare aur manage kare.
- [x] "Add Card" form: card naam/type select (dropdown of India cards)
- [x] Optional: last-4 digits + nickname field
- [x] Reward rules store per card (category → %, cashback/points, cap) — `data/cards.json`
- [x] Cards list view (edit/delete)
- [x] Clear UI label: "Aapki details sirf is device pe save hain"
- [x] **Depends on:** India cards reward-rules database (see Pending Tasks) — 11 cards done

### Phase 2 — Manual Best-Card Recommender (Week 2-3) ⭐ Core value ✅ DONE
**Goal:** User category chune → extension best card rank kare.
- [x] Category dropdown (shopping / dining / travel / fuel / grocery / online)
- [x] Ranking engine: cashback + points value compare — `recommend.js` (11 tests pass)
- [x] Result UI: "Is purchase pe X card → ₹___ bachenge"
- [x] Caps factor in (agar cap khatam to next best suggest)
- [ ] EMI discount compare (abhi pending)
- [ ] **Milestone:** Yahan tak basic usable product → soft launch + feedback possible

### Phase 3 — Auto Checkout Detection (Week 3-5) ✅ DONE
**Goal:** Shopping sites pe khud detect + popup.
- [x] Content script for Amazon, Flipkart, Myntra — `content-detect.js`
- [x] Read-only detection of purchase category (domain-based map)
- [x] **Read displayed bank-offers / EMI section (read-only)** — `offers.js` (13 tests)
- [x] Auto popup: "Is purchase pe Y card use karo, ₹___ bachenge" — Shadow-DOM widget
- [x] Amount auto-read (site selectors + generic "Grand Total" fallback)
- [x] Top recommendation visible offers ke basis pe (reward + offer combined re-rank)

### Phase 4 — Bill Tracking & Reminders (Week 5-7) ⭐ Killer differentiator ✅ DONE
**Goal:** Due-date reminders bina sensitive data ke.
- [x] Per card: due date (mahine ka din) + reminder-days-before input — wallet form
- [x] Reminder logic (calendar-based): month-rollover + Feb clamp — `reminders.js` (10 tests)
- [x] Browser notifications — `background.js` service worker (chrome.alarms, 12h)
- [x] "Pay Now" button → bank/CRED redirect (hum payment NAHI karte)
- [x] Reminder dashboard (🔔 Bills tab, soonest-first, color-coded)

### Phase 5 — Caps & Smart Alerts (Week 7-8) ✅ DONE
**Goal:** Monthly cashback limits track karna.
- [x] Per card monthly cap tracking — `captracker.js` (manual log, 10 tests)
- [x] Alert: "Is card ka cap khatam — ab doosra card use karo" (auto re-rank to base + badge)
- [x] Reset logic har billing cycle pe (monthly auto-reset on period change + manual reset)
- [x] Shared caps (Axis ACE GPay+Swiggy) ek bucket — `capGroup`

### Phase 6 — Monetization Layer (Week 8-9) ✅ DONE
**Goal:** Revenue streams jodna.
- [x] **Affiliate links** — `affiliate.js` (Amazon Associates, Flipkart, Cuelinks). 12 tests.
      ⚠️ Real IDs daalne baaki (abhi placeholders).
- [x] "Buy via our link" option in widget (no extra cost) — affiliated current URL
- [x] **Transparency disclosure** — har affiliate link + More tab pe
- [x] Premium tier gating — `premium.js` (free: 3 cards; premium: unlimited + analytics). 10 tests.
      Dev toggle (real payment Phase 7+). Note: caps tracking FREE rakha (differentiator).

### Phase 7 — Polish & Launch (Week 9-10) 🟡 PREP DONE (publish manual)
**Goal:** Public release.
- [x] UI/UX cleanup — 4-tab popup, About card, manifest v1.0
- [x] Full testing — `npm test` single runner, 87 tests green (real-site verify manual)
- [x] Privacy Policy page — `privacy.html` (bundled) + `PRIVACY.md`, More tab se linked
- [x] Affiliate disclosure — widget + More tab pe
- [x] Store listing + permission justifications — `STORE.md`
- [x] Packaging guide — `PACKAGING.md` (clean zip, dev files exclude)
- [ ] Chrome Web Store publish ($5 fee) — manual step (STORE.md follow karo)
- [ ] Edge + Firefox publish — manual step

---

## 🔐 BACKEND PHASES (Accounts + Payments)

> Yahan se ek lightweight backend judta hai. **Core principle wahi:** full card
> number / CVV / bank login backend pe BHI kabhi nahi. Sirf account + plan + (future)
> card-*type*/nickname/last-4/due-date sync. Cards ka logic aur recommendations
> device pe hi rehte hain. Code: `backend/` folder (Node.js + Express).

> **▶ Agreed build order (Jun 2026):** Phase 9 (Supabase DB) → Phase 10 (Card Sync) → Phase 11 (Payments).

### Phase 8 — Backend Foundation + Google SSO (Accounts) ✅ LIVE
**Goal:** User accounts + Google sign-in, taaki plan/payment handle ho sake.
- [x] Express backend scaffold — `backend/` (config, CORS, health check)
- [x] DB layer: JSON-file store default (zero setup) + Postgres/Supabase optional — `backend/src/db/`
- [x] User table/schema: id, google_id, email, name, plan (free/premium) — `schema.sql`
- [x] Google ID-token verify (`google-auth-library`) — `services/googleVerify.js`
- [x] Session tokens (JWT) + `requireAuth` middleware — `services/jwt.js`, `middleware/auth.js`
- [x] Routes: `POST /auth/google`, `GET /auth/me` — `routes/auth.js`
- [x] Extension side: `auth.js` (chrome.identity `launchWebAuthFlow` → backend → JWT)
- [x] Manifest: `identity` permission + localhost host permission
- [x] Popup "More" tab: Sign in with Google + account card; plan account se sync
- [x] **Manual setup DONE:** Google OAuth client banaya, `GOOGLE_CLIENT_ID` + `JWT_SECRET`
      set, sign-in end-to-end test ho gaya (user JSON store mein aaya). ✅ SSO LIVE.

### Phase 9 — Real Database (Supabase Postgres) ✅ LIVE
**Goal:** JSON-file store se managed Postgres pe move — users reliable, backed-up table mein.
- [x] Supabase project (ap-south-1 Mumbai) + DB password
- [x] `DATABASE_URL` `backend/.env` mein (Session Pooler, IPv4; password `@`→`%40` encoded)
- [x] Backend `[db] driver: postgres`; `users` table auto-create; sign-in se user Postgres mein verified
- Code change ZERO (pluggable db layer); sirf config + manual setup.
- Note: purana JSON `users.json` ab unused (gitignored hi tha).

### Phase 10 — Card Sync (cross-device) — DEFAULT ON, opt-out ✅ LIVE
**Goal:** Signed-in user ke cards account se sync → kisi bhi browser pe login = cards ready.
- [x] `cards` table (user_id FK, UNIQUE(user_id, client_id)) + auto-create — `schema.sql`, `pgStore.js`
- [x] `GET /cards` + `PUT /cards` (full-set replace, Bearer auth) — `routes/cards.js`
- [x] Store ONLY: card type, nickname, last-4, due-date, reminder-days. **Full number/CVV NAHI**
      (server-side defense: last4 ko digits-only + last-4 tak truncate — e2e verified)
- [x] Extension `sync.js`: `mergeCards` (union by id, newer updatedAt jeete) + pull/push/syncNow
- [x] `auth.js` `authedFetch` (Bearer + 401 auto sign-out); popup: init/sign-in pe sync, change pe push
- [x] **Cloud Sync toggle — default ON**, More tab se OFF (signed-in pe hi active)
- [x] Cards-tab privacy line sync-aware; `privacy.html` honestly update (account + sync disclose)
- [x] `sync.test.js` (9 tests) — merge logic; suite 96 green

### Phase 11 — Payment Integration (Razorpay) 🟡 CODE DONE (keys manual)
**Goal:** Real premium upgrade — `users.plan` ko payment se `premium` karna.
- [x] `payments` table (link/payment id, amount, status) — `schema.sql`, `pgStore`/`jsonStore`
- [x] `services/razorpay.js` — Payment Links create/get + webhook signature verify (REST, no SDK)
- [x] `POST /payment/order` (link banao) + `POST /payment/verify` (status poll → premium) — `routes/payment.js`
- [x] Extension: "More" tab Upgrade ₹99 button → naye tab mein Razorpay page → "Maine pay kiya" → unlock
- [x] Signed-in pe dev toggle hata, real upgrade button; plan backend se authoritative
- [x] `razorpay.test.js` (5 tests, signature) — suite 101 green; routes smoke-tested (401/503/table)
- [ ] **Manual:** Razorpay TEST account + `RAZORPAY_KEY_ID/SECRET` `.env` mein (README). Tab tak payments live nahi.
- [ ] (Future) Webhook endpoint (production); annual expiry (`premium_until`)

---

## 💰 Monetization Model

### Free Tier (affiliate-supported)
- Core features free: best-card recommendation, bill reminders
- Revenue: affiliate commission ("Buy via our link", no extra cost to user)
- Networks: Amazon Associates, Flipkart Affiliate, Cuelinks, INRDeals
- **MUST disclose** affiliate behaviour (legal + Chrome Web Store policy)

### Premium Tier (subscription — ₹99-299/year sweet spot)
- Multiple-cards auto-comparison
- Caps tracking + smart alerts
- Detailed spending analytics
- Unlimited cards
- Ad-free experience

---

## 🔮 FUTURE / PENDING TASKS (Baad ke liye — known rakhna)

### Optional "Auto-Try Cards" POC (Phase 3.5 — experimental)
- **Idea:** Checkout pe (payment gateway se PEHLE), jab user card select karta hai,
  extension visible offer options padhe — ya har card "apply karke" dekhe ki kispe
  zyada off/cashback/EMI discount milta hai.
- **Approach:** Pehle sirf displayed offer options READ karo (safe). "Har card apply
  karke test" — risky, isliye OPTIONAL + baad ka POC.
- **Caution:** Payment gateway pe actual card daalkar test NAHI karna (fraud-detection
  trigger, cards block ho sakte hain). Sirf checkout ke pehle visible options.
- **Decision:** "Try karke dekhte hai, agar nahi chala to safe fallback (sirf type-based
  recommendation) hai hi."

### Secure Auto-Fill (Defer karo — MVP mein NAHI)
- Kudos jaisa auto-fill enterprise-level security challenge hai (encryption key mgmt,
  breach liability, compliance). Kudos ke paas $7M funding + security team hai.
- **Decision:** MVP mein skip. Pehle recommendation + reminders se launch + traction.
  Auto-fill baad mein jab resources hon. Iske bina bhi product full value deta hai.

### CRED-style Bill Payment Partnership (Future — bade user base ke baad)
- Jab achha user base ban jaye, CRED ya kisi payment partner ke saath partnership
  karke in-extension bill payment introduce kar sakte hain.
- Tab tak: hum sirf reminder + "Pay Now" redirect karte hain (no payment processing,
  no PCI/licensing headache).

### Other future ideas
- [ ] Spending analytics dashboard (premium)
- [ ] More cards coverage (IDFC, AU, RBL, etc.)
- [ ] More merchant sites for auto-detection
- [ ] Milestone tracking (jaise "₹X aur kharch karo to free voucher milega")
- [ ] Mobile app (baad mein)

---

## ⚠️ Risks & Guardrails (Yaad rakhne layak)

- **PCI-DSS:** CVV kabhi store mat karo. Full number store mat karo.
- **localStorage encryption:** key same device pe ho to full protection nahi.
  Best = sensitive data store hi na karo.
- **Affiliate disclosure:** Legally + policy-wise required. Honestly disclose karo.
- **No actual payment:** Hum payment process nahi karte = no licensing/liability.
- **Read-only on checkout:** Sirf visible offers padho, card entry mat karo.

---

## ✅ Immediate Next Step

**Option A:** Phase 0 + 1 ka actual code likhna shuru (working extension jisme cards
add ho saken).

**Option B:** India ke top 8-10 cards ki reward-rules table banana (extension ka
"brain" — Phase 1 & 2 isi pe depend karte hain).

> Recommendation: **Option B pehle** — kyunki Phase 1 & 2 dono is data pe depend karte
> hain. Data ready ho to coding fast chalegi.