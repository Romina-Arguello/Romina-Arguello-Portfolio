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


  //Animación de tipeo 

const texts = [
        "Creative Designer", 
        "Web Developer",
        "Web Designer",
       
      ];
      const typingSpeed = 250; // Velocidad de escritura (ms)
      const erasingSpeed = 50; // Velocidad de borrado (ms)
      const delayBetweenTexts = 700; // Pausa entre textos (ms)

      let currentTextIndex = 0; // Índice del texto actual
      let charIndex = 0; // Índice del carácter actual
      const textElement = document.getElementById("text");

      function typeText() {
        if (charIndex < texts[currentTextIndex].length) {
          // Añade una letra al texto
          textElement.textContent += texts[currentTextIndex].charAt(charIndex);
          charIndex++;
          setTimeout(typeText, typingSpeed); // Llama a la función nuevamente
        } else {
          // Pausa antes de borrar
          setTimeout(eraseText, delayBetweenTexts);
        }
      }

      function eraseText() {
        if (charIndex > 0) {
          // Elimina una letra del texto
          textElement.textContent = texts[currentTextIndex].substring(
            0,
            charIndex - 1
          );
          charIndex--;
          setTimeout(eraseText, erasingSpeed); // Llama a la función nuevamente
        } else {
          // Cambia al siguiente texto
          currentTextIndex = (currentTextIndex + 1) % texts.length;
          setTimeout(typeText, typingSpeed);
        }
      }

      // Inicia la animación
      typeText();

      //Fin de animación==========================================================
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

/*MENU EN PANTALLAS PEQUEÑAS*/
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('#navbarNav .nav-link');
  const navbarCollapse = document.querySelector('#navbarNav');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      } else {
        // por si acaso no hay instancia creada todavía
        new bootstrap.Collapse(navbarCollapse).hide();
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const navbarCollapseEl = document.querySelector('#navbarNav');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  if (!navbarCollapseEl) {
    console.warn('No se encontró #navbarNav');
    return;
  }

  const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapseEl, { toggle: false });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      bsCollapse.hide();
    });
  });
});