const bg          = document.getElementById('bg');
const progressBar = document.getElementById('progressBar');

// Zoom : scale(1) au départ → scale(1.35) à la fin du scroll
const SCALE_MAX = 0.35;

function onScroll() {
  const scrolled  = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const t = Math.min(scrolled / maxScroll, 1);

  // Zoom progressif sur le fond
  if (bg) {
    bg.style.transform = `scale(${1 + t * SCALE_MAX})`;
  }

  // Barre de progression
  if (progressBar) {
    progressBar.style.width = `${t * 100}%`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

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
