/* =========================================================
   Francis Bobson Hinckley — Portfolio Scripts
   Handles: smooth fade-out on internal link clicks, footer
   year, mobile nav toggle, the About page auto-advancing
   image slideshow (5s per slide, #aboutSlides), and the
   scroll progress bar.
   ========================================================= */

// ---- Smooth page transitions ----
// Fade-in on load is pure CSS (works with JS off). This adds a
// matching fade-out when a same-site link is clicked, so the page
// dips out before the browser navigates to the next page.
(() => {
  const isSameSiteLink = (link) => {
    if (!link || !link.href) return false;
    if (link.target && link.target !== '' && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.hash && url.pathname === window.location.pathname) return false; // in-page anchor
    return true;
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!isSameSiteLink(link)) return;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    document.documentElement.classList.add('page-leaving');
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 260);
  });
})();

document.addEventListener('DOMContentLoaded', () => {

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---- Mobile nav toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close the mobile menu after a nav link is tapped
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close the mobile menu if a click lands outside it
    document.addEventListener('click', (event) => {
      const clickedInsideNav = siteNav.contains(event.target);
      const clickedToggle = navToggle.contains(event.target);
      if (!clickedInsideNav && !clickedToggle) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Auto-advancing slideshow (5s per slide, right to left) ----
  // Runs on the About page, which has a <div id="aboutSlides"> with
  // .slide children. Does nothing on pages without that markup.
  const slides = document.querySelectorAll('#aboutSlides .slide');
  const dots = document.querySelectorAll('#aboutSlideDots button');

  if (slides.length) {
    let current = 0;
    const SLIDE_DURATION = 5000;
    const TRANSITION_DURATION = 650;

    const goToSlide = (nextIndex) => {
      const prevIndex = current;
      if (nextIndex === prevIndex) return;

      slides[prevIndex].classList.remove('active');
      slides[prevIndex].classList.add('exit');

      slides[nextIndex].classList.add('active');

      dots.forEach((dot) => dot.classList.remove('active'));
      if (dots[nextIndex]) dots[nextIndex].classList.add('active');

      setTimeout(() => {
        slides[prevIndex].classList.remove('exit');
      }, TRANSITION_DURATION);

      current = nextIndex;
    };

    let timer = setInterval(() => {
      goToSlide((current + 1) % slides.length);
    }, SLIDE_DURATION);

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.dataset.dot);
        goToSlide(index);
        clearInterval(timer);
        timer = setInterval(() => {
          goToSlide((current + 1) % slides.length);
        }, SLIDE_DURATION);
      });
    });
  }

  // ---- Scroll progress bar ----
  // Fills left to right as the visitor scrolls down the page.
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressBar.style.width = progress + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // ---- Smooth scroll-reveal (fade + rise) across all pages ----
  const revealSelectors = [
    '.hero-text', '.hero-image',
    '.highlight-item',
    '.skill-card',
    '.timeline-item',
    '.bio-text', '.bio-slideshow',
    '.contact-details',
    '.globe-arc-band',
    '.cta .container > *',
    '.page-header .container > *'
  ];

  const revealTargets = document.querySelectorAll(revealSelectors.join(','));

  if (revealTargets.length && 'IntersectionObserver' in window) {
    revealTargets.forEach((el, i) => {
      el.classList.add('reveal');
      // small stagger for items that share a parent (cards, timeline, etc.)
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    // No IntersectionObserver support — just show everything.
    revealTargets.forEach((el) => el.classList.add('reveal-visible'));
  }

});
