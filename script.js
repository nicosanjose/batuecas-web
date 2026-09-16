const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- cinematic intro (home page only): dark curtain + logo,
   then the real hero-video section (scaled down small) fades in and
   expands to full size. Skipped entirely for reduced motion or if the
   GSAP CDN failed — the page must never stay stuck mid-intro. ---------- */
(function () {
  const overlay = document.querySelector('.intro-overlay');
  if (!overlay) return;
  const finish = () => {
    document.body.classList.remove('has-intro');
    overlay.remove();
    // Other ScrollTrigger instances (the build-reveal pin, in particular)
    // were measured while has-intro's overflow:hidden was still on the
    // body, i.e. against a slightly different layout/scrollbar state.
    // Recalculate now that the page has settled into its final layout.
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  };
  if (REDUCE || typeof gsap === 'undefined') {
    finish();
    return;
  }
  gsap.timeline({ onComplete: finish })
    .fromTo('.intro-logo', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' })
    .to('.intro-logo', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.9')
    .to('.hero-video', { opacity: 1, duration: 0.2 }, '<')
    .to('.hero-video', { scale: 1, borderRadius: 0, duration: 1.4, ease: 'power3.inOut' }, '-=0.05')
    .to(overlay, { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5')
    .to('.hero-content', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .set('.hero-video', { clearProps: 'transform,opacity,zIndex,position,borderRadius' });
})();

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
  // Wrap every letter of the build-reveal headline in its own span so the
  // gray-to-black fill can be staggered character-by-character rather than
  // line-by-line. The trailing accent dot is a separate element already
  // and is left untouched.
  document.querySelectorAll('.build-chars').forEach((container) => {
    const nodes = Array.from(container.childNodes);
    container.innerHTML = '';
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split('').forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'build-char';
          span.textContent = ch;
          container.appendChild(span);
        });
      } else {
        container.appendChild(node);
      }
    });
  });

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // A CDN failed to load: reveal everything immediately rather than
    // leaving .reveal elements stuck at opacity:0 forever.
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.build-char').forEach((el) => { el.style.color = 'rgba(27,20,15,1)'; });
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

  // Build reveal: pin the stage while scrolling through it. The exploded
  // materials image sits still on the left; the headline on the right
  // fills in from gray to black, one line at a time, as you scroll.
  // Skipped for reduced motion — final (black) state shown directly.
  const buildStage = document.querySelector('.build-stage');
  if (buildStage && !REDUCE) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.build-reveal', start: 'top top', end: '+=160%', pin: buildStage, scrub: 0.4,
      },
    }).to('.build-char', { color: 'rgba(27,20,15,1)', stagger: 0.045, ease: 'none' });
  } else if (buildStage) {
    document.querySelectorAll('.build-char').forEach((el) => { el.style.color = 'rgba(27,20,15,1)'; });
  }
})();
