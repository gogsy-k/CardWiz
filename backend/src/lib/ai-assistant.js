/*
 * AI Card Assistant — pre-filter + Claude Haiku.
 * Rule-based engine finds top cards first → Claude explains (doesn't rank).
 * ANTHROPIC_API_KEY missing → throws; caller handles 503.
 */
'use strict';

// keyword → catalog category IDs
const KEYWORD_CATS = [
  ['amazon',      ['amazon', 'online_shopping']],
  ['flipkart',    ['flipkart', 'online_shopping']],
  ['myntra',      ['myntra', 'online_shopping']],
  ['meesho',      ['online_shopping']],
  ['ajio',        ['online_shopping']],
  ['nykaa',       ['online_shopping']],
  ['swiggy',      ['food_delivery']],
  ['zomato',      ['food_delivery', 'dining']],
  ['blinkit',     ['grocery']],
  ['zepto',       ['grocery']],
  ['bigbasket',   ['grocery']],
  ['grofers',     ['grocery']],
  ['dunzo',       ['grocery']],
  ['uber',        ['uber', 'cab']],
  ['ola',         ['cab']],
  ['rapido',      ['cab']],
  ['irctc',       ['travel']],
  ['makemytrip',  ['travel', 'flights', 'hotels']],
  ['goibibo',     ['travel', 'flights', 'hotels']],
  ['indigo',      ['flights']],
  ['spicejet',    ['flights']],
  ['air india',   ['flights']],
  ['air asia',    ['flights']],
  ['booking',     ['hotels']],
  ['oyo',         ['hotels']],
  ['hotel',       ['hotels']],
  ['petrol',      ['fuel']],
  ['diesel',      ['fuel']],
  ['hpcl',        ['fuel']],
  ['bpcl',        ['fuel']],
  ['iocl',        ['fuel']],
  ['netflix',     ['entertainment']],
  ['hotstar',     ['entertainment']],
  ['prime video', ['entertainment']],
  ['spotify',     ['entertainment']],
  ['youtube',     ['entertainment']],
  ['gaming',      ['gaming']],
  ['restaurant',  ['dining']],
  ['dining',      ['dining']],
  ['cafe',        ['dining']],
  ['travel',      ['travel']],
  ['flight',      ['flights']],
  ['grocery',     ['grocery']],
  ['supermarket', ['grocery']],
  ['medical',     ['healthcare']],
  ['hospital',    ['healthcare']],
  ['pharmacy',    ['healthcare']],
  ['international',['international']],
  ['foreign',     ['international']],
  ['lounge',      ['lounge_access']],
  ['education',   ['education']],
  ['insurance',   ['insurance']],
  ['utility',     ['utilities']],
  ['electricity', ['utilities']],
  ['mobile recharge', ['utilities']],
];

function detectCategories(query) {
  const lower = query.toLowerCase();
  const cats = new Set();
  for (const [kw, catList] of KEYWORD_CATS) {
    if (lower.includes(kw)) catList.forEach((c) => cats.add(c));
  }
  return [...cats];
}

function bestRateForCard(card, categories) {
  if (!categories.length) return card.baseRate || 0;
  let best = 0;
  for (const cat of categories) {
    const rule = (card.rules || []).find((r) => r.categories?.includes(cat));
    const rate = rule ? (rule.effectiveRate || card.baseRate || 0) : (card.baseRate || 0);
    if (rate > best) best = rate;
  }
  return best;
}

function preFilter(query, catalogCards, maxResults = 5) {
  const categories = detectCategories(query);
  const scored = catalogCards.map((c) => ({ card: c, score: bestRateForCard(c, categories) }));
  scored.sort((a, b) => b.score - a.score);
  return { topCards: scored.slice(0, maxResults).map((x) => x.card), categories };
}

function cardLine(card, categories) {
  const rates = [];
  for (const cat of categories) {
    const rule = (card.rules || []).find((r) => r.categories?.includes(cat));
    if (rule) rates.push(`${cat}: ${rule.effectiveRate}%`);
  }
  const rateStr = rates.length ? rates.join(', ') : `base: ${card.baseRate || 0}%`;
  return `- ${card.name} (${card.bank || ''}): ${rateStr}`;
}

async function chat({ query, walletCards = [], catalogCards = [] }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { topCards, categories } = preFilter(query, catalogCards);
  const walletNames = walletCards.length
    ? walletCards.map((c) => c.name || c.cardId).join(', ')
    : 'No cards in wallet yet';
  const cardsList = topCards.map((c) => cardLine(c, categories)).join('\n');

  const systemPrompt = `You are CardWiz — a friendly Indian credit card advisor.
Your job is to explain which card to use for a purchase and WHY — not to discover the top cards (they are already pre-ranked below).

Guidelines:
- Respond in Hinglish (casual Hindi-English mix, like talking to a friend)
- Be concise: 2-4 sentences max
- Mention the specific reward rate or approximate ₹ savings
- If the user's wallet has a relevant card, mention it first
- Never mention card features that are not listed below
- If the query is unclear or has no purchase intent, ask one short clarifying question

User's wallet: ${walletNames}

Top cards pre-ranked for this query:
${cardsList}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    system: systemPrompt,
    messages: [{ role: 'user', content: query }],
  });

  const reply =
    response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Sorry, kuch issue hua. Dobara try karo.';

  return {
    reply,
    topCards: topCards.map((c) => ({ id: c.id, name: c.name, bank: c.bank, baseRate: c.baseRate })),
    categories,
  };
}

// In-memory rate limit (resets on server restart — fine for daily Render redeploys).
const _limits = new Map();
function checkRateLimit(key, maxPerDay) {
  const now = Date.now();
  let entry = _limits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 86_400_000 };
  }
  if (entry.count >= maxPerDay) {
    return { allowed: false, remaining: 0, resetInHours: Math.ceil((entry.resetAt - now) / 3_600_000) };
  }
  entry.count++;
  _limits.set(key, entry);
  return { allowed: true, remaining: maxPerDay - entry.count };
}

module.exports = { chat, preFilter, checkRateLimit };
