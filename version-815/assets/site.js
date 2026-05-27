(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAutoPlay();
      });
    }

    startAutoPlay();
  }

  function createCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-dot">▶</span>',
      '<span class="poster-badge">' + escapeHtml(item.category) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p class="card-desc">' + escapeHtml(item.desc) + '</p>',
      '<div class="card-meta">',
      '<span>★ ' + escapeHtml(item.rating) + '</span>',
      '<span>' + escapeHtml(item.views) + '</span>',
      '<span>' + escapeHtml(item.year) + '</span>',
      '</div>',
      '</div>'
    ].join('');

    return article;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchStatus = document.querySelector('[data-search-status]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = '';

  function renderSearch() {
    if (!searchResults || !window.SEARCH_ITEMS) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var items = window.SEARCH_ITEMS.filter(function (item) {
      var matchesKeyword = !keyword || String(item.keywords).toLowerCase().indexOf(keyword) !== -1;
      var matchesFilter = !activeFilter || item.category === activeFilter;
      return matchesKeyword && matchesFilter;
    }).slice(0, 96);

    searchResults.innerHTML = '';

    items.forEach(function (item) {
      searchResults.appendChild(createCard(item));
    });

    if (searchStatus) {
      searchStatus.textContent = items.length ? '为你找到相关内容' : '暂无匹配内容';
    }
  }

  if (searchResults && window.SEARCH_ITEMS) {
    var queryValue = getQueryValue('q');

    if (searchInput && queryValue) {
      searchInput.value = queryValue;
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        activeFilter = button.getAttribute('data-filter') || '';
        renderSearch();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', renderSearch);
    }

    renderSearch();
  }

  var player = document.querySelector('[data-player]');
  var playerButton = document.querySelector('[data-player-start]');
  var playerMessage = document.querySelector('[data-player-message]');
  var playerReady = false;

  function setPlayerMessage(text) {
    if (playerMessage) {
      playerMessage.textContent = text || '';
    }
  }

  function startPlayer() {
    if (!player) {
      return;
    }

    var source = player.getAttribute('data-source') || (playerButton && playerButton.getAttribute('data-source')) || '';

    if (!source) {
      setPlayerMessage('播放内容加载中');
      return;
    }

    if (playerButton) {
      playerButton.classList.add('is-hidden');
    }

    if (playerReady) {
      player.play().catch(function () {});
      return;
    }

    playerReady = true;
    setPlayerMessage('正在加载播放内容');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(player);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setPlayerMessage('');
        player.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setPlayerMessage('播放加载失败，请稍后重试');
          }
        }
      });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.addEventListener('loadedmetadata', function () {
        setPlayerMessage('');
        player.play().catch(function () {});
      }, { once: true });
    } else {
      player.src = source;
      player.play().then(function () {
        setPlayerMessage('');
      }).catch(function () {
        setPlayerMessage('播放加载中，请稍后重试');
      });
    }
  }

  if (playerButton) {
    playerButton.addEventListener('click', startPlayer);
  }

  if (player) {
    player.addEventListener('click', function () {
      if (!playerReady) {
        startPlayer();
      }
    });
  }
})();
