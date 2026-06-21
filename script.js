// ── Fond panoramique : translateX proportionnel au scroll vertical ──
const bgStrip     = document.getElementById('bgStrip');
const progressBar = document.getElementById('progressBar');
const IMG_COUNT   = bgStrip ? bgStrip.querySelectorAll('img').length : 1;

function onScroll() {
  const scrolled   = window.scrollY;
  const maxScroll  = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const progress = Math.min(scrolled / maxScroll, 1);

  if (bgStrip) {
    const maxTranslate = (IMG_COUNT - 1) * window.innerWidth;
    bgStrip.style.transform = `translateX(${-progress * maxTranslate}px)`;
  }

  if (progressBar) {
    progressBar.style.width = `${progress * 100}%`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// ── Animations d'entrée via IntersectionObserver ─────────────────────
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
