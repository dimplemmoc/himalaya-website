(function () {
  "use strict";

  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderCard(post) {
    var title = post.h1 || post.title || "Story";
    var slug = post.slug || post.id || "";
    var imgUrl = post.featured_image_url || post.image_url;
    var imgAlt = post.featured_image_alt || post.image_alt || title;
    var category = post.category_label || post.category || "JOURNAL";
    var dateStr = post.published_at ? new Date(post.published_at + (post.published_at.length === 10 ? "T12:00:00" : "")).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
    var readLink = "blog-details.html?slug=" + encodeURIComponent(slug);

    var imgHtml = imgUrl
      ? '<img loading="lazy" src="' + esc(imgUrl) + '" alt="' + esc(imgAlt) + '">'
      : '<div class="cms-card-placeholder">HIMALAYAN JOURNAL</div>';

    return '<article class="blog-card">' +
      '<div class="blog-card-image">' + imgHtml + '<span>' + esc(category) + '</span></div>' +
      '<div class="blog-card-content">' +
        '<small>' + esc(dateStr) + '</small>' +
        '<h3>' + esc(title) + '</h3>' +
        '<p>' + esc(post.excerpt || "") + '</p>' +
        '<a href="' + readLink + '">READ STORY ↗</a>' +
      '</div>' +
    '</article>';
  }

  function start() {
    var host = document.getElementById("cms-stories");
    var section = document.getElementById("cms-stories-section");
    if (!host || !section) return;

    var config = window.HIMALAYA_SUPABASE_URL && window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    // 1. Try Supabase
    if (config && window.supabase) {
      var client = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
      client.from("blog_posts").select("h1,seo_title,slug,category_label,excerpt,featured_image_url,featured_image_alt,published_at").eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false }).then(function (result) {
        if (!result.error && result.data && result.data.length) {
          section.hidden = false;
          host.innerHTML = result.data.map(renderCard).join("");
          return;
        }
        loadLocalOrApi(host, section);
      }).catch(function () {
        loadLocalOrApi(host, section);
      });
    } else {
      loadLocalOrApi(host, section);
    }
  }

  function loadLocalOrApi(host, section) {
    try {
      var saved = localStorage.getItem("llh-blogs-store");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          var published = parsed.filter(function (p) { return p.status === "published"; });
          if (published.length) {
            section.hidden = false;
            host.innerHTML = published.map(renderCard).join("");
            return;
          }
        }
      }
    } catch (e) {}

    // Fallback to PHP API
    fetch("api/blogs.php", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.posts && data.posts.length) {
          section.hidden = false;
          host.innerHTML = data.posts.map(renderCard).join("");
        }
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
