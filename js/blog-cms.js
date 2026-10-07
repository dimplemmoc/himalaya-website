(function () {
  "use strict";

  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeCategory(cat) {
    var s = String(cat || "").trim().toUpperCase();
    if (s === "ALL") return "ALL";
    if (/VILLAGE|LOCAL LIFE|RURAL/.test(s)) return "VILLAGE LIFE";
    if (/NATURE|WILD|FOREST|FLORA|FAUNA|ECO/.test(s)) return "NATURE";
    if (/FOOD|CUISINE|KITCHEN|MEAL|CHAI|SIDDU|DHAAM/.test(s)) return "FOOD";
    if (/CULTURE|TRADITION|HERITAGE|FESTIVAL|PEOPLE|DEITY|SHAWL/.test(s)) return "CULTURE";
    if (/ADVENTURE|TREK|HIKE|WALK|PASS|RIVER|CLIMB/.test(s)) return "ADVENTURE";
    if (/WELLNESS|YOGA|MEDITATION|HEALING|RETREAT|STILLNESS/.test(s)) return "WELLNESS";
    if (/REMOTE|WORK|WORKATION|NOMAD|CREATIVE/.test(s)) return "REMOTE WORK";
    if (/STAR|ASTRO|NIGHT|SKY|MILKY WAY|SPACE/.test(s)) return "STARGAZING";
    if (/HOMESTAY|VILLAGE STAY|FAMILY STAY|ORCHARD STAY/.test(s)) return "HOMESTAYS";
    if (/TRAVEL|JOURNEY|ROAD|GUIDE|TRIP|SLOW|HIMALAYA/.test(s)) return "HIMALAYAN TRAVEL";
    return s;
  }

  var allLoadedPosts = [];
  var currentActiveCategory = "ALL";

  function renderCard(post) {
    var title = post.h1 || post.title || "Himalayan Story";
    var slug = post.slug || post.id || slugify(title);
    var imgUrl = post.featured_image_url || post.image_url || "images/pexels-deekshyant-134459764-10778690.jpg";
    var imgAlt = post.featured_image_alt || post.image_alt || title;
    var rawCategory = post.category_label || post.category || "VILLAGE LIFE";
    var normCategory = normalizeCategory(rawCategory);
    var excerpt = post.excerpt || (post.description ? post.description.slice(0, 95) + "…" : "Wake up to mountain views, local food and warm smiles.");
    var readLink = "blog-details.html?slug=" + encodeURIComponent(slug);

    var imgHtml = '<img loading="lazy" src="' + esc(imgUrl) + '" alt="' + esc(imgAlt) + '" onerror="this.src=\'images/pexels-deekshyant-134459764-10778690.jpg\'">';

    return '<a href="' + readLink + '" class="blog-card-compact" data-category="' + esc(normCategory) + '" aria-label="Read story: ' + esc(title) + '">' +
      '<div class="blog-card-compact-image">' + imgHtml + '</div>' +
      '<span class="blog-card-compact-category">' + esc(rawCategory) + '</span>' +
      '<h2 class="blog-card-compact-title">' + esc(title) + '</h2>' +
      '<p class="blog-card-compact-excerpt">' + esc(excerpt) + '</p>' +
      '<span class="blog-card-compact-action" aria-hidden="true">→</span>' +
    '</a>';
  }

  function filterCmsStories(category) {
    currentActiveCategory = category || "ALL";
    var host = document.getElementById("cms-stories");
    var emptyState = document.getElementById("cms-empty-state");
    var pillButtons = document.querySelectorAll("#cms-category-pills .category-pill");

    if (!host) return;

    // Update active pill button
    Array.prototype.forEach.call(pillButtons, function (btn) {
      var cat = btn.getAttribute("data-category") || "ALL";
      var isActive = cat.toUpperCase() === currentActiveCategory.toUpperCase();
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Filter posts
    var filtered = allLoadedPosts.filter(function (post) {
      if (currentActiveCategory === "ALL") return true;
      var raw = String(post.category_label || post.category || "").trim().toUpperCase();
      var postCat = normalizeCategory(raw);
      var targetCat = normalizeCategory(currentActiveCategory);
      return postCat === targetCat || raw === targetCat || raw === currentActiveCategory.toUpperCase();
    });

    if (filtered.length > 0) {
      host.innerHTML = filtered.map(renderCard).join("");
      host.style.display = "grid";
      if (emptyState) emptyState.classList.add("hidden");
    } else {
      host.innerHTML = "";
      host.style.display = "none";
      if (emptyState) emptyState.classList.remove("hidden");
    }
  }

  function setupFilterEvents() {
    var pillsRow = document.getElementById("cms-category-pills");
    if (pillsRow) {
      pillsRow.addEventListener("click", function (e) {
        var btn = e.target.closest(".category-pill");
        if (!btn) return;
        var cat = btn.getAttribute("data-category") || "ALL";
        filterCmsStories(cat);
      });
    }

    var emptyStateReset = document.querySelector("#cms-empty-state .btn-reset-filter");
    if (emptyStateReset) {
      emptyStateReset.addEventListener("click", function () {
        filterCmsStories("ALL");
      });
    }
  }

  function mergePosts(baseList, incomingList) {
    var map = new Map();
    // Incoming (e.g. Supabase newly published) first
    (incomingList || []).forEach(function (p) {
      if (p && p.slug) map.set(p.slug, p);
      else if (p && p.id) map.set(String(p.id), p);
    });
    // Then base curated list
    (baseList || []).forEach(function (p) {
      if (p && p.slug && !map.has(p.slug)) map.set(p.slug, p);
      else if (p && p.id && !map.has(String(p.id))) map.set(String(p.id), p);
    });
    return Array.from(map.values());
  }

  async function start() {
    var host = document.getElementById("cms-stories");
    var section = document.getElementById("cms-stories-section");
    if (!host || !section) return;

    section.hidden = false;
    section.removeAttribute("hidden");
    setupFilterEvents();

    var defaultList = (window.LLH_DEFAULT_BLOGS && Array.isArray(window.LLH_DEFAULT_BLOGS))
      ? window.LLH_DEFAULT_BLOGS.slice()
      : [];

    var fetchedPosts = [];

    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    // 1. Fetch from Supabase
    if (sbUrl && sbKey) {
      try {
        var queryUrl = sbUrl + "/rest/v1/blog_posts?select=id,h1,seo_title,slug,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status&status=eq.published&deleted_at=is.null&order=created_at.desc&_t=" + Date.now();
        var res = await fetch(queryUrl, {
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey },
          cache: "no-store"
        });
        if (res.ok) {
          var data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            fetchedPosts = data;
          }
        }
      } catch (e) {
        console.warn("Supabase fetch warning:", e);
      }
    }

    // 2. Local storage overrides
    try {
      var saved = localStorage.getItem("llh-blogs-store");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          var published = parsed.filter(function (p) { return p.status === "published"; });
          fetchedPosts = mergePosts(fetchedPosts, published);
        }
      }
    } catch (e) {}

    allLoadedPosts = mergePosts(defaultList, fetchedPosts);
    filterCmsStories("ALL");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
