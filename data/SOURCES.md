# 📚 Reward Rules — Data Sources & Methodology

> `cards.json` ka backing document. Har card ki reward rule kahaan se aayi, kab verify hui,
> aur effective-rate kaise nikala — sab yahaan transparency ke liye.

**Last verified:** 2026-06-09
**Maintainer note:** Banks reward rules frequently change karte hain (devaluations common hain).
Har 1-2 mahine mein re-verify karo. Jab koi rule badle, `cards.json` mein `lastVerified` update karo.

---

## 🧮 Methodology — effectiveRate kaise nikala

Saare cards ko ek hi unit (**effective cashback %**) mein normalize kiya, taaki cashback,
points, aur miles cards directly compare ho saken.

- **Cashback cards:** effectiveRate = cashback % seedha (pointValue = ₹1).
- **Points/Miles cards:** effectiveRate = (reward per ₹ spent) × pointValueINR × 100.
  - Example HDFC Infinia: 5 RP per ₹150 = 0.0333 RP/₹ × ₹1 × 100 = **3.3%**
  - Example IDFC Wealth (above ₹20k tier): 10 RP per ₹200 × ₹0.25 = **1.25%**
  - Example Amex SmartEarn 10X: 10 points per ₹50 = 0.2 points/₹ × ₹0.40 × 100 = **8%** (capped)

**Point values (conservative redemption assumptions):**
| Card / Currency        | pointValueINR | Basis                                      |
|------------------------|---------------|--------------------------------------------|
| Cashback cards         | ₹1.00         | Direct cashback                            |
| HDFC RP (Infinia)      | ₹1.00         | SmartBuy flights/hotels 1:1                 |
| Tata NeuCoins          | ₹1.00         | 1 NeuCoin = ₹1 on Tata Neu                  |
| Axis EDGE Miles        | ₹1.00         | 1:1 on Travel Edge (transfer pe up to ₹2)   |
| IDFC Reward Points     | ₹0.25         | Standard IDFC redemption                    |
| Amex Membership Rewards| ₹0.40         | Voucher redemption average                  |

> ⚠️ Point values redemption method pe depend karte hain. Premium cards (Infinia, Atlas)
> ka value optimal redemption pe zyada ho sakta hai — humne conservative liya.

---

## 💳 Per-Card Sources

### 1. SBI Cashback Card
- 5% online (cap ₹2000/cycle), 1% offline (cap ₹2000), total cap ₹4000 — **April 2026 devaluation**
- Excl: fuel, rent, wallet, utilities, insurance, education, government, gaming
- Sources:
  - [SBI Card official](https://www.sbicard.com/en/personal/credit-cards/cashback-sbi-card.html)
  - [Live From A Lounge — April 2026 restrictions](https://livefromalounge.com/sbicards-cashback-card-imposes-new-restrictions-effective-april-1-2026/)
  - [Paisabazaar](https://www.paisabazaar.com/sbi-bank/cashback-sbi-card/)

### 2. HDFC Millennia
- 5% on 10 brands (cap 1000 CashPoints/mo), 1% base (cap 1000). Wallet/EMI excluded (Sep 2024)
- Sources:
  - [HDFC official](https://www.hdfc.bank.in/credit-cards/millennia-credit-card)
  - [Paisabazaar](https://www.paisabazaar.com/hdfc-bank/millennia-credit-card/)

### 3. Axis Bank ACE
- 5% GPay bills/recharge (Android only), 4% Swiggy/Zomato/Ola — share ₹500/mo cap; 1.5% base uncapped
- Sources:
  - [Axis official](https://www.axis.bank.in/about-us/press-releases/axis-bank-launches-ace-credit-card-in-collaboration-with-google-pay-visa)
  - [CardInsight — ₹500 cap analysis](https://cardinsight.in/axis-ace-credit-card/)

### 4. Amazon Pay ICICI
- 5% Amazon (Prime) / 3% (non-Prime), 2% Amazon Pay partners, 1% base. LTF, fuel surcharge waiver
- Jan 15 2026: 1% fee on wallet loads ≥ ₹5000
- Sources:
  - [ICICI official](https://www.icici.bank.in/personal-banking/cards/credit-card/amazon-pay-credit-card)
  - [TradeBrains review 2026](https://tradebrains.in/money/amazon-pay-icici-credit-card-prime-rewards-cashback-and-detailed-review-2026/)

### 5. Flipkart Axis
- 7.5% Myntra, 5% Flipkart/Cleartrip, 4% Swiggy/Uber/PVR/cult.fit (each ₹4000/quarter cap), 1% base
- Sources:
  - [Axis official](https://www.axis.bank.in/cards/credit-card/flipkart-axisbank-credit-card)
  - [Paisabazaar](https://www.paisabazaar.com/axis-bank/flipkart-axis-bank-credit-card/)

### 6. Tata Neu Infinity HDFC
- 10% Tata Neu (NeuPass), 5% partner Tata brands (grocery cap 2000/mo), 1.5% others, 1.5% UPI
- Sources:
  - [HDFC official](https://www.hdfc.bank.in/credit-cards/tata-neu-infinity-hdfc-bank-credit-card)
  - [Value chart](https://www.hdfc.bank.in/credit-cards/tata-neu-infinity-hdfc-bank-credit-card/value-chart)

### 7. IDFC FIRST Wealth
- Tiered: 3 RP/₹200 below ₹20k/mo, 10 RP/₹200 above (per-₹200 from 18 Jan 2026). 1 RP = ₹0.25
- **Rare:** rent/education/utilities/insurance pe bhi rewards
- Sources:
  - [IDFC official](https://www.idfcfirst.bank.in/credit-card/wealth)
  - [1Finance review 2026](https://1finance.co.in/blog/idfc-first-wealth-credit-card-review-2026-2/)

### 8. Axis Atlas
- 5 EDGE Miles/₹100 travel (₹2L/mo cap), 2/₹100 base. Tiered lounge benefits
- April 2026: Accor/Marriott/Qatar removed; British Airways/Finnair/Lotusmiles added
- Sources:
  - [Paisabazaar](https://www.paisabazaar.com/axis-bank/atlas-credit-card/)
  - [Paisabazaar — devaluation](https://www.paisabazaar.com/credit-card/axis-bank-credit-card-changes/)

### 9. HDFC Infinia
- 5 RP/₹150 (3.3%), up to 10X SmartBuy (cap 15000 points/mo). 1 RP ≈ ₹1
- 2026: SmartBuy voucher multiplier 5X→3X
- Sources:
  - [HDFC official](https://www.hdfc.bank.in/credit-cards/infinia-credit-card)
  - [Card Maven review](https://cardmaven.in/hdfc-bank-infinia-credit-card-review/)

### 10. Swiggy HDFC
- 10% Swiggy (cap ₹1500/mo, txn ≥ ₹249 from 17 Apr 2026), 5% Cleartrip (cap ₹1500), 1% base
- Sources:
  - [Swiggy official](https://www.swiggy.com/swiggy-hdfc-bank-credit-card)
  - [CardInsider — ₹249 rule update](https://cardinsider.com/blog/swiggy-hdfc-credit-card-update/)

### 11. Amex SmartEarn
- 10X MR on Amazon/Flipkart/Uber (cap 500 pts/mo jointly A+F, 500 Uber), 5X Swiggy/Paytm/BMS. 1 MR ≈ ₹0.40
- Sources:
  - [Amex official](https://www.americanexpress.com/in/benefits/smart-earn-credit-card/)
  - [CardInsider](https://cardinsider.com/american-express/american-express-smartearn-credit-card/)

---

## 🔁 Re-verification checklist (har 1-2 mahine)
- [ ] Har card ka official page kholo → reward rate / cap badla?
- [ ] Exclusions list change hui? (rent/fuel/wallet/utilities common targets)
- [ ] Point/mile redemption value badla? (devaluations)
- [ ] Naye cards add karne hain? (RBL, AU, HSBC, Marriott Bonvoy HDFC, etc.)
- [ ] Update `lastVerified` + `lastUpdated` in cards.json
