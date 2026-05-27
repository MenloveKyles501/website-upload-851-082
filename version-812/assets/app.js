(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var navPanel = document.querySelector("[data-nav-panel]");

        if (menuButton && navPanel) {
            menuButton.addEventListener("click", function () {
                navPanel.classList.toggle("is-open");
            });
        }

        var filterInput = document.querySelector(".search-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function applyFilter(value) {
            var terms = String(value || "")
                .trim()
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });

                if (matched || terms.length === 0) {
                    card.style.display = "";
                    visible += 1;
                } else {
                    card.style.display = "none";
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (query) {
                filterInput.value = query;
            }

            applyFilter(filterInput.value);
            filterInput.addEventListener("input", function () {
                applyFilter(filterInput.value);
            });
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (frame) {
            var video = frame.querySelector("video");
            var overlay = frame.querySelector(".player-overlay");
            var streamUrl = video ? video.getAttribute("data-stream") : "";
            var loaded = false;
            var hlsInstance = null;

            function attachStream() {
                if (!video || !streamUrl || loaded) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    loaded = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    loaded = true;
                    return;
                }

                video.src = streamUrl;
                loaded = true;
            }

            function startPlayback() {
                attachStream();

                if (!video) {
                    return;
                }

                var playResult = video.play();

                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", function (event) {
                    event.preventDefault();
                    startPlayback();
                });
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        startPlayback();
                    } else {
                        video.pause();
                    }
                });

                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });

                video.addEventListener("pause", function () {
                    if (overlay && !video.ended) {
                        overlay.classList.remove("is-hidden");
                    }
                });

                video.addEventListener("ended", function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
