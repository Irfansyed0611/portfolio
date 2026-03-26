/**
 * Scroll-to-reveal animation system for all <section> elements.
 *
 * Usage examples:
 * <!-- Default: slides up -->
 * <section data-reveal="up">...</section>
 *
 * <!-- Slides in from the left -->
 * <section data-reveal="left">...</section>
 *
 * <!-- Fade only -->
 * <section data-reveal="fade">...</section>
 *
 * <!-- With staggered children -->
 * <section data-reveal="up">
 *   <div data-reveal-child>Card 1</div>
 *   <div data-reveal-child>Card 2</div>
 *   <div data-reveal-child>Card 3</div>
 * </section>
 */

const SECTION_SELECTOR = 'section';
const EXCLUDED_SECTION_SELECTOR = '[data-reveal-ignore]';
const HIDDEN_CLASS = 'reveal-hidden';
const VISIBLE_CLASS = 'reveal-visible';
const CHILD_HIDDEN_CLASS = 'reveal-child-hidden';
const CHILD_VISIBLE_CLASS = 'reveal-child-visible';
const TRANSITION_EASE = 'opacity, transform';
const STAGGER_DELAY_MS = 120;
const OBSERVER_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px',
};

let observer = null;
const observedSections = new Set();

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cleanupObserver = () => {
  if (observer && observedSections.size === 0) {
    observer.disconnect();
    observer = null;
  }
};

const resetObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  observedSections.clear();
};

const cleanupDisconnectedSections = () => {
  if (!observer || observedSections.size === 0) {
    return;
  }

  observedSections.forEach(section => {
    if (!section.isConnected) {
      observer.unobserve(section);
      observedSections.delete(section);
    }
  });

  cleanupObserver();
};

const handleTransitionCleanup = element => {
  const onTransitionEnd = event => {
    if (event.target !== element || event.propertyName !== 'opacity') {
      return;
    }

    element.style.removeProperty('will-change');
    element.removeEventListener('transitionend', onTransitionEnd);
  };

  element.addEventListener('transitionend', onTransitionEnd);
};

const getRevealChildren = section =>
  Array.from(section.children).filter(child => child.hasAttribute('data-reveal-child'));

const prepareSection = section => {
  if (section.dataset.revealInitialized === 'true') {
    return false;
  }

  section.dataset.revealInitialized = 'true';
  section.classList.add(HIDDEN_CLASS);
  section.classList.remove(VISIBLE_CLASS);

  getRevealChildren(section).forEach((child, index) => {
    child.classList.add(CHILD_HIDDEN_CLASS);
    child.classList.remove(CHILD_VISIBLE_CLASS);
    child.style.setProperty('--reveal-delay', `${index * STAGGER_DELAY_MS}ms`);
  });

  return true;
};

const revealSection = section => {
  if (section.dataset.revealState === 'visible') {
    return;
  }

  section.dataset.revealState = 'visible';
  section.style.willChange = TRANSITION_EASE;
  handleTransitionCleanup(section);
  section.classList.remove(HIDDEN_CLASS);
  section.classList.add(VISIBLE_CLASS);

  getRevealChildren(section).forEach(child => {
    child.style.willChange = TRANSITION_EASE;
    handleTransitionCleanup(child);
    child.classList.remove(CHILD_HIDDEN_CLASS);
    child.classList.add(CHILD_VISIBLE_CLASS);
  });

  if (observer) {
    observer.unobserve(section);
  }
  observedSections.delete(section);
  cleanupObserver();
};

const handleIntersections = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      revealSection(entry.target);
    }
  });
};

const getObserver = () => {
  if (!observer) {
    observer = new IntersectionObserver(handleIntersections, OBSERVER_OPTIONS);
  }

  return observer;
};

function initReveal() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  cleanupDisconnectedSections();

  if (prefersReducedMotion()) {
    resetObserver();
    return;
  }

  const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR)).filter(
    section =>
      section.dataset.revealInitialized !== 'true' && !section.matches(EXCLUDED_SECTION_SELECTOR),
  );

  if (sections.length === 0) {
    cleanupObserver();
    return;
  }

  sections.forEach(section => {
    prepareSection(section);
  });

  const sectionObserver = getObserver();

  sections.forEach(section => {
    observedSections.add(section);
    sectionObserver.observe(section);
  });
}

window.initReveal = initReveal;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal, { once: true });
} else {
  initReveal();
}

export { initReveal };

/*
Testing checklist
- All sections hidden on load, reveal on scroll
- No flash of unstyled content (FOUC)
- Works with prefers-reduced-motion: reduce (no animation, all visible)
- Observer is disconnected after all sections have been revealed
- will-change is removed after each transition completes
- Staggered children animate sequentially
- Works on Chrome, Firefox, Safari, Edge (latest)
- No horizontal scrollbar caused by translateX variants (add overflow-x: hidden on parent if needed)
*/
