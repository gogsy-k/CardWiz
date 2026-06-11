/*
 * Google ID-token verification.
 * Extension Google se ek signed ID token (JWT) leta hai aur humein bhejta hai.
 * Hum use Google ki public keys se verify karte hain — token asli hai aur
 * humare hi client ke liye bana hai (audience check). Tabhi user bharosa.
 */
'use strict';

const { OAuth2Client } = require('google-auth-library');
const { config } = require('../config');

const client = new OAuth2Client(config.googleClientId);

/**
 * @param {string} idToken  Google se mila ID token
 * @returns {Promise<{googleId, email, name, picture, emailVerified}>}
 * @throws agar token invalid / expired / galat audience
 */
async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('idToken missing');
  }

  // Library hi signature + expiry + audience sab verify karti hai.
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });

  const p = ticket.getPayload();
  if (!p || !p.sub) throw new Error('Invalid Google token payload');
  if (!p.email_verified) throw new Error('Google email verified nahi');

  return {
    googleId: p.sub,        // stable unique user id
    email: p.email,
    name: p.name || '',
    picture: p.picture || '',
    emailVerified: !!p.email_verified,
  };
}

module.exports = { verifyGoogleIdToken };
