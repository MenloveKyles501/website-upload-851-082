(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      start();
    }

    var searchInput = document.querySelector('.js-search-input');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.js-filter'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function textOfCard(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = textOfCard(card);
        var filterMatch = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var queryMatch = !query || text.indexOf(query) !== -1;
        var show = filterMatch && queryMatch;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
      }
      searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });
    applyFilters();

    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-layer');
      var stream = player.getAttribute('data-stream');
      var initialized = false;
      var hlsInstance = null;

      function bindStream() {
        if (initialized || !video || !stream) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function playVideo() {
        bindStream();
        if (!video) {
          return;
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(function () {
            player.classList.add('is-playing');
          }).catch(function () {
            player.classList.remove('is-playing');
          });
        } else {
          player.classList.add('is-playing');
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            player.classList.remove('is-playing');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
