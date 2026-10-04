(function () {
  "use strict";

  var API_AUTH = "api/admin-auth.php";
  var API_BLOGS = "api/blogs.php";
  var STORAGE_KEY = "llh-blogs-store";
  var AUTH_STORAGE_KEY = "llh-admin-auth-session";
  var csrfToken = "";

  // Initial demo / seed stories if storage is empty
  var sampleBlogs = [
    {
      id: "story-1",
      title: "The rhythm of morning in a Himalayan village",
      seo_title: "Himalayan Village Morning Rhythm | Live Local",
      site: "Main site",
      category: "Local Life",
      published_at: "2026-10-03",
      image_url: "images/pexels-urtimud-89-76108288-32261668.jpg",
      image_alt: "Mountain sunrise in Himalaya",
      excerpt: "Before the day begins, the village wakes gently: a kettle on the stove, distant footsteps, and the first light over the ridge.",
      content: "<h2>The Mountain Dawn</h2>\n<p>Before the day begins, the village wakes gently: a kettle on the stove, distant footsteps, and the first light over the ridge.</p>\n<p>A good mountain journey leaves space for the unexpected. Stop when a view asks you to. Share tea. Let the local road and local voices guide the day.</p>",
      target_url: "https://himalayawebsite.vercel.app/stays.html",
      anchor_text: "village homestays",
      link_type: "DoFollow",
      post_type: "Normal",
      status: "published"
    },
    {
      id: "story-2",
      title: "A slower way to travel through the mountains",
      seo_title: "Slow Travel in the Himalaya Guide",
      site: "Main site",
      category: "Himalayan Travel",
      published_at: "2026-10-01",
      image_url: "images/stays/stay-5.jpg",
      image_alt: "Trekking route in high mountains",
      excerpt: "Take the smaller road, leave room in the day, and let local stories shape the journey as much as the destination.",
      content: "<h2>Traveling Slow</h2>\n<p>Take the smaller road, leave room in the day, and let local stories shape the journey as much as the destination.</p>\n<p>When you walk through the valleys, time takes on a different meaning. Listen to the mountain streams and connect with the locals.</p>",
      target_url: "https://himalayawebsite.vercel.app/package.html",
      anchor_text: "explore tour packages",
      link_type: "DoFollow",
      post_type: "Featured",
      status: "published"
    },
    {
      id: "story-3",
      title: "What grows in a village kitchen garden",
      seo_title: "Himalayan Food & Kitchen Herbs",
      site: "Main site",
      category: "Food & Culture",
      published_at: "2026-09-27",
      image_url: "images/experiences/exp-6.jpg",
      image_alt: "Organic Himalayan herbs and vegetables",
      excerpt: "A look at the herbs, greens and seasonal ingredients that bring everyday Himalayan meals to life.",
      content: "<h2>Traditional Kitchen Herbs</h2>\n<p>Every season brings a different colour to the kitchen garden. Fresh greens, wild mountain herbs and local grains become simple meals shared around the hearth.</p>",
      target_url: "",
      anchor_text: "",
      link_type: "DoFollow",
      post_type: "Normal",
      status: "draft"
    }
  ];

  // DOM Elements
  var loginView = document.getElementById("login-view");
  var dashboardView = document.getElementById("dashboard-view");
  var loginForm = document.getElementById("login-form");
  var loginMsg = document.getElementById("login-message");

  var navAllBlogs = document.getElementById("nav-all-blogs");
  var navAddBlog = document.getElementById("nav-add-blog");
  var viewAllBlogs = document.getElementById("view-all-blogs");
  var viewAddBlog = document.getElementById("view-add-blog");
  var btnBackToAll = document.getElementById("btn-back-to-all");
  var btnCreateNew = document.getElementById("btn-create-new");
  var btnLogout = document.getElementById("logout-button");
  var sidebarLogout = document.getElementById("sidebar-logout");

  var searchBlogsInput = document.getElementById("search-blogs");
  var filterSiteSelect = document.getElementById("filter-site");
  var statusTabs = document.querySelectorAll(".status-tab");
  var blogsTableBody = document.getElementById("blogs-table-body");

  var countAll = document.getElementById("count-all");
  var countPublished = document.getElementById("count-published");
  var countDrafts = document.getElementById("count-drafts");

  var blogForm = document.getElementById("blog-form");
  var editorHeading = document.getElementById("editor-heading");
  var postMsg = document.getElementById("post-message");
  var btnSaveDraft = document.getElementById("btn-save-draft");
  var btnClearForm = document.getElementById("btn-clear-form");
  var btnAddCategory = document.getElementById("btn-add-category");
  var btnExportJson = document.getElementById("btn-export-json");

  // Form Inputs
  var blogIdInput = document.getElementById("blog-id");
  var blogStatusInput = document.getElementById("blog-status");
  var blogTitleInput = document.getElementById("blog-title");
  var blogSeoTitleInput = document.getElementById("blog-seo-title");
  var blogSiteInput = document.getElementById("blog-site");
  var blogCategoryInput = document.getElementById("blog-category");
  var blogDateInput = document.getElementById("blog-date");
  var blogImageFileInput = document.getElementById("blog-image-file");
  var blogImageUrlInput = document.getElementById("blog-image-url");
  var blogImageAltInput = document.getElementById("blog-image-alt");
  var imagePreviewBox = document.getElementById("image-preview-box");
  var imagePreview = document.getElementById("image-preview");
  var blogExcerptInput = document.getElementById("blog-excerpt");
  var blogContentInput = document.getElementById("blog-content");
  var blogTargetUrlInput = document.getElementById("blog-target-url");
  var blogAnchorTextInput = document.getElementById("blog-anchor-text");
  var blogLinkTypeInput = document.getElementById("blog-link-type");
  var blogPostTypeInput = document.getElementById("blog-post-type");

  var currentStatusFilter = "all";

  // --- Local Data Helpers ---
  function getLocalBlogs() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBlogs));
    return sampleBlogs.slice();
  }

  function saveLocalBlogs(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function formatDate(isoStr) {
    if (!isoStr) return "";
    var d = new Date(isoStr + "T12:00:00");
    return isNaN(d.getTime()) ? isoStr : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function makeSlug(title) {
    return String(title || "himalaya-story")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // --- UI Switching ---
  function showView(view) {
    if (view === "add") {
      viewAllBlogs.classList.add("hidden");
      viewAddBlog.classList.remove("hidden");
      navAllBlogs.classList.remove("active");
      navAddBlog.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      viewAddBlog.classList.add("hidden");
      viewAllBlogs.classList.remove("hidden");
      navAddBlog.classList.remove("active");
      navAllBlogs.classList.add("active");
      renderBlogsTable();
    }
  }

  function setAuthenticated(isAuth) {
    if (isAuth) {
      loginView.classList.add("hidden");
      dashboardView.classList.remove("hidden");
      showView("all");
    } else {
      dashboardView.classList.add("hidden");
      loginView.classList.remove("hidden");
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // --- Auth Check ---
  function checkAuth() {
    var localSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localSession === "authenticated") {
      setAuthenticated(true);
      return;
    }

    fetch(API_AUTH, { method: "GET", headers: { Accept: "application/json" } })
      .then(function (res) {
        return res.json().catch(function () { return { authenticated: false }; });
      })
      .then(function (data) {
        csrfToken = data.csrf_token || "";
        if (data.authenticated) {
          localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch(function () {
        // Fallback for static servers
        if (localStorage.getItem(AUTH_STORAGE_KEY) === "authenticated") {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      });
  }

  // --- Login Handler ---
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var user = loginForm.username.value.trim().toLowerCase();
    var pass = loginForm.password.value;

    loginMsg.textContent = "Authenticating...";
    loginMsg.className = "form-feedback";

    // Fixed credentials check
    var isMaster = (user === "admin@himalaya.com" || user === "admin" || user === "dimple") && (pass === "admin@123" || pass === "admin123");

    // Attempt backend login first
    fetch(API_AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", username: user, password: pass, csrf_token: csrfToken })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Login failed");
          return data;
        });
      })
      .then(function () {
        loginMsg.textContent = "";
        localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
        setAuthenticated(true);
      })
      .catch(function (err) {
        // If master credentials match, allow login even if PHP/MySQL is not running
        if (isMaster) {
          loginMsg.textContent = "";
          localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
          setAuthenticated(true);
        } else {
          loginMsg.textContent = err.message || "Invalid credentials. Use admin@himalaya.com / admin@123";
          loginMsg.className = "form-feedback error";
        }
      });
  });

  function handleLogout() {
    fetch(API_AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout", csrf_token: csrfToken })
    }).catch(function () {});
    setAuthenticated(false);
  }

  btnLogout.addEventListener("click", handleLogout);
  sidebarLogout.addEventListener("click", handleLogout);

  // --- Navigation Events ---
  navAllBlogs.addEventListener("click", function () { showView("all"); });
  navAddBlog.addEventListener("click", function () { resetForm(); showView("add"); });
  btnCreateNew.addEventListener("click", function () { resetForm(); showView("add"); });
  btnBackToAll.addEventListener("click", function () { showView("all"); });

  // --- Table Rendering & Filtering ---
  function renderBlogsTable() {
    var blogs = getLocalBlogs();
    var searchVal = (searchBlogsInput.value || "").toLowerCase().trim();
    var siteVal = filterSiteSelect.value;

    // Filter by site and search
    var filtered = blogs.filter(function (b) {
      var matchSearch = !searchVal ||
        (b.title && b.title.toLowerCase().indexOf(searchVal) !== -1) ||
        (b.category && b.category.toLowerCase().indexOf(searchVal) !== -1) ||
        (b.excerpt && b.excerpt.toLowerCase().indexOf(searchVal) !== -1);
      
      var matchSite = !siteVal || (b.site === siteVal);
      var matchStatus = currentStatusFilter === "all" || (b.status === currentStatusFilter);

      return matchSearch && matchSite && matchStatus;
    });

    // Counts update
    var totalAll = blogs.length;
    var totalPublished = blogs.filter(function (b) { return b.status === "published"; }).length;
    var totalDrafts = blogs.filter(function (b) { return b.status === "draft"; }).length;

    countAll.textContent = totalAll;
    countPublished.textContent = totalPublished;
    countDrafts.textContent = totalDrafts;

    if (!filtered.length) {
      blogsTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No blogs match your filter. Click "Add new blog" to write your first one.</td></tr>';
      return;
    }

    blogsTableBody.innerHTML = filtered.map(function (b) {
      var statusBadge = b.status === "published"
        ? '<span class="badge badge-published">Published</span>'
        : '<span class="badge badge-draft">Draft</span>';

      return '<tr>' +
        '<td class="table-title"><a class="table-title-link" data-edit="' + escapeHtml(b.id) + '">' + escapeHtml(b.title) + '</a></td>' +
        '<td class="table-site">' + escapeHtml(b.site || "Main site") + '</td>' +
        '<td><span class="badge badge-category">' + escapeHtml(b.category || "General") + '</span></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td style="color:var(--text-muted);font-size:12px;">' + formatDate(b.published_at) + '</td>' +
        '<td style="text-align: right;">' +
          '<div class="table-actions" style="justify-content: flex-end;">' +
            '<button type="button" class="btn-action" data-edit="' + escapeHtml(b.id) + '">Edit</button>' +
            '<button type="button" class="btn-action delete" data-delete="' + escapeHtml(b.id) + '">Delete</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  searchBlogsInput.addEventListener("input", renderBlogsTable);
  filterSiteSelect.addEventListener("change", renderBlogsTable);

  statusTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      statusTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      currentStatusFilter = tab.getAttribute("data-status");
      renderBlogsTable();
    });
  });

  // Table click events (Edit / Delete)
  blogsTableBody.addEventListener("click", function (e) {
    var editId = e.target.getAttribute("data-edit");
    if (editId) {
      loadBlogIntoForm(editId);
      return;
    }

    var deleteId = e.target.getAttribute("data-delete");
    if (deleteId) {
      if (window.confirm("Are you sure you want to delete this blog post?")) {
        deleteBlog(deleteId);
      }
    }
  });

  function deleteBlog(id) {
    var blogs = getLocalBlogs();
    var updated = blogs.filter(function (b) { return String(b.id) !== String(id); });
    saveLocalBlogs(updated);
    renderBlogsTable();

    // Sync with backend API if available
    fetch(API_BLOGS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: id, csrf_token: csrfToken })
    }).catch(function () {});
  }

  // --- Form Helpers ---
  function resetForm() {
    blogForm.reset();
    blogIdInput.value = "";
    blogStatusInput.value = "published";
    blogDateInput.value = todayISO();
    editorHeading.textContent = "Add new blog";
    imagePreviewBox.classList.add("hidden");
    imagePreview.src = "";
    postMsg.textContent = "";
    postMsg.className = "form-feedback";
  }

  function loadBlogIntoForm(id) {
    var blogs = getLocalBlogs();
    var blog = blogs.find(function (b) { return String(b.id) === String(id); });
    if (!blog) return;

    blogIdInput.value = blog.id;
    blogStatusInput.value = blog.status || "published";
    blogTitleInput.value = blog.title || "";
    blogSeoTitleInput.value = blog.seo_title || blog.title || "";
    blogSiteInput.value = blog.site || "Main site";
    
    // Set or add category if not present
    var hasCat = Array.from(blogCategoryInput.options).some(function (opt) { return opt.value === blog.category; });
    if (!hasCat && blog.category) {
      var opt = document.createElement("option");
      opt.value = blog.category;
      opt.textContent = blog.category;
      blogCategoryInput.appendChild(opt);
    }
    blogCategoryInput.value = blog.category || "General";
    
    blogDateInput.value = blog.published_at || todayISO();
    blogImageUrlInput.value = blog.image_url || "";
    blogImageAltInput.value = blog.image_alt || "";
    
    if (blog.image_url) {
      imagePreview.src = blog.image_url;
      imagePreviewBox.classList.remove("hidden");
    } else {
      imagePreviewBox.classList.add("hidden");
    }

    blogExcerptInput.value = blog.excerpt || "";
    blogContentInput.value = blog.content || "";
    blogTargetUrlInput.value = blog.target_url || "";
    blogAnchorTextInput.value = blog.anchor_text || "";
    blogLinkTypeInput.value = blog.link_type || "DoFollow";
    blogPostTypeInput.value = blog.post_type || "Normal";

    editorHeading.textContent = "Edit blog";
    showView("add");
  }

  // --- Image Upload Preview ---
  blogImageFileInput.addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (evt) {
        var base64 = evt.target.result;
        blogImageUrlInput.value = base64;
        imagePreview.src = base64;
        imagePreviewBox.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  blogImageUrlInput.addEventListener("input", function () {
    var val = blogImageUrlInput.value.trim();
    if (val) {
      imagePreview.src = val;
      imagePreviewBox.classList.remove("hidden");
    } else {
      imagePreviewBox.classList.add("hidden");
    }
  });

  // --- Rich Editor Toolbar Actions ---
  document.querySelectorAll(".editor-toolbar .toolbar-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tag = btn.getAttribute("data-tag");
      var start = blogContentInput.selectionStart;
      var end = blogContentInput.selectionEnd;
      var selected = blogContentInput.value.substring(start, end);
      var replacement = "";

      switch (tag) {
        case "h2":
          replacement = "<h2>" + (selected || "Heading 2") + "</h2>";
          break;
        case "h3":
          replacement = "<h3>" + (selected || "Heading 3") + "</h3>";
          break;
        case "b":
          replacement = "<strong>" + (selected || "bold text") + "</strong>";
          break;
        case "i":
          replacement = "<em>" + (selected || "italic text") + "</em>";
          break;
        case "ul":
          replacement = "<ul>\n  <li>" + (selected || "List item 1") + "</li>\n  <li>List item 2</li>\n</ul>";
          break;
        case "ol":
          replacement = "<ol>\n  <li>" + (selected || "First step") + "</li>\n  <li>Second step</li>\n</ol>";
          break;
        case "quote":
          replacement = "<blockquote>" + (selected || "Quote text here...") + "</blockquote>";
          break;
        case "link":
          var url = prompt("Enter link URL:", "https://");
          if (url) {
            replacement = '<a href="' + url + '">' + (selected || "Link text") + '</a>';
          } else {
            return;
          }
          break;
        case "image":
          var imgUrl = prompt("Enter image URL:", "https://");
          if (imgUrl) {
            replacement = '<img src="' + imgUrl + '" alt="' + (selected || "Blog image") + '">';
          } else {
            return;
          }
          break;
      }

      blogContentInput.setRangeText(replacement, start, end, "select");
      blogContentInput.focus();
    });
  });

  // --- Add Category Dynamically ---
  btnAddCategory.addEventListener("click", function () {
    var newCat = prompt("Enter new category name:");
    if (newCat && newCat.trim()) {
      var catName = newCat.trim();
      var opt = document.createElement("option");
      opt.value = catName;
      opt.textContent = catName;
      blogCategoryInput.appendChild(opt);
      blogCategoryInput.value = catName;
    }
  });

  // --- Form Submission (Publish & Draft) ---
  function savePost(status) {
    var title = blogTitleInput.value.trim();
    if (!title) {
      postMsg.textContent = "Please enter the blog heading (H1).";
      postMsg.className = "form-feedback error";
      blogTitleInput.focus();
      return;
    }

    var id = blogIdInput.value || "story-" + Date.now();
    var slug = makeSlug(title) + "-" + String(id).replace(/\D/g, "").slice(-4);

    var blogData = {
      id: id,
      slug: slug,
      title: title,
      seo_title: blogSeoTitleInput.value.trim() || title,
      site: blogSiteInput.value,
      category: blogCategoryInput.value,
      published_at: blogDateInput.value || todayISO(),
      image_url: blogImageUrlInput.value.trim(),
      image_alt: blogImageAltInput.value.trim(),
      excerpt: blogExcerptInput.value.trim(),
      content: blogContentInput.value.trim(),
      target_url: blogTargetUrlInput.value.trim(),
      anchor_text: blogAnchorTextInput.value.trim(),
      link_type: blogLinkTypeInput.value,
      post_type: blogPostTypeInput.value,
      status: status || "published"
    };

    var blogs = getLocalBlogs();
    var existingIdx = blogs.findIndex(function (b) { return String(b.id) === String(id); });

    if (existingIdx !== -1) {
      blogs[existingIdx] = blogData;
    } else {
      blogs.unshift(blogData);
    }

    saveLocalBlogs(blogs);

    // Sync with PHP backend if running
    fetch(API_BLOGS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        id: blogIdInput.value ? blogData.id : null,
        title: blogData.title,
        category: blogData.category,
        published_at: blogData.published_at,
        excerpt: blogData.excerpt,
        content: blogData.content,
        image_url: blogData.image_url,
        csrf_token: csrfToken
      })
    }).catch(function () {});

    postMsg.textContent = status === "draft" ? "Saved as draft successfully!" : "Blog published successfully!";
    postMsg.className = "form-feedback success";

    setTimeout(function () {
      showView("all");
    }, 600);
  }

  blogForm.addEventListener("submit", function (e) {
    e.preventDefault();
    savePost("published");
  });

  btnSaveDraft.addEventListener("click", function () {
    savePost("draft");
  });

  btnClearForm.addEventListener("click", resetForm);

  // --- Export JSON ---
  btnExportJson.addEventListener("click", function () {
    var blogs = getLocalBlogs();
    var blob = new Blob([JSON.stringify(blogs, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "himalaya-blogs-export-" + todayISO() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Initialize
  checkAuth();
})();
