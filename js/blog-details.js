(function () {
  "use strict";

  function param(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function setMeta(selector, attribute, value) {
    var el = document.querySelector(selector);
    if (el && value) el.setAttribute(attribute, value);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value || "";
  }

  function getCuratedPost(slug) {
    if (!window.LLH_DEFAULT_BLOGS || !Array.isArray(window.LLH_DEFAULT_BLOGS)) return null;
    var cleanSlug = String(slug || "").toLowerCase().trim();
    return window.LLH_DEFAULT_BLOGS.find(function (p) {
      return String(p.slug || "").toLowerCase() === cleanSlug || String(p.id || "").toLowerCase() === cleanSlug;
    }) || null;
  }

  function getLocalPost(slug) {
    try {
      var saved = localStorage.getItem("llh-blogs-store");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          var cleanSlug = String(slug || "").toLowerCase().trim();
          return parsed.find(function (p) {
            return String(p.slug || "").toLowerCase() === cleanSlug || String(p.id || "").toLowerCase() === cleanSlug;
          });
        }
      }
    } catch (e) {}
    return null;
  }

  async function getSupabasePost(slug) {
    if (!window.supabase || !window.HIMALAYA_SUPABASE_URL || !window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY) {
      return null;
    }

    var client = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
    var result = await client
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (result.error) throw result.error;
    return result.data || null;
  }

  async function getApiPost(slug) {
    try {
      var res = await fetch("api/blogs.php?slug=" + encodeURIComponent(slug), {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!res.ok) return null;
      var data = await res.json();
      return data && data.post ? data.post : null;
    } catch (e) {
      return null;
    }
  }

  function renderPost(post) {
    var mainTitle = post.h1 || post.title || "Himalayan Story";
    var seoTitle = post.seo_title || mainTitle;
    document.title = seoTitle + " | Live Local Himalaya";

    // 1. FIRST: H1 in Hero section
    setText("article-h1", mainTitle);

    var rawCategory = (post.category_label || post.category || "VILLAGE LIFE").toUpperCase();
    setText("article-kicker", "LIVE LOCAL HIMALAYA");
    setText("article-category", rawCategory);

    // Meta details (Place / date / duration)
    var metaText = post.meta;
    if (!metaText) {
      var dateVal = post.published_at || post.created_at;
      var dateStr = dateVal ? new Date(dateVal + (dateVal.length === 10 ? "T12:00:00" : "")).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
      metaText = (post.place || "Himalayan Valley") + (dateStr ? " · " + dateStr : "");
    }
    setText("article-meta", metaText);

    // Hero background image
    var heroImg = document.getElementById("article-hero-image");
    var mainImgUrl = post.featured_image_url || post.image_url || "images/pexels-deekshyant-134459764-10778690.jpg";
    if (heroImg) {
      heroImg.src = mainImgUrl;
      heroImg.alt = post.featured_image_alt || mainTitle;
    }

    // 2. SECOND: Headline / Title (H2)
    var headlineText = post.headline || ("Discovering " + mainTitle);
    setText("article-headline", headlineText);

    // 3. THIRD: Description (Lead paragraph)
    var descText = post.description || post.excerpt || "Explore the authentic quiet rhythm of Himalayan village life, home-cooked local meals, and peaceful mountain trails.";
    setText("article-description", descText);

    // 4. FOURTH: Images side-by-side (2 images, bounded, not full length)
    var gallery1 = document.getElementById("article-gallery-1");
    var gallery2 = document.getElementById("article-gallery-2");
    var galleryArr = post.gallery || [];
    
    // Pick 2 suitable side-by-side images
    var img1 = galleryArr[0] || "images/pexels-dxaxoxfz-16153351.jpg";
    var img2 = galleryArr[1] || "images/pexels-llizzk-18276996.jpg";
    
    if (gallery1) {
      gallery1.src = img1;
      gallery1.alt = mainTitle + " view 1";
    }
    if (gallery2) {
      gallery2.src = img2;
      gallery2.alt = mainTitle + " view 2";
    }

    // 5. FIFTH: What you'll experience highlights
    var highlightsList = document.getElementById("article-highlights");
    var highlightsSection = document.getElementById("article-highlights-section");
    var rawHighlights = post.highlights;
    if (Array.isArray(rawHighlights) && rawHighlights.length > 0) {
      if (highlightsList) {
        highlightsList.innerHTML = rawHighlights.map(function (item) {
          return "<li>" + item + "</li>";
        }).join("");
      }
      if (highlightsSection) highlightsSection.hidden = false;
    } else if (highlightsList) {
      highlightsList.innerHTML = 
        "<li>A warm welcome from people who know the place by heart</li>" +
        "<li>Slow village walks and time to explore at your own pace</li>" +
        "<li>Home-cooked local food and stories shared over tea</li>";
    }

    // 6. SIXTH: Full article body content
    var bodyDiv = document.getElementById("article-body");
    if (bodyDiv) {
      bodyDiv.innerHTML = "";
      var rawContent = post.content_html || post.content;
      if (rawContent) {
        if (window.DOMPurify) {
          bodyDiv.innerHTML = DOMPurify.sanitize(rawContent, { USE_PROFILES: { html: true } });
        } else if (/<[a-z][\s\S]*>/i.test(rawContent)) {
          bodyDiv.innerHTML = rawContent;
        } else {
          String(rawContent).split(/\n\s*\n/).forEach(function (paragraph) {
            var val = paragraph.trim();
            if (!val) return;
            var p = document.createElement("p");
            p.textContent = val;
            bodyDiv.appendChild(p);
          });
        }
      }
    }

    // 7. Right sticky plan card
    setText("article-plan-title", "Ask for a quote");
    setText("article-place", post.place || "Kumaon, Uttarakhand");
    setText("article-length", post.length || "2 nights");
    setText("article-style", post.style || "Village homestay");

    // SEO updates
    if (post.slug) {
      var canonical = window.location.origin + "/blog-details.html?slug=" + encodeURIComponent(post.slug);
      setMeta('link[rel="canonical"]', "href", canonical);
      setMeta('meta[property="og:url"]', "content", canonical);
    }
    setMeta('meta[property="og:title"]', "content", seoTitle);
  }

  async function start() {
    var pathMatch = window.location.pathname.match(/^\/blog\/([^/]+)\/?$/);
    var slug = param("slug") || (pathMatch ? decodeURIComponent(pathMatch[1]) : "");

    // If no slug, check if title was passed in query params
    if (!slug) {
      var queryTitle = param("title");
      if (queryTitle) {
        slug = queryTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      }
    }

    // Default to 'stay-in-local-villages' if completely empty
    if (!slug) {
      slug = "stay-in-local-villages";
    }

    // 1. Try curated local dataset
    var curated = getCuratedPost(slug);
    if (curated) {
      renderPost(curated);
      return;
    }

    // 2. Try Supabase
    try {
      var supabasePost = await getSupabasePost(slug);
      if (supabasePost) {
        renderPost(supabasePost);
        return;
      }
    } catch (e) {}

    // 3. Try localStorage
    var localPost = getLocalPost(slug);
    if (localPost && (!localPost.status || localPost.status === "published")) {
      renderPost(localPost);
      return;
    }

    // 4. Try API
    try {
      var apiPost = await getApiPost(slug);
      if (apiPost) {
        renderPost(apiPost);
        return;
      }
    } catch (e) {}

    // Fallback to first curated post
    if (window.LLH_DEFAULT_BLOGS && window.LLH_DEFAULT_BLOGS.length > 0) {
      renderPost(window.LLH_DEFAULT_BLOGS[0]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
