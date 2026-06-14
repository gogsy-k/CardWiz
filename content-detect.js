/*
 * CardWiz — Content Script (Phase 3: Auto Checkout Detection)
 * ------------------------------------------------------------------
 * Amazon / Flipkart / Myntra pe chalkar:
 *   1. merchant -> category map karta hai (read-only)
 *   2. cart/checkout page pe order amount padhta hai (read-only)
 *   3. recommend.js engine se best card nikaalta hai
 *   4. ek floating Shadow-DOM widget mein dikhata hai
 *
 * PRINCIPLE: Sirf PADHTA hai. Koi card number/CVV entry NAHI, koi form fill NAHI.
 *
 * Pure helpers (detectSite, isCheckoutish, parseRupee...) Node mein testable hain;
 * DOM/chrome wala init() sirf browser mein chalta hai.
 */

// ---------- Pure helpers (testable) ----------

function detectSite(hostname) {
  const h = (hostname || '').toLowerCase();
  // Exact domain ya uska subdomain hi match ho (lookalike/phishing domains nahi).
  const isDomain = (host, root) => host === root || host.endsWith('.' + root);
  if (isDomain(h, 'amazon.in')) return { merchant: 'Amazon', category: 'amazon' };
  if (isDomain(h, 'flipkart.com')) return { merchant: 'Flipkart', category: 'flipkart' };
  if (isDomain(h, 'myntra.com')) return { merchant: 'Myntra', category: 'myntra' };
  return null;
}

// Sirf cart/checkout/payment jaise pages pe widget dikhao — har page pe nahi.
function isCheckoutish(pathAndSearch) {
  const u = (pathAndSearch || '').toLowerCase();
  return /(cart|checkout|\/buy|payment|\/gp\/buy|order-summary|bag)/.test(u);
}

// "₹1,299.00" / "Rs. 1299" / "1,299" -> 1299  (warna null)
function parseRupee(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/[,\s]/g, '');
  const m = cleaned.match(/(?:₹|rs\.?|inr)?([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return isNaN(v) || v <= 0 ? null : v;
}

// Per-site amount selectors (pehle ye try honge). Fragile — banks/sites DOM badalte hain.
const AMOUNT_SELECTORS = {
  Amazon: [
    '#sc-subtotal-amount-activecart .a-price-whole',
    '#sc-subtotal-amount-buybox .a-price-whole',
    '.grand-total-price',
    '#subtotals-marketplace-table .a-text-bold',
    '.order-summary-grand-total-price',
  ],
  Flipkart: [
    '._1dqRvU ._2-ut7f',
    '._1dqRvU',
    '.IO0WAR',
    '._3Gw2pT',
  ],
  Myntra: [
    '.priceDetail-base-grandTotal',
    '.priceDetail-base-totalAmount',
    '.pdp-price strong',
  ],
};

const TOTAL_LABELS = /(grand total|order total|amount payable|total payable|total amount|net payable|to pay)/i;

// ---------- DOM-dependent (browser only) ----------

const WIDGET_HOST_ID = 'cardwiz-widget-host';

// Site selectors se amount nikaalo; warna label-based generic fallback.
function detectAmount(merchant) {
  for (const sel of AMOUNT_SELECTORS[merchant] || []) {
    const el = document.querySelector(sel);
    if (el) {
      const v = parseRupee(el.textContent);
      if (v) return v;
    }
  }
  return genericAmount();
}

// Fallback: "Grand Total / Amount Payable" jaise label ke paas ka ₹ amount dhoondo.
function genericAmount() {
  const nodes = document.querySelectorAll('span, div, td, p, strong, b');
  let best = null;
  for (const node of nodes) {
    const txt = node.textContent || '';
    if (txt.length > 120) continue;          // bade blocks skip
    if (!TOTAL_LABELS.test(txt)) continue;
    // is element ya uske parent/siblings mein ₹ amount dhoondo
    const candidate =
      parseRupee(txt) ||
      parseRupee(node.parentElement && node.parentElement.textContent) ||
      parseRupee(node.nextElementSibling && node.nextElementSibling.textContent);
    if (candidate && (!best || candidate > best)) best = candidate; // sabse bada = grand total
  }
  return best;
}

// Checkout page pe dikhne wale bank-offer / No-Cost-EMI text padho (READ-ONLY).
// Heuristic: chhote text blocks jo offer-jaise lagte hain. offers.js parse karega.
const OFFER_HINT = /(instant discount|bank offer|no cost emi|cashback|%\s*off|flat\s*₹|credit card|debit card|₹\s*[\d,]+(?:\.\d+)?\s*off)/i;
const OFFER_VALUE_HINT = /(credit card|debit card|emi|instant|cashback|%|₹\s*\d)/i;

const BANK_NAME_RE = /(hdfc|icici|sbi|axis|kotak|amex|american express|indusind|yes bank|rbl|idfc|federal|standard chartered|hsbc|au bank|bob|bank of baroda|citibank|onecard)/i;

// Payment page pe card option containers scan karo — bank name + "X off" dono ek box mein.
function readPaymentPageOffers() {
  const texts = new Set();
  const allNodes = document.querySelectorAll('div, li, tr');
  for (const node of allNodes) {
    const t = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length < 20 || t.length > 600) continue;
    if (!BANK_NAME_RE.test(t)) continue;
    if (!/\b[\d,]+(?:\.\d+)?\s*off\b/i.test(t)) continue;
    texts.add(t.slice(0, 300));
  }
  return [...texts];
}

function readOffersFromDOM() {
  const texts = new Set();

  // Payment page specific reader (Amazon checkout step 2)
  readPaymentPageOffers().forEach((t) => texts.add(t));

  // Known offer containers (cart page — best signal)
  const scopes = [];
  ['#itembox-InstantBankDiscount', '#sopp_offers', '#bank-offer', '[class*="offer"]', '[class*="Offer"]']
    .forEach((sel) => document.querySelectorAll(sel).forEach((el) => scopes.push(el)));
  const root = scopes.length ? scopes : [document.body];

  let count = 0;
  for (const scope of root) {
    const nodes = scope.querySelectorAll('li, p, span, div');
    for (const n of nodes) {
      if (count++ > 5000) break;
      const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length < 15 || t.length > 250) continue;
      if (OFFER_HINT.test(t) && OFFER_VALUE_HINT.test(t)) texts.add(t);
    }
  }
  return [...texts].slice(0, 20);
}

// Wallet + cap usage ek saath padho (read-only).
function getWalletState() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) return resolve({ owned: [], capUsage: null });
    chrome.storage.local.get(['myCards', 'capUsage'], (r) => {
      const mc = r.myCards || [];
      resolve({ owned: [...new Set(mc.map((c) => c.cardId))], capUsage: r.capUsage || null, myCards: mc });
    });
  });
}

let lastSignature = null; // dohraav rokne ke liye (SPA re-eval)

async function evaluateAndRender() {
  const site = detectSite(location.hostname);
  if (!site) return;
  if (!isCheckoutish(location.pathname + location.search)) {
    removeWidget();
    return;
  }
  // User ne is page pe widget close kiya tha? to mat dikhao.
  if (sessionStorage.getItem('scs-dismissed') === location.pathname) return;

  const DB = await window.CardWizCatalog.load();
  const { owned, capUsage, myCards } = await getWalletState();
  const amount = detectAmount(site.merchant);

  const opts = { category: site.category, amount: amount || 0 };
  if (owned.length) opts.ownedCardIds = owned;

  // Phase 5: widget bhi caps respect kare (read-only — sirf warn karta hai, log nahi).
  if (window.CardWizCapTracker) {
    opts.getRemaining = window.CardWizCapTracker.makeGetRemaining(capUsage, new Date());
  }

  const ranked = window.CardWizEngine.recommend(DB, opts);

  // Page pe visible bank-offers padho aur ranking mein factor karo (reward + offer).
  const offerTexts = readOffersFromDOM();
  const offersByBank = window.CardWizOffers.bestOffersByBank(offerTexts, amount || 0);
  ranked.forEach((r) => {
    const m = offersByBank[r.bank];
    r.offerValue = m ? m.value : 0;
    r.offerRaw = m ? m.offer.raw : null;
    r.total = r.savings + r.offerValue;
  });
  // reward+offer combined ke hisaab se dobara rank karo.
  ranked.sort((a, b) => (b.total - a.total) || (b.rate - a.rate));

  // Jo offers kisi card se match nahi hue (Kotak/OneCard etc.) — info ke liye.
  const matchedBanks = new Set(ranked.map((r) => r.bank));
  const otherOffers = Object.values(offersByBank)
    .filter((m) => !matchedBanks.has(m.offer.bank))
    .map((m) => m.offer.bank);

  // Same state pe baar-baar re-render mat karo.
  const sig = `${site.category}|${amount}|${owned.length}|${ranked[0] && ranked[0].id}|${ranked[0] && ranked[0].total}|${offerTexts.length}`;
  if (sig === lastSignature) return;
  lastSignature = sig;

  renderWidget(site, amount, ranked, owned.length > 0, otherOffers, myCards);
}

// ---------- Shadow-DOM Widget ----------

function removeWidget() {
  const host = document.getElementById(WIDGET_HOST_ID);
  if (host) host.remove();
}

function renderWidget(site, amount, ranked, usingWallet, otherOffers, myCards) {
  removeWidget();

  const host = document.createElement('div');
  host.id = WIDGET_HOST_ID;
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });

  const hasAmount = amount && amount > 0;

  // Top 3 (savings/offer > 0 wale) list banao
  const top3 = ranked.filter((r) => r.total > 0 || !hasAmount).slice(0, 3);

  let listHtml = '';
  top3.forEach((r, i) => {
    const star = i === 0 ? '⭐ ' : '';
    const typeLabel = r.type === 'cashback' ? 'cashback' : r.type === 'miles' ? 'miles' : 'points';
    const typeClass = r.type === 'cashback' ? 'tag-cash' : r.type === 'miles' ? 'tag-miles' : 'tag-pts';
    let right;
    if (hasAmount) {
      const capTag = r.capExhausted ? '<em>cap khatam</em>' : (r.capped ? '<em>cap</em>' : '');
      const parts = [`₹${r.savings}${capTag}`];
      if (r.offerValue > 0) parts.push(`<o>+₹${r.offerValue} offer</o>`);
      parts.push(`<t class="${typeClass}">${typeLabel}</t>`);
      right = parts.join(' ');
    } else {
      right = `${r.rate}% <t class="${typeClass}">${typeLabel}</t>`;
    }
    const walletEntry = myCards && myCards.find((c) => c.cardId === r.id);
    let subtitle = '';
    if (walletEntry) {
      const endingPart = walletEntry.last4 ? `ending with ${walletEntry.last4}` : '';
      if (walletEntry.nickname && endingPart) subtitle = `${walletEntry.nickname} - ${endingPart}`;
      else if (walletEntry.nickname) subtitle = walletEntry.nickname;
      else subtitle = endingPart;
    }
    listHtml += `
      <div class="row ${i === 0 ? 'best' : ''} ${r.capExhausted ? 'exhausted' : ''}">
        <div class="cleft">
          <span class="cname">${star}${escapeHtml(r.name)}</span>
          ${subtitle ? `<span class="csub">${escapeHtml(subtitle)}</span>` : ''}
        </div>
        <span class="csave">${right}</span>
      </div>`;
  });

  const headline = hasAmount
    ? `Is ₹${amount} ${site.merchant} purchase pe:`
    : `${site.merchant} pe best card:`;

  const sourceNote = usingWallet
    ? 'Aapke cards mein se 💼'
    : 'Sabhi cards mein se — apne cards "Mere Cards" mein add karo';

  // Jo offers kisi DB-card se match nahi (Kotak etc.) — chhoti info line.
  const otherOffersHtml = (otherOffers && otherOffers.length)
    ? `<div class="offers">💡 Page pe aur offers: ${escapeHtml(otherOffers.join(', '))}</div>`
    : '';

  // Phase 6: affiliate "Buy via our link" (no extra cost) + disclosure.
  const aff = window.CardWizAffiliate
    ? window.CardWizAffiliate.affiliateUrl(site.category, location.href)
    : { affiliated: false };
  const affHtml = aff.affiliated
    ? `<button class="buy" data-url="${escapeHtml(aff.url)}">🛒 Buy via our link (no extra cost)</button>
       <div class="disc">${escapeHtml(aff.disclosure)}</div>`
    : '';

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .box {
        font-family: 'Segoe UI', system-ui, sans-serif;
        width: 280px; background: #1e1e2e; color: #cdd6f4;
        border: 1px solid #45475a; border-radius: 14px; padding: 14px;
        box-shadow: 0 8px 30px rgba(0,0,0,.45);
      }
      .hd { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
      .title { font-size:13px; font-weight:700; color:#cba6f7; }
      .x { cursor:pointer; color:#6c7086; font-size:14px; line-height:1; background:none; border:none; padding:2px 4px; }
      .x:hover { color:#f38ba8; }
      .headline { font-size:11px; color:#a6adc8; margin-bottom:8px; }
      .row { display:flex; justify-content:space-between; align-items:center;
             background:#313244; border:1px solid #45475a; border-radius:8px;
             padding:7px 9px; margin-bottom:6px; }
      .row.best { border-color:#a6e3a1; background:#2a3a2e; }
      .row.exhausted { border-color:#f38ba8; opacity:.85; }
      .cleft { display:flex; flex-direction:column; }
      .cname { font-size:11px; font-weight:600; }
      .csub { font-size:9px; color:#6c7086; margin-top:1px; }
      .csave { font-size:12px; font-weight:700; color:#a6e3a1; white-space:nowrap; text-align:right; }
      .csave em { font-size:8px; background:#f9e2af; color:#1e1e2e; padding:0 4px; border-radius:3px; font-style:normal; margin-left:2px; }
      .csave o { font-size:9px; color:#89b4fa; font-weight:700; display:block; }
      .csave t { font-size:8px; padding:1px 5px; border-radius:3px; font-style:normal; font-weight:700; display:block; margin-top:2px; }
      .tag-cash { background:#a6e3a1; color:#1e1e2e; }
      .tag-pts  { background:#89b4fa; color:#1e1e2e; }
      .tag-miles { background:#f9e2af; color:#1e1e2e; }
      .offers { font-size:9px; color:#89b4fa; margin-top:2px; line-height:1.4; }
      .buy {
        width:100%; margin-top:8px; background:#f9e2af; color:#1e1e2e; border:none;
        border-radius:8px; padding:8px; font-size:11px; font-weight:700; cursor:pointer;
      }
      .buy:hover { background:#f5d68a; }
      .disc { font-size:8px; color:#6c7086; margin-top:3px; line-height:1.4; }
      .ft { font-size:9px; color:#6c7086; margin-top:6px; line-height:1.4; }
      .ft b { color:#a6adc8; }
    </style>
    <div class="box">
      <div class="hd">
        <span class="title">💳 CardWiz</span>
        <button class="x" title="Band karo">✕</button>
      </div>
      <div class="headline">${escapeHtml(headline)}</div>
      ${listHtml}
      ${otherOffersHtml}
      ${affHtml}
      <div class="ft"><b>${escapeHtml(sourceNote)}</b><br>🔒 Read-only · "offer" = page ka instant discount · data sirf is device pe</div>
    </div>
  `;

  shadow.querySelector('.x').addEventListener('click', () => {
    sessionStorage.setItem('scs-dismissed', location.pathname);
    removeWidget();
  });
  const buyBtn = shadow.querySelector('.buy');
  if (buyBtn) buyBtn.addEventListener('click', () => window.open(buyBtn.dataset.url, '_blank', 'noopener'));

  document.body.appendChild(host);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Init + SPA navigation handling ----------

function init() {
  // Pehli baar: thoda delay (checkout totals async load hote hain), phir retries.
  let tries = 0;
  const retry = () => {
    evaluateAndRender().catch(() => {});
    if (++tries < 5) setTimeout(retry, 1200);
  };
  setTimeout(retry, 600);

  // SPA (Flipkart/Myntra) URL change pe re-evaluate.
  let lastPath = location.pathname + location.search;
  const onNav = () => {
    const now = location.pathname + location.search;
    if (now !== lastPath) {
      lastPath = now;
      lastSignature = null;
      tries = 0;
      setTimeout(retry, 600);
    }
  };
  // history API patch + popstate
  ['pushState', 'replaceState'].forEach((fn) => {
    const orig = history[fn];
    history[fn] = function () { const r = orig.apply(this, arguments); onNav(); return r; };
  });
  window.addEventListener('popstate', onNav);
  setInterval(onNav, 1500); // fallback for sites that bypass history API
}

// Browser mein hi init chalao; Node test mein nahi.
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  init();
}

// Node testing ke liye pure helpers export.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectSite, isCheckoutish, parseRupee };
}
