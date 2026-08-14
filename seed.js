// seed.js — creates the admin user and populates default content
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

// --- Admin user -----------------------------------------------------
const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get(ADMIN_USER);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(ADMIN_PASS, 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(ADMIN_USER, hash);
  console.log(`Admin user created: ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log('IMPORTANT: change this password after first login, or set ADMIN_PASSWORD in .env before seeding.');
} else {
  console.log(`Admin user "${ADMIN_USER}" already exists — skipping.`);
}

// --- Content fields ---------------------------------------------------
// field_type: 'text' | 'textarea' | 'image'
const fields = [
  // HOME
  ['home', 'hero_eyebrow', 'Hero — small label', 'text', 'Architecture & interiors, Vijayawada'],
  ['home', 'hero_heading', 'Hero — headline', 'textarea', 'Spaces drawn from how you actually live.'],
  ['home', 'hero_body', 'Hero — supporting text', 'textarea', "We design homes and small commercial spaces around daily rituals, honest materials, and light — not trends. Every project starts as a sketch on the same table you'll eat breakfast at."],
  ['home', 'stat_1_num', 'Stat 1 — number', 'text', '14'],
  ['home', 'stat_1_label', 'Stat 1 — label', 'text', 'Years practicing'],
  ['home', 'stat_2_num', 'Stat 2 — number', 'text', '86'],
  ['home', 'stat_2_label', 'Stat 2 — label', 'text', 'Projects completed'],
  ['home', 'stat_3_num', 'Stat 3 — number', 'text', '4'],
  ['home', 'stat_3_label', 'Stat 3 — label', 'text', 'Cities we work in'],
  ['home', 'stat_4_num', 'Stat 4 — number', 'text', '9.4'],
  ['home', 'stat_4_label', 'Stat 4 — label', 'text', 'Avg. client rating /10'],
  ['home', 'service_1_title', 'Service 1 — title', 'text', 'Residential Architecture'],
  ['home', 'service_1_body', 'Service 1 — description', 'textarea', 'New builds and renovations, from single rooms to full homes — planned around light, airflow, and how a household actually moves through a day.'],
  ['home', 'service_2_title', 'Service 2 — title', 'text', 'Interior Design'],
  ['home', 'service_2_body', 'Service 2 — description', 'textarea', 'Material palettes, custom joinery, and furniture layouts that hold up to daily use and age well, rather than dating in five years.'],
  ['home', 'service_3_title', 'Service 3 — title', 'text', 'Small Commercial Spaces'],
  ['home', 'service_3_body', 'Service 3 — description', 'textarea', 'Cafés, studios, and clinics — spaces designed to work hard for the business while still feeling considered and calm.'],
  ['home', 'project_1_image', 'Featured project 1 — image URL', 'image', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
  ['home', 'project_1_title', 'Featured project 1 — title', 'text', 'Kondapalli House'],
  ['home', 'project_1_meta', 'Featured project 1 — meta line', 'text', 'Full renovation · 2025 · Vijayawada'],
  ['home', 'project_2_image', 'Featured project 2 — image URL', 'image', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80'],
  ['home', 'project_2_title', 'Featured project 2 — title', 'text', 'Second Cup Café'],
  ['home', 'project_2_meta', 'Featured project 2 — meta line', 'text', 'New build, commercial · 2024 · Guntur'],
  ['home', 'testimonial_quote', 'Testimonial — quote', 'textarea', '"They asked more questions about our mornings than about our Pinterest board. The house they gave us actually fits how we live — that\'s rarer than it should be."'],
  ['home', 'testimonial_author', 'Testimonial — author', 'text', '— R. Devi, Kondapalli House'],

  // ABOUT
  ['about', 'page_heading', 'Page heading', 'textarea', 'A studio built around one long conversation.'],
  ['about', 'page_lede', 'Page intro text', 'textarea', "Marrow Studio started in 2012 with a simple frustration: most design happens before anyone asks what a family's mornings look like. We start there instead."],
  ['about', 'story_heading', 'Story section — heading', 'text', 'Fourteen years, one habit that stuck'],
  ['about', 'story_body_1', 'Story section — paragraph 1', 'textarea', "Founder Ananya Rao trained as an architect but spent her first two years out of school working construction sites, not drafting tables — watching how buildings actually got used once the architects left. That habit of staying close to the ground never went away."],
  ['about', 'story_body_2', 'Story section — paragraph 2', 'textarea', "Today Marrow is a small team of five: two architects, an interior designer, a materials specialist, and a project manager who keeps everyone honest about budgets. We keep our project list short on purpose — usually four or five running at once — so nothing gets handed off to someone who wasn't in the first conversation."],
  ['about', 'story_image', 'Story section — image URL', 'image', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
  ['about', 'value_1_label', 'Value 1 — label', 'text', 'Materials'],
  ['about', 'value_1_title', 'Value 1 — title', 'text', 'Honest over impressive'],
  ['about', 'value_1_body', 'Value 1 — description', 'textarea', 'We specify materials that age with dignity — timber that weathers well, stone that shows its texture — over finishes chosen to photograph well on day one.'],
  ['about', 'value_2_label', 'Value 2 — label', 'text', 'Process'],
  ['about', 'value_2_title', 'Value 2 — title', 'text', 'You see the drawing before we do'],
  ['about', 'value_2_body', 'Value 2 — description', 'textarea', 'Every major decision is reviewed with you in person or on a call, walking through the actual plan — not a rendering that hides the trade-offs.'],
  ['about', 'value_3_label', 'Value 3 — label', 'text', 'Budget'],
  ['about', 'value_3_title', 'Value 3 — title', 'text', 'The number we quote is the number you pay'],
  ['about', 'value_3_body', 'Value 3 — description', 'textarea', "We build contingency into the plan up front instead of surprising you mid-build. If something changes, you hear about it before it's decided."],
  ['about', 'team_1_name', 'Team member 1 — name', 'text', 'Ananya Rao'],
  ['about', 'team_1_role', 'Team member 1 — role', 'text', 'Founder & Principal Architect'],
  ['about', 'team_1_image', 'Team member 1 — image URL', 'image', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'],
  ['about', 'team_2_name', 'Team member 2 — name', 'text', 'Karthik Menon'],
  ['about', 'team_2_role', 'Team member 2 — role', 'text', 'Lead Interior Designer'],
  ['about', 'team_2_image', 'Team member 2 — image URL', 'image', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'],
  ['about', 'team_3_name', 'Team member 3 — name', 'text', 'Priya Nair'],
  ['about', 'team_3_role', 'Team member 3 — role', 'text', 'Project Manager'],
  ['about', 'team_3_image', 'Team member 3 — image URL', 'image', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'],

  // SERVICES
  ['services', 'page_heading', 'Page heading', 'textarea', 'What we offer, and how we run a project.'],
  ['services', 'page_lede', 'Page intro text', 'textarea', 'Three core services, each shaped by the same process — listen first, sketch fast, build carefully.'],
  ['services', 'process_1_title', 'Process step 1 — title', 'text', 'Conversation'],
  ['services', 'process_1_body', 'Process step 1 — description', 'textarea', 'A free, no-obligation call or site visit to understand your space, budget, and how you actually want to live or work in it.'],
  ['services', 'process_2_title', 'Process step 2 — title', 'text', 'Concept'],
  ['services', 'process_2_body', 'Process step 2 — description', 'textarea', 'We return with sketches, a rough material direction, and an honest budget range — before any detailed drawing begins.'],
  ['services', 'process_3_title', 'Process step 3 — title', 'text', 'Design development'],
  ['services', 'process_3_body', 'Process step 3 — description', 'textarea', 'Detailed drawings, material samples, and 3D walkthroughs, refined together over a set number of review sessions.'],
  ['services', 'process_4_title', 'Process step 4 — title', 'text', 'Build & handover'],
  ['services', 'process_4_body', 'Process step 4 — description', 'textarea', 'We coordinate contractors and visit site regularly through construction, ending with a walkthrough before you move in.'],
  ['services', 'faq_1_q', 'FAQ 1 — question', 'text', 'How long does a typical project take?'],
  ['services', 'faq_1_a', 'FAQ 1 — answer', 'textarea', 'A single room refresh can take 6–8 weeks. A full home renovation usually runs 4–8 months depending on scope and approvals. We give you a realistic timeline before any contract is signed.'],
  ['services', 'faq_2_q', 'FAQ 2 — question', 'text', 'Do you work outside Vijayawada?'],
  ['services', 'faq_2_a', 'FAQ 2 — answer', 'textarea', 'Yes — we currently take on projects across Andhra Pradesh, Telangana, and parts of Tamil Nadu, with site visits scheduled around the project\'s phase.'],
  ['services', 'faq_3_q', 'FAQ 3 — question', 'text', "What's your fee structure?"],
  ['services', 'faq_3_a', 'FAQ 3 — answer', 'textarea', "Fees are typically a percentage of construction cost for full architecture projects, or a flat fee for interior-only work. We'll give you a clear number after the first conversation, in writing."],
  ['services', 'faq_4_q', 'FAQ 4 — question', 'text', 'Can you work with our own contractor?'],
  ['services', 'faq_4_a', 'FAQ 4 — answer', 'textarea', "Absolutely. We're happy to design and hand off drawings to a contractor you already trust, or manage the build ourselves — whichever fits your project."],

  // CONTACT
  ['contact', 'page_heading', 'Page heading', 'textarea', 'Tell us about your project.'],
  ['contact', 'page_lede', 'Page intro text', 'textarea', 'Fill in the form, or reach us directly by phone or email. We reply to every enquiry within two business days.'],
  ['contact', 'address', 'Studio address', 'textarea', '12 Ring Road Layout, Vijayawada, Andhra Pradesh 520008, India'],
  ['contact', 'email', 'Email address', 'text', 'hello@marrowstudio.example'],
  ['contact', 'phone', 'Phone number', 'text', '+91 12345 67890'],
  ['contact', 'hours', 'Studio hours', 'textarea', 'Monday – Saturday, 10:00 AM – 6:30 PM. Site visits by appointment'],

  // SITE-WIDE (footer, brand)
  ['global', 'brand_name', 'Brand name', 'text', 'Marrow Studio'],
  ['global', 'footer_desc', 'Footer description', 'textarea', 'Architecture and interior design practice based in Vijayawada, working on homes and small commercial spaces across South India.'],
  ['global', 'footer_location', 'Footer — location line', 'text', 'Vijayawada, Andhra Pradesh'],
];

const insert = db.prepare(`
  INSERT INTO content (page, field_key, field_label, field_type, value, sort_order)
  VALUES (@page, @field_key, @field_label, @field_type, @value, @sort_order)
  ON CONFLICT(page, field_key) DO NOTHING
`);

const insertMany = db.transaction((rows) => {
  rows.forEach((row, i) => {
    insert.run({
      page: row[0],
      field_key: row[1],
      field_label: row[2],
      field_type: row[3],
      value: row[4],
      sort_order: i,
    });
  });
});

insertMany(fields);
console.log(`Seeded ${fields.length} content fields (existing values were left untouched).`);
