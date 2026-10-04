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
    var category = post.category_label || post.category || "HIMALAYAN JOURNAL";
    var dateStr = post.published_at ? new Date(post.published_at + (post.published_at.length === 10 ? "T12:00:00" : "")).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
    var readLink = "blog-details.html?slug=" + encodeURIComponent(slug);

    var imgHtml = imgUrl
      ? '<img loading="lazy" src="' + esc(imgUrl) + '" alt="' + esc(imgAlt) + '" onerror="this.src=\'images/m.jpg\'">'
      : '<div class="cms-card-placeholder" style="width:100%;height:100%;display:grid;place-items:center;background:#17483d;color:#e8d9a5;font-size:12px;letter-spacing:2px;">HIMALAYAN JOURNAL</div>';

    return '<article class="blog-card">' +
      '<div class="blog-card-image">' + imgHtml + '<span>' + esc(category) + '</span></div>' +
      '<div class="blog-card-content">' +
        '<small>' + esc(dateStr) + '</small>' +
        '<h3><a href="' + readLink + '" style="color:inherit;text-decoration:none;">' + esc(title) + '</a></h3>' +
        '<p>' + esc(post.excerpt || "") + '</p>' +
        '<a href="' + readLink + '" class="blog-read-button">READ STORY <span>↗</span></a>' +
      '</div>' +
    '</article>';
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
            section.hidden = false;
            host.innerHTML = data.map(renderCard).join("");
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
            section.hidden = false;
            host.innerHTML = published.map(renderCard).join("");
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
