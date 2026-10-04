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
    var title = post.h1 || post.title || "Story";
    var slug = post.slug || post.id || slugify(title);
    var imgUrl = post.featured_image_url || post.image_url;
    var imgAlt = post.featured_image_alt || post.image_alt || title;
    var rawCategory = post.category_label || post.category || "HIMALAYAN JOURNAL";
    var normCategory = normalizeCategory(rawCategory);
    var dateVal = post.published_at || post.created_at;
    var dateStr = dateVal ? new Date(dateVal + (dateVal.length === 10 ? "T12:00:00" : "")).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
    var readLink = "blog-details.html?slug=" + encodeURIComponent(slug);

    var imgHtml = imgUrl
      ? '<img loading="lazy" src="' + esc(imgUrl) + '" alt="' + esc(imgAlt) + '" onerror="this.src=\'images/m.jpg\'">'
      : '<div class="cms-card-placeholder" style="width:100%;height:100%;display:grid;place-items:center;background:#17483d;color:#e8d9a5;font-size:12px;letter-spacing:2px;">HIMALAYAN JOURNAL</div>';

    return '<article class="blog-card" data-category="' + esc(normCategory) + '">' +
      '<div class="blog-card-image">' + imgHtml + '<span>' + esc(rawCategory) + '</span></div>' +
      '<div class="blog-card-content">' +
        '<small>' + esc(dateStr) + '</small>' +
        '<h3><a href="' + readLink + '" style="color:inherit;text-decoration:none;">' + esc(title) + '</a></h3>' +
        '<p>' + esc(post.excerpt || "") + '</p>' +
        '<a href="' + readLink + '" class="blog-read-button">READ STORY <span>↗</span></a>' +
      '</div>' +
    '</article>';
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
      var postCat = normalizeCategory(post.category_label || post.category || "");
      return postCat.toUpperCase() === currentActiveCategory.toUpperCase();
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

  async function start() {
    var host = document.getElementById("cms-stories");
    var section = document.getElementById("cms-stories-section");
    if (!host || !section) return;

    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    // 1. Direct REST fetch from Supabase
    if (sbUrl && sbKey) {
      try {
        var queryUrl = sbUrl + "/rest/v1/blog_posts?select=id,h1,seo_title,slug,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status&status=eq.published&deleted_at=is.null&order=created_at.desc";
        var res = await fetch(queryUrl, {
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
        });
        if (res.ok) {
          var data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            allLoadedPosts = data;
            section.hidden = false;
            filterCmsStories("ALL");
            setupFilterEvents();
            return;
          }
        }
      } catch (e) {
        console.warn("REST load error:", e);
      }
    }

    // 2. Fallback to localStorage
    try {
      var saved = localStorage.getItem("llh-blogs-store");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          var published = parsed.filter(function (p) { return p.status === "published"; });
          if (published.length) {
            allLoadedPosts = published;
            section.hidden = false;
            filterCmsStories("ALL");
            setupFilterEvents();
            return;
          }
        }
      }
    } catch (e) {}

    // If no published blogs, keep section hidden
    section.hidden = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
