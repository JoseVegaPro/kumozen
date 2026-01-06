document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function markLoaded(el) {
  el.classList.add('is-loaded');
}

function setupLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;

  const body = document.body;
  const durationMs = prefersReducedMotion ? 1600 : 12000;
  let finished = false;
  let finishScheduled = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    loader.classList.add('is-hidden');
    body.classList.remove('is-loading');
  };

  body.classList.add('is-loading');

  const scheduleFinish = () => {
    if (finishScheduled) return;
    finishScheduled = true;
    if (window.gsap && !prefersReducedMotion) {
      const fadeMs = 700;
      const holdMs = Math.max(0, durationMs - fadeMs);
      gsap.to(loader, {
        opacity: 0,
        duration: fadeMs / 1000,
        ease: 'power2.in',
        delay: holdMs / 1000,
        onComplete: finish
      });
    } else {
      window.setTimeout(finish, durationMs);
    }
  };

  scheduleFinish();

  if (window.gsap && !prefersReducedMotion) {
    gsap.fromTo(
      loader,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
    gsap.fromTo(
      loader.querySelector('.loader-core'),
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
  }
}

function setupMediaLoading() {
  const media = document.querySelectorAll('img[loading], video[preload]');

  media.forEach((el) => {
    if (el.tagName === 'IMG') {
      if (el.complete && el.naturalWidth > 0) {
        markLoaded(el);
      } else {
        el.addEventListener('load', () => markLoaded(el), { once: true });
      }
    } else if (el.tagName === 'VIDEO') {
      if (el.readyState > 1) {
        markLoaded(el);
      } else {
        el.addEventListener('loadeddata', () => markLoaded(el), { once: true });
      }
    }
  });
}

function setupVideoAutoplay() {
  const videos = Array.from(document.querySelectorAll('[data-autoplay-visible]'));
  if (!videos.length) return;

  if (prefersReducedMotion) {
    videos.forEach((video) => {
      video.pause();
      video.removeAttribute('autoplay');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.35 }
  );

  videos.forEach((video) => observer.observe(video));
}

function setupNavState() {
  const nav = document.querySelector('.nav-bar');
  if (!nav) return;

  const update = () => {
    nav.classList.toggle('is-solid', window.scrollY > 24);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupSnapReveal() {
  const cards = Array.from(document.querySelectorAll('.snap-card'));
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.35 }
  );

  cards.forEach((card) => observer.observe(card));
}

function setupSmoothAnchors() {
  const links = Array.from(document.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      const target = hash && document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', hash);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupLoader();
  setupMediaLoading();
  setupVideoAutoplay();
  setupNavState();
  setupSnapReveal();
  setupSmoothAnchors();
});
