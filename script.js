const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header: transparent-over-hero -> solid on scroll ---------- */
(function () {
  const header = document.querySelector('header.site');
  if (!header) return;
  const hasHero = !!document.querySelector('.build-scroll');
  if (!hasHero) {
    header.classList.add('solid');
    return;
  }
  const threshold = () => window.innerHeight * 0.82;
  const onScroll = () => header.classList.toggle('solid', window.scrollY > threshold());
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- mobile nav ---------- */
(function () {
  const burger = document.querySelector('.burger');
  if (!burger) return;
  burger.addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.querySelectorAll('nav.main-links a').forEach((a) =>
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

/* ============================================================
   GSAP + Lenis: smooth scroll, generic reveals, and the
   photographic "villa being built" scroll sequence in the hero.
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

  // ---------------- Villa build sequence ----------------
  const scrollSection = document.querySelector('.build-scroll');
  if (!scrollSection) return;

  const images = gsap.utils.toArray('.build-img');
  const captions = gsap.utils.toArray('.build-caption');
  const dots = gsap.utils.toArray('.build-dots i');
  const cue = document.querySelector('.build-scrollcue');

  if (REDUCE || images.length < 2) return; // CSS fallback already shows a static state

  gsap.set(images, { scale: 1.08 });
  gsap.set(images[0], { scale: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scrollSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      pin: '.build-pin',
      anticipatePin: 1,
      onUpdate: (self) => { if (cue) cue.style.opacity = self.progress > 0.03 ? '0' : '1'; },
    },
  });

  const steps = images.length - 1;
  for (let i = 0; i < steps; i++) {
    const at = i;
    tl.to(images[i], { opacity: 0, scale: 1.08, duration: 1, ease: 'power1.inOut' }, at)
      .to(images[i + 1], { opacity: 1, scale: 1, duration: 1, ease: 'power1.inOut' }, at)
      .to(captions[i], { opacity: 0, y: -18, duration: 0.35 }, at)
      .to(captions[i + 1], { opacity: 1, y: 0, duration: 0.35 }, at + 0.55)
      .call(() => {
        dots.forEach((d) => d.classList.remove('on'));
        dots[at + 1]?.classList.add('on');
      }, null, at + 0.55);
  }
})();
