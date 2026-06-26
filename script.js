if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const bgImg       = document.getElementById('bgImg');
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

  if (bgImg && !reducedMotion) {
    bgImg.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
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

// ─── Musique de fond ────────────────────────────────
const audio     = document.getElementById('bg-audio');
const musicBtn  = document.getElementById('musicBtn');
const iconNote  = musicBtn && musicBtn.querySelector('.music-icon--note');
const iconMute  = musicBtn && musicBtn.querySelector('.music-icon--mute');

let musicStarted = false;
let muted        = false;

function setPlayingState(playing) {
  if (!musicBtn) return;
  musicBtn.classList.toggle('is-playing', playing);
  musicBtn.setAttribute('aria-label', playing ? 'Couper la musique' : 'Activer la musique');
  if (iconNote) iconNote.style.display = playing ? '' : 'none';
  if (iconMute) iconMute.style.display = playing ? 'none' : '';
}

function startMusic() {
  if (musicStarted || !audio) return;

  audio.volume = 0.45;
  const p = audio.play();
  if (p === undefined) {        // très vieux navigateurs : pas de promesse
    musicStarted = true;
    setPlayingState(true);
    return;
  }
  p.then(() => {
      musicStarted = true;
      setPlayingState(true);
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('click',       startMusic);
    })
    .catch(() => {
      // Geste non accepté (scroll sur Android) — on attend un vrai tap
    });
}

// Tap franc n'importe où → tente le démarrage (le bouton reste la garantie)
document.addEventListener('pointerdown', startMusic, { passive: true });
document.addEventListener('click',       startMusic, { passive: true });

// Bouton : démarre si pas encore lancé, sinon toggle mute / unmute
if (musicBtn) {
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();          // évite le double-déclenchement via le listener document
    if (!musicStarted) {
      startMusic();
      return;
    }
    muted = !muted;
    audio.muted = muted;
    setPlayingState(!muted);
  });
}

// Initialisation visuelle : icône note visible, mute masquée
setPlayingState(false);

// ─── Overlay d'accueil : ouverture de la carte ──────
const inviteOverlay = document.getElementById('inviteOverlay');

function openInvitation() {
  if (!inviteOverlay || inviteOverlay.classList.contains('is-open')) return;
  startMusic();                                    // tap franc → lecture autorisée partout
  inviteOverlay.classList.add('is-open');
  document.body.classList.remove('invite-locked'); // déclenche la cascade du hero, synchronisée
  setTimeout(() => inviteOverlay.classList.add('is-gone'), 1800);
}

if (inviteOverlay) {
  inviteOverlay.addEventListener('click', openInvitation);
  inviteOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvitation(); }
  });
} else {
  // Sécurité : si l'overlay n'existe pas, ne jamais laisser le hero gelé
  document.body.classList.remove('invite-locked');
}
