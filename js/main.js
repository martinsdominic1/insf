/* ============================================================
   Shared site behaviour: nav shadow, hamburger drawer,
   scroll-reveal animation, rosary scroll-progress trail.
   Loaded on every page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Nav shadow on scroll */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* Scroll reveal */
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* Hamburger menu */
  const hamburger = document.getElementById('hamburger');
  const navDrawer = document.getElementById('navDrawer');
  let drawerOpen = false;

  function openDrawer() {
    drawerOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navDrawer.classList.add('open');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawerOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navDrawer.classList.remove('open');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  window.closeDrawer = closeDrawer;

  if (hamburger && navDrawer) {
    hamburger.addEventListener('click', () => (drawerOpen ? closeDrawer() : openDrawer()));
    document.addEventListener('click', (e) => {
      if (drawerOpen && !navDrawer.contains(e.target) && !hamburger.contains(e.target)) closeDrawer();
    });
    document.querySelectorAll('.nav-drawer a').forEach(a => a.addEventListener('click', closeDrawer));
  }

  /* Rosary scroll trail — build beads once, light them up as the page scrolls */
  const trail = document.getElementById('rosaryTrail');
  if (trail) {
    const BEAD_COUNT = 59; // a full rosary: 59 beads (5 decades + Our Fathers + medal)
    for (let i = 0; i < BEAD_COUNT; i++) {
      const b = document.createElement('span');
      b.className = 'bead';
      trail.appendChild(b);
    }
    const beads = trail.querySelectorAll('.bead');
    window.addEventListener('scroll', () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const lit = Math.round(progress * beads.length);
      beads.forEach((b, i) => b.classList.toggle('lit', i < lit));
    }, { passive: true });
  }
});
