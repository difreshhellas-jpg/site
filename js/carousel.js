// DIFRESHHELLAS — reusable background-image carousel
// Usage: initCarousel({ root: '#hero', images: ['a.jpg','b.jpg'], folder: 'images/', alt: 'Product name' })

function initCarousel(config) {
  var root = document.querySelector(config.root);
  if (!root) return;

  var images = config.images;
  var folder = config.folder || 'images/';
  var index = 0;
  var interval = null;
  var AUTO_MS = 7000;

  var slidesWrap = root.querySelector('.bg-slides');
  var dotsWrap = root.querySelector('.carousel-dots');
  var prevBtn = root.querySelector('.carousel-arrow.prev');
  var nextBtn = root.querySelector('.carousel-arrow.next');

  // Build slides
  images.forEach(function (img, i) {
    var div = document.createElement('div');
    div.className = 'bg-slide' + (i === 0 ? ' active' : '');
    div.style.backgroundImage = "url('" + folder + img + "')";
    div.setAttribute('role', 'img');
    div.setAttribute('aria-label', (config.alt || 'Product') + ' - variant ' + (i + 1));
    slidesWrap.appendChild(div);
  });

  // Build dots
  if (dotsWrap) {
    images.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', 'Variant ' + (i + 1));
      dot.addEventListener('click', function () {
        go(i);
        resetAutoPlay();
      });
      dotsWrap.appendChild(dot);
    });
  }

  var slideEls = slidesWrap.querySelectorAll('.bg-slide');
  var dotEls = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];

  function update() {
    slideEls.forEach(function (el, i) {
      el.classList.toggle('active', i === index);
    });
    dotEls.forEach(function (el, i) {
      el.classList.toggle('active', i === index);
    });
  }

  function go(i) {
    index = (i + images.length) % images.length;
    update();
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  function resetAutoPlay() {
    if (interval) clearInterval(interval);
    interval = setInterval(next, AUTO_MS);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoPlay(); });

  // Wheel control (debounced)
  var wheelLock = false;
  root.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    setTimeout(function () { wheelLock = false; }, 100);
    if (e.deltaY > 0 || e.deltaX > 0) next(); else prev();
    resetAutoPlay();
  }, { passive: false });

  // Keyboard control
  document.addEventListener('keydown', function (e) {
    if (!isElementInViewport(root)) return;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { next(); resetAutoPlay(); }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { prev(); resetAutoPlay(); }
  });

  function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  resetAutoPlay();
}
