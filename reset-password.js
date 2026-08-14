// reset-password.js — force-resets the admin password to whatever is
// currently set in ADMIN_PASSWORD (env var), regardless of what's already
// in the database. Use this when you're locked out.
//
// Run with: node reset-password.js
//
// On Railway: open the service's "Shell" tab (or use `railway run`) and
// run this once, then remove it or just ignore it going forward.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASS) {
  console.error('ADMIN_PASSWORD is not set in the environment. Set it first, then re-run this.');
  process.exit(1);
}

const hash = bcrypt.hashSync(ADMIN_PASS, 10);

const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(ADMIN_USER);

if (existing) {
  db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, ADMIN_USER);
  console.log(`Password reset for existing user "${ADMIN_USER}".`);
} else {
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(ADMIN_USER, hash);
  console.log(`Admin user "${ADMIN_USER}" created.`);
}

console.log('You can now log in with the username and password currently set in your environment variables.');
