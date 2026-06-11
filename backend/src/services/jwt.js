/*
 * Humare apne session tokens (JWT).
 * Google verify hone ke baad hum user ko ek JWT dete hain. Extension har API
 * call pe ye token bhejta hai (Authorization: Bearer ...). Google ko baar-baar
 * verify karne ki zaroorat nahi — humara token hi proof hai.
 */
'use strict';

const jwt = require('jsonwebtoken');
const { config } = require('../config');

// Payload chhota rakho — sirf user id. Baaki DB se aata hai.
function signSession(userId) {
  return jwt.sign({ uid: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

// Valid ho to payload, warna null (throw nahi — caller decide kare).
function verifySession(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

module.exports = { signSession, verifySession };
