# 💳 RewardXtra

> India ka **privacy-first** browser extension — checkout pe sabse zyada bachat dene wala
> credit card bataye, aur bill due-dates yaad rakhe. **Bina** card number/CVV ya bank login ke.

[![tests](https://img.shields.io/badge/tests-87%20passing-success)](#testing)
[![privacy](https://img.shields.io/badge/privacy-on--device-blue)](PRIVACY.md)

---

## ✨ Features

| Feature | Kya karta hai |
|---------|---------------|
| 💡 **Best-card recommender** | Category + amount → "is purchase pe X card → ₹__ bachenge" |
| 🛒 **Auto checkout detection** | Amazon/Flipkart/Myntra pe khud detect + floating widget |
| 🏷️ **Bank-offer reading** | Page ke visible offers (10% instant discount etc.) read-only padhke ranking mein factor |
| 💼 **Card wallet** | Apne cards add karo (nickname, last-4) — sab device pe |
| 🔔 **Bill reminders** | Due-date pe browser notification + "Pay Now" (bank/CRED redirect) |
| 📉 **Caps & smart alerts** | "Is card ka cap khatam — ab doosra use karo" |
| 🤝 **Affiliate + Premium** | Free tier (affiliate-supported) + optional premium |

### Privacy principles (kabhi nahi todte)
- ❌ Full card number / CVV — **kabhi store nahi**
- ❌ Bank login / net-banking — **nahi**
- ❌ Payment processing — **hum nahi karte**, sirf redirect
- ✅ Saara data **sirf is device pe** (`chrome.storage.local`), koi server nahi

---

## 🚀 Install (Load Unpacked)

1. `chrome://extensions/` kholo (ya Edge: `edge://extensions/`)
2. **Developer mode** ON karo (top-right)
3. **Load unpacked** → is folder ko select karo
4. Toolbar pe 💳 icon → popup khulega

> Amazon/Flipkart/Myntra ke cart page pe jaake widget auto-dikhega.

---

## 🗂️ Project structure

```
manifest.json            Extension config (MV3)
popup-smartcard.html/js   Popup UI (4 tabs: Suggest / Cards / Bills / More)
background.js             Service worker — bill reminder alarms + notifications
content-detect.js         Content script — checkout detect + Shadow-DOM widget

  Engine & logic (pure, testable — browser + Node):
recommend.js             Best-card ranking engine
captracker.js            Monthly cap tracking + reset
reminders.js             Bill due-date math
offers.js                Bank-offer text parser
affiliate.js             Affiliate link builder
premium.js               Free/premium feature gates

data/cards.json          11 India cards ka reward database ("brain")
data/SOURCES.md          Reward data sources + methodology

  Assets / dev:
icon16/48/128.png        Icons (generate-icons.js se bante hain)
privacy.html / PRIVACY.md Privacy policy (Web Store required)
*.test.js                Unit tests (run-all-tests.js / npm test)
```

---

## 🧪 Testing

```bash
npm test          # saare 87 tests (ya: node run-all-tests.js)
node recommend.test.js   # ek single suite
```

87 tests cover: ranking, caps/exclusions, cap-exhaustion re-rank, due-date math (Feb clamp,
month rollover), offer parsing, affiliate URLs, premium gating, domain/phishing safety.

> **Note:** Unit tests pure logic cover karte hain. Content-script ka real-site behaviour
> (Amazon/Flipkart DOM) browser mein manually verify karna padta hai — DOM selectors fragile
> hote hain kyunki sites apna markup badalte rehte hain.

---

## ⚙️ Configuration (launch se pehle)

### Affiliate IDs daalo
[affiliate.js](affiliate.js) mein `DEFAULT_AFFILIATE_CONFIG` ke **placeholder** IDs replace karo:
```js
amazon:   { tag: 'YOUR-amazon-associates-tag' },
flipkart: { affid: 'YOUR-flipkart-affid' },
cuelinks: { cid: 'YOUR-cuelinks-cid', enabled: true },
```
Networks: [Amazon Associates](https://affiliate-program.amazon.in), Flipkart Affiliate, Cuelinks/INRDeals.

### Reward data refresh
[data/cards.json](data/cards.json) banks ke current rewards pe based hai (June 2026). Banks
**frequently devalue** karte hain — [data/SOURCES.md](data/SOURCES.md) ka re-verification
checklist har 1-2 mahine follow karo.

---

## 💰 Monetization
- **Free tier:** core features + affiliate commission ("Buy via our link", no extra cost)
- **Premium (₹99-299/yr):** unlimited cards + spending analytics (abhi dev toggle; payment Phase 7+)

---

## 📦 Publishing
Dekho [STORE.md](STORE.md) — listing copy, permission justifications, Chrome/Edge/Firefox steps.
Packaging ke liye [PACKAGING.md](PACKAGING.md).

---

## ⚠️ Disclaimer
Reward calculations estimates hain (point/mile values redemption pe depend karte hain). Actual
benefit aapke spends aur card terms pe depend karta hai. Apne card ke latest terms verify karo.
RewardXtra kisi bank se affiliated nahi hai.

## License
MIT
