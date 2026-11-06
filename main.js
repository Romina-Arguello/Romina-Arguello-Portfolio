 /**
 * Apply .scrolled class to the body as the page is scrolled down
 */
function toggleScrolled() {
  const selectBody = document.querySelector('body');
  const selectHeader = document.querySelector('#header');
  if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
  window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
}

document.addEventListener('scroll', toggleScrolled);
window.addEventListener('load', toggleScrolled);


/**
 * Scroll top button
 */
let scrollTop = document.querySelector('.scroll-top');

function toggleScrollTop() {
  if (scrollTop) {
    window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
  }
}
scrollTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

window.addEventListener('load', toggleScrollTop);
document.addEventListener('scroll', toggleScrollTop);

/**
 * Animation on scroll function and init
 */
function aosInit() {
  AOS.init({
    duration: 600,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });
}
window.addEventListener('load', aosInit);

/**
 * Menu (mobile + scroll a las secciones)
 * - En pantallas chicas, el header sticky es más alto con el menú abierto.
 *   Por eso primero se cierra el menú y, recién cuando termina esa
 *   animación (evento 'hidden.bs.collapse'), se hace el scroll a la
 *   sección: así se calcula con la altura final (ya colapsada) del header.
 * - En desktop el menú nunca está "abierto" (siempre visible en línea),
 *   así que el scroll se dispara directo.
 */
document.addEventListener('DOMContentLoaded', function () {
  const navbarCollapseEl = document.querySelector('#navbarNav');
  const navLinks = document.querySelectorAll('#navbarNav .nav-link');
  const header = document.querySelector('#header');

  if (!navbarCollapseEl) {
    console.warn('No se encontró #navbarNav');
    return;
  }

  const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapseEl, { toggle: false });

  function scrollToTarget(targetEl) {
    const headerHeight = header ? header.offsetHeight : 0;
    const targetY = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const isMenuOpen = navbarCollapseEl.classList.contains('show');

      if (isMenuOpen) {
        navbarCollapseEl.addEventListener('hidden.bs.collapse', () => scrollToTarget(targetEl), { once: true });
        bsCollapse.hide();
      } else {
        scrollToTarget(targetEl);
      }
    });
  });
});