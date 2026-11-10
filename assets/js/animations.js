/**
 * Animations — GSAP + ScrollTrigger + SplitText + Lenis
 *
 * Principles:
 * - Progressive enhancement: without JavaScript, the site is complete and readable.
 * - Accessibility: nothing moves for users who asked their system to reduce motion.
 */
(() => {
  // Safety: if a library failed to load, stop here (the site still works)
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
      typeof SplitText === 'undefined' || typeof Lenis === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ScrambleText is only loaded on the pages that use the "scramble" title animation
  const hasScramble = typeof ScrambleTextPlugin !== 'undefined';
  if (hasScramble) gsap.registerPlugin(ScrambleTextPlugin);

  /* ======================================================================
     Media queries used by gsap.matchMedia()
     ====================================================================== */
  const MOTION = '(prefers-reduced-motion: no-preference)';
  const DESKTOP = '(min-width: 992px)';
  const MOBILE = '(max-width: 991.98px)';

  // Elements revealed while scrolling (only those present on the page are used)
  const REVEAL_SELECTOR = [
    '.section-head .kicker', '.section-head__intro',
    '.about__photo', '.about__columns p', '.about__actions',
    '.skill', '.project__visual', '.project__body',
    '.design__text p', '.design__item', '.timeline__item',
    '.contact__mail', '.contact__links', '.site-footer__top',
    '.case-hero .kicker', '.case-hero__lead', '.facts__item', '.case-visual img',
    '.case-section__number', '.case-section__body > *', '.case-figure', '.stats__item', '.case-cta > *',
    '.legal h2', '.legal p',
  ].join(', ');

  // Titles revealed line by line
  const TITLE_SELECTOR = '.section-head h2, .design__text h2, .case-section h2, .case-hero h1, .legal h1';

  // Elements inside the horizontal scroll section are handled separately
  const isInHorizontal = (element) => element.closest('.h-scroll') !== null;

  /* ======================================================================
     Helpers
     ====================================================================== */

  /**
   * Wraps the final "." of the highlighted word in a <span>, so it can fall on its own.
   * <em>code.</em>  ->  <em>code<span class="title-dot">.</span></em>
   * @param {HTMLElement} title
   */
  function prepareTitleDot(title) {
    const em = title.querySelector('em');
    if (!em || em.querySelector('.title-dot')) return;   // nothing to do, or already done

    const lastNode = em.lastChild;
    if (lastNode && lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent.trimEnd().endsWith('.')) {
      lastNode.textContent = lastNode.textContent.trimEnd().slice(0, -1);   // removes the "."
      const dot = document.createElement('span');
      dot.className = 'title-dot';
      dot.textContent = '.';
      em.append(dot);
    }
  }

  /**
   * The 4 letter animations. Chosen in the HTML with data-title-anim="...".
   * Each function adds its tweens to the timeline it receives.
   */
  const LETTER_ANIMATIONS = {
    // A. Fall: the letters drop from above and bounce, like the final dot
    fall: (timeline, split) => timeline.from(split.chars, {
      y: () => gsap.utils.random(-250, -120),
      rotation: () => gsap.utils.random(-25, 25),
      autoAlpha: 0,
      duration: 1,
      ease: 'bounce.out',
      stagger: { amount: 0.6, from: 'random' },
    }),

    // B. 3D wave: each letter tilts forward, one after the other
    wave: (timeline, split) => timeline.from(split.chars, {
      rotationX: -100,
      yPercent: 60,
      transformPerspective: 600,      // depth of the 3D effect (in px)
      transformOrigin: '50% 100%',    // rotates around its bottom edge
      autoAlpha: 0,
      duration: 0.9,
      ease: 'back.out(2)',
      stagger: 0.03,
    }),

    // C. Decoding: random "code" characters turn into the real words
    scramble: (timeline, split) => {
      split.words.forEach((word, index) => {
        timeline.from(word, {
          autoAlpha: 0,
          duration: 0.9,
          scrambleText: { text: '{original}', chars: '01<>/{}#$%&*', revealDelay: 0.3, speed: 0.6 },
        }, index * 0.1);              // each word starts 0.1 s after the previous one
      });
      return timeline;
    },

    // G. Scatter: the letters arrive from everywhere and settle into place
    scatter: (timeline, split) => timeline.from(split.chars, {
      x: () => gsap.utils.random(-220, 220),
      y: () => gsap.utils.random(-160, 160),
      rotation: () => gsap.utils.random(-120, 120),
      scale: () => gsap.utils.random(0.2, 1.8),
      autoAlpha: 0,
      duration: 1.1,
      ease: 'back.out(1.4)',
      stagger: { amount: 0.5, from: 'random' },
    }),
  };

  /**
   * Returns the animation name of a title (data-title-anim), "scatter" by default.
   * Without the ScrambleText plugin, "scramble" falls back to "wave".
   * @param {HTMLElement} title
   * @returns {string}
   */
  function getTitleAnimationName(title) {
    const name = title.dataset.titleAnim;
    if (name === 'scramble' && !hasScramble) return 'wave';
    return LETTER_ANIMATIONS[name] ? name : 'scatter';
  }

  /**
   * Builds the title animation:
   * 1. the letters (animation chosen in the HTML),
   * 2. the highlighted word lands like a sticker,
   * 3. the final dot falls and bounces.
   * @param {HTMLElement} title
   * @param {SplitText} split result of SplitText (gives access to chars / words)
   * @param {object} timelineVars options of the timeline (e.g. scrollTrigger)
   * @returns {gsap.core.Timeline}
   */
  function buildTitleAnimation(title, split, timelineVars = {}) {
    const em = title.querySelector('em');
    const dot = title.querySelector('.title-dot');
    const timeline = gsap.timeline(timelineVars);

    LETTER_ANIMATIONS[getTitleAnimationName(title)](timeline, split);

    if (em) {
      timeline.from(em, {
        y: -80,
        rotation: -12,
        scale: 0.6,
        autoAlpha: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.55)',                // small elastic bounce, like a sticker
      }, '-=0.5');
    }

    if (dot) {
      timeline.from(dot, {
        y: -220,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'bounce.out',                          // falls and bounces like a ball
      }, '-=0.35');
    }

    return timeline;
  }

  /**
   * SplitText options for a title: "scramble" works on whole words,
   * the other animations need words + letters.
   * @param {HTMLElement} title
   * @returns {string}
   */
  function getSplitType(title) {
    return getTitleAnimationName(title) === 'scramble' ? 'words' : 'words, chars';
  }

  /**
   * Splits a title into letters and animates it when it enters the screen.
   * @param {HTMLElement} title
   * @param {object} triggerOptions extra ScrollTrigger options (e.g. containerAnimation)
   */
  function revealTitle(title, triggerOptions = {}) {
    prepareTitleDot(title);

    SplitText.create(title, {
      type: getSplitType(title),   // words (+ letters): no break in the middle of a word
      ignore: 'em',           // the highlighted word is animated as one block
      autoSplit: true,        // re-split when fonts load or the width changes
      onSplit(self) {
        return buildTitleAnimation(title, self, {
          scrollTrigger: { trigger: title, start: 'top 85%', once: true, ...triggerOptions },
        });
      },
    });
  }

  /**
   * Fades in elements from below, in small groups, when they enter the screen.
   * @param {HTMLElement[]} elements
   */
  function revealOnScroll(elements) {
    if (!elements.length) return;

    gsap.set(elements, { autoAlpha: 0, y: 40 });   // starting state

    ScrollTrigger.batch(elements, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
      }),
    });
  }

  /* ======================================================================
     1. Smooth scroll (Lenis), synchronised with ScrollTrigger
     ====================================================================== */
  function initSmoothScroll() {
    const header = document.querySelector('#siteHeader');
    const headerHeight = header ? header.offsetHeight : 0;

    const lenis = new Lenis({
      lerp: 0.1,                              // inertia: 0 = none, 1 = instant
      anchors: { offset: -headerHeight },     // smooth scroll for #anchor links
    });

    // ScrollTrigger recalculates its positions on every Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // A single animation loop: the GSAP one drives Lenis
    const update = (time) => lenis.raf(time * 1000);   // GSAP gives seconds, Lenis wants ms
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    window.lenis = lenis;   // used by main.js for the back to top button

    // Cleanup, called if the media query stops matching
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      window.lenis = undefined;
    };
  }

  /* ======================================================================
     2. Hero intro (home page)
     ====================================================================== */
  function initHeroIntro() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const title = hero.querySelector('.hero__title');
    prepareTitleDot(title);

    SplitText.create(title, {
      type: getSplitType(title),
      ignore: 'em',
      autoSplit: true,
      onSplit(self) {
        return gsap.timeline({ defaults: { ease: 'expo.out' } })
          .from(hero.querySelector('.eyebrow'), { autoAlpha: 0, y: 20, duration: 0.8 })
          .add(buildTitleAnimation(title, self), '-=0.4')     // a timeline inside a timeline
          .from(hero.querySelectorAll('.hero__lead, .hero__actions, .availability'),
            { autoAlpha: 0, y: 30, duration: 1, stagger: 0.12 }, '-=0.6')
          .from(hero.querySelector('.scroll-hint'), { autoAlpha: 0, duration: 1 }, '-=0.6');
      },
    });
  }

  /* ======================================================================
     3. Titles and blocks revealed on scroll
     ====================================================================== */
  function initScrollReveals() {
    gsap.utils.toArray(TITLE_SELECTOR)
      .filter((title) => !isInHorizontal(title))
      .forEach((title) => revealTitle(title));

    revealOnScroll(gsap.utils.toArray(REVEAL_SELECTOR).filter((el) => !isInHorizontal(el)));
  }

  /* ======================================================================
     4. Parallax on project screenshots
     The CSS variable --parallax is used in the transform of .project__shot
     ====================================================================== */
  function initParallax() {
    gsap.utils.toArray('.project__visual').forEach((visual) => {
      gsap.fromTo(visual,
        { '--parallax': '40px' },
        {
          '--parallax': '-40px',
          ease: 'none',
          scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: true },
        });
    });
  }

  /* ======================================================================
     5. Journey timeline: the pink line grows while scrolling
     ====================================================================== */
  function initTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    gsap.to(timeline, {
      '--progress': 1,
      ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: true },
    });

    // Each dot fills in when the line reaches it
    timeline.querySelectorAll('.timeline__item').forEach((item) => {
      ScrollTrigger.create({ trigger: item, start: 'top 70%', toggleClass: 'is-active' });
    });
  }

  /* ======================================================================
     6. Horizontal scroll (case study, desktop only)
     ====================================================================== */
  function initHorizontalScroll() {
    const wrapper = document.querySelector('.h-scroll');
    if (!wrapper) return;

    const track = wrapper.querySelector('.h-scroll__track');
    const progressBar = wrapper.querySelector('.h-scroll__progress span');

    wrapper.classList.add('is-horizontal');   // switches the CSS to the horizontal layout

    // Distance to travel: total width of the panels minus the visible width
    const getDistance = () => track.scrollWidth - wrapper.clientWidth;

    const horizontalTween = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',                       // linear: the movement follows the scroll exactly
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${getDistance()}`,  // scrolls as long as the horizontal distance
        pin: true,                        // the section stays fixed on screen
        scrub: 1,                         // linked to the scroll, with 1s of smoothing
        invalidateOnRefresh: true,        // recalculates on resize
        refreshPriority: 1,               // calculated before the triggers below it
        onUpdate: (self) => gsap.set(progressBar, { scaleX: self.progress }),
      },
    });

    // Content of each panel appears when the panel enters the screen horizontally
    // (the first panel is already visible: it uses a normal vertical trigger)
    wrapper.querySelectorAll('.h-scroll__panel').forEach((panel, index) => {
      const triggerOptions = index === 0
        ? { trigger: panel, start: 'top 75%' }
        : { trigger: panel, containerAnimation: horizontalTween, start: 'left 75%' };

      revealTitle(panel.querySelector('h2'), triggerOptions);

      gsap.from(panel.querySelectorAll('.case-section__number, .case-section__body > *, .case-figure'), {
        autoAlpha: 0,
        x: index === 0 ? 0 : 80,
        y: index === 0 ? 40 : 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { ...triggerOptions, once: true },
      });
    });

    return () => wrapper.classList.remove('is-horizontal');
  }

  /* On small screens, the same panels are simply revealed vertically */
  function initHorizontalFallback() {
    const wrapper = document.querySelector('.h-scroll');
    if (!wrapper) return;

    wrapper.querySelectorAll('h2').forEach((title) => revealTitle(title));
    revealOnScroll(gsap.utils.toArray(wrapper.querySelectorAll(REVEAL_SELECTOR)));
  }

  /* ======================================================================
     Start: each block only runs when its media query matches.
     gsap.matchMedia() automatically reverts the GSAP animations of a block
     when its condition stops matching (e.g. window resized).
     ====================================================================== */
  const mm = gsap.matchMedia();

  mm.add(MOTION, () => {
    const destroySmoothScroll = initSmoothScroll();
    initHeroIntro();
    initScrollReveals();
    initParallax();
    initTimeline();
    return destroySmoothScroll;
  });

  mm.add(`${MOTION} and ${DESKTOP}`, () => initHorizontalScroll());
  mm.add(`${MOTION} and ${MOBILE}`, () => initHorizontalFallback());
})();
