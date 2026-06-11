# 💳 RewardXtra — Privacy Policy

**Last updated:** 9 June 2026

> **TL;DR —** Aapka saara data **sirf aapke device pe** rehta hai (browser local storage).
> Hum koi data server pe nahi bhejte — **hamara koi server hi nahi hai**. Koi tracking,
> koi analytics server nahi.

## Hum ye KABHI collect/store nahi karte
- Poora credit/debit card number
- CVV
- Net-banking / bank login credentials
- OTP ya koi payment authentication

## 1. Kaun-sa data store hota hai (sirf device pe)
Browser ke `chrome.storage.local` mein, sirf is device pe:
- Cards ka type/naam (jaise "HDFC Millennia") + optional nickname
- Optional last 4 digits (sirf pehchaan ke liye — poora number nahi)
- Bill due date (mahine ka din) + reminder preference
- Cap usage jo aap manually log karte ho
- Premium on/off setting

Ye data kabhi device se bahar nahi jaata.

## 2. Shopping sites pe (read-only)
Amazon.in / Flipkart.com / Myntra.com ke cart/checkout pages pe extension read-only padhta hai:
- Order total amount
- Page pe dikhaye gaye bank offers / No-Cost-EMI text

Sab browser ke andar process hota hai — best card recommend karne ke liye. Transmit kahin nahi hota.
Koi form fill / card entry nahi.

## 3. Notifications
Bill reminders locally schedule hoti hain (`chrome.alarms`) — koi external push service nahi.

## 4. Affiliate links
"Buy via our link" pe affiliate tag add hota hai. Khareedne pe hame chhota commission milta hai —
**aapko koi extra cost nahi**. Affiliate network ko sirf standard click-referral jaati hai; koi
personal data share nahi.

## 5. Permissions
- `storage` — cards/settings device pe save
- `alarms` — bill reminder check schedule
- `notifications` — bill due reminders
- Amazon/Flipkart/Myntra access — checkout pe best card recommend (read-only)

## 6. Data delete
Uninstall karte hi saara local data delete. "Clear" / "Caps reset" se bhi hata sakte ho.

## 7. Contact
gurpreetsj8871@gmail.com
