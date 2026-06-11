# 🏪 RewardXtra — Store Listing & Publishing Guide

Chrome Web Store / Edge Add-ons / Firefox ke liye ready-to-paste content + steps.

---

## 📝 Listing copy

### Name
`RewardXtra — Best Card & Bill Reminders`

### Short description (≤132 chars)
`Checkout pe sabse zyada bachat dene wala credit card bataye + bill due-date reminders. Privacy-first, India-first.`

### Category
`Shopping` (secondary: `Productivity`)

### Detailed description
```
RewardXtra India ka privacy-first browser extension hai jo aapko har purchase pe
sabse zyada cashback/rewards dene wala credit card batata hai — aur aapke bill due-dates
bhi yaad rakhta hai.

✨ KYA KARTA HAI
• Best card recommender — category + amount daalo, ya Amazon/Flipkart/Myntra checkout pe
  apne aap best card suggest karta hai ("is purchase pe X card → ₹__ bachenge")
• Bank offers padhta hai — page ke visible "10% instant discount" jaise offers ko factor
  karke ranking deta hai (read-only)
• Bill reminders — due-date pe browser notification, "Pay Now" se bank/CRED pe redirect
• Smart cap alerts — "is card ka monthly cap khatam, ab doosra use karo"
• Card wallet — apne cards add karo (sirf type/nickname/last-4, device pe)

🔒 PRIVACY-FIRST
• Saara data SIRF aapke device pe — koi server nahi, koi tracking nahi
• Full card number ya CVV KABHI nahi maangte/store karte
• Koi bank login nahi — hum payment nahi karte, sirf reminder dete hain

🇮🇳 INDIA-FIRST
HDFC, ICICI, SBI, Axis, IDFC, Amex aur Tata Neu jaise 11+ cards ki actual reward rules,
caps aur exclusions (rent/fuel) cover.

💡 Free to use (affiliate-supported). Premium optional.
```

---

## 🔐 Permission justifications (review form ke liye)

| Permission | Justification |
|------------|---------------|
| `storage` | User ke cards, bill due-dates aur settings device pe locally save karne ke liye. Koi data transmit nahi hota. |
| `alarms` | Bill reminders ko periodically check karne ke liye (har 12 ghante) taaki due-date pe notify kar saken. |
| `notifications` | Credit card bill due-date reminders dikhane ke liye. |
| Host: `amazon.in`, `flipkart.com`, `myntra.com` | Checkout pe order amount aur visible bank-offers READ-ONLY padhke best card recommend karne ke liye. Koi data collect/transmit nahi hota. |

**Single purpose:** Help users pick the best credit card at checkout and remember bill due dates.

**Data usage disclosures (Chrome):**
- ❌ Does NOT collect personally identifiable information
- ❌ Does NOT collect financial/payment info (no card numbers/CVV)
- ❌ Does NOT sell or transfer data
- ✅ All data stays on-device

Privacy policy URL: host `privacy.html` (ya `PRIVACY.md` content kahin publish karo).

---

## 🖼️ Assets checklist
- [ ] Icon 128×128 (✅ `icon128.png` bundled)
- [ ] Screenshots 1280×800 (ya 640×400) — min 1, ideal 3-5:
      1. Suggest tab recommendation
      2. Checkout widget on Amazon
      3. Bills dashboard
      4. Cards wallet
- [ ] Small promo tile 440×280 (optional)

---

## 📤 Publishing steps

### Chrome Web Store
1. [Developer Dashboard](https://chrome.google.com/webstore/devconsole) pe register ($5 one-time fee)
2. `PACKAGING.md` ke hisaab se zip banao (dev files exclude)
3. "New Item" → zip upload
4. Listing copy + screenshots + privacy policy URL bharo
5. Permission justifications bharo → Submit for review

### Edge Add-ons (free)
1. [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge) — free registration
2. Same zip upload, same listing

### Firefox (free) — needs port
- MV3 mostly compatible, par `background.service_worker` ko Firefox `background.scripts`
  ya event page chahiye ho sakta hai. Test on Firefox Developer Edition pehle.
- [addons.mozilla.org](https://addons.mozilla.org/developers/) pe submit.

---

## ✅ Pre-submit checklist
- [ ] `npm test` — saare 87 tests green
- [ ] Real Amazon/Flipkart/Myntra checkout pe widget verify
- [ ] Bill reminder notification fire hota hai (due date set karke test)
- [ ] Affiliate IDs real daale (`affiliate.js`)
- [ ] `data/cards.json` reward data re-verified (latest)
- [ ] Privacy policy publicly accessible URL pe live
- [ ] Version bump `manifest.json` + `package.json`
