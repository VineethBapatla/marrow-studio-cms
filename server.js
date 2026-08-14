// server.js — Marrow Studio site + admin panel backend
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'marrow-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  },
}));

// -----------------------------------------------------------------------
// Auth helpers
// -----------------------------------------------------------------------
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.redirect('/admin/login');
}

// -----------------------------------------------------------------------
// Public content API — read-only, no auth
// -----------------------------------------------------------------------
app.get('/api/content/:page', (req, res) => {
  const rows = db.prepare(
    'SELECT field_key, value, field_type FROM content WHERE page = ? ORDER BY sort_order'
  ).all(req.params.page);

  const out = {};
  rows.forEach((r) => { out[r.field_key] = r.value; });
  res.json(out);
});

app.get('/api/content', (req, res) => {
  // all content, grouped by page — used by the public site to hydrate everything in one call
  const rows = db.prepare('SELECT page, field_key, value FROM content ORDER BY page, sort_order').all();
  const out = {};
  rows.forEach((r) => {
    if (!out[r.page]) out[r.page] = {};
    out[r.page][r.field_key] = r.value;
  });
  res.json(out);
});

// -----------------------------------------------------------------------
// Public contact form submission
// -----------------------------------------------------------------------
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required.' });

  db.prepare(`
    INSERT INTO contact_submissions (name, email, phone, service, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), email.trim(), (phone || '').trim(), service || 'other', message.trim());

  res.json({ ok: true, message: `Thanks, ${name.trim().split(' ')[0]} — your message is in. We reply to every enquiry within two business days.` });
});

// -----------------------------------------------------------------------
// Admin auth routes
// -----------------------------------------------------------------------
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminId) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.adminId = admin.id;
  req.session.username = admin.username;
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/me', requireAuth, (req, res) => {
  res.json({ username: req.session.username });
});

// -----------------------------------------------------------------------
// Admin panel (protected)
// -----------------------------------------------------------------------
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Get all content for editing (grouped by page, includes labels/types)
app.get('/api/admin/content', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM content ORDER BY page, sort_order').all();
  const grouped = {};
  rows.forEach((r) => {
    if (!grouped[r.page]) grouped[r.page] = [];
    grouped[r.page].push(r);
  });
  res.json(grouped);
});

// Update a single field
app.put('/api/admin/content/:id', requireAuth, (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'value is required' });

  const result = db.prepare(
    "UPDATE content SET value = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(value, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Field not found' });
  res.json({ ok: true });
});

// Bulk update (save all fields on a page at once)
app.put('/api/admin/content', requireAuth, (req, res) => {
  const updates = req.body.updates; // [{ id, value }, ...]
  if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates array required' });

  const stmt = db.prepare("UPDATE content SET value = ?, updated_at = datetime('now') WHERE id = ?");
  const runAll = db.transaction((items) => {
    items.forEach((item) => stmt.run(item.value, item.id));
  });
  runAll(updates);

  res.json({ ok: true, updated: updates.length });
});

// View contact submissions
app.get('/api/admin/submissions', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC').all();
  res.json(rows);
});

// Change admin password
app.post('/api/admin/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.session.adminId);
  if (!bcrypt.compareSync(currentPassword || '', admin.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, admin.id);
  res.json({ ok: true });
});

// -----------------------------------------------------------------------
// Public site (static files + page routes)
// -----------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

['/', '/about', '/services', '/contact'].forEach((route) => {
  app.get(route, (req, res) => {
    const file = route === '/' ? 'index' : route.slice(1);
    res.sendFile(path.join(__dirname, 'public', `${file}.html`));
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Marrow Studio server running on port ${PORT}`);
  console.log(`Admin panel at /admin/login`);
});
