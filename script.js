const bgImg       = document.querySelector('#bgZoom img');
const heroSection = document.querySelector('.section--hero');
const progressBar = document.getElementById('progressBar');
const bgOverlay   = document.querySelector('.bg-overlay');

const ZOOM_MAX = 0.42; // scale(1) → scale(1.42)

function onScroll() {
  const scrolled  = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Zoom synchronisé sur l'ensemble du scroll
  if (bgImg && maxScroll > 0) {
    const t = Math.min(scrolled / maxScroll, 1);
    bgImg.style.transform = `scale(${1 + t * ZOOM_MAX})`;
  }

  // bg-overlay : transparent pendant le hero, sombre ensuite
  if (bgOverlay && heroSection) {
    const heroH = heroSection.offsetHeight;
    const t = Math.min(scrolled / (heroH * 0.75), 1);
    bgOverlay.style.opacity = t.toString();
  }

  // Barre de progression
  if (progressBar && maxScroll > 0) {
    progressBar.style.width = `${(scrolled / maxScroll) * 100}%`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// Animations d'entrée (IntersectionObserver)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate').forEach(el => observer.observe(el));
