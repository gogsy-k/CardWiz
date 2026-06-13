# RewardXtra — Backend (Phase 8)

Google SSO + user accounts ka backend. Extension yahaan se login verify karta hai
aur premium status laata hai.

> **Privacy:** Yahaan bhi full card number / CVV / bank login **kabhi nahi** store hota.
> Sirf account (email, Google id) + plan (free/premium). Cards aapke device pe hi.

---

## Kya banaya (is phase mein)

| Endpoint | Kaam |
|----------|------|
| `GET /health` | Server zinda hai? (DB driver bhi batata hai) |
| `POST /auth/google` | Google ID token → verify → user banao/update → session token do |
| `GET /auth/me` | Bearer token → current logged-in user |

**Stack:** Node.js + Express · Google ID-token verify · JWT sessions ·
DB = JSON-file (default, zero setup) ya Postgres/Supabase (optional).

---

## Setup — 3 steps

### 1) Dependencies install karo

```bash
cd backend
npm install
```

### 2) Google OAuth Client banao (SSO ke liye zaroori)

1. [Google Cloud Console](https://console.cloud.google.com/) → naya project banao (ya koi existing).
2. **APIs & Services → OAuth consent screen** → External → app naam + email bharo → save.
   - "Test users" mein apna Gmail add kar lo (jab tak app published nahi).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URIs** mein extension ka redirect URL daalo:
     ```
     https://<EXTENSION_ID>.chromiumapp.org/
     ```
     `<EXTENSION_ID>` kaise milega: Chrome → `chrome://extensions` → Developer mode on →
     "Load unpacked" se extension load karo → uski **ID** copy karo.
     > Tip: extension ID badal jaaye (reload pe) to ye URI dobara update karna padega.
     > Stable rakhne ke liye baad mein manifest mein `key` daal sakte ho (optional).
4. Ban-ne ke baad **Client ID** copy karo (`...apps.googleusercontent.com`).

### 3) `.env` banao

`.env.example` ko copy karke `.env` banao aur values bharo:

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```

```ini
GOOGLE_CLIENT_ID=<step 2 wala client id>
JWT_SECRET=<lamba random string>
```

`JWT_SECRET` generate karne ka quick tarika:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Yahi `GOOGLE_CLIENT_ID` extension ki `auth.js` mein bhi daalna hai** (public value).

---

## Chalao

```bash
npm start        # ya: npm run dev  (file change pe auto-reload)
```

Dikhna chahiye:

```
[db] driver: json
✅ RewardXtra backend chal raha hai: http://localhost:3000
```

Test:

```bash
curl http://localhost:3000/health
# {"ok":true,"service":"smartcard-saver-backend","db":"json"}
```

---

## Database — do options

- **Default (kuch nahi karna):** `DATABASE_URL` khaali → users `backend/data/users.json`
  mein save (gitignored). Dev/MVP ke liye perfect.
- **Postgres / Supabase (production):** `.env` mein `DATABASE_URL` daalo. Backend
  startup pe table khud bana leta hai; ya `schema.sql` Supabase SQL editor mein chala do.
  Postgres driver ke liye: `npm install pg` (optionalDependency hai).

---

## Razorpay (Phase 11 — premium payments)

Premium upgrade Razorpay **Payment Links** se hota hai (extension MV3 ke liye sabse
saaf — koi checkout.js popup mein load nahi karna padta). Setup:

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) pe account banao (free).
2. **Test Mode** on karo (top toggle) — asli paisa nahi lagta.
3. **Settings → API Keys → Generate Test Key** → `Key Id` (`rzp_test_...`) + `Key Secret` copy karo.
4. `backend/.env` mein daalo:
   ```ini
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_test_secret
   ```
5. Backend restart → "RAZORPAY..." warning chala jayega.

**Flow:**
- Extension "More" tab → **Upgrade ₹99/year** → backend payment link banata hai → naya tab khulta hai
- Razorpay test page pe pay karo — [test cards](https://razorpay.com/docs/payments/payments/test-card-details/)
  (e.g. `4111 1111 1111 1111`, koi future expiry, koi CVV; UPI: `success@razorpay`)
- Extension pe wapas aakar **"✅ Maine pay kar diya"** → backend Razorpay se status verify → premium unlock

**Endpoints:** `POST /payment/order`, `POST /payment/verify` (dono Bearer auth).
Card number/CVV hamare server pe **kabhi nahi** — payment poora Razorpay ke page pe.

---

## Aage (future)

- **Webhook** endpoint (production robustness — `verifyWebhookSignature` ready hai)
- Annual expiry (`premium_until`) + renewal
- `cards.json` server se serve (bina Chrome Store republish update)

## Files

```
backend/
  src/
    server.js            # entry — express app + CORS + boot
    config.js            # .env load + validate
    db/
      index.js           # driver selector (json | postgres)
      jsonStore.js       # default file store
      pgStore.js         # postgres/supabase store
    services/
      googleVerify.js    # Google ID token verify
      jwt.js             # humare session token sign/verify
      razorpay.js        # payment links (create/get) + webhook signature
    middleware/
      auth.js            # requireAuth (Bearer)
    routes/
      auth.js            # /auth/google, /auth/me
      cards.js           # /cards (cross-device sync)
      payment.js         # /payment/order, /payment/verify
  schema.sql             # postgres schema (users, cards, payments)
  .env.example           # config template
```
