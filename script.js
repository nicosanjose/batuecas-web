const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header: transparent-over-hero -> solid on scroll ---------- */
(function () {
  const header = document.querySelector('header.site');
  if (!header) return;
  const hasHero = !!document.querySelector('.hero-video');
  if (!hasHero) {
    header.classList.add('solid');
    return;
  }
  const threshold = () => window.innerHeight * 0.82;
  const onScroll = () => header.classList.toggle('solid', window.scrollY > threshold());
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- hero: crossfade between property videos ---------- */
(function () {
  const videos = document.querySelectorAll('.hero-video video.hero-bg');
  if (videos.length < 2 || REDUCE) return;
  let i = 0;
  setInterval(() => {
    videos[i].classList.remove('active');
    i = (i + 1) % videos.length;
    videos[i].classList.add('active');
  }, 6000);
})();

/* ---------- mobile nav ---------- */
(function () {
  const burger = document.querySelector('.burger');
  if (!burger) return;
  burger.addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.querySelectorAll('.nav-overlay a').forEach((a) =>
    a.addEventListener('click', () => document.body.classList.remove('nav-open'))
  );
})();

/* ---------- filter bar (pisos-turisticos listing) ---------- */
(function () {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const buttons = bar.querySelectorAll('button[data-filter]');
  const cards = document.querySelectorAll('[data-city]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach((c) => { c.style.display = f === 'all' || c.dataset.city === f ? '' : 'none'; });
    });
  });
})();

/* ---------- demo forms (no backend) ---------- */
(function () {
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = form.parentElement.querySelector('.form-success');
      if (success) success.classList.add('show');
      form.querySelectorAll('input,select,textarea').forEach((f) => (f.disabled = true));
      form.querySelector('button[type=submit]')?.setAttribute('disabled', '');
    });
  });
})();

/* ---------- FAQ accordion ---------- */
(function () {
  document.querySelectorAll('.faq-list').forEach((list) => {
    const items = list.querySelectorAll('.faq-item');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) items.forEach((o) => { if (o !== item) o.open = false; });
      });
    });
  });
})();

/* ---------- showcase: click a project on the left, its photo
   slides in on the right (reformas section) ---------- */
(function () {
  const showcase = document.querySelector('.showcase');
  if (!showcase) return;
  const items = showcase.querySelectorAll('.showcase-item');
  const panels = showcase.querySelectorAll('.showcase-panel img');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((i) => i.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      item.classList.add('active');
      const target = showcase.querySelector('.showcase-panel img[data-key="' + item.dataset.key + '"]');
      target?.classList.add('active');
    });
  });
})();

/* ============================================================
   GSAP + Lenis: smooth scroll and generic scroll reveals.
   ============================================================ */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // A CDN failed to load: reveal everything immediately rather than
    // leaving .reveal elements stuck at opacity:0 forever.
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Smooth inertial scroll (Lenis), wired to GSAP's ticker so
  // ScrollTrigger and Lenis stay in sync. Skipped for reduced motion.
  if (!REDUCE && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Generic fade-up reveal for section content across every page.
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Subtle Ken Burns zoom-out on the full-viewport feature slide,
  // tied to its own scroll position rather than the whole page.
  if (!REDUCE) {
    document.querySelectorAll('.feature-slide img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.15 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: img.closest('.feature-slide'), start: 'top bottom', end: 'top top', scrub: true },
      });
    });
  }
})();
