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

  function getLocalPost(slug) {
    try {
      var saved = localStorage.getItem("llh-blogs-store");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.find(function (p) {
            return String(p.slug) === slug || String(p.id) === slug;
          });
        }
      }
    } catch (e) {}
    return null;
  }

  function renderPost(post) {
    var title = post.seo_title || post.h1 || post.title || "Himalayan Journal";
    document.title = title + " | Live Local Himalaya";
    
    setText("article-title", post.h1 || post.title);
    setText("article-category", (post.category_label || post.category || "HIMALAYAN JOURNAL").toUpperCase());
    
    var dateVal = post.published_at;
    var dateStr = dateVal ? new Date(dateVal + (dateVal.length === 10 ? "T12:00:00" : "")).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
    setText("article-meta", dateStr);

    var img = document.getElementById("article-image");
    var imgUrl = post.featured_image_url || post.image_url;
    if (img && imgUrl) {
      img.src = imgUrl;
      img.alt = post.featured_image_alt || post.image_alt || post.h1 || post.title || "";
      img.hidden = false;
    } else if (img) {
      img.hidden = true;
    }

    var body = document.getElementById("article-body");
    if (!body) return;
    body.innerHTML = "";

    if (post.excerpt) {
      var lead = document.createElement("p");
      lead.className = "article-lead";
      lead.textContent = post.excerpt;
      body.appendChild(lead);
    }

    var rawContent = post.content_html || post.content;
    if (rawContent) {
      var contentDiv = document.createElement("div");
      contentDiv.className = "cms-article-body article-html-content";
      
      if (window.DOMPurify) {
        contentDiv.innerHTML = DOMPurify.sanitize(rawContent, { USE_PROFILES: { html: true } });
      } else if (/<[a-z][\s\S]*>/i.test(rawContent)) {
        contentDiv.innerHTML = rawContent;
      } else {
        String(rawContent).split(/\n\s*\n/).forEach(function (paragraph) {
          var val = paragraph.trim();
          if (!val) return;
          var p = document.createElement("p");
          p.textContent = val;
          contentDiv.appendChild(p);
        });
      }
      body.appendChild(contentDiv);
    }

    // SEO Meta updates
    if (post.slug) {
      var canonical = window.location.origin + "/blog-details.html?slug=" + encodeURIComponent(post.slug);
      setMeta('link[rel="canonical"]', "href", canonical);
      setMeta('meta[property="og:url"]', "content", canonical);
    }
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[name="twitter:title"]', "content", title);

    if (post.is_indexable === false) {
      setMeta('meta[name="robots"]', "content", "noindex,follow");
    }

    var desc = post.seo_description || post.excerpt;
    if (desc) {
      setMeta('meta[name="description"]', "content", desc);
      setMeta('meta[property="og:description"]', "content", desc);
      setMeta('meta[name="twitter:description"]', "content", desc);
    }

    if (imgUrl) {
      setMeta('meta[property="og:image"]', "content", imgUrl);
      setMeta('meta[name="twitter:image"]', "content", imgUrl);
    }
  }

  function renderLegacy() {
    var title = param("title");
    var image = param("image");
    var category = param("category");
    var date = param("date");
    var excerpt = param("excerpt");
    var body = document.getElementById("article-body");

    if (!title) {
      setText("article-title", "Choose a story");
      if (body) body.innerHTML = '<p class="article-lead">Please choose a story from the journal to read it here.</p>';
      return;
    }

    document.title = title + " | Live Local Himalaya";
    setText("article-title", title);
    setText("article-category", (category || "HIMALAYAN JOURNAL").toUpperCase());
    setText("article-meta", date);

    var img = document.getElementById("article-image");
    if (img && image) {
      img.src = image;
      img.alt = param("alt") || title;
      img.hidden = false;
    }

    if (body) {
      body.innerHTML = "";
      if (excerpt) {
        var lead = document.createElement("p");
        lead.className = "article-lead";
        lead.textContent = excerpt;
        body.appendChild(lead);
      }
    }
  }

  async function start() {
    var slug = param("slug") || decodeURIComponent(window.location.pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1] || "");
    
    if (!slug) {
      renderLegacy();
      return;
    }

    // 1. Try local storage first
    var localPost = getLocalPost(slug);
    if (localPost) {
      renderPost(localPost);
      return;
    }

    // 2. Try PHP API
    try {
      var res = await fetch("api/blogs.php?slug=" + encodeURIComponent(slug), { headers: { Accept: "application/json" } });
      if (res.ok) {
        var data = await res.json();
        if (data && data.post) {
          renderPost(data.post);
          return;
        }
      }
    } catch (e) {}

    // 3. Try Supabase if configured
    if (window.supabase && window.HIMALAYA_SUPABASE_URL && window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY) {
      try {
        var client = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
        var result = await client.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").is("deleted_at", null).maybeSingle();
        if (result.data) {
          renderPost(result.data);
          return;
        }
      } catch (err) {}
    }

    setText("article-title", "Story not found");
    var body = document.getElementById("article-body");
    if (body) {
      body.innerHTML = '<p class="article-error" style="padding: 24px 0; color: #a05345;">This story could not be found or is not yet published. <a href="blog.html" style="color:#7ecc9f;text-decoration:underline;">Back to Journal</a></p>';
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
