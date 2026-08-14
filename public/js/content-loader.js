// content-loader.js — fetches editable content from the backend and
// fills in any element marked with data-content="field_key".
// Runs before other page scripts so content is in place on first paint.

(function () {
  const page = document.body.getAttribute('data-page');
  if (!page) return;

  fetch(`/api/content/${page}`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load content');
      return res.json();
    })
    .then((data) => {
      document.querySelectorAll('[data-content]').forEach((el) => {
        const key = el.getAttribute('data-content');
        if (!(key in data)) return;
        const value = data[key];

        if (el.tagName === 'IMG') {
          el.src = value;
        } else if (el.hasAttribute('data-content-html')) {
          // only used where the field intentionally contains simple markup (e.g. line breaks)
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      });
    })
    .catch((err) => {
      console.warn('Content load failed, showing static fallback:', err);
    });

  // Global (footer/brand) content — loaded on every page
  fetch('/api/content/global')
    .then((res) => res.json())
    .then((data) => {
      document.querySelectorAll('[data-global]').forEach((el) => {
        const key = el.getAttribute('data-global');
        if (key in data) el.textContent = data[key];
      });
    })
    .catch(() => {});
})();
