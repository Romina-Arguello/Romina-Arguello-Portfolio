/**
 * Navigation
 * - Adds the .is-scrolled class to the header once the page is scrolled
 * - Closes the mobile menu after a click on a link or a press on "Escape"
 */
(() => {
  const header = document.querySelector('#siteHeader');
  const menu = document.querySelector('#mainNav');

  // Safety: stop here if the HTML is missing (avoids JS errors)
  if (!header || !menu) return;

  /* ---------- 1. Header background on scroll ---------- */
  const SCROLL_THRESHOLD = 50; // in pixels

  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  updateHeader(); // correct state if the page is reloaded mid-scroll
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- 2. Mobile menu ---------- */
  const collapse = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });

  const closeMenu = () => {
    if (menu.classList.contains('show')) collapse.hide();
  };

  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();
