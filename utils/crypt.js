const crypto = require('crypto');
const isNodejs = (typeof window === 'undefined')
let ENCRYPTION_KEY // Must be 256 bits (32 characters)
if (isNodejs) {
  const {ENCRYPTION_KEY: KEY} = require('../config');
  ENCRYPTION_KEY = KEY
} else {
  ENCRYPTION_KEY = process.env.VUE_APP_ENCRYPTION_KEY;
}
const IV_LENGTH = 16; // For AES, this is always 16
function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {decrypt, encrypt};
