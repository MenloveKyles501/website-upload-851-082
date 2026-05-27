(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var clearButton = panel.querySelector("[data-filter-clear]");
    var countBox = panel.querySelector("[data-filter-count]");
    var grid = document.querySelector("[data-filter-grid]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (year && normalize(card.getAttribute("data-year")) !== year) {
          ok = false;
        }

        if (type && normalize(card.getAttribute("data-type")) !== type) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";

        if (ok) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = "匹配 " + visible + " 部";
      }

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }

        if (yearSelect) {
          yearSelect.value = "";
        }

        if (typeSelect) {
          typeSelect.value = "";
        }

        applyFilter();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && input) {
      input.value = q;
    }

    applyFilter();
  });

  document.querySelectorAll("[data-player]").forEach(function (wrap) {
    var video = wrap.querySelector("video");
    var button = wrap.querySelector("[data-play-button]");
    var stream = video ? video.getAttribute("data-stream") : "";

    function connect() {
      if (!video || video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute("data-ready", "1");
    }

    function play() {
      connect();

      if (button) {
        button.classList.add("is-hidden");
      }

      if (video && video.play) {
        var playResult = video.play();

        if (playResult && playResult.catch) {
          playResult.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
    }
  });
})();
