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
};

// Startup pe hi check — galat config silently chalne se accha hai abhi fail ho.
function validate() {
  const problems = [];
  if (!config.googleClientId || config.googleClientId.startsWith('YOUR_CLIENT_ID')) {
    problems.push('GOOGLE_CLIENT_ID set nahi — Google Cloud Console se OAuth client banao (README dekho).');
  }
  if (!config.jwtSecret || config.jwtSecret === 'change-me-to-a-long-random-string') {
    problems.push('JWT_SECRET set nahi — koi lamba random string daalo (README dekho).');
  }
  return problems;
}

module.exports = { config, validate };
