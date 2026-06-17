(function () {
  const NAV_H = 72; // hauteur barre nav (px)

  function getDims() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw < 768) {
      // Mobile : pleine largeur, hauteur moins la nav
      return { w: vw, h: vh - NAV_H };
    } else if (vw < 1200) {
      // Tablette
      const h = Math.round((vh - NAV_H) * 0.90);
      return { w: Math.round(h * 0.68), h };
    } else {
      // Desktop : demi-largeur × hauteur
      const h = Math.min(Math.round(vh * 0.85), 720);
      return { w: Math.round(h * 0.65), h };
    }
  }

  const { w, h } = getDims();

  const pageFlip = new St.PageFlip(
    document.getElementById('flip-book'),
    {
      width:               w,
      height:              h,
      size:                'fixed',
      showCover:           true,
      usePortrait:         true,   // 1 page à la fois en portrait mobile
      startPage:           0,
      drawShadow:          true,
      flippingTime:        850,
      mobileScrollSupport: false,  // évite conflit scroll/flip
      swipeDistance:       30,     // seuil swipe mobile (px)
      clickEventForward:   true,   // tap gauche/droite = flip
      autoSize:            false,
    }
  );

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));

  // ── Navigation ──────────────────────────────────────────────────
  const numEl = document.getElementById('page-num');
  const INNER = pageFlip.getPageCount() - 2; // sans les 2 couvertures hard

  function updateNav(idx) {
    const btnP = document.getElementById('btn-prev');
    const btnN = document.getElementById('btn-next');
    if (idx <= 0) {
      numEl.textContent = '·';
      btnP.disabled = true;
      btnN.disabled = false;
    } else if (idx >= pageFlip.getPageCount() - 1) {
      numEl.textContent = '·';
      btnP.disabled = false;
      btnN.disabled = true;
    } else {
      numEl.textContent = `${idx} / ${INNER}`;
      btnP.disabled = false;
      btnN.disabled = false;
    }
  }

  pageFlip.on('flip', (e) => updateNav(e.data));
  updateNav(0);

  document.getElementById('btn-next').addEventListener('click', () => pageFlip.flipNext('bottom'));
  document.getElementById('btn-prev').addEventListener('click', () => pageFlip.flipPrev('bottom'));
})();
