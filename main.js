document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function markLoaded(el) {
  el.classList.add('is-loaded');
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

document.addEventListener('DOMContentLoaded', () => {
  setupMediaLoading();
  setupVideoAutoplay();
});
