// DIFRESHHELLAS — navigation: mobile menu + active link highlighting
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.querySelector('.hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileClose = document.querySelector('.mobile-menu-close');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        mobileMenu.classList.add('open');
      });
    }
    if (mobileClose && mobileMenu) {
      mobileClose.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
      });
    }
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
        });
      });
    }

    // Highlight active nav link based on current page
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a, .mobile-menu a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path) {
        link.classList.add('active');
      }
    });
  });
})();
