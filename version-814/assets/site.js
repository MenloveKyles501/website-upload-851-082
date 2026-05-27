(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]"));
        var noResults = document.querySelector(".no-results");
        var filters = {
            category: "all",
            year: "all",
            region: "all",
            type: "all"
        };

        function cardText(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-category") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
        }

        function matchYear(card, value) {
            if (value === "all") {
                return true;
            }
            var year = parseInt(card.getAttribute("data-year") || "0", 10);
            if (value === "before2020") {
                return year > 0 && year < 2020;
            }
            return String(year) === value;
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var ok = true;
                if (query && cardText(card).indexOf(query) === -1) {
                    ok = false;
                }
                if (filters.category !== "all" && card.getAttribute("data-category") !== filters.category) {
                    ok = false;
                }
                if (filters.region !== "all" && card.getAttribute("data-region") !== filters.region) {
                    ok = false;
                }
                if (filters.type !== "all" && card.getAttribute("data-type") !== filters.type) {
                    ok = false;
                }
                if (!matchYear(card, filters.year)) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle("show", visible === 0);
            }
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var queryFromUrl = params.get("q");
            if (queryFromUrl) {
                searchInput.value = queryFromUrl;
            }
            searchInput.addEventListener("input", applyFilters);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                var type = button.getAttribute("data-filter-type");
                var value = button.getAttribute("data-filter-value") || "all";
                filters[type] = value;
                filterButtons
                    .filter(function (item) {
                        return item.getAttribute("data-filter-type") === type;
                    })
                    .forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                applyFilters();
            });
        });

        var sortButtons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
        sortButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                var mode = button.getAttribute("data-sort");
                var grid = document.querySelector("[data-sort-grid]");
                if (!grid) {
                    return;
                }
                sortButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                var sorted = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));
                sorted.sort(function (a, b) {
                    if (mode === "year") {
                        return parseInt(b.getAttribute("data-year") || "0", 10) - parseInt(a.getAttribute("data-year") || "0", 10);
                    }
                    if (mode === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    return parseInt(a.getAttribute("data-index") || "0", 10) - parseInt(b.getAttribute("data-index") || "0", 10);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        });

        applyFilters();
    });

    window.initMoviePlayer = function (streamUrl) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var overlay = document.querySelector(".player-overlay");
            var playButton = document.querySelector(".player-overlay");
            if (!video || !overlay || !streamUrl) {
                return;
            }

            var attach = function () {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            overlay.querySelector(".player-label").textContent = "视频暂时无法播放";
                        }
                    });
                    return;
                }
                video.src = streamUrl;
            };

            var start = function () {
                overlay.classList.add("hide");
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        overlay.classList.remove("hide");
                    });
                }
            };

            attach();

            playButton.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        });
    };
})();
