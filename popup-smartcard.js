/*
 * CardWiz — Popup UI logic.
 * recommend.js (engine) + data/cards.json (brain) + chrome.storage (wallet).
 *
 * Phase 1 (Card Wallet): user apne cards add/edit/delete kare. Har card:
 *   { id, cardId, nickname, last4 }
 * NOTE: full card number / CVV KABHI store nahi (plan ka core principle).
 */

const CATEGORY_LABELS = {
  amazon: 'Amazon', flipkart: 'Flipkart', myntra: 'Myntra',
  online_shopping: 'Online Shopping (general)',
  food_delivery: 'Food Delivery (Swiggy/Zomato)', dining: 'Dining / Restaurant',
  grocery: 'Grocery', instamart: 'Instamart / Quick grocery',
  travel: 'Travel (general)', flights: 'Flights', hotels: 'Hotels',
  fuel: 'Fuel / Petrol', utilities: 'Bills / Utilities / Recharge',
  rent: 'Rent', education: 'Education / Fees', insurance: 'Insurance',
  wallet: 'Wallet load (Paytm etc.)', uber: 'Uber', cab: 'Cab / Ola',
  entertainment: 'Movies / Entertainment', upi: 'UPI payment',
  offline: 'Offline shop (card swipe)', government: 'Government / Tax', gaming: 'Gaming',
};

// Bank -> bill-payment URL (best-effort official). Na mile to CRED fallback.
// Hum payment NAHI karte — sirf user ko unke bank/CRED pe bhej dete hain.
const CRED_URL = 'https://cred.club';
const BANK_PAY_URLS = {
  'HDFC': 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/credit-card-bill-payment',
  'SBI': 'https://www.sbicard.com/en/personal/manage-your-card/credit-card-bill-payment.page',
  'ICICI': 'https://www.icicibank.com/personal-banking/cards/credit-card/credit-card-bill-payment',
  'Axis': 'https://www.axisbank.com/retail/cards/credit-card/credit-card-payments',
  'IDFC FIRST': 'https://www.idfcfirstbank.com/credit-card',
  'American Express': 'https://www.americanexpress.com/in/account-management/login/',
};

const $ = (id) => document.getElementById(id);
const els = {
  category: $('category'), amount: $('amount'), goBtn: $('goBtn'),
  onlyMine: $('onlyMine'), results: $('results'),
  cardsList: $('cardsList'), addCardBtn: $('addCardBtn'),
  cardForm: $('cardForm'), formCardId: $('formCardId'),
  formNickname: $('formNickname'), formLast4: $('formLast4'),
  formDueDay: $('formDueDay'), formRemindBefore: $('formRemindBefore'),
  formErr: $('formErr'), saveCardBtn: $('saveCardBtn'), cancelCardBtn: $('cancelCardBtn'),
  billsList: $('billsList'),
  capsFoot: $('capsFoot'), capsPeriod: $('capsPeriod'), resetCapsBtn: $('resetCapsBtn'),
  premiumStatus: $('premiumStatus'), premiumToggle: $('premiumToggle'),
  analyticsBox: $('analyticsBox'), affDisclosure: $('affDisclosure'),
  accountBox: $('accountBox'),
};

let DB = null;        // cards.json
let myCards = [];     // wallet: [{id, cardId, nickname, last4, dueDay, reminderDaysBefore}]
let capUsage = null;  // { period, used } — Phase 5 monthly cap tracking
let isPremium = false;// Phase 6 premium flag (dev toggle / backend-synced)
let currentUser = null;// Phase 8: signed-in Google user, ya null
let syncEnabled = true;// Phase 10: cloud sync (default ON; signed-in pe hi active)
let editingId = null; // agar edit ho raha hai to uska wallet-entry id
let cardsTab = 'credit'; // Cards section ka active tab: 'credit' | 'debit'
let lastRanked = [];  // last recommendation results (log button ke liye)

// ---------- Init ----------
async function init() {
  DB = await CardWizCatalog.load();
  buildCategoryDropdown();
  buildCardSelect();
  await loadWallet();
  await loadCapUsage();
  await loadPremium();
  await loadAuth(); // Phase 8: signed-in user + plan sync (backend)
  await loadSyncPref(); // Phase 10: cloud sync pref (default ON)
  if (currentUser && syncEnabled) await doSyncNow(); // pull+merge+push cards
  if (currentUser && !isPremium) await autoVerifyPayment(); // Phase 11: pending payment auto-detect
  renderMyCards();
  renderFeatured(); // Phase 6.5: sponsored card (free users)

  // View switching
  document.querySelectorAll('nav button').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Cards section ke Debit/Credit toggle tabs
  document.querySelectorAll('.cards-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => { cardsTab = btn.dataset.cardtype; buildCardSelect(); renderMyCards(); });
  });

  els.goBtn.addEventListener('click', runRecommendation);
  els.onlyMine.addEventListener('change', runRecommendation);
  els.resetCapsBtn.addEventListener('click', resetCaps);
  els.premiumToggle.addEventListener('click', togglePremium);

  els.addCardBtn.addEventListener('click', () => openForm());
  els.cancelCardBtn.addEventListener('click', closeForm);
  els.saveCardBtn.addEventListener('click', saveCard);
  els.formCardId.addEventListener('change', updateFormForCardType);
  // last4 = sirf digits
  els.formLast4.addEventListener('input', () => {
    els.formLast4.value = els.formLast4.value.replace(/\D/g, '').slice(0, 4);
  });
}

function switchView(view) {
  document.querySelectorAll('nav button').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === view));
  $('view-suggest').hidden = view !== 'suggest';
  $('view-mycards').hidden = view !== 'mycards';
  $('view-bills').hidden = view !== 'bills';
  $('view-more').hidden = view !== 'more';
  if (view === 'bills') renderBills();
  if (view === 'more') renderMore();
  if (view === 'suggest') renderFeatured();
}

function buildCategoryDropdown() {
  for (const cat of DB.categories) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = CATEGORY_LABELS[cat] || cat;
    els.category.appendChild(opt);
  }
}

// Card credit hai ya debit. cardType missing = 'credit' (purane cards sab credit the).
function cardTypeOf(cat) {
  return cat && cat.cardType === 'debit' ? 'debit' : 'credit';
}

// Add/Edit form ka dropdown — sirf active tab (credit ya debit) ke cards.
function buildCardSelect() {
  els.formCardId.innerHTML = '';
  const filtered = DB.cards.filter((c) => cardTypeOf(c) === cardsTab);
  for (const card of filtered) {
    const opt = document.createElement('option');
    opt.value = card.id;
    const fee = card.annualFee === 0 ? 'LTF' : '₹' + card.annualFee + '/yr';
    opt.textContent = `${card.name} (${fee})`;
    els.formCardId.appendChild(opt);
  }
  updateFormForCardType();
}

// ---------- Wallet storage ----------
function loadWallet() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) { myCards = []; return resolve(); }
    chrome.storage.local.get(['myCards', 'ownedCardIds'], (res) => {
      if (Array.isArray(res.myCards)) {
        myCards = res.myCards;
      } else if (Array.isArray(res.ownedCardIds)) {
        // Purane "wallet lite" model se migrate karo.
        myCards = res.ownedCardIds.map((cardId) => ({ id: uid(), cardId, nickname: '', last4: '' }));
        saveWallet();
      } else {
        myCards = [];
      }
      resolve();
    });
  });
}

function saveWallet() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ myCards });
  }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// ---------- Cap usage storage (Phase 5) ----------
function loadCapUsage() {
  return new Promise((resolve) => {
    const done = (raw) => {
      // Load pe hi normalize → naya mahina ho to auto-reset.
      capUsage = window.CardWizCapTracker.normalize(raw, new Date());
      if (!raw || raw.period !== capUsage.period) saveCapUsage(); // reset persist
      resolve();
    };
    if (typeof chrome === 'undefined' || !chrome.storage) return done(null);
    chrome.storage.local.get(['capUsage'], (r) => done(r.capUsage));
  });
}

function saveCapUsage() {
  if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ capUsage });
}

function resetCaps() {
  if (!confirm('Is mahine ka cap usage reset karein?')) return;
  capUsage = window.CardWizCapTracker.resetAll(new Date());
  saveCapUsage();
  runRecommendation();
}

// ---------- Premium (Phase 6) ----------
function loadPremium() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) { isPremium = false; return resolve(); }
    chrome.storage.local.get(['isPremium'], (r) => { isPremium = !!r.isPremium; resolve(); });
  });
}

function togglePremium() {
  // Signed in: free -> real Razorpay upgrade; premium -> kuch nahi.
  if (currentUser) {
    if (!isPremium) startUpgrade();
    return;
  }
  // Signed out: dev toggle (local testing ke liye).
  isPremium = !isPremium;
  if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ isPremium });
  renderMore();
  renderMyCards(); // card-limit gating refresh
}

// ---------- Premium upgrade (Razorpay Subscriptions — free trial + auto-pay) ----------

// Popup khulte hi silently check: subscription card save hua? ya old payment paid? -> premium unlock.
async function autoVerifyPayment() {
  if (!currentUser || isPremium || typeof CardWizAuth === 'undefined') return;
  try {
    // New flow: subscription check (card authenticated = premium)
    const subRes = await CardWizAuth.authedFetch('/payment/verify-subscription', { method: 'POST' });
    if (subRes.ok) {
      const subData = await subRes.json();
      if (subData.status === 'active' || subData.plan === 'premium') {
        currentUser = await CardWizAuth.fetchMe();
        applyAuthToPremium();
        return;
      }
    }
    // Old flow fallback: one-time payment link (backward compat)
    const res = await CardWizAuth.authedFetch('/payment/verify', { method: 'POST' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === 'paid' || data.plan === 'premium') {
      currentUser = await CardWizAuth.fetchMe();
      applyAuthToPremium();
    }
  } catch (e) { /* offline / koi pending nahi — ignore */ }
}

// Plan selector dikhao — monthly ya yearly chunne do, phir subscribe karo.
function startUpgrade() {
  const msg = $('upgradeMsg');
  if (typeof CardWizAuth === 'undefined') return;
  const P = window.CardWizPremium;
  const yearlySaving = P.PREMIUM_MONTHLY_INR * 12 - P.PREMIUM_YEARLY_INR;

  msg.innerHTML = `
    <div class="upgrade-note" style="text-align:left;padding:12px;">
      <div style="font-weight:700;font-size:12px;margin-bottom:10px;text-align:center;color:#cdd6f4;">
        Plan chuniye 👇
      </div>
      <div class="plan-selector">
        <div class="plan-card selected" id="planMonthly">
          <div class="plan-price">₹${P.PREMIUM_MONTHLY_INR}</div>
          <div class="plan-label">/ month</div>
          <div class="plan-trial">1st month FREE</div>
        </div>
        <div class="plan-card" id="planYearly">
          <div class="plan-badge">SAVE ₹${yearlySaving}!</div>
          <div class="plan-price">₹${P.PREMIUM_YEARLY_INR}</div>
          <div class="plan-label">/ year</div>
          <div class="plan-trial">1st month FREE</div>
          <div class="plan-label" style="margin-top:2px;">₹${Math.round(P.PREMIUM_YEARLY_INR / 12)}/mo effective</div>
        </div>
      </div>
      <button class="plan-confirm" id="confirmUpgradeBtn">
        ⭐ 1st mahina FREE — Shuru karo
      </button>
      <div style="font-size:9px;color:#6c7086;text-align:center;margin-top:6px;">
        🔒 Card abhi save hoga, charge ${P.PREMIUM_TRIAL_DAYS} din baad. Cancel kabhi bhi.
      </div>
    </div>`;

  let selectedPlan = 'monthly';

  function updateSelection() {
    const pm = $('planMonthly'), py = $('planYearly'), btn = $('confirmUpgradeBtn');
    if (pm) pm.classList.toggle('selected', selectedPlan === 'monthly');
    if (py) py.classList.toggle('selected', selectedPlan === 'yearly');
    if (btn) btn.textContent = selectedPlan === 'yearly'
      ? `⭐ ₹${P.PREMIUM_YEARLY_INR}/year — Shuru karo`
      : `⭐ 1st mahina FREE, phir ₹${P.PREMIUM_MONTHLY_INR}/month`;
  }

  const pm = $('planMonthly'), py = $('planYearly');
  if (pm) pm.addEventListener('click', () => { selectedPlan = 'monthly'; updateSelection(); });
  if (py) py.addEventListener('click', () => { selectedPlan = 'yearly'; updateSelection(); });

  const btn = $('confirmUpgradeBtn');
  if (btn) btn.addEventListener('click', () => doSubscribe(selectedPlan));
}

// Subscription create karo aur user ko Razorpay hosted checkout pe bhejo.
async function doSubscribe(plan) {
  const msg = $('upgradeMsg');
  if (!msg || typeof CardWizAuth === 'undefined') return;
  msg.innerHTML = '<div class="more-sub" style="text-align:center;padding:12px;">Subscription ban raha hai…</div>';
  try {
    const res = await CardWizAuth.authedFetch('/payment/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      throw new Error(res.status === 503
        ? 'Payments abhi enable nahi — backend pe Razorpay keys daalo (README).'
        : 'Subscribe fail (' + res.status + ')');
    }
    const data = await res.json(); // { shortUrl, plan, trialDays }
    window.open(data.shortUrl, '_blank', 'noopener');
    msg.innerHTML =
      `<div class="upgrade-note">
         Naye tab mein apna card save karo (${data.trialDays} din free trial).<br>
         Card save ho jaye to yahan wapas aao 👇<br>
         <button id="verifySubBtn">✅ Card save kar diya</button>
       </div>`;
    const vb = $('verifySubBtn');
    if (vb) vb.addEventListener('click', verifySubscription);
  } catch (e) {
    if (msg) msg.innerHTML = `<div class="acct-err">${escapeHtml((e && e.message) || 'Subscribe fail')}</div>`;
  }
}

// Subscription verify — 'authenticated' matlab card save hua = premium.
async function verifySubscription() {
  const msg = $('upgradeMsg');
  const vb = $('verifySubBtn');
  if (vb) { vb.disabled = true; vb.textContent = 'Check kar rahe hain…'; }
  try {
    const res = await CardWizAuth.authedFetch('/payment/verify-subscription', { method: 'POST' });
    const data = await res.json();
    if (data.status === 'active' || data.plan === 'premium') {
      currentUser = await CardWizAuth.fetchMe();
      applyAuthToPremium();
      if (msg) msg.innerHTML = '<div class="upgrade-note">🎉 Premium active! Pehla charge 30 din baad. Shukriya! 🙏</div>';
      renderMore();
      renderMyCards();
    } else if (data.status === 'pending') {
      if (msg) msg.innerHTML =
        '<div class="upgrade-note">Card abhi verify nahi hua. Thodi der mein dobara try karo.<br><button id="verifySubBtn">🔄 Dobara check</button></div>';
      const vb2 = $('verifySubBtn'); if (vb2) vb2.addEventListener('click', verifySubscription);
    } else {
      if (msg) msg.innerHTML = '<div class="more-sub">Subscription nahi mila. Upgrade dobara shuru karo.</div>';
    }
  } catch (e) {
    if (msg) msg.innerHTML = `<div class="acct-err">${escapeHtml((e && e.message) || 'Check fail')}</div>`;
  }
}

// ---------- Account / Google SSO (Phase 8) ----------
function loadAuth() {
  return new Promise(async (resolve) => {
    if (typeof CardWizAuth === 'undefined') return resolve();
    try {
      currentUser = await CardWizAuth.fetchMe(); // null = signed out / token expired
    } catch {
      currentUser = null;
    }
    applyAuthToPremium();
    resolve();
  });
}

// Signed in -> plan backend se authoritative. Signed out -> local dev flag chalta hai.
function applyAuthToPremium() {
  if (currentUser) isPremium = currentUser.plan === 'premium';
}

function renderAccount() {
  const box = els.accountBox;
  if (!box) return;
  if (typeof CardWizAuth === 'undefined') {
    box.innerHTML = '<div class="more-sub">Auth module load nahi hua.</div>';
    return;
  }

  if (currentUser) {
    const initial = (currentUser.name || currentUser.email || '?').charAt(0).toUpperCase();
    const pic = safePictureUrl(currentUser.picture);
    const avatar = pic ? `<img src="${pic}" alt="">` : escapeHtml(initial);
    box.innerHTML =
      `<div class="acct-row">
         <div class="acct-avatar">${avatar}</div>
         <div class="acct-info">
           <div class="acct-name">${escapeHtml(currentUser.name || 'User')}</div>
           <div class="acct-email">${escapeHtml(currentUser.email || '')}</div>
         </div>
         <span class="pill ${isPremium ? 'pro' : 'free'}">${isPremium ? 'PREMIUM' : 'FREE'}</span>
       </div>
       <button class="ghost" id="signOutBtn" style="margin-top:10px;">Sign out</button>`;
    const b = $('signOutBtn');
    if (b) b.addEventListener('click', doSignOut);
  } else {
    box.innerHTML =
      `<div class="more-sub">Sign in karke apna plan sync karo + cross-device. Hum sirf
        naam/email lete hain — card number/CVV <b>kabhi nahi</b>.</div>
       <button class="signin-btn" id="signInBtn">🔵 Sign in with Google</button>
       <div class="acct-err" id="acctErr"></div>`;
    const b = $('signInBtn');
    if (b) b.addEventListener('click', doSignIn);
  }
}

async function doSignIn() {
  const btn = $('signInBtn');
  const err = $('acctErr');
  if (btn) { btn.disabled = true; btn.textContent = 'Sign in ho raha hai…'; }
  if (err) err.textContent = '';
  try {
    currentUser = await CardWizAuth.signIn();
    applyAuthToPremium();
    if (syncEnabled) await doSyncNow(); // Phase 10: local cards ko cloud mein merge
    renderMore();
    renderMyCards(); // card-limit gating refresh
  } catch (e) {
    if (err) err.textContent = (e && e.message) || 'Sign-in fail ho gaya';
    if (btn) { btn.disabled = false; btn.textContent = '🔵 Sign in with Google'; }
  }
}

async function doSignOut() {
  if (typeof CardWizAuth !== 'undefined') await CardWizAuth.signOut();
  currentUser = null;
  await loadPremium();   // signed out -> wapas local dev premium flag pe
  renderMore();
  renderMyCards();
}

// Sirf https Google avatar allow — innerHTML injection guard.
function safePictureUrl(url) {
  if (typeof url !== 'string') return '';
  return /^https:\/\//.test(url) ? url.replace(/"/g, '%22') : '';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Cloud Sync (Phase 10) ----------
function loadSyncPref() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) { syncEnabled = true; return resolve(); }
    chrome.storage.local.get(['syncEnabled'], (r) => {
      syncEnabled = r.syncEnabled !== false; // undefined -> true (default ON)
      resolve();
    });
  });
}

function saveSyncPref() {
  if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ syncEnabled });
}

// Pull + merge + push — local aur cloud dono consistent, bina kisi device ka data khoye.
async function doSyncNow() {
  if (!currentUser || !syncEnabled || typeof CardWizSync === 'undefined') return;
  try {
    const merged = await CardWizSync.syncNow(myCards);
    myCards = merged;
    saveWallet();
    renderMyCards();
  } catch (e) { /* offline / token expired — local rehne do */ }
}

// Local change ke baad cloud update (best-effort, signed-in + sync-on pe hi).
function pushIfSyncing() {
  if (!currentUser || !syncEnabled || typeof CardWizSync === 'undefined') return;
  CardWizSync.push(myCards).catch(() => {});
}

async function toggleSync() {
  syncEnabled = !syncEnabled;
  saveSyncPref();
  if (syncEnabled && currentUser) await doSyncNow(); // ON karte hi sync
  renderMore();
  renderMyCards();
}

function renderSync() {
  const box = $('syncBox');
  if (!box) return;
  if (!currentUser) {
    box.innerHTML =
      '<div class="more-sub">Sign in karke cloud sync on karo — phir kisi bhi browser pe login karo, cards apne aap ready. 🔒 Sirf last-4, poora number nahi.</div>';
    return;
  }
  if (syncEnabled) {
    box.innerHTML =
      `<div class="more-sub">✅ <b>ON</b> — aapke cards account se synced. Kahin bhi login karo, sab kuch wahin.
         <br>🔒 Sirf card type, nickname, last-4 (poora number nahi) aur due date.</div>
       <button class="ghost" id="syncToggle" style="margin-top:8px;">Cloud sync OFF karo</button>`;
  } else {
    box.innerHTML =
      `<div class="more-sub">Cloud sync <b>OFF</b> — cards sirf is device pe. On karo to har browser pe milenge.</div>
       <button class="signin-btn" id="syncToggle" style="margin-top:8px;">☁️ Cloud sync ON karo</button>`;
  }
  const b = $('syncToggle');
  if (b) b.addEventListener('click', toggleSync);
}

// Cards-tab privacy line — sync state ke hisaab se honest message.
function updateCardsPrivacy() {
  const el = $('cardsPrivacy');
  if (!el) return;
  if (currentUser && syncEnabled) {
    el.innerHTML = '☁️ Aapke cards account se <b>synced</b> (sirf last-4, poora number nahi). More tab se off kar sakte ho.';
  } else {
    el.innerHTML = '🔒 Aapki details <b>sirf is device pe</b> save hain.<br>Hum full card number ya CVV <b>kabhi</b> nahi maangte/store karte.';
  }
}

function renderMore() {
  const P = window.CardWizPremium;

  // Account / SSO (Phase 8) — sabse upar.
  renderAccount();
  renderSync(); // Cloud Sync card (Phase 10)

  // Premium status + toggle
  els.premiumStatus.innerHTML = isPremium
    ? '<span class="pill pro">PREMIUM</span> Saari features unlocked. Shukriya! 🙏'
    : `<span class="pill free">FREE</span> 1st mahina FREE, phir ₹${P.PREMIUM_MONTHLY_INR}/month · ya ₹${P.PREMIUM_YEARLY_INR}/year (save ₹${P.PREMIUM_MONTHLY_INR * 12 - P.PREMIUM_YEARLY_INR}!).`;
  // Action button — signed in free: plan selector + Razorpay subscription; premium: hidden;
  // signed out: dev toggle (local testing).
  const devNote = $('premiumDevNote');
  const btn = els.premiumToggle;
  if (currentUser) {
    btn.hidden = isPremium;
    btn.textContent = `⭐ 1st Mahina FREE — Upgrade karo`;
    if (devNote) devNote.textContent = isPremium
      ? 'Premium active — account se synced, har device pe.'
      : '🔒 Card save hoga, charge 30 din baad. Auto-renew. Cancel kabhi bhi.';
  } else {
    btn.hidden = false;
    btn.textContent = isPremium ? '↩ Free pe wapas (dev)' : '⭐ Premium on karo (dev)';
    if (devNote) devNote.textContent = 'Sign in karke real upgrade — ya dev toggle (local test).';
  }

  // Analytics (premium-gated)
  renderAnalytics();

  // Affiliate disclosure
  els.affDisclosure.textContent = window.CardWizAffiliate.DISCLOSURE +
    (window.CardWizReferral ? ' ' + window.CardWizReferral.DISCLOSURE : '') +
    ' Networks: Amazon Associates, Flipkart, Cuelinks, card-referral.';

  // About: privacy link + version (manifest se).
  const verEl = $('versionLabel');
  const link = $('privacyLink');
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const mf = chrome.runtime.getManifest();
    if (verEl) verEl.textContent = `v${mf.version}`;
    if (link && !link.dataset.wired) {
      link.dataset.wired = '1';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(chrome.runtime.getURL('privacy.html'), '_blank');
      });
    }
  }
}

function renderAnalytics() {
  const P = window.CardWizPremium;
  if (!P.canUseFeature('spending_analytics', isPremium)) {
    els.analyticsBox.innerHTML =
      `<div class="upgrade-note">🔒 Premium feature<br>Is mahine kis card pe kitna reward kamaaya — dekho.
       <button id="analyticsUpgrade">⭐ 1st mahina FREE — Upgrade karo</button></div>`;
    const b = $('analyticsUpgrade');
    if (b) b.addEventListener('click', togglePremium);
    return;
  }
  // Premium: capUsage se simple monthly reward summary.
  const used = (capUsage && capUsage.used) || {};
  const byCard = {};
  for (const key of Object.keys(used)) {
    const cardId = key.split('::')[0];
    byCard[cardId] = (byCard[cardId] || 0) + used[key];
  }
  const entries = Object.entries(byCard).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    els.analyticsBox.innerHTML = '<div class="more-sub">Abhi koi reward log nahi. Suggest tab pe "✓ Use kiya" se track karo.</div>';
    return;
  }
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let html = `<div class="more-sub">Is mahine (${capUsage.period}) total reward: <b>₹${Math.round(total)}</b></div>`;
  for (const [cardId, val] of entries) {
    const cat = catalogCard(cardId);
    html += `<div class="more-sub">• ${cat ? cat.name : cardId}: ₹${Math.round(val)}</div>`;
  }
  els.analyticsBox.innerHTML = html;
}

function catalogCard(cardId) {
  return DB.cards.find((c) => c.id === cardId);
}

// ---------- My Cards view (CRUD) ----------
function renderMyCards() {
  updateCardsPrivacy(); // sync-aware privacy line (Phase 10)
  const stale = $('limitNote');
  if (stale) stale.remove();
  // Tab toggle ka active state set karo.
  document.querySelectorAll('.cards-tabs button').forEach((b) =>
    b.classList.toggle('active', b.dataset.cardtype === cardsTab));

  els.cardsList.innerHTML = '';

  // Sirf active tab (credit ya debit) ke cards dikhao.
  const items = [];
  for (const mc of myCards) {
    const cat = catalogCard(mc.cardId);
    if (!cat) continue; // catalog se hata diya gaya card (rare)
    if (cardTypeOf(cat) === cardsTab) items.push({ mc, cat });
  }

  if (items.length === 0) {
    els.cardsList.innerHTML =
      `<div class="empty">Koi ${cardsTab} card nahi. Neeche se add karo 👇</div>`;
    return;
  }
  for (const { mc, cat } of items) els.cardsList.appendChild(makeCardRow(mc, cat));
}

// Ek wallet-card ka row banao (credit + debit dono ke liye same).
function makeCardRow(mc, cat) {
  const row = document.createElement('div');
  row.className = 'mycard';

  const info = document.createElement('div');
  info.className = 'info';
  const nick = document.createElement('div');
  nick.className = 'nick';
  nick.textContent = mc.nickname ? `${mc.nickname}` : cat.name;
  const meta = document.createElement('div');
  meta.className = 'meta';
  const last4 = mc.last4 ? ` · •••• ${mc.last4}` : '';
  const dueInfo = mc.dueDay ? ` · 🔔 due ${mc.dueDay}` : '';
  meta.textContent = (mc.nickname ? cat.name : cat.bank) + last4 + dueInfo;
  info.appendChild(nick);
  info.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'actions';
  const editBtn = document.createElement('button');
  editBtn.className = 'edit';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => openForm(mc.id));
  const delBtn = document.createElement('button');
  delBtn.className = 'del';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => deleteCard(mc.id));
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  row.appendChild(info);
  row.appendChild(actions);
  return row;
}

// Debit card pe bill due/reminder fields hide (debit = no bill cycle).
function updateFormForCardType() {
  const box = $('dueDateFields');
  if (!box) return;
  const isDebit = cardTypeOf(catalogCard(els.formCardId.value)) === 'debit';
  box.hidden = isDebit;
  if (isDebit) els.formDueDay.value = ''; // saved value bhi clear
}

function openForm(editId = null) {
  // Phase 6: free tier card-limit gate (sirf naye card pe, edit pe nahi).
  if (!editId) {
    const uniqueCount = ownedUniqueIds().length;
    if (window.CardWizPremium.cardLimitReached(myCards.length, isPremium)) {
      const max = window.CardWizPremium.FREE_LIMITS.maxCards;
      els.cardsList.insertAdjacentHTML('afterend',
        `<div class="upgrade-note" id="limitNote">🔒 Free tier mein ${max} cards tak. Unlimited ke liye Premium.
         <button id="limitUpgrade">⭐ 1st mahina FREE — Premium on karo</button></div>`);
      const b = $('limitUpgrade');
      if (b) b.addEventListener('click', () => { switchView('more'); const n = $('limitNote'); if (n) n.remove(); });
      void uniqueCount;
      return;
    }
  }
  editingId = editId;
  els.formErr.textContent = '';
  if (editId) {
    const mc = myCards.find((c) => c.id === editId);
    els.formCardId.value = mc.cardId;
    els.formNickname.value = mc.nickname || '';
    els.formLast4.value = mc.last4 || '';
    els.formDueDay.value = mc.dueDay || '';
    els.formRemindBefore.value = mc.reminderDaysBefore != null ? mc.reminderDaysBefore : 3;
    els.saveCardBtn.textContent = 'Update';
  } else {
    els.formNickname.value = '';
    els.formLast4.value = '';
    els.formDueDay.value = '';
    els.formRemindBefore.value = 3;
    els.saveCardBtn.textContent = 'Save';
  }
  updateFormForCardType(); // debit -> bill due fields hide
  els.cardForm.hidden = false;
  els.addCardBtn.hidden = true;
}

function closeForm() {
  els.cardForm.hidden = true;
  els.addCardBtn.hidden = false;
  editingId = null;
}

function saveCard() {
  const cardId = els.formCardId.value;
  const nickname = els.formNickname.value.trim();
  const last4 = els.formLast4.value.trim();
  const dueDayRaw = els.formDueDay.value.trim();
  const remindRaw = els.formRemindBefore.value.trim();

  // Validation: last4 optional, par agar diya to exactly 4 digits.
  if (last4 && !/^\d{4}$/.test(last4)) {
    els.formErr.textContent = 'Last 4 digits exactly 4 ank hone chahiye (ya khaali chhodo).';
    return;
  }
  // dueDay optional, par agar diya to 1-31.
  let dueDay = null;
  if (dueDayRaw) {
    const d = parseInt(dueDayRaw, 10);
    if (isNaN(d) || d < 1 || d > 31) {
      els.formErr.textContent = 'Due date 1 se 31 ke beech hona chahiye (ya khaali chhodo).';
      return;
    }
    dueDay = d;
  }
  let reminderDaysBefore = 3;
  if (remindRaw) {
    const r = parseInt(remindRaw, 10);
    if (!isNaN(r) && r >= 0 && r <= 15) reminderDaysBefore = r;
  }

  // Debit card pe bill due nahi — force null (defense, fields hidden hote hi hain).
  if (cardTypeOf(catalogCard(cardId)) === 'debit') dueDay = null;
  const fields = { cardId, nickname, last4, dueDay, reminderDaysBefore, updatedAt: new Date().toISOString() };
  if (editingId) {
    const mc = myCards.find((c) => c.id === editingId);
    Object.assign(mc, fields);
  } else {
    myCards.push({ id: uid(), ...fields });
  }
  cardsTab = cardTypeOf(catalogCard(cardId)); // added/edited card ke tab pe switch
  saveWallet();
  pushIfSyncing(); // Phase 10: cloud update
  renderMyCards();
  closeForm();
}

function deleteCard(id) {
  if (!confirm('Yeh card hata dein?')) return;
  myCards = myCards.filter((c) => c.id !== id);
  saveWallet();
  pushIfSyncing(); // Phase 10: cloud update
  renderMyCards();
}

// ---------- Bills dashboard (Phase 4) ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function renderBills() {
  els.billsList.innerHTML = '';
  const withDue = myCards.filter((c) => c.dueDay);

  if (withDue.length === 0) {
    els.billsList.innerHTML =
      '<div class="empty">Kisi card pe due date set nahi.<br>"💼 Cards" mein card edit karke due date daalo.</div>';
    return;
  }

  const today = new Date();
  const R = window.CardWizReminders;

  // Sabse pehle jo due ho, woh upar.
  const rows = withDue
    .map((mc) => ({ mc, status: R.dueStatus(mc.dueDay, mc.reminderDaysBefore, today) }))
    .sort((a, b) => a.status.days - b.status.days);

  for (const { mc, status } of rows) {
    const cat = catalogCard(mc.cardId);
    if (!cat) continue;
    const name = mc.nickname || cat.name;

    const row = document.createElement('div');
    row.className = `bill-row ${status.level}`;

    const left = document.createElement('div');
    const bname = document.createElement('div');
    bname.className = 'bname';
    bname.textContent = name;
    const bmeta = document.createElement('div');
    bmeta.className = 'bmeta';
    const dueStr = `${status.due.getDate()} ${MONTHS[status.due.getMonth()]}`;
    bmeta.textContent = `Due ${dueStr}${mc.last4 ? ' · •••• ' + mc.last4 : ''}`;
    left.appendChild(bname);
    left.appendChild(bmeta);

    const right = document.createElement('div');
    right.className = 'bill-right';
    const bdays = document.createElement('div');
    bdays.className = 'bdays';
    bdays.textContent = status.days <= 0 ? 'Aaj due!' : status.days === 1 ? 'Kal due' : `${status.days} din`;
    const pay = document.createElement('button');
    pay.className = 'pay';
    pay.textContent = 'Pay Now ↗';
    pay.addEventListener('click', () => payNow(cat.bank));
    right.appendChild(bdays);
    right.appendChild(pay);

    row.appendChild(left);
    row.appendChild(right);
    els.billsList.appendChild(row);
  }
}

// Hum payment NAHI karte — bank/CRED ka bill-pay page kholte hain.
function payNow(bank) {
  const url = BANK_PAY_URLS[bank] || CRED_URL;
  window.open(url, '_blank', 'noopener');
}

// ---------- Recommendation ----------
function ownedUniqueIds() {
  return [...new Set(myCards.map((c) => c.cardId))];
}

function runRecommendation() {
  const category = els.category.value;
  const amount = Number(els.amount.value) || 0;
  const opts = { category, amount };

  if (els.onlyMine.checked) {
    const owned = ownedUniqueIds();
    if (owned.length === 0) {
      els.results.innerHTML =
        '<div class="empty">Pehle "💼 Cards" mein apne cards add karo.</div>';
      els.capsFoot.hidden = true;
      return;
    }
    opts.ownedCardIds = owned;
  }

  // Phase 5: cap-aware ranking — used caps factor karo.
  opts.getRemaining = window.CardWizCapTracker.makeGetRemaining(capUsage, new Date());

  const ranked = window.CardWizEngine.recommend(DB, opts);
  lastRanked = ranked;
  renderResults(ranked);

  // Caps footer: current period + reset.
  els.capsPeriod.textContent = `📅 Caps period: ${capUsage.period}`;
  els.capsFoot.hidden = false;
}

// "✓ Use kiya" — top card ka reward is mahine ke cap mein log karo.
function logUsageFor(result) {
  if (!result || !result.rule || result.savings <= 0) return;
  capUsage = window.CardWizCapTracker.logUsage(capUsage, result.id, result.rule, result.savings, new Date());
  saveCapUsage();
  runRecommendation(); // re-rank with updated caps
}

// myCards mein is cardId ka nickname (agar ho) — results mein dikhane ke liye.
function nicknameFor(cardId) {
  const mc = myCards.find((c) => c.cardId === cardId && c.nickname);
  return mc ? mc.nickname : null;
}

function renderResults(ranked) {
  els.results.innerHTML = '';
  if (ranked.length === 0) {
    els.results.innerHTML = '<div class="empty">Koi card nahi mila</div>';
    return;
  }

  const ownedSet = new Set(ownedUniqueIds());

  ranked.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'card-row';
    if (r.savings <= 0) row.classList.add('zero');
    else if (i === 0) row.classList.add('best');
    if (r.capExhausted) row.classList.add('exhausted');

    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    const nick = nicknameFor(r.id);
    const star = i === 0 && r.savings > 0 ? '⭐ ' : '';
    name.textContent = star + (nick ? `${nick}` : r.name);
    // Debit card ho to chhota DEBIT tag (payment ke time clarity ke liye).
    if (cardTypeOf(catalogCard(r.id)) === 'debit') {
      const tag = document.createElement('span');
      tag.className = 'type-tag';
      tag.textContent = 'DEBIT';
      name.appendChild(tag);
    }
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = r.excluded ? 'Is category pe reward nahi' : (nick ? r.name : r.note);
    left.appendChild(name);
    left.appendChild(sub);

    // Top card: owned -> "✓ Use kiya" (cap log); not owned -> "Apply" (referral).
    if (i === 0 && r.savings > 0 && !r.excluded) {
      if (ownedSet.has(r.id)) {
        const logBtn = document.createElement('button');
        logBtn.className = 'log-btn';
        logBtn.textContent = '✓ Ye card use kiya';
        logBtn.addEventListener('click', () => logUsageFor(r));
        left.appendChild(logBtn);
      } else {
        const applyBtn = document.createElement('button');
        applyBtn.className = 'apply-btn';
        applyBtn.textContent = 'Apply for this card ↗';
        applyBtn.addEventListener('click', () => openApply({ id: r.id, name: r.name }));
        left.appendChild(applyBtn);
      }
    }

    const right = document.createElement('div');
    const save = document.createElement('div');
    save.className = 'save';
    let badge = '';
    if (r.capExhausted) badge = '<span class="badge khatam">cap khatam</span>';
    else if (r.capped) badge = '<span class="badge">cap</span>';
    save.innerHTML = r.savings > 0 ? `₹${r.savings}${badge}` : '—';
    const rate = document.createElement('div');
    rate.className = 'rate';
    rate.textContent = r.savings > 0 ? `${r.rate}% reward` : '';
    right.appendChild(save);
    right.appendChild(rate);

    row.appendChild(left);
    row.appendChild(right);
    els.results.appendChild(row);
  });
}

// ---------- Referral / Sponsored (Phase 6.5 monetization) ----------
function openApply(card) {
  if (typeof CardWizReferral === 'undefined') return;
  const url = CardWizReferral.getApplyUrl(card);
  if (url) window.open(url, '_blank', 'noopener');
}

// Sponsored card — sirf FREE users ko (premium = ad-free). Catalog mein na ho to hide.
function renderFeatured() {
  const box = $('featuredBox');
  if (!box) return;
  const feat = (typeof CardWizReferral !== 'undefined') ? CardWizReferral.getFeatured() : null;
  const cat = feat ? catalogCard(feat.cardId) : null;
  if (isPremium || !feat || !cat) { box.hidden = true; box.innerHTML = ''; return; }

  box.hidden = false;
  box.innerHTML =
    `<div class="featured">
       <span class="spon-badge">SPONSORED</span>
       <div class="featured-name">${escapeHtml(cat.name)}</div>
       <div class="featured-blurb">${escapeHtml(feat.blurb)}</div>
       <button class="featured-apply" id="featuredApply">Apply ↗</button>
       <div class="featured-note">Referral — apply/approve pe hame commission, aapko extra cost nahi.</div>
     </div>`;
  const b = $('featuredApply');
  if (b) b.addEventListener('click', () => {
    const url = CardWizReferral.getFeaturedApplyUrl({ id: feat.cardId, name: cat.name });
    if (url) window.open(url, '_blank', 'noopener');
  });
}

init();
