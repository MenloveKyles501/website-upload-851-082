(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          start();
        });
      }

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      start();
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  if (yearFilter && cards.length) {
    var years = cards.map(function (card) {
      return card.getAttribute('data-year');
    }).filter(Boolean).filter(function (year, index, arr) {
      return arr.indexOf(year) === index;
    }).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      card.hidden = !matched;
    });
  }

  if (searchInput || categoryFilter || yearFilter) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q');

    if (initialKeyword && searchInput) {
      searchInput.value = initialKeyword;
    }

    [searchInput, categoryFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
}());

function initMoviePlayer(videoUrl) {
  var video = document.querySelector('[data-video-player]');
  var cover = document.querySelector('[data-player-cover]');
  var hls = null;
  var ready = false;

  if (!video || !videoUrl) {
    return;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function playVideo() {
    hideCover();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function attach() {
    if (ready) {
      playVideo();
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = videoUrl;
    playVideo();
  }

  if (cover) {
    cover.addEventListener('click', attach);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      attach();
    }
  });

  video.addEventListener('play', hideCover);
}
