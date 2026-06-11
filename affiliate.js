/*
 * RewardXtra — Affiliate Link Builder (Phase 6)
 * --------------------------------------------------
 * Merchant + page URL -> affiliate-tagged URL. Free tier ka revenue source.
 *
 * IMPORTANT (transparency): har affiliate link ke saath disclosure dikhana ZAROORI hai
 * (Chrome Web Store policy + user trust): "Hum chhota commission kamaate hain, aapko
 * koi extra cost nahi." User ke liye price same rehta hai.
 *
 * Pure logic, koi DOM nahi — Node mein testable.
 *
 * ⚠️ Neeche ke IDs PLACEHOLDER hain. Networks pe sign-up karke real IDs daalo:
 *    - Amazon Associates: https://affiliate-program.amazon.in
 *    - Flipkart Affiliate / via Cuelinks/INRDeals (India)
 */

const DEFAULT_AFFILIATE_CONFIG = {
  amazon: { tag: 'smartcardsav-21' },        // Amazon Associates "tag" — REPLACE
  flipkart: { affid: 'smartcardsaver' },     // Flipkart affiliate id   — REPLACE
  // Myntra/baaki ke liye Cuelinks/INRDeals universal wrapper (enable + cid daalo):
  cuelinks: { cid: '', enabled: false },
};

const DISCLOSURE =
  '💡 Hum affiliate link se chhota commission kamaate hain — aapko koi extra cost nahi.';

// URL pe ek query param safely set karo (existing params todhe bina).
function setParam(url, key, value) {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch (_) {
    return url; // invalid URL -> jaisa hai waisa
  }
}

function amazonLink(url, tag) {
  return tag ? setParam(url, 'tag', tag) : url;
}

function flipkartLink(url, affid) {
  return affid ? setParam(url, 'affid', affid) : url;
}

// Universal network (Cuelinks/INRDeals) — destination URL ko wrap karta hai.
function cuelinksLink(url, cid) {
  if (!cid) return url;
  return `https://linksredirect.com/?cid=${encodeURIComponent(cid)}&source=linkkit&url=${encodeURIComponent(url)}`;
}

/**
 * Affiliated URL banao.
 * @param {string} merchant - 'amazon' | 'flipkart' | 'myntra' | ...
 * @param {string} url      - current page/product URL
 * @param {object} [config] - affiliate IDs (DEFAULT_AFFILIATE_CONFIG)
 * @returns {{url:string, affiliated:boolean, network:string|null, disclosure:string}}
 */
function affiliateUrl(merchant, url, config) {
  const cfg = config || DEFAULT_AFFILIATE_CONFIG;
  if (!url) return { url, affiliated: false, network: null, disclosure: DISCLOSURE };

  let out = url, network = null;
  if (merchant === 'amazon' && cfg.amazon && cfg.amazon.tag) {
    out = amazonLink(url, cfg.amazon.tag); network = 'Amazon Associates';
  } else if (merchant === 'flipkart' && cfg.flipkart && cfg.flipkart.affid) {
    out = flipkartLink(url, cfg.flipkart.affid); network = 'Flipkart Affiliate';
  } else if (cfg.cuelinks && cfg.cuelinks.enabled && cfg.cuelinks.cid) {
    // Myntra + koi bhi aur merchant -> universal network.
    out = cuelinksLink(url, cfg.cuelinks.cid); network = 'Cuelinks';
  }

  return { url: out, affiliated: out !== url, network, disclosure: DISCLOSURE };
}

// ---------- Exports (browser/worker/node) ----------
// unique const naam — classic scripts shared global scope mein collide na ho.
const affiliateApi = { DEFAULT_AFFILIATE_CONFIG, DISCLOSURE, affiliateUrl, amazonLink, flipkartLink, cuelinksLink };
if (typeof module !== 'undefined' && module.exports) module.exports = affiliateApi;
if (typeof globalThis !== 'undefined') globalThis.SmartCardAffiliate = affiliateApi;
