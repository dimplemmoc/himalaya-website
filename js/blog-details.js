(function () {
  "use strict";

  function query(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function text(id, value) {
    var element = document.getElementById("article-title");
    if (id === "article-title" && element) element.textContent = value || "";
    var cat = document.getElementById("article-category");
    if (id === "article-category" && cat) cat.textContent = value || "";
    var meta = document.getElementById("article-meta");
    if (id === "article-meta" && meta) meta.textContent = value || "";
  }

  function image(value, title) {
    var el = document.getElementById("article-image");
    if (!el) return;
    if (value && (/^(https?:\/\/|images\/|data:image\/)/i).test(value)) {
      el.src = value;
      el.alt = title || "Himalayan journal story";
      el.hidden = false;
    } else {
      el.hidden = true;
    }
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
    document.title = (post.seo_title || post.title) + " | Live Local Himalaya";
    text("article-title", post.title);
    text("article-category", (post.category || "HIMALAYAN JOURNAL").toUpperCase());
    
    var dateStr = post.published_at ? new Date(post.published_at + "T12:00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
    text("article-meta", dateStr);
    image(post.image_url, post.image_alt || post.title);

    var body = document.getElementById("article-body");
    if (!body) return;
    body.innerHTML = "";

    if (post.excerpt) {
      var lead = document.createElement("p");
      lead.className = "article-lead";
      lead.textContent = post.excerpt;
      body.appendChild(lead);
    }

    if (post.content) {
      // If content contains HTML tags, render HTML safely, else paragraphs
      if (/<[a-z][\s\S]*>/i.test(post.content)) {
        var contentDiv = document.createElement("div");
        contentDiv.className = "article-html-content";
        contentDiv.innerHTML = post.content;
        body.appendChild(contentDiv);
      } else {
        String(post.content).split(/\n\s*\n/).forEach(function (paragraph) {
          var val = paragraph.trim();
          if (!val) return;
          var p = document.createElement("p");
          p.textContent = val;
          body.appendChild(p);
        });
      }
    }
  }

  function showError(msg) {
    text("article-title", "Story unavailable");
    text("article-category", "HIMALAYAN JOURNAL");
    text("article-meta", "");
    var body = document.getElementById("article-body");
    if (body) {
      body.innerHTML = '<p class="article-error" style="color:#d9534f;padding:24px 0;">' + (msg || "Story could not be loaded.") + '</p>';
    }
  }

  function start() {
    var body = document.getElementById("article-body");
    if (!body) return;

    var slug = query("slug");
    if (slug) {
      fetch("api/blogs.php?slug=" + encodeURIComponent(slug), {
        headers: { Accept: "application/json" },
        cache: "no-store"
      })
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok) throw new Error(data.error || "This story could not be found.");
            return data;
          });
        })
        .then(function (data) {
          renderPost(data.post);
        })
        .catch(function () {
          var local = getLocalPost(slug);
          if (local) {
            renderPost(local);
          } else {
            showError("This story could not be found. Please return to the journal.");
          }
        });
      return;
    }

    showError("Choose a story from the journal to read it here.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();