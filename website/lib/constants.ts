/*
 * Site-wide constants — single source of truth.
 *
 * CHROME WEB STORE: extension abhi publish nahi hui. Jab listing live ho jaye:
 *   1. EXTENSION_PUBLISHED → true
 *   2. CHROME_STORE_URL mein real <extension-id> daal do
 * Tab tak saari "Add to Chrome" buttons launch-notify (mailto) pe jaati hain —
 * koi dead/generic store-homepage link nahi.
 */
export const EXTENSION_PUBLISHED = false;

// ⚠️ Publish hone ke baad <EXTENSION-ID> replace karo.
export const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/cardwiz/EXTENSION_ID_HERE";

export const NOTIFY_EMAIL = "gurpreetsj8871@gmail.com";

const NOTIFY_LAUNCH_HREF = `mailto:${NOTIFY_EMAIL}?subject=${encodeURIComponent(
  "CardWiz extension — launch pe notify karo",
)}&body=${encodeURIComponent(
  "Mujhe CardWiz Chrome extension launch hone par email bhej dena. Dhanyavaad!",
)}`;

/** Har "Add to Chrome" button yahin point kare. */
export const INSTALL_HREF = EXTENSION_PUBLISHED ? CHROME_STORE_URL : NOTIFY_LAUNCH_HREF;

/** Install button ka label i18n key — publish-state ke hisaab se. */
export const INSTALL_CTA_KEY = EXTENSION_PUBLISHED ? "cta_install" : "cta_notify";
