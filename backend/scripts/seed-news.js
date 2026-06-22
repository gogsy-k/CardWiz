/*
 * One-off: publish a researched, sourced credit-card news article.
 * Idempotent — skips if the slug already exists.
 * Run:  cd backend && node scripts/seed-news.js
 */
'use strict';

require('../src/config');
const db = require('../src/db');

const SLUG = 'rbi-credit-card-rules-2026-weekly-credit-score';

const CONTENT = `Agar aapke paas credit card hai, to 2026 mein kuch bade badlaav ho rahe hain — aapke **credit score** se lekar **rewards** tak. Sab kuch ek jagah, simple bhasha mein.

## 1. Credit score ab har hafte update hoga (1 July 2026 se)

RBI ki **Credit Information Reporting Directions, 2025** ke mutabik, 1 July 2026 se sabhi banks, NBFCs aur card issuers ko aapka credit data har **hafte** credit bureaus (CIBIL, Experian, etc.) ko bhejna hoga. Pehle ye mahine mein ek baar (ya fortnightly) hota tha.

Iska aapke liye matlab:

- **On-time payment** ka positive asar ab **kuch hi dino** mein score mein dikhega — pehle weeks lag jaate the.
- Ek bhi **missed payment** ya extra loan application bhi tezi se reflect hoga.
- **Takeaway:** Score ab fast recover bhi hota hai aur fast girta bhi hai — isliye bill hamesha time pe bharo.

## 2. Har transaction pe two-factor authentication

RBI ki **Authentication Directions, 2025** ke tehat, har card transaction (online ho ya POS) ko kam se kam **do independent factors** se verify karna zaroori hai — aur unmein se ek factor **dynamic** hona chahiye (jaise har baar badalne wala OTP). Ye rule fraud rokne ke liye hai, aur isse aapke payments aur secure ho jaate hain.

## 3. "Overdue" tag ab 3 din ki grace ke baad

Naye uniform standard ke anusaar, kisi credit card account ko "past due" sirf tab mark kiya jayega jab payment **due date ke 3 din baad** tak bhi na ho. Pehle har bank ka apna timeline tha. Thodi rahat zaroor hai — par phir bhi due date pe bharna hi best hai (score weekly update ho raha hai, yaad rahe).

## 4. Rewards pe issuers ki kainchi

Banks dheere-dheere reward programs tight kar rahe hain. Kuch recent changes:

- **Axis Bank** — insurance premium aur utility bill payments pe reward points pe cap.
- **Yes Bank** — third-party apps se rent payment pe 1% + GST fee.
- **HDFC** — premium cards (jaise Infinia) pe kuch redemptions par quarterly limits (e.g. Apple products / Tanishq vouchers).

**Takeaway:** Har spend pe aankh band karke ek hi card mat use karo. Category ke hisaab se sahi card chunoge to rewards kaafi zyada milenge — aur yahi CardWiz ka kaam hai.

## CardWiz se kaise faayda uthayein

- **Bill reminders** — missed payment se bacho (ab score pe asar pehle se fast hai).
- **Best card at checkout** — har category (Amazon, Swiggy, fuel, travel) pe sabse zyada reward dene wala card.
- **[Savings Calculator](https://cardwiz.in)** — turant dekho kaunsa card kitna bachata hai.

---

> **Disclaimer:** Ye general information hai, financial advice nahi. Rule effective dates aur apne card ke exact terms ke liye RBI ki official notifications aur apne bank/issuer se confirm karein. Rewards aur fees bank ki terms pe depend karte hain.`;

async function main() {
  await db.init();
  const existing = await db.posts.getBySlug(SLUG);
  if (existing) {
    console.log(`[seed-news] already exists (${SLUG}) — skipping.`);
    process.exit(0);
  }
  const post = await db.posts.create({
    slug: SLUG,
    title: 'RBI ke naye credit card rules 2026: ab credit score har hafte update hoga',
    excerpt:
      '1 July 2026 se credit score har hafte update, har transaction pe 2-factor auth, overdue tag par 3-din grace, aur rewards par banks ki kainchi — saari zaroori credit card updates ek jagah.',
    content: CONTENT,
    category: 'news',
    status: 'published',
    authorId: null,
    authorName: 'CardWiz Team',
  });
  console.log(`[seed-news] published: ${post.slug} (id=${post.id})`);
  process.exit(0);
}

main().catch((e) => { console.error('[seed-news] FAILED:', e); process.exit(1); });
