/*
 * Central config — saari env values ek jagah, validate karke.
 * .env se load hota hai (dotenv). Agar zaroori value missing ho to saaf error.
 */
'use strict';

require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  databaseUrl: process.env.DATABASE_URL || '',
  // comma-separated list -> array (khaali entries hata do)
  allowedExtensionIds: (process.env.ALLOWED_EXTENSION_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Website origins jo backend ko call kar sakti hain (CORS). Prod defaults baked in;
  // ALLOWED_WEB_ORIGINS env se override ho sakta hai.
  allowedWebOrigins: (process.env.ALLOWED_WEB_ORIGINS ||
    'https://cardwiz.in,https://www.cardwiz.in,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Razorpay (Phase 11 — premium payments)
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  premiumMonthlyInr: Number(process.env.PREMIUM_MONTHLY_INR) || 49,
  premiumYearlyInr:  Number(process.env.PREMIUM_YEARLY_INR)  || 299,
  premiumTrialDays:  Number(process.env.PREMIUM_TRIAL_DAYS)  || 30,
  // backward compat
  get premiumPriceInr() { return this.premiumMonthlyInr; },
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};

// Razorpay keys set hain? (payment routes isse guard karte hain)
function razorpayConfigured() {
  return !!(config.razorpayKeyId && config.razorpayKeySecret);
}

// Startup pe hi check — galat config silently chalne se accha hai abhi fail ho.
function validate() {
  const problems = [];
  if (!config.googleClientId || config.googleClientId.startsWith('YOUR_CLIENT_ID')) {
    problems.push('GOOGLE_CLIENT_ID set nahi — Google Cloud Console se OAuth client banao (README dekho).');
  }
  if (!config.jwtSecret || config.jwtSecret === 'change-me-to-a-long-random-string') {
    problems.push('JWT_SECRET set nahi — koi lamba random string daalo (README dekho).');
  }
  if (!razorpayConfigured()) {
    problems.push('RAZORPAY_KEY_ID/SECRET set nahi — premium payments ke liye test keys daalo (README). (Baaki sab chalega.)');
  }
  return problems;
}

module.exports = { config, validate, razorpayConfigured };
