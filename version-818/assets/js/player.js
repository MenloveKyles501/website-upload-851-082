(function () {
    const player = document.querySelector('[data-player]');
    const video = document.querySelector('[data-player-video]');
    if (!player || !video) {
        return;
    }

    const source = video.dataset.src;
    let hlsInstance = null;

    function initializeHls() {
        if (!source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = source;
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function togglePlay() {
        if (video.paused) {
            video.play().catch(function () {
                video.setAttribute('controls', 'controls');
            });
        } else {
            video.pause();
        }
    }

    function updatePlayingState() {
        player.classList.toggle('is-playing', !video.paused);
    }

    document.querySelectorAll('[data-video-toggle]').forEach(function (button) {
        button.addEventListener('click', togglePlay);
    });

    const muteButton = document.querySelector('[data-video-mute]');
    if (muteButton) {
        muteButton.addEventListener('click', function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }

    const fullscreenButton = document.querySelector('[data-video-fullscreen]');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                player.requestFullscreen().catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        });
    }

    video.addEventListener('play', updatePlayingState);
    video.addEventListener('pause', updatePlayingState);
    video.addEventListener('ended', updatePlayingState);

    initializeHls();
})();
