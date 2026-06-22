/*
 * Make the RBI article multilingual: link the existing Hinglish post + publish
 * accurate English & Hindi versions, all sharing translation_group 'rbi-rules-2026',
 * each with a branded cover image. Idempotent.
 * Run:  cd backend && node scripts/seed-news-translations.js
 */
'use strict';

require('../src/config');
const db = require('../src/db');

const GROUP = 'rbi-rules-2026';
const HINGLISH_SLUG = 'rbi-credit-card-rules-2026-weekly-credit-score';

const cover = (title) =>
  `https://cardwiz.in/news-cover?title=${encodeURIComponent(title)}&cat=${encodeURIComponent('Credit Card News')}`;

const HINGLISH_TITLE = 'RBI ke naye credit card rules 2026: ab credit score har hafte update hoga';

const EN_TITLE = "RBI's new credit card rules 2026: your credit score now updates every week";
const EN = `If you hold a credit card, 2026 brings some big changes — from your **credit score** to your **rewards**. Here's everything in one place, in plain language.

## 1. Your credit score now updates every week (from 1 July 2026)

As per the RBI's **Credit Information Reporting Directions, 2025**, from 1 July 2026 all banks, NBFCs and card issuers must send your credit data to the bureaus (CIBIL, Experian, etc.) **every week** — earlier this happened roughly once a month.

What it means for you:

- An **on-time payment** reflects in your score within **days**, not weeks.
- A single **missed payment** or extra loan application also shows up faster.
- **Takeaway:** Your score now recovers fast and drops fast — so always pay on time.

## 2. Two-factor authentication on every transaction

Under the RBI's **Authentication Directions, 2025**, every card transaction (online or POS) must be verified using at least **two independent factors**, and at least one must be **dynamic** (like a one-time OTP). This curbs fraud and makes your payments more secure.

## 3. "Overdue" tag only after a 3-day grace

Under the new uniform standard, a credit card account is marked "past due" only if the payment stays unpaid for **more than 3 days after the due date** — earlier each bank had its own timeline. A small relief, but with weekly score updates, paying on time is still best.

## 4. Banks are trimming rewards

Issuers are gradually tightening reward programs. Some recent changes:

- **Axis Bank** — caps on reward points for insurance premium and utility bill payments.
- **Yes Bank** — a 1% + GST fee on rent payments via third-party apps.
- **HDFC** — quarterly caps on some redemptions on premium cards (e.g. Infinia: limits on Apple products / Tanishq vouchers).

**Takeaway:** Don't blindly use one card for every spend. Pick the right card per category and you'll earn far more — exactly what CardWiz helps with.

## How CardWiz helps

- **Bill reminders** — avoid missed payments (the score impact is faster now).
- **Best card at checkout** — the highest-reward card for each category (Amazon, Swiggy, fuel, travel).
- **[Savings Calculator](https://cardwiz.in)** — instantly see which card saves you the most.

---

> **Disclaimer:** This is general information, not financial advice. Confirm effective dates and your card's exact terms with RBI's official notifications and your bank/issuer. Rewards and fees depend on bank terms.`;

const HI_TITLE = 'RBI के नए क्रेडिट कार्ड नियम 2026: अब आपका credit score हर हफ़्ते अपडेट होगा';
const HI = `अगर आपके पास credit card है, तो 2026 में कुछ बड़े बदलाव हो रहे हैं — आपके **credit score** से लेकर **rewards** तक। सब कुछ एक जगह, आसान भाषा में।

## 1. Credit score अब हर हफ़्ते अपडेट होगा (1 जुलाई 2026 से)

RBI की **Credit Information Reporting Directions, 2025** के अनुसार, 1 जुलाई 2026 से सभी banks, NBFCs और card issuers को आपका credit data हर **हफ़्ते** credit bureaus (CIBIL, Experian, आदि) को भेजना होगा। पहले यह महीने में लगभग एक बार होता था।

आपके लिए इसका मतलब:

- **समय पर payment** का असर अब कुछ ही **दिनों** में score में दिखेगा — पहले हफ़्तों लगते थे।
- एक भी **missed payment** या extra loan application भी तेज़ी से दिखेगा।
- **Takeaway:** Score अब तेज़ी से सुधरता भी है और गिरता भी है — इसलिए हमेशा समय पर bill भरें।

## 2. हर transaction पर two-factor authentication

RBI की **Authentication Directions, 2025** के तहत, हर card transaction (online हो या POS) को कम से कम **दो independent factors** से verify करना ज़रूरी है — और उनमें से एक factor **dynamic** होना चाहिए (जैसे हर बार बदलने वाला OTP)। यह नियम fraud रोकने के लिए है।

## 3. "Overdue" टैग अब 3 दिन की रियायत के बाद

नए uniform standard के अनुसार, किसी credit card account को "past due" तभी मार्क किया जाएगा जब payment **due date के 3 दिन बाद** तक भी न हो। पहले हर बैंक का अपना timeline था। थोड़ी राहत ज़रूर है — पर score weekly update हो रहा है, इसलिए समय पर भरना ही सबसे अच्छा है।

## 4. Rewards पर बैंकों की कैंची

बैंक धीरे-धीरे reward programs सख़्त कर रहे हैं। कुछ हालिया बदलाव:

- **Axis Bank** — insurance premium और utility bill payments पर reward points पर cap।
- **Yes Bank** — third-party apps से rent payment पर 1% + GST fee।
- **HDFC** — premium cards (जैसे Infinia) पर कुछ redemptions पर quarterly limits (जैसे Apple products / Tanishq vouchers)।

**Takeaway:** हर खर्च पर आँख बंद करके एक ही card मत इस्तेमाल करें। Category के हिसाब से सही card चुनेंगे तो rewards काफ़ी ज़्यादा मिलेंगे — और यही CardWiz का काम है।

## CardWiz से कैसे फ़ायदा

- **Bill reminders** — missed payment से बचें (अब score पर असर तेज़ है)।
- **Best card at checkout** — हर category (Amazon, Swiggy, fuel, travel) पर सबसे ज़्यादा reward देने वाला card।
- **[Savings Calculator](https://cardwiz.in)** — तुरंत देखें कौनसा card कितना बचाता है।

---

> **Disclaimer:** यह सामान्य जानकारी है, financial advice नहीं। Rule effective dates और अपने card के exact terms के लिए RBI की official notifications और अपने bank/issuer से confirm करें। Rewards और fees बैंक की terms पर निर्भर करते हैं।`;

const VARIANTS = [
  {
    slug: 'rbi-credit-card-rules-2026-weekly-credit-score-en',
    lang: 'en',
    title: EN_TITLE,
    excerpt:
      "From 1 July 2026 your credit score updates weekly, every transaction needs two-factor auth, a 3-day grace before 'overdue', and banks are trimming rewards — all the key credit card updates in one place.",
    content: EN,
  },
  {
    slug: 'rbi-credit-card-rules-2026-weekly-credit-score-hi',
    lang: 'hi',
    title: HI_TITLE,
    excerpt:
      '1 जुलाई 2026 से credit score हर हफ़्ते अपडेट, हर transaction पर two-factor authentication, overdue टैग पर 3 दिन की रियायत, और rewards पर बैंकों की कैंची — सभी ज़रूरी क्रेडिट कार्ड अपडेट एक जगह।',
    content: HI,
  },
];

async function main() {
  await db.init();
  console.log(`[seed-translations] driver=${db.kind}`);

  // 1. Link + cover the existing Hinglish article.
  const hin = await db.posts.getBySlug(HINGLISH_SLUG);
  if (hin) {
    await db.posts.update(hin.id, { translationGroup: GROUP, coverImage: cover(HINGLISH_TITLE) });
    console.log('  ~ updated Hinglish: group + cover');
  } else {
    console.log('  ! Hinglish article not found — run seed-news.js first');
  }

  // 2. Create EN + HI versions (skip if slug already exists).
  for (const v of VARIANTS) {
    const existing = await db.posts.getBySlug(v.slug);
    if (existing) { console.log(`  = exists, skip: ${v.slug}`); continue; }
    const post = await db.posts.create({
      slug: v.slug,
      title: v.title,
      excerpt: v.excerpt,
      content: v.content,
      category: 'news',
      status: 'published',
      lang: v.lang,
      translationGroup: GROUP,
      coverImage: cover(v.title),
      authorId: null,
      authorName: 'CardWiz Team',
    });
    console.log(`  + published ${v.lang}: ${post.slug}`);
  }

  console.log('[seed-translations] done.');
  process.exit(0);
}

main().catch((e) => { console.error('[seed-translations] FAILED:', e); process.exit(1); });
