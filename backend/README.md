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

## Aage (next phases)

- **Phase 9 — Payments:** Razorpay order + webhook → `users.plan` ko `premium` karna.
- **Phase 10 — Cards on server:** `cards.json` yahaan se serve karna (bina republish update).

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
    middleware/
      auth.js            # requireAuth (Bearer)
    routes/
      auth.js            # /auth/google, /auth/me
  schema.sql             # postgres schema
  .env.example           # config template
```
