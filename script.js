const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header: condense early in the hero, go "solid" (ink icons)
   only once the page behind the header is actually light ---------- */
(function () {
  const header = document.querySelector('header.site');
  if (!header) return;
  const hasHero = !!document.querySelector('.hero-video');
  if (!hasHero) {
    header.classList.add('condensed', 'solid');
    return;
  }
  const condensedThreshold = 80; // condense almost as soon as you start scrolling
  const solidThreshold = () => window.innerHeight * 0.92; // just before leaving the hero, into the white build-reveal section
  const onScroll = () => {
    header.classList.toggle('condensed', window.scrollY > condensedThreshold);
    header.classList.toggle('solid', window.scrollY > solidThreshold());
  };
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
    const video = document.querySelector('.build-video');
    if (video) {
      video.addEventListener('loadedmetadata', () => { video.currentTime = video.duration; });
    }
    document.querySelectorAll('.build-line:not(.accent)').forEach((el) => { el.style.color = 'rgba(27,20,15,1)'; });
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

  // Build reveal: pin the stage while scrolling through it. First, the
  // house-assembly video (left half) is scrubbed frame-by-frame by scroll
  // position — no autoplay, the scroll position IS the playhead. Then,
  // still pinned, the headline (right half) fills in from gray to black
  // one line at a time. Skipped for reduced motion — final state shown
  // directly instead (see the REDUCE branch below).
  const buildStage = document.querySelector('.build-stage');
  const buildVideo = document.querySelector('.build-video');
  if (buildStage && buildVideo && !REDUCE) {
    const setupBuildTimeline = () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: '.build-reveal', start: 'top top', end: '+=250%', pin: buildStage, scrub: 0.4,
        },
      })
        .to(buildVideo, { currentTime: buildVideo.duration, ease: 'none', duration: 1.5 }, 0)
        .to('.build-line:not(.accent)', { color: 'rgba(27,20,15,1)', stagger: 0.35, ease: 'none' }, 1.6);
    };
    if (buildVideo.readyState >= 1) {
      setupBuildTimeline();
    } else {
      buildVideo.addEventListener('loadedmetadata', setupBuildTimeline, { once: true });
    }
  } else if (buildStage && buildVideo) {
    buildVideo.addEventListener('loadedmetadata', () => { buildVideo.currentTime = buildVideo.duration; }, { once: true });
    document.querySelectorAll('.build-line:not(.accent)').forEach((el) => { el.style.color = 'rgba(27,20,15,1)'; });
  }
})();
