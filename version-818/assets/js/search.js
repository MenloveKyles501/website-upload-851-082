(function () {
    const movies = window.MOVIES || [];
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const input = document.getElementById('search-input');
    const summary = document.getElementById('search-summary');
    const results = document.getElementById('search-results');
    const categoryFilter = document.getElementById('search-category-filter');
    let activeCategory = 'all';

    if (input) {
        input.value = query;
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function movieMatches(movie, keyword) {
        if (!keyword) {
            return true;
        }
        const haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags,
            movie.oneLine,
            movie.summary,
            movie.category
        ].join(' ').toLowerCase();
        return haystack.includes(keyword.toLowerCase());
    }

    function cardTemplate(movie) {
        return `
                <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-type="${escapeHtml(movie.type)}" data-year="${escapeHtml(movie.year)}" data-category="${escapeHtml(movie.category)}">
                    <a class="poster-frame" href="detail/${movie.id}.html">
                        <img src="${movie.cover}" alt="${escapeHtml(movie.title)} 封面" loading="lazy">
                        <span class="play-chip">播放</span>
                    </a>
                    <div class="card-body">
                        <div class="card-meta-row">
                            <a class="card-category" href="category/${movie.categorySlug}.html">${escapeHtml(movie.category)}</a>
                            <span>${escapeHtml(movie.year)}</span>
                        </div>
                        <h3><a href="detail/${movie.id}.html">${escapeHtml(movie.title)}</a></h3>
                        <p class="card-desc">${escapeHtml(movie.oneLine)}</p>
                        <div class="card-info">
                            <span>${escapeHtml(movie.genre)}</span>
                            <span>${escapeHtml(movie.type)}</span>
                        </div>
                    </div>
                </article>`;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function renderFilters() {
        if (!categoryFilter) {
            return;
        }
        const categories = Array.from(new Set(movies.map(function (movie) {
            return movie.category;
        })));
        categoryFilter.innerHTML = [
            '<button type="button" class="is-active" data-search-category="all">全部</button>'
        ].concat(categories.map(function (category) {
            return `<button type="button" data-search-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
        })).join('');

        categoryFilter.querySelectorAll('[data-search-category]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.dataset.searchCategory || 'all';
                categoryFilter.querySelectorAll('button').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                renderResults();
            });
        });
    }

    function renderResults() {
        if (!results || !summary) {
            return;
        }
        const keyword = input ? input.value.trim() : query;
        const matched = movies.filter(function (movie) {
            const categoryMatch = activeCategory === 'all' || movie.category === activeCategory;
            return categoryMatch && movieMatches(movie, keyword);
        });
        summary.textContent = keyword
            ? `关键词“${keyword}”共找到 ${matched.length} 部作品。`
            : `当前展示全部 ${matched.length} 部作品，可输入关键词继续筛选。`;
        results.innerHTML = matched.map(cardTemplate).join('');
    }

    if (input) {
        input.addEventListener('input', renderResults);
    }

    renderFilters();
    renderResults();
})();
