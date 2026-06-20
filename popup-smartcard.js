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
let bestTier = 'elite'; // Best Cards (Tab 1) tier filter: elite|premium|solid (default Elite)

// ---------- Init ----------
async function init() {
  await CardWizI18n.loadLang();   // language pref (default en)
  CardWizI18n.applyStaticI18n();  // static UI strings translate
  applyExtTitle();                // icon tooltip in selected language
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
  renderBestCards(); // Tab 1: curated "best cards in market"
  // renderFeatured(); // Sponsored card — TEMPORARILY DISABLED (TODO: re-enable elsewhere)

  // View switching
  document.querySelectorAll('nav button').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Cards section ke Debit/Credit toggle tabs
  document.querySelectorAll('.cards-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => { cardsTab = btn.dataset.cardtype; buildCardSelect(); renderMyCards(); });
  });

  // Best Cards tier filter
  document.querySelectorAll('#bestFilter button').forEach((btn) => {
    btn.addEventListener('click', () => { bestTier = btn.dataset.tier; renderBestCards(); });
  });

  // Card info modal close (X button ya overlay pe click)
  const modal = $('cardInfoModal');
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeCardInfo(); });

  // CIBIL score checker button
  const cibilBtn = $('cibilBtn');
  if (cibilBtn) cibilBtn.addEventListener('click', openCibil);

  // Quiz teaser → open /find-my-card on cardwiz.in
  const quizTeaserBtn = $('quizTeaserBtn');
  if (quizTeaserBtn) quizTeaserBtn.addEventListener('click', () => {
    window.open('https://cardwiz.in/find-my-card', '_blank', 'noopener');
  });

  // Language buttons (English / Hinglish / Hindi)
  document.querySelectorAll('#langBtns button').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  syncLangButtons();

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
  $('view-best').hidden = view !== 'best';
  $('view-suggest').hidden = view !== 'suggest';
  $('view-mycards').hidden = view !== 'mycards';
  $('view-more').hidden = view !== 'more';
  if (view === 'best') renderBestCards();
  if (view === 'more') renderMore();
  // if (view === 'suggest') renderFeatured(); // Sponsored — TEMPORARILY DISABLED
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
  // Signed in & not premium: pricing website pe bhejo (payment ab extension mein direct nahi).
  if (currentUser) {
    if (!isPremium) openPricing();
    return;
  }
  // Signed out: dev toggle (local testing ke liye).
  isPremium = !isPremium;
  if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ isPremium });
  renderMore();
  renderMyCards(); // card-limit gating refresh
}

// Subscribe ab direct pay nahi karta — cardwiz.in/pricing kholta hai (3 plans wahan).
function openPricing() {
  const url = (window.CardWizPremium && window.CardWizPremium.PRICING_URL) || 'https://cardwiz.in/pricing';
  window.open(url, '_blank', 'noopener');
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
       <button class="ghost" id="signOutBtn" style="margin-top:10px;">${escapeHtml(CardWizI18n.t('acc_signout'))}</button>`;
    const b = $('signOutBtn');
    if (b) b.addEventListener('click', doSignOut);
  } else {
    box.innerHTML =
      `<div class="more-sub">${escapeHtml(CardWizI18n.t('acc_blurb'))}</div>
       <button class="signin-btn" id="signInBtn">${escapeHtml(CardWizI18n.t('acc_signin'))}</button>
       <div class="acct-err" id="acctErr"></div>`;
    const b = $('signInBtn');
    if (b) b.addEventListener('click', doSignIn);
  }
}

async function doSignIn() {
  const btn = $('signInBtn');
  const err = $('acctErr');
  if (btn) { btn.disabled = true; btn.textContent = CardWizI18n.t('acc_signing'); }
  if (err) err.textContent = '';
  try {
    currentUser = await CardWizAuth.signIn();
    applyAuthToPremium();
    if (syncEnabled) await doSyncNow(); // Phase 10: local cards ko cloud mein merge
    renderMore();
    renderMyCards(); // card-limit gating refresh
  } catch (e) {
    if (err) err.textContent = (e && e.message) || 'Sign-in fail ho gaya';
    if (btn) { btn.disabled = false; btn.textContent = CardWizI18n.t('acc_signin'); }
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
    box.innerHTML = `<div class="more-sub">${CardWizI18n.t('sync_signin')}</div>`;
    return;
  }
  if (syncEnabled) {
    box.innerHTML =
      `<div class="more-sub">${CardWizI18n.t('sync_on_msg')}</div>
       <button class="ghost" id="syncToggle" style="margin-top:8px;">${escapeHtml(CardWizI18n.t('sync_off_btn'))}</button>`;
  } else {
    box.innerHTML =
      `<div class="more-sub">${CardWizI18n.t('sync_off_msg')}</div>
       <button class="signin-btn" id="syncToggle" style="margin-top:8px;">${escapeHtml(CardWizI18n.t('sync_on_btn'))}</button>`;
  }
  const b = $('syncToggle');
  if (b) b.addEventListener('click', toggleSync);
}

// Cards-tab privacy line — sync state ke hisaab se honest message.
function updateCardsPrivacy() {
  const el = $('cardsPrivacy');
  if (!el) return;
  if (currentUser && syncEnabled) {
    el.innerHTML = CardWizI18n.t('cards_synced');
  } else {
    el.innerHTML = CardWizI18n.t('cards_local');
  }
}

function renderMore() {
  const P = window.CardWizPremium;

  // Account / SSO (Phase 8) — sabse upar.
  renderAccount();
  renderSync(); // Cloud Sync card (Phase 10)

  // Premium status + toggle
  const freeMsg = CardWizI18n.t('prem_free')
    .replace('{m}', P.PREMIUM_MONTHLY_INR).replace('{y}', P.PREMIUM_YEARLY_INR)
    .replace('{s}', P.PREMIUM_MONTHLY_INR * 12 - P.PREMIUM_YEARLY_INR);
  els.premiumStatus.innerHTML = isPremium
    ? `<span class="pill pro">PREMIUM</span> ${escapeHtml(CardWizI18n.t('prem_active'))}`
    : `<span class="pill free">FREE</span> ${escapeHtml(freeMsg)}`;
  // Action button — signed in free: plan selector + Razorpay subscription; premium: hidden;
  // signed out: dev toggle (local testing).
  const devNote = $('premiumDevNote');
  const btn = els.premiumToggle;
  if (currentUser) {
    btn.hidden = isPremium;
    btn.textContent = CardWizI18n.t('prem_upgrade');
    if (devNote) devNote.textContent = isPremium
      ? CardWizI18n.t('prem_note_active')
      : CardWizI18n.t('prem_note_upgrade');
  } else {
    btn.hidden = false;
    btn.textContent = isPremium ? CardWizI18n.t('prem_dev_off') : CardWizI18n.t('prem_dev_on');
    if (devNote) devNote.textContent = CardWizI18n.t('prem_note_out');
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
      `<div class="upgrade-note">${CardWizI18n.t('an_locked')}
       <button id="analyticsUpgrade">${escapeHtml(CardWizI18n.t('prem_upgrade'))}</button></div>`;
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
    els.analyticsBox.innerHTML = `<div class="more-sub">${escapeHtml(CardWizI18n.t('an_none'))}</div>`;
    return;
  }
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let html = `<div class="more-sub">${escapeHtml(CardWizI18n.t('an_total'))} (${capUsage.period}): <b>₹${Math.round(total)}</b></div>`;
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
      `<div class="empty">${escapeHtml(CardWizI18n.t('mc_empty'))}</div>`;
    return;
  }
  for (const { mc, cat } of items) els.cardsList.appendChild(makeCardRow(mc, cat));
}

// Ek wallet-card ka row banao (credit + debit dono ke liye same).
// Bill due date set ho to due-status + "Pay Now" button bhi (bills ab yahin merge).
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

  // Bill due — days-left dikhao (CardWizReminders se).
  let dueInfo = '';
  if (mc.dueDay && window.CardWizReminders) {
    const st = window.CardWizReminders.dueStatus(mc.dueDay, mc.reminderDaysBefore, new Date());
    const when = st.days <= 0 ? 'aaj due!' : st.days === 1 ? 'kal due' : `${st.days} din mein due`;
    dueInfo = ` · 🔔 ${when}`;
  } else if (mc.dueDay) {
    dueInfo = ` · 🔔 due ${mc.dueDay}`;
  }
  meta.textContent = (mc.nickname ? cat.name : cat.bank) + last4 + dueInfo;
  info.appendChild(nick);
  info.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'actions';
  // Pay Now — sirf jab bill due date set ho (credit cards).
  if (mc.dueDay) {
    const payBtn = document.createElement('button');
    payBtn.className = 'pay-now';
    payBtn.textContent = CardWizI18n.t('act_pay');
    payBtn.title = 'Apne bank/CRED pe bill pay karo';
    payBtn.addEventListener('click', () => payNow(cat.bank));
    actions.appendChild(payBtn);
  }
  const editBtn = document.createElement('button');
  editBtn.className = 'edit';
  editBtn.textContent = CardWizI18n.t('act_edit');
  editBtn.addEventListener('click', () => openForm(mc.id));
  const delBtn = document.createElement('button');
  delBtn.className = 'del';
  delBtn.textContent = CardWizI18n.t('act_delete');
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
        `<div class="empty">${escapeHtml(CardWizI18n.t('sg_add_first'))}</div>`;
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
    els.results.innerHTML = `<div class="empty">${escapeHtml(CardWizI18n.t('sg_no_card'))}</div>`;
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
    sub.textContent = r.excluded ? CardWizI18n.t('sg_no_reward') : (nick ? r.name : r.note);
    left.appendChild(name);
    left.appendChild(sub);

    // Top card: owned -> "✓ Use kiya" (cap log); not owned -> "Apply" (referral).
    if (i === 0 && r.savings > 0 && !r.excluded) {
      if (ownedSet.has(r.id)) {
        const logBtn = document.createElement('button');
        logBtn.className = 'log-btn';
        logBtn.textContent = CardWizI18n.t('sg_used');
        logBtn.addEventListener('click', () => logUsageFor(r));
        left.appendChild(logBtn);
      } else {
        const applyBtn = document.createElement('button');
        applyBtn.className = 'apply-btn';
        applyBtn.textContent = CardWizI18n.t('act_apply_this');
        applyBtn.addEventListener('click', () => openApply({ id: r.id, name: r.name }));
        left.appendChild(applyBtn);
      }

      // "Why this card" — show savings gap vs next best
      if (ranked.length > 1) {
        const diff = r.savings - ranked[1].savings;
        if (diff > 0) {
          const whyEl = document.createElement('div');
          whyEl.className = 'why-cmp';
          whyEl.textContent = CardWizI18n.t('why_extra').replace('{d}', diff);
          left.appendChild(whyEl);
        }
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
    rate.textContent = r.savings > 0 ? `${r.rate}% ${CardWizI18n.t('sg_reward')}` : '';
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

// ---------- Best Cards (Tab 1) ----------
function renderBestCards() {
  const list = $('bestCardsList');
  if (!list || typeof CardWizBestCards === 'undefined') return;
  const { BEST_CARDS, TIER_META, BADGE_ICONS } = CardWizBestCards;

  document.querySelectorAll('#bestFilter button').forEach((b) =>
    b.classList.toggle('active', b.dataset.tier === bestTier));

  const cards = BEST_CARDS.filter((c) => bestTier === 'all' || c.tier === bestTier);

  list.innerHTML = '';
  for (const card of cards) {
    const tm = TIER_META[card.tier] || {};
    const el = document.createElement('div');
    el.className = `bestcard lvl-${card.tier}`;
    el.innerHTML =
      `<div class="bc-name">${escapeHtml(card.name)} <span class="bc-tier-icon" title="${escapeHtml(tm.label || '')}">${tm.icon}</span></div>
       <div class="bc-badges">${card.badges.map((bd) => `<span class="bc-badge">${(BADGE_ICONS[bd] || '🏷️')} ${escapeHtml(CardWizI18n.tBadge(bd))}</span>`).join('')}</div>
       <div class="bc-actions">
         <button class="bc-info">${escapeHtml(CardWizI18n.t('act_info'))}</button>
         <button class="bc-apply">${escapeHtml(CardWizI18n.t('act_apply'))}</button>
       </div>`;
    el.querySelector('.bc-info').addEventListener('click', () => openCardInfo(card));
    el.querySelector('.bc-apply').addEventListener('click', () => openApply({ id: card.cardId, name: card.name }));
    list.appendChild(el);
  }

  const disc = $('bestDisclosure');
  if (disc) disc.textContent = (typeof CardWizReferral !== 'undefined') ? CardWizReferral.DISCLOSURE : '';
}

// Card content language ke hisaab se (bestcards-i18n.js); missing -> English base.
function cardField(card, field) {
  const lang = CardWizI18n.getLang();
  const all = (typeof CardWizBestCardsI18n !== 'undefined') && CardWizBestCardsI18n.BEST_CARDS_I18N;
  const tr = all && all[card.cardId];
  if (tr && tr[lang] && tr[lang][field] != null) return tr[lang][field];
  return card[field]; // English base (bestcards.js). Card NAME kabhi translate nahi.
}

// Card info modal — features / pros / cons / useful-for + Apply (andar bhi).
function openCardInfo(card) {
  const modal = $('cardInfoModal');
  const box = $('cardInfoBox');
  if (!modal || !box) return;
  const tm = (CardWizBestCards.TIER_META[card.tier]) || {};
  const li = (arr) => (arr || []).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  box.innerHTML =
    `<div class="m-hd">
       <div class="m-name">${escapeHtml(card.name)} <span class="bc-tier-icon" title="${escapeHtml(tm.label || '')}">${tm.icon}</span></div>
       <button class="m-x" id="cardInfoClose">✕</button>
     </div>
     <div class="m-sec feat"><h4>${escapeHtml(CardWizI18n.t('md_features'))}</h4><ul>${li(cardField(card, 'features'))}</ul></div>
     <div class="m-sec pros"><h4>${escapeHtml(CardWizI18n.t('md_pros'))}</h4><ul>${li(cardField(card, 'pros'))}</ul></div>
     <div class="m-sec cons"><h4>${escapeHtml(CardWizI18n.t('md_cons'))}</h4><ul>${li(cardField(card, 'cons'))}</ul></div>
     <div class="m-sec use"><h4>${escapeHtml(CardWizI18n.t('md_useful'))}</h4><div class="m-use">${escapeHtml(cardField(card, 'usefulFor') || '')}</div></div>
     <button class="m-apply" id="cardInfoApply">${escapeHtml(CardWizI18n.t('act_apply_this'))}</button>
     <div class="m-disc">${(typeof CardWizReferral !== 'undefined') ? escapeHtml(CardWizReferral.DISCLOSURE) : ''}</div>`;
  $('cardInfoClose').addEventListener('click', closeCardInfo);
  $('cardInfoApply').addEventListener('click', () => openApply({ id: card.cardId, name: card.name }));
  modal.hidden = false;
  // Background scroll lock — html + body dono (popup scroll html pe hota hai).
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function closeCardInfo() {
  const modal = $('cardInfoModal');
  if (modal) modal.hidden = true;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

// ---------- CIBIL score checker (affiliate redirect) ----------
// ⚠️ TODO: Replace with your Paisabazaar affiliate deep link once sign-up is done.
//    Affiliate program: https://www.paisabazaar.com/affiliate
const CIBIL_PARTNER_URL = 'https://www.paisabazaar.com/credit-score/';

function openCibil() {
  window.open(CIBIL_PARTNER_URL, '_blank', 'noopener');
  const note = $('cibilNote');
  if (note) note.textContent = CardWizI18n.t('cb_redirect');
}

// ---------- Language (English / Hinglish / Hindi) ----------
function syncLangButtons() {
  const code = CardWizI18n.getLang();
  document.querySelectorAll('#langBtns button').forEach((b) =>
    b.classList.toggle('active', b.dataset.lang === code));
}

// Extension icon ka hover tooltip (action title) — selected language mein.
function applyExtTitle() {
  try {
    if (typeof chrome !== 'undefined' && chrome.action && chrome.action.setTitle) {
      chrome.action.setTitle({ title: CardWizI18n.t('ext_title') });
    }
  } catch (_) { /* ignore */ }
}

function setLanguage(code) {
  CardWizI18n.saveLang(code);
  CardWizI18n.applyStaticI18n();      // static [data-i18n] strings
  syncLangButtons();
  applyExtTitle();                    // icon tooltip
  renderBestCards();                  // dynamic (JS-generated) strings
  renderMyCards();
  renderMore();                       // account/sync/premium/analytics dynamic strings
}

init();
