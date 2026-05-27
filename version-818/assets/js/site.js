(function () {
    const select = (selector, scope = document) => scope.querySelector(selector);
    const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const mobileButton = select('[data-mobile-menu-button]');
    const mobileMenu = select('[data-mobile-menu]');
    if (mobileButton && mobileMenu) {
        mobileButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = select('[data-hero-slider]');
    if (hero) {
        const slides = selectAll('[data-hero-slide]', hero);
        const dots = selectAll('[data-hero-dot]', hero);
        let index = 0;

        const showSlide = function (nextIndex) {
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
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5000);
    }

    selectAll('[data-filter-group]').forEach(function (group) {
        const buttons = selectAll('[data-filter-value]', group);
        const scope = select('[data-filter-scope]', group.parentElement) || select('[data-filter-scope]');
        const cards = scope ? selectAll('.movie-card', scope) : [];

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                const value = button.dataset.filterValue;
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                cards.forEach(function (card) {
                    const match = value === 'all' || card.dataset.category === value;
                    card.classList.toggle('is-hidden', !match);
                });
            });
        });
    });

    selectAll('[data-type-filter-group]').forEach(function (group) {
        const buttons = selectAll('[data-type-filter]', group);
        const scope = select('[data-filter-scope]', group.closest('.container'));
        const cards = scope ? selectAll('.movie-card', scope) : [];

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                const value = button.dataset.typeFilter;
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                cards.forEach(function (card) {
                    const match = value === 'all' || card.dataset.type === value;
                    card.classList.toggle('is-hidden', !match);
                });
            });
        });
    });

    selectAll('.page-filter-input').forEach(function (input) {
        const scope = select(input.dataset.filterScope || '');
        const cards = scope ? selectAll('.movie-card', scope) : [];
        input.addEventListener('input', function () {
            const keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.category,
                    card.textContent
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', keyword && !haystack.includes(keyword));
            });
        });
    });

    const rail = select('[data-movie-rail]');
    const left = select('[data-rail-left]');
    const right = select('[data-rail-right]');
    if (rail && left && right) {
        left.addEventListener('click', function () {
            rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
        right.addEventListener('click', function () {
            rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
    }

    selectAll('[data-scroll-player]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const player = select('[data-player]');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
})();
