(function () {
  "use strict";

  var list = document.getElementById("published-posts");
  var status = document.getElementById("journal-status");
  if (!list || !status) return;

  var month = document.getElementById("journal-month");
  var date = document.getElementById("journal-date");

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function niceDate(value) {
    if (!value) return "";
    var d = new Date(value + "T12:00:00");
    return isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  }

  function getLocalFallback() {
    try {
      var saved = localStorage.getItem("llh-blogs-store");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(function (p) { return p.status === "published"; });
        }
      }
    } catch (e) {}
    return [];
  }

  function renderList(posts) {
    var filtered = posts.slice();
    if (date.value) {
      filtered = filtered.filter(function (p) { return p.published_at === date.value; });
    } else if (month.value) {
      filtered = filtered.filter(function (p) { return p.published_at && p.published_at.slice(0, 7) === month.value; });
    }

    filtered.sort(function (a, b) {
      return String(b.published_at || "").localeCompare(String(a.published_at || "")) || String(b.id).localeCompare(String(a.id));
    });

    status.textContent = filtered.length
      ? filtered.length + (filtered.length === 1 ? " story" : " stories") + " found"
      : "No published stories match these filters.";

    list.innerHTML = filtered.length
      ? filtered.map(function (p) {
          var image = p.image_url
            ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.image_alt || p.title) + '" loading="lazy">'
            : '<span class="journal-image-placeholder" aria-hidden="true">LLH</span>';
          
          var postLink = "blog-details.html?slug=" + encodeURIComponent(p.slug || p.id);

          return '<article class="published-post">' +
            '<a class="published-post-image" href="' + postLink + '">' + image + '<span>' + esc(p.category || "Journal") + '</span></a>' +
            '<div class="published-post-copy">' +
              '<time datetime="' + esc(p.published_at) + '">' + niceDate(p.published_at) + '</time>' +
              '<h3><a href="' + postLink + '">' + esc(p.title) + '</a></h3>' +
              '<p>' + esc(p.excerpt) + '</p>' +
              '<a class="published-read" href="' + postLink + '">READ STORY ↗</a>' +
            '</div>' +
          '</article>';
        }).join("")
      : '<div class="journal-empty">There are no stories for this date yet. Try another date or month.</div>';
  }

  function load() {
    var query = new URLSearchParams();
    if (date.value) query.set("date", date.value);
    else if (month.value) query.set("month", month.value);

    status.textContent = "Loading stories…";

    fetch("api/blogs.php" + (query.toString() ? "?" + query.toString() : ""), {
      headers: { Accept: "application/json" },
      cache: "no-store"
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || "Could not load stories.");
          return data;
        });
      })
      .then(function (data) {
        var posts = data.posts || [];
        if (!posts.length) {
          posts = getLocalFallback();
        }
        renderList(posts);
      })
      .catch(function () {
        var local = getLocalFallback();
        if (local.length) {
          renderList(local);
        } else {
          status.textContent = "No published stories found.";
          list.innerHTML = '<div class="journal-empty">No stories available right now. Visit Admin to create your first story.</div>';
        }
      });
  }

  month.addEventListener("change", function () {
    if (month.value) date.value = "";
    load();
  });

  date.addEventListener("change", function () {
    if (date.value) month.value = "";
    load();
  });

  var clearBtn = document.getElementById("journal-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      month.value = "";
      date.value = "";
      load();
    });
  }

  load();
})();