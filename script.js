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

// ─── DIAGNOSTIC TEMPORAIRE (à retirer) ──────────────
const dbg = document.createElement('div');
dbg.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,.85);color:#fff;font:12px/1.4 monospace;padding:6px 8px;white-space:pre-wrap;word-break:break-word;';
dbg.textContent = 'diag: en attente d\'un geste…';
document.body.appendChild(dbg);
function diag(msg) { dbg.textContent = 'diag: ' + msg; }

if (audio) {
  diag('audio trouvé. readyState=' + audio.readyState + ' networkState=' + audio.networkState);
  audio.addEventListener('error', () => {
    const e = audio.error;
    diag('AUDIO ERROR code=' + (e ? e.code : '?') + ' (1=ABORT 2=NETWORK 3=DECODE 4=SRC_NOT_SUPPORTED)');
  });
  audio.addEventListener('stalled', () => diag('stalled (réseau bloqué)'));
}

function startMusic(evt) {
  if (musicStarted || !audio) return;
  musicStarted = true;

  diag('geste=' + (evt ? evt.type : 'manuel') + ' → play()… readyState=' + audio.readyState);
  audio.volume = 0.45;
  const p = audio.play();
  if (p === undefined) {
    diag('play() a renvoyé undefined (vieux navigateur) — supposé OK');
    setPlayingState(true);
    return;
  }
  p.then(() => {
      diag('✅ PLAY OK — paused=' + audio.paused + ' muted=' + audio.muted + ' vol=' + audio.volume);
      setPlayingState(true);
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('touchend',    startMusic);
      document.removeEventListener('click',       startMusic);
    })
    .catch((err) => {
      diag('❌ PLAY REJETÉ : ' + err.name + ' — ' + err.message);
      musicStarted = false;
    });
}

// Listeners persistants jusqu'au succès (iOS + Android Chrome + Samsung Internet)
document.addEventListener('pointerdown', startMusic, { passive: true });
document.addEventListener('touchend',    startMusic, { passive: true });
document.addEventListener('click',       startMusic, { passive: true });

// Bouton : toggle mute / unmute
if (musicBtn) {
  musicBtn.addEventListener('click', () => {
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
