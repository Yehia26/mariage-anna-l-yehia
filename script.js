const bg          = document.getElementById('bg');
const progressBar = document.getElementById('progressBar');

const ZOOM_START    = 1.0;
const ZOOM_END      = 1.65;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let rafPending = false;

function update() {
  rafPending = false;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const t     = Math.min(window.scrollY / maxScroll, 1);
  const scale = ZOOM_START + t * (ZOOM_END - ZOOM_START);

  if (bg && !reducedMotion) {
    bg.style.transform = `scale(${scale.toFixed(4)})`;
  }

  if (progressBar) {
    progressBar.style.width = `${(t * 100).toFixed(1)}%`;
  }
}

function onScroll() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(update);
}

window.addEventListener('scroll', onScroll, { passive: true });
update();

// Animations d'entrée au scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate').forEach(el => observer.observe(el));
