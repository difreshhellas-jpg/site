// DIFRESHHELLAS — site-wide animation engine
// Scroll reveals, stat count-up, intro splash, header state, souvenir color cycler.
// Everything respects prefers-reduced-motion.
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Header scrolled state ---------- */
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('scrolled', window.scrollY > 24);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Scroll reveals (auto-tagged, staggered) ---------- */
    var revealSelectors = [
      '.section-head', '.product-card', '.spec-item', '.ps-media', '.ps-content',
      '.about-grid > div', '.map-frame-wrap', '.contact-form', '.contact-alt',
      '.social-links', '.footer-col', '.about-stats .stat'
    ];
    var revealEls = document.querySelectorAll(revealSelectors.join(','));

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
    } else {
      // Stagger siblings that share a parent (cards in a grid rise one after another)
      var parentCounts = new Map();
      revealEls.forEach(function (el) {
        el.classList.add('will-reveal');
        var p = el.parentElement;
        var n = parentCounts.get(p) || 0;
        el.style.setProperty('--rd', Math.min(n * 70, 420) + 'ms');
        parentCounts.set(p, n + 1);
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) {
        // Anything already on screen shows immediately; the rest reveal on scroll
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('revealed');
        } else {
          io.observe(el);
        }
      });
    }

    /* ---------- Stat count-up ---------- */
    var stats = document.querySelectorAll('.about-stats .num[data-count]');
    if (stats.length && !reducedMotion && 'IntersectionObserver' in window) {
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          statIO.unobserve(el);
          var target = parseFloat(el.getAttribute('data-count'));
          var suffix = el.getAttribute('data-suffix') || '';
          var start = null, dur = 1400;
          function tick(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.6 });
      stats.forEach(function (el) { statIO.observe(el); });
    }

    /* ---------- Souvenir color cycler (homepage) ---------- */
    document.querySelectorAll('.auto-cycle').forEach(function (wrap) {
      var img = wrap.querySelector('img');
      var list = (wrap.getAttribute('data-images') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!img || list.length < 2 || reducedMotion) return;
      var i = 0;
      setInterval(function () {
        img.classList.add('fading');
        setTimeout(function () {
          i = (i + 1) % list.length;
          img.src = list[i];
          img.classList.remove('fading');
        }, 500);
      }, 3000);
    });

    /* ---------- Intro splash (homepage) ---------- */
    var splash = document.getElementById('intro-splash');
    if (splash && !splash.hidden) {
      var video = splash.querySelector('video');
      var skipBtn = document.getElementById('intro-skip');
      var closed = false;

      function replayHeroEntrance() {
        document.querySelectorAll('.hero-content > *').forEach(function (el) {
          el.style.animation = 'none';
          void el.offsetWidth; // force reflow
          el.style.animation = '';
        });
      }

      function closeSplash() {
        if (closed) return;
        closed = true;
        try { sessionStorage.setItem('difreshIntroSeen', '1'); } catch (e) {}
        splash.classList.add('done');
        document.documentElement.classList.remove('intro-lock');
        replayHeroEntrance();
        setTimeout(function () { splash.remove(); }, 800);
      }

      if (skipBtn) skipBtn.addEventListener('click', closeSplash);
      splash.addEventListener('click', function (e) { if (e.target === splash) closeSplash(); });
      if (video) {
        video.addEventListener('ended', closeSplash);
        video.addEventListener('error', closeSplash);
        var playAttempt = video.play();
        if (playAttempt && playAttempt.catch) {
          playAttempt.catch(function () { closeSplash(); });
        }
      }
      // Hard safety net: never trap the user longer than 10s
      setTimeout(closeSplash, 10000);
    }

    /* ---------- Hero background video fallback ---------- */
    var heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
      heroVideo.addEventListener('error', function () { heroVideo.style.display = 'none'; });
      if (reducedMotion) {
        try { heroVideo.pause(); } catch (e) {}
      } else {
        // Resume if the page loaded in a hidden tab (autoplay defers there)
        var resume = function () {
          if (document.visibilityState === 'visible' && heroVideo.paused) {
            var p = heroVideo.play();
            if (p && p.catch) p.catch(function () {});
          }
        };
        document.addEventListener('visibilitychange', resume);
        resume();
      }
    }
  });
})();
