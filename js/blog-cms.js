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

  // Normalized category matching
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

  var categoryHeadings = {
    "ALL": "All Himalayan Stories",
    "VILLAGE LIFE": "Village Life & Mountain Living",
    "NATURE": "Nature, Wildlife & Alpine Forests",
    "FOOD": "Pahadi Cuisine & Culinary Traditions",
    "CULTURE": "Heritage, Traditions & Mountain People",
    "ADVENTURE": "Treks, Trails & Himalayan Adventures",
    "WELLNESS": "Peace, Meditation & Mindful Retreats",
    "REMOTE WORK": "Workations & Mountain Living for Creators",
    "STARGAZING": "Dark Sky Reserves & Himalayan Astronomy",
    "HIMALAYAN TRAVEL": "Slow Travel, Routes & Practical Guides",
    "HOMESTAYS": "Authentic Village Stays & Local Hospitality"
  };

  var allLoadedStories = [];
  var currentActiveCategory = "ALL";

  function renderCard(post) {
    var title = post.h1 || post.title || "Story";
    var slug = post.slug || post.id || slugify(title);
    var imgUrl = post.featured_image_url || post.image_url || "images/m.jpg";
    var imgAlt = post.featured_image_alt || post.image_alt || title;
    var rawCategory = post.category_label || post.category || "Himalayan Travel";
    var normCategory = normalizeCategory(rawCategory);
    var dateVal = post.published_at || post.created_at;
    var dateStr = dateVal ? new Date(dateVal + (dateVal.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Recent Story";
    var readLink = "blog-details.html?slug=" + encodeURIComponent(slug);

    var excerptText = post.excerpt || "";
    if (!excerptText && post.content_html) {
      excerptText = post.content_html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150) + "...";
    }

    return '<article class="blog-card" data-category="' + esc(normCategory) + '" data-raw-category="' + esc(rawCategory) + '">' +
      '<div class="blog-card-image">' +
        '<a href="' + readLink + '"><img loading="lazy" src="' + esc(imgUrl) + '" alt="' + esc(imgAlt) + '" onerror="this.src=\'images/m.jpg\'"></a>' +
        '<span>' + esc(rawCategory) + '</span>' +
      '</div>' +
      '<div class="blog-card-content">' +
        '<small>' + esc(dateStr) + '</small>' +
        '<h3><a href="' + readLink + '" style="color:inherit;text-decoration:none;">' + esc(title) + '</a></h3>' +
        (excerptText ? '<p>' + esc(excerptText) + '</p>' : '') +
        '<a href="' + readLink + '" class="blog-read-button">READ STORY <span>↗</span></a>' +
      '</div>' +
    '</article>';
  }

  function filterStories(category, shouldScroll) {
    currentActiveCategory = category || "ALL";
    var grid = document.getElementById("category-blogs-grid");
    var counter = document.getElementById("stories-counter");
    var heading = document.getElementById("active-category-heading");
    var emptyState = document.getElementById("category-empty-state");
    var pillButtons = document.querySelectorAll("#category-pills-row .category-pill");

    if (!grid) return;

    // Update active pill state
    Array.prototype.forEach.call(pillButtons, function (btn) {
      var cat = btn.getAttribute("data-category") || "ALL";
      var isActive = cat.toUpperCase() === currentActiveCategory.toUpperCase();
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Update title
    if (heading) {
      heading.textContent = categoryHeadings[currentActiveCategory] || (currentActiveCategory + " Stories");
    }

    // Filter posts
    var filtered = allLoadedStories.filter(function (post) {
      if (currentActiveCategory === "ALL") return true;
      var postCat = normalizeCategory(post.category_label || post.category || "");
      return postCat.toUpperCase() === currentActiveCategory.toUpperCase();
    });

    // Render grid
    if (filtered.length > 0) {
      grid.innerHTML = filtered.map(renderCard).join("");
      grid.style.display = "grid";
      if (emptyState) emptyState.classList.add("hidden");
      if (counter) counter.textContent = "Showing " + filtered.length + (filtered.length === 1 ? " story" : " stories");
    } else {
      grid.innerHTML = "";
      grid.style.display = "none";
      if (emptyState) emptyState.classList.remove("hidden");
      if (counter) counter.textContent = "0 stories found";
    }

    if (shouldScroll) {
      var section = document.getElementById("stories");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function setupPillListeners() {
    var pillsContainer = document.getElementById("category-pills-row");
    if (!pillsContainer) return;

    pillsContainer.addEventListener("click", function (e) {
      var btn = e.target.closest(".category-pill");
      if (!btn) return;
      var cat = btn.getAttribute("data-category") || "ALL";
      filterStories(cat, false);
      if (window.history && window.history.replaceState) {
        var hash = cat === "ALL" ? "#stories" : "#stories-" + slugify(cat);
        window.history.replaceState(null, "", hash);
      }
    });

    var resetBtn = document.getElementById("btn-reset-filter");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        filterStories("ALL", true);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", "#stories");
        }
      });
    }
  }

  async function loadAllStories() {
    var dynamicPosts = [];
    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    // 1. Fetch Real Stories from Supabase via REST
    if (sbUrl && sbKey) {
      try {
        var queryUrl = sbUrl + "/rest/v1/blog_posts?select=id,h1,seo_title,slug,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status&status=eq.published&deleted_at=is.null&order=created_at.desc";
        var res = await fetch(queryUrl, {
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
        });
        if (res.ok) {
          var data = await res.json();
          if (Array.isArray(data) && data.length) {
            dynamicPosts = data;
          }
        }
      } catch (e) {
        console.warn("Direct REST fetch failed:", e);
      }
    }

    // 2. Supabase-js Fallback if REST was empty
    if (!dynamicPosts.length && window.supabase && sbUrl && sbKey) {
      try {
        var client = window.supabase.createClient(sbUrl, sbKey);
        var result = await client
          .from("blog_posts")
          .select("id,h1,seo_title,slug,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status")
          .eq("status", "published")
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (!result.error && result.data && result.data.length) {
          dynamicPosts = result.data;
        }
      } catch (err) {
        console.warn("Supabase-js fetch failed:", err);
      }
    }

    // 3. Fallback to localStorage if any
    if (!dynamicPosts.length) {
      try {
        var saved = localStorage.getItem("llh-blogs-store");
        if (saved) {
          var parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) {
            dynamicPosts = parsed.filter(function (p) { return p.status === "published"; });
          }
        }
      } catch (e) {}
    }

    allLoadedStories = dynamicPosts;

    // Check URL hash for initial category
    var hash = (window.location.hash || "").replace("#stories-", "").toUpperCase();
    var matchCategory = "ALL";
    if (hash && hash !== "STORIES") {
      var pills = document.querySelectorAll("#category-pills-row .category-pill");
      Array.prototype.forEach.call(pills, function (p) {
        var c = p.getAttribute("data-category") || "";
        if (slugify(c).toUpperCase() === hash || c.toUpperCase() === hash) {
          matchCategory = c;
        }
      });
    }

    filterStories(matchCategory, false);
    setupPillListeners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAllStories);
  } else {
    loadAllStories();
  }
})();
