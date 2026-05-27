(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var emptyState = document.querySelector("[data-empty-state]");
  var currentFilter = "all";

  function cardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-category")
    ].join(" ").toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visible = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchesTerm = !term || text.indexOf(term) !== -1;
      var matchesFilter = currentFilter === "all" || text.indexOf(currentFilter.toLowerCase()) !== -1;
      var show = matchesTerm && matchesFilter;

      card.classList.toggle("hidden-by-filter", !show);

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });

      applyFilters();
    });
  });

  applyFilters();
})();
