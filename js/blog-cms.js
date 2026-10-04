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
    if (/TRAVEL|JOURNEY|ROAD|GUIDE|TRIP|SLOW/.test(s)) return "HIMALAYAN TRAVEL";
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

  // Rich seed stories for all 10 categories
  var seedStories = [
    {
      title: "The rhythm of morning in a Himalayan village",
      slug: "the-rhythm-of-morning-in-a-himalayan-village",
      category: "VILLAGE LIFE",
      published_at: "2025-09-20",
      image_url: "images/pexels-urtimud-89-76108288-32261668.jpg",
      image_alt: "Himalayan Village Morning",
      excerpt: "Before the sun crests the ridge, kitchens are warm, cattle bells echo down the valley, and daily life begins with timeless simplicity."
    },
    {
      title: "The living architecture of Kath-Kuni houses",
      slug: "living-architecture-kath-kuni-houses",
      category: "VILLAGE LIFE",
      published_at: "2025-09-10",
      image_url: "images/pexels-llizzk-18276996.jpg",
      image_alt: "Traditional wooden Pahadi house",
      excerpt: "How indigenous wood-and-stone building techniques have withstood centuries of mountain earthquakes and bitter Himalayan winters."
    },
    {
      title: "Flora and ancient pines of the Great Himalayan National Park",
      slug: "flora-and-ancient-pines-ghnp",
      category: "NATURE",
      published_at: "2025-09-18",
      image_url: "images/pexels-sagarkumarr-1481581.jpg",
      image_alt: "Pine forest in Himalayas",
      excerpt: "Walking through UNESCO World Heritage forests where deodar, fir, and rare medicinal mountain herbs flourish untouched."
    },
    {
      title: "Birdwatching in Tirthan: Feathers of the Western Himalayas",
      slug: "birdwatching-in-tirthan-western-himalayas",
      category: "NATURE",
      published_at: "2025-08-30",
      image_url: "images/pexels-sagarkumarr-1481581.jpg",
      image_alt: "Himalayan birds in wild nature",
      excerpt: "Spotting the Western Tragopan, Himalayan Monal, and cheer pheasants along the mist-laden riverside trails."
    },
    {
      title: "Flavors of the valley: Traditional Siddu, Madra and Pahadi Dhaam",
      slug: "flavors-of-the-valley-traditional-siddu-dhaam",
      category: "FOOD",
      published_at: "2025-09-15",
      image_url: "images/pexels-marina-zvada-844583049-20315033.jpg",
      image_alt: "Himalayan traditional cuisine and cooking",
      excerpt: "Steamed wheat bread stuffed with walnuts and poppy seeds, slow-cooked lentils in yogurt, and meals prepared with seasonal mountain herbs."
    },
    {
      title: "Wood-fired tea & stories: Pahadi chai culture",
      slug: "wood-fired-tea-stories-pahadi-chai",
      category: "FOOD",
      published_at: "2025-08-25",
      image_url: "images/pexels-yademidov-36285486.jpg",
      image_alt: "Drinking chai in high mountain village",
      excerpt: "Why sitting beside a wood-fired tandoor with a warm brass glass of spiced tea creates instant bonds with mountain hosts."
    },
    {
      title: "Folk deities and ancient temple rituals of Kullu Valley",
      slug: "folk-deities-temple-rituals-kullu-valley",
      category: "CULTURE",
      published_at: "2025-09-08",
      image_url: "images/m.jpg",
      image_alt: "Himalayan temple architecture and festival",
      excerpt: "Understanding the unique Devta system where local deities govern village justice, festivals, and community celebrations."
    },
    {
      title: "Weaving warmth: The handloom heritage of Kullu shawls",
      slug: "weaving-warmth-handloom-kullu-shawls",
      category: "CULTURE",
      published_at: "2025-08-12",
      image_url: "images/pexels-ahmet-ciftci-1413580052-35749293.jpg",
      image_alt: "Local artisans weaving traditional patterns",
      excerpt: "Geometric patterns, natural sheep wool, and generational weavers preserving Himachal's finest textile traditions."
    },
    {
      title: "Trekking to Serolsar Lake: An ancient sacred water trail",
      slug: "trekking-to-serolsar-lake-sacred-trail",
      category: "ADVENTURE",
      published_at: "2025-09-05",
      image_url: "images/pexels-urtimud-89-76108288-32261668.jpg",
      image_alt: "High mountain lake trek",
      excerpt: "A 5km trail through dense oak forest from Jalori Pass leading to a crystal-clear lake guarded by the goddess Buddhi Nagin."
    },
    {
      title: "The Jalori Pass crossing: Ridge walks & hidden meadows",
      slug: "jalori-pass-crossing-ridge-walks",
      category: "ADVENTURE",
      published_at: "2025-08-19",
      image_url: "images/m.jpg",
      image_alt: "Mountain ridge trekking view",
      excerpt: "At 10,800 feet, Jalori Pass connects Inner and Outer Seraj with breathtaking 360-degree vistas of the snow-clad Pir Panjal range."
    },
    {
      title: "Silence and stillness: Yoga and meditation in pine valleys",
      slug: "silence-and-stillness-yoga-meditation",
      category: "WELLNESS",
      published_at: "2025-09-02",
      image_url: "images/pexels-sagarkumarr-1481581.jpg",
      image_alt: "Meditation in peaceful mountain valley",
      excerpt: "How the crisp cedar-scented mountain air, pure glacier streams, and absence of city noise restore mental clarity."
    },
    {
      title: "Work from the mountains: Finding deep focus in remote valleys",
      slug: "work-from-the-mountains-finding-deep-focus",
      category: "REMOTE WORK",
      published_at: "2025-08-28",
      image_url: "images/pexels-yademidov-36285486.jpg",
      image_alt: "Laptop workspace overlooking mountain valley",
      excerpt: "High-speed optical fiber now meets panoramic apple orchard views — making productive remote work effortless and rejuvenating."
    },
    {
      title: "Clear Himalayan nights: Stargazing and astrophotography in dark skies",
      slug: "clear-himalayan-nights-stargazing-astrophotography",
      category: "STARGAZING",
      published_at: "2025-08-22",
      image_url: "images/pexels-urtimud-89-76108288-32261668.jpg",
      image_alt: "Starry sky and Milky Way over Himalayas",
      excerpt: "Far away from city light pollution, high-altitude Himalayan valleys offer zero-Bortle skies where the core of the Milky Way shines brightly."
    },
    {
      title: "How to travel the Himalayas slowly and responsibly",
      slug: "how-to-travel-the-himalayas-slowly",
      category: "HIMALAYAN TRAVEL",
      published_at: "2025-09-12",
      image_url: "images/pexels-ahmet-ciftci-1413580052-35749293.jpg",
      image_alt: "Slow travel through Himalayan valley",
      excerpt: "Why staying in one village for a week offers infinitely richer memories than rushing through five tourist hotspots in a weekend."
    },
    {
      title: "Staying with local families: The heart of mountain hospitality",
      slug: "staying-with-local-families-mountain-hospitality",
      category: "HOMESTAYS",
      published_at: "2025-09-01",
      image_url: "images/pexels-llizzk-18276996.jpg",
      image_alt: "Traditional wooden homestay balcony",
      excerpt: "From home-cooked meals by the bukhari to participating in apple harvesting, authentic homestays turn travelers into lifelong family."
    }
  ];

  var allLoadedStories = [];
  var currentActiveCategory = "ALL";

  function renderCard(post) {
    var title = post.h1 || post.title || "Story";
    var slug = post.slug || post.id || slugify(title);
    var imgUrl = post.featured_image_url || post.image_url || "images/m.jpg";
    var imgAlt = post.featured_image_alt || post.image_alt || title;
    var rawCategory = post.category_label || post.category || "HIMALAYAN TRAVEL";
    var normCategory = normalizeCategory(rawCategory);
    var dateVal = post.published_at;
    var dateStr = dateVal ? new Date(dateVal + (dateVal.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Recent Story";
    var readLink = "blog-details.html?slug=" + encodeURIComponent(slug);

    return '<article class="blog-card" data-category="' + esc(normCategory) + '" data-raw-category="' + esc(rawCategory) + '">' +
      '<div class="blog-card-image">' +
        '<a href="' + readLink + '"><img loading="lazy" src="' + esc(imgUrl) + '" alt="' + esc(imgAlt) + '"></a>' +
        '<span>' + esc(rawCategory) + '</span>' +
      '</div>' +
      '<div class="blog-card-content">' +
        '<small>' + esc(dateStr) + '</small>' +
        '<h3><a href="' + readLink + '" style="color:inherit;text-decoration:none;">' + esc(title) + '</a></h3>' +
        '<p>' + esc(post.excerpt || "") + '</p>' +
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

    // 1. Try Supabase
    if (window.supabase && window.HIMALAYA_SUPABASE_URL && window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY) {
      try {
        var client = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
        var result = await client
          .from("blog_posts")
          .select("id,h1,title,seo_title,slug,category_label,category,excerpt,featured_image_url,image_url,featured_image_alt,image_alt,published_at,created_at")
          .eq("status", "published")
          .is("deleted_at", null)
          .order("published_at", { ascending: false });

        if (!result.error && result.data && result.data.length) {
          dynamicPosts = result.data;
        }
      } catch (err) {
        console.warn("Supabase fetch failed:", err);
      }
    }

    // 2. Try localStorage fallback if no Supabase posts
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

    // 3. Try PHP API fallback if still empty
    if (!dynamicPosts.length) {
      try {
        var res = await fetch("api/blogs.php", { headers: { Accept: "application/json" } });
        if (res.ok) {
          var data = await res.json();
          if (data && data.posts && data.posts.length) {
            dynamicPosts = data.posts;
          }
        }
      } catch (e) {}
    }

    // Combine dynamic posts (newest first) with seed stories
    var uniqueSlugs = new Set();
    var merged = [];

    dynamicPosts.forEach(function (p) {
      var s = p.slug || p.id || slugify(p.h1 || p.title);
      if (!uniqueSlugs.has(s)) {
        uniqueSlugs.add(s);
        merged.push(p);
      }
    });

    seedStories.forEach(function (p) {
      var s = p.slug;
      if (!uniqueSlugs.has(s)) {
        uniqueSlugs.add(s);
        merged.push(p);
      }
    });

    allLoadedStories = merged;

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
