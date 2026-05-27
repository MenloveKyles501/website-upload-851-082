(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initImages() {
        var images = document.querySelectorAll("img");
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var progress = hero.querySelector("[data-hero-progress]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
            if (progress) {
                progress.style.width = ((index + 1) / slides.length * 100) + "%";
            }
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
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
        show(0);
        start();
    }

    function initPlayers() {
        var videos = document.querySelectorAll("video[data-stream]");
        videos.forEach(function (video) {
            var stream = video.getAttribute("data-stream");
            var attached = false;
            var trigger = document.querySelector('[data-play-target="' + video.id + '"]');
            var hlsInstance = null;

            function attach() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
                if (trigger) {
                    trigger.classList.add("hidden");
                }
            }

            if (trigger) {
                trigger.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (trigger) {
                    trigger.classList.add("hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (trigger && video.currentTime === 0) {
                    trigger.classList.remove("hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function cardTemplate(item) {
        return [
            '<a class="movie-card" href="' + item.url + '">',
            '    <span class="card-media">',
            '        <img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
            '        <span class="card-shade"></span>',
            '        <span class="play-mark">▶</span>',
            '        <span class="year-badge">' + item.year + '</span>',
            '    </span>',
            '    <span class="card-body">',
            '        <strong>' + item.title + '</strong>',
            '        <em>' + item.oneLine + '</em>',
            '        <span class="card-meta"><b>' + item.region + '</b><b>' + item.type + '</b></span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function initSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        if (!results || !input || !window.movieSearchItems) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        input.value = query;
        if (!query) {
            return;
        }
        var normalized = query.toLowerCase();
        var found = window.movieSearchItems.filter(function (item) {
            return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
                .join(" ")
                .toLowerCase()
                .indexOf(normalized) !== -1;
        }).slice(0, 80);
        if (title) {
            title.textContent = "搜索：“" + query + "”";
        }
        results.innerHTML = found.map(cardTemplate).join("") || '<div class="article-page"><p>没有找到完全匹配的内容，可以尝试更短的片名、地区或类型关键词。</p></div>';
        initImages();
    }

    ready(function () {
        initMobileMenu();
        initImages();
        initHero();
        initPlayers();
        initSearchPage();
    });
})();
