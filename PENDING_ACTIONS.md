# CardWiz — Pending Actions & Testing Checklist

_Last updated: 14 June 2026_

Ye file un saare kaamon ko track karti hai jo abhi baaki hain (mostly external/manual),
aur testing checklist jahan-jahan extension test karni hai.

---

## 🔴 1. Razorpay — Payments (BLOCKED: wife ka account chahiye)

**Decision:** Account wife ke naam pe lena hai (non-working — tax wife ke slab pe, lower).
Income wahi decide karta hai jiske naam pe Razorpay KYC + settlement bank account ho.

**Wait:** Wife ka bank account khulwana — **1-2 din** lagenge.

### Steps (account khulne ke baad):
- [ ] Wife ka **PAN card** ready karo (KYC ke liye must)
- [ ] Razorpay pe KYC **wife ke naam** pe complete karo (individual/proprietor)
- [ ] Settlement **bank account wife ke naam** pe daalo
- [ ] KYC approval ka wait (2-3 din Razorpay side se)
- [ ] Approval ke baad: Dashboard **Test → Live** toggle karo
- [ ] **Live API keys** generate karo (`rzp_live_...` id + secret)
- [ ] `backend/.env` mein `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` update karo (live wali)
- [ ] Backend restart → verify live mode active
- [ ] Ek chhota **real transaction** (₹49) khud karke settlement confirm karo

> ⚠️ Note: KYC naam = bank account naam = same hona chahiye. Baad mein naam badalna = nayi KYC.
> CA se 30 min consult karke clubbing-of-income + ITR setup confirm kar lena.

---

## 🟡 2. Website Deploy — cardwiz.in (Razorpay verification ke liye zaroori)

Razorpay website verification ke liye `cardwiz.in` pe ye 5 pages **live** honi chahiye.
Saari pages `landing/` folder mein ready hain.

### Steps:
- [ ] [netlify.com](https://app.netlify.com) pe sign up
- [ ] "Add new site" → "Deploy manually" → `landing/` folder drag-drop
- [ ] Temp URL pe saari pages khul rahi hain verify karo
- [ ] Custom domain `cardwiz.in` add karo → GoDaddy DNS records update karo
- [ ] HTTPS active hone ka wait (15-30 min)
- [ ] Razorpay form: website = `https://cardwiz.in`, "login to pay" = No → Submit

### Mandatory pages (sab ready):
| Page | File | URL |
|------|------|-----|
| Privacy Policy | `landing/privacy.html` | cardwiz.in/privacy.html |
| Terms & Conditions | `landing/terms.html` | cardwiz.in/terms.html |
| Shipping & Delivery | `landing/shipping.html` | cardwiz.in/shipping.html |
| Contact Us | `landing/contact.html` | cardwiz.in/contact.html |
| Cancellation & Refunds | `landing/refunds.html` | cardwiz.in/refunds.html |

---

## 🟡 3. Affiliate Programs

- [x] **Amazon Associates** — LIVE (tag: `gogsy-21`)
- [ ] **Cuelinks** — sign up karo (Flipkart, Myntra, Nykaa, Ajio, MMT etc. sab cover).
      Website URL: `https://cardwiz.in`. Approve hone pe CID milega → `affiliate.js` mein
      `cuelinks: { cid: 'XXXX', enabled: true }` set karo. (2-3 din approval)
- [ ] **Flipkart Affiliate** — alag se join karna ho to (ya Cuelinks se hi cover ho jata hai)

---

## 🟡 4. Backend Deploy (production ke liye)

Abhi backend **localhost:3000** pe hai. Live payments tabhi process honge jab backend chal raha ho.
Real product ke liye backend deploy karna padega.

- [ ] Backend deploy karo (Render / Railway / VPS)
- [ ] `backend/.env` mein `BASE_URL` = deployed URL set karo
- [ ] `ALLOWED_EXTENSION_IDS` = published extension ID set karo
- [ ] Extension mein backend URL update karo (`auth.js` BACKEND_URL + `catalog.js` CATALOG_BACKEND_URL)
- [ ] Supabase `/catalog/seed` deployed backend pe chala ke cards seed karo

---

## ✅ 5. Testing Checklist — Sabhi Websites

Har site pe **cart/checkout page** pe jaake check karo:
1. Widget bottom-right corner mein aata hai?
2. Order **amount** sahi detect hota hai (₹)?
3. **Best card** recommendation sahi hai? ⭐ top pe?
4. **Bank offer / instant discount** detect hota hai? (jahan applicable — `+₹X instant off`)
5. **"Buy via our link"** button kaam karta hai (affiliate)?
6. Widget **✕** se band hota hai?
7. Apne cards add karke: nickname + "ending with XXXX" sahi dikhta hai?

### 🟢 Currently LIVE (manifest mein hain) — abhi test karo:
- [ ] **Amazon.in** — cart + payment page (instant bank discount yahan milta hai)
- [ ] **Flipkart.com** — cart/checkout
- [ ] **Myntra.com** — bag/checkout

### 🔵 Add karne hain phir test (abhi manifest mein NAHI):

**Food delivery:**
- [ ] Swiggy (swiggy.com)
- [ ] Zomato (zomato.com)

**Grocery / quick-commerce:**
- [ ] BigBasket (bigbasket.com)
- [ ] Blinkit (blinkit.com)
- [ ] Zepto (zepto.com / zeptonow.com)

**Fashion / shopping:**
- [ ] Nykaa (nykaa.com)
- [ ] Ajio (ajio.com)
- [ ] Meesho (meesho.com)
- [ ] Tata Cliq (tatacliq.com)

**Travel:**
- [ ] MakeMyTrip (makemytrip.com)
- [ ] Cleartrip (cleartrip.com)
- [ ] IRCTC (irctc.co.in)

**Entertainment:**
- [ ] BookMyShow (bookmyshow.com)

> Note: Naye sites add karne ke liye `manifest.json` ke `content_scripts.matches` +
> `web_accessible_resources.matches` mein domains add karne honge, aur `content-detect.js`
> ke `detectSite()` + `AMOUNT_SELECTORS` mein per-site logic add karna hoga.

---

## 📌 Quick status

| Item | Status |
|------|--------|
| Codebase rename (RewardXtra → CardWiz) | ✅ Done |
| Card catalog (195 cards: 138 credit + 57 debit) | ✅ Done |
| Citi cards added | ✅ Done |
| Widget UI (reward/offer/type tags) | ✅ Done |
| Amazon instant-discount detection | ✅ Done |
| Legal pages (privacy/terms/refunds/shipping/contact) | ✅ Ready (deploy pending) |
| Razorpay live payments | 🔴 Wife ka account pending |
| cardwiz.in deploy | 🟡 Netlify pe deploy pending |
| Cuelinks affiliate | 🟡 Signup pending |
| Backend production deploy | 🟡 Pending |
| Add 13 new checkout sites | 🟡 Pending |
| Testing on all sites | 🟡 Pending |
