// ==========================================================================
// Marrow Studio — shared behavior
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollReveal();
  initContactForm();
});

/* Mobile nav toggle -------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* Scroll reveal -------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* Contact form — posts to the real backend at /api/contact ------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    const errors = [];
    if (!name.value.trim()) errors.push('Enter your name.');
    if (!isValidEmail(email.value.trim())) errors.push('Enter a valid email address.');
    if (!message.value.trim()) errors.push('Tell us a little about your project.');

    if (errors.length) {
      showStatus(status, errors.join(' '), 'error');
      return;
    }

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: form.querySelector('#phone').value.trim(),
      service: form.querySelector('#service').value,
      message: message.value.trim(),
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.6'; }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showStatus(status, data.error || 'Something went wrong. Please try again.', 'error');
      } else {
        showStatus(status, data.message, 'success');
        form.reset();
      }
    } catch (err) {
      showStatus(status, 'Could not reach the server. Please check your connection and try again.', 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
    }
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('form-status--success', 'form-status--error');
  el.classList.add('is-visible', `form-status--${type}`);
}
