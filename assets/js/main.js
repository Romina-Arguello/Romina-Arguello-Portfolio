/**
 * Main interactions
 * - Back to top button
 * - "Copy e-mail address" button
 * - Current year in the footer
 */

/* ---------- 1. Back to top button ---------- */
function initScrollTop() {
  const button = document.querySelector('.scroll-top');
  if (!button) return;

  const SHOW_AFTER = 600; // pixels scrolled before the button appears

  const toggleButton = () => {
    button.classList.toggle('is-visible', window.scrollY > SHOW_AFTER);
  };

  toggleButton();
  window.addEventListener('scroll', toggleButton, { passive: true });

  button.addEventListener('click', () => {
    // Respect users who asked their system to reduce motion
    // With smooth scroll active (animations.js), let Lenis do the scrolling
    if (window.lenis) {
      window.lenis.scrollTo(0);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* ---------- 2. Copy the e-mail address ---------- */
function initCopyEmail() {
  const button = document.querySelector('.contact__copy');
  const status = document.querySelector('.contact__status');
  if (!button || !status) return;

  button.addEventListener('click', async () => {
    const email = button.dataset.copy; // value of the data-copy attribute

    try {
      await navigator.clipboard.writeText(email);
      status.textContent = 'Adresse copiée dans le presse-papiers.';
    } catch (error) {
      // Clipboard API unavailable (old browser, page not served over HTTPS...)
      status.textContent = `Copie impossible : ${email}`;
    }

    // Clear the message after 3 seconds
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  });
}

/* ---------- 3. Current year in the footer ---------- */
function initCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = year;
  });
}

initScrollTop();
initCopyEmail();
initCurrentYear();
