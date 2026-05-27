document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  if (slides.length > 0) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var searchInput = document.querySelector("[data-movie-search]");
  var regionFilter = document.querySelector("[data-region-filter]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var categoryFilter = document.querySelector("[data-category-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector("[data-empty]");
  var normalize = function (value) {
    return String(value || "").trim().toLowerCase();
  };
  var runFilter = function () {
    if (cards.length === 0) {
      return;
    }
    var q = normalize(searchInput ? searchInput.value : "");
    var region = normalize(regionFilter ? regionFilter.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var category = normalize(categoryFilter ? categoryFilter.value : "");
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
      var matchQ = !q || text.indexOf(q) !== -1;
      var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
      var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
      var matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
      var ok = matchQ && matchRegion && matchYear && matchCategory;
      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };
  [searchInput, regionFilter, yearFilter, categoryFilter].forEach(function (element) {
    if (element) {
      element.addEventListener("input", runFilter);
      element.addEventListener("change", runFilter);
    }
  });
  runFilter();

  Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (player) {
    var video = player.querySelector("video");
    var start = player.querySelector(".player-start");
    var status = player.querySelector(".player-status");
    var url = player.getAttribute("data-stream");
    var loaded = false;
    var hls = null;
    var setStatus = function (value) {
      if (status) {
        status.textContent = value || "";
      }
    };
    var begin = function () {
      if (!video || !url) {
        setStatus("视频加载失败，请稍后重试");
        return;
      }
      if (!loaded) {
        loaded = true;
        setStatus("加载中…");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请稍后重试");
              if (hls) {
                hls.destroy();
                hls = null;
              }
              loaded = false;
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
            video.play().catch(function () {});
          }, { once: true });
          video.load();
        } else {
          setStatus("视频加载失败，请稍后重试");
          loaded = false;
          return;
        }
      } else {
        video.play().catch(function () {});
      }
      if (start) {
        start.classList.add("is-hidden");
      }
    };
    if (start) {
      start.addEventListener("click", begin);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (start) {
          start.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (start && video.currentTime === 0) {
          start.classList.remove("is-hidden");
        }
      });
    }
  });
});
