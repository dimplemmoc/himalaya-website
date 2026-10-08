(function () {
  "use strict";

  var STORAGE_KEY = "llh-blogs-store";
  var AUTH_STORAGE_KEY = "llh-admin-auth-session";
  var supabase = null;
  var user = null;

  // Purge legacy sample blogs from localStorage
  try {
    var rawSaved = localStorage.getItem(STORAGE_KEY);
    if (rawSaved && (rawSaved.indexOf("story-1") !== -1 || rawSaved.indexOf("story-2") !== -1)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {}

  // Initialize Supabase if available
  if (window.supabase && window.HIMALAYA_SUPABASE_URL && window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY) {
    try {
      supabase = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
    } catch (e) {
      console.warn("Supabase init error:", e);
    }
  }

  // DOM Elements
  var loginView = document.getElementById("login-view");
  var dashboardView = document.getElementById("dashboard-view");
  var loginForm = document.getElementById("login-form");
  var loginMsg = document.getElementById("login-message");

  var navAllBlogs = document.getElementById("nav-all-blogs");
  var navAddBlog = document.getElementById("nav-add-blog");
  var navTripInquiries = document.getElementById("nav-trip-inquiries");
  var navContactMessages = document.getElementById("nav-contact-messages");
  var navNewsletter = document.getElementById("nav-newsletter");

  var viewAllBlogs = document.getElementById("view-all-blogs");
  var viewAddBlog = document.getElementById("view-add-blog");
  var viewTripInquiries = document.getElementById("view-trip-inquiries");
  var viewContactMessages = document.getElementById("view-contact-messages");
  var viewNewsletter = document.getElementById("view-newsletter");

  var tripsTableBody = document.getElementById("trips-table-body");
  var contactsTableBody = document.getElementById("contacts-table-body");
  var newsletterTableBody = document.getElementById("newsletter-table-body");

  var badgeTrips = document.getElementById("badge-trips");
  var badgeContacts = document.getElementById("badge-contacts");
  var badgeNewsletter = document.getElementById("badge-newsletter");

  var searchTrips = document.getElementById("search-trips");
  var searchContacts = document.getElementById("search-contacts");
  var searchNewsletters = document.getElementById("search-newsletters");

  var btnRefreshTrips = document.getElementById("btn-refresh-trips");
  var btnExportTrips = document.getElementById("btn-export-trips");
  var btnRefreshContacts = document.getElementById("btn-refresh-contacts");
  var btnExportContacts = document.getElementById("btn-export-contacts");
  var btnRefreshNewsletter = document.getElementById("btn-refresh-newsletter");
  var btnExportNewsletters = document.getElementById("btn-export-newsletters");

  var allTripInquiries = [];
  var allContactInquiries = [];
  var allNewsletterSubscribers = [];

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
  var allCategories = [];

  // --- Local Data Helpers ---
  function getLocalBlogs() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
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
    var d = new Date(isoStr + (isoStr.length === 10 ? "T12:00:00" : ""));
    return isNaN(d.getTime()) ? isoStr : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function toPublishIso(dateValue) {
    var value = dateValue || todayISO();
    return value + "T12:00:00.000Z";
  }

  function isSupabaseId(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function makeSlug(title) {
    return String(title || "himalaya-story")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function mapSupabasePost(p) {
    return {
      id: p.id,
      slug: p.slug,
      title: p.h1 || p.title || "Untitled story",
      seo_title: p.seo_title || p.h1 || p.title || "",
      site: p.site || "Main site",
      category: p.category_label || (p.category_id ? "General" : "General"),
      category_id: p.category_id,
      published_at: p.published_at ? p.published_at.slice(0, 10) : todayISO(),
      image_url: p.featured_image_url || p.image_url || "",
      image_alt: p.featured_image_alt || p.image_alt || "",
      excerpt: p.excerpt || "",
      content: p.content_html || p.content || "",
      target_url: p.target_url || "",
      anchor_text: p.anchor_text || "",
      link_type: p.link_type === "nofollow" ? "NoFollow" : "DoFollow",
      post_type: p.is_sponsored ? "Sponsored" : "Normal",
      status: p.status || "published"
    };
  }

  // --- UI Switching ---
  function showView(view) {
    // Hide all views first
    viewAllBlogs.classList.add("hidden");
    viewAddBlog.classList.add("hidden");
    if (viewTripInquiries) viewTripInquiries.classList.add("hidden");
    if (viewContactMessages) viewContactMessages.classList.add("hidden");
    if (viewNewsletter) viewNewsletter.classList.add("hidden");

    // Remove active from all nav links
    navAllBlogs.classList.remove("active");
    navAddBlog.classList.remove("active");
    if (navTripInquiries) navTripInquiries.classList.remove("active");
    if (navContactMessages) navContactMessages.classList.remove("active");
    if (navNewsletter) navNewsletter.classList.remove("active");

    if (view === "add") {
      viewAddBlog.classList.remove("hidden");
      navAddBlog.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "trips") {
      if (viewTripInquiries) viewTripInquiries.classList.remove("hidden");
      if (navTripInquiries) navTripInquiries.classList.add("active");
      renderTripInquiriesTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "contacts") {
      if (viewContactMessages) viewContactMessages.classList.remove("hidden");
      if (navContactMessages) navContactMessages.classList.add("active");
      renderContactInquiriesTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "newsletter") {
      if (viewNewsletter) viewNewsletter.classList.remove("hidden");
      if (navNewsletter) navNewsletter.classList.add("active");
      renderNewsletterTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      viewAllBlogs.classList.remove("hidden");
      navAllBlogs.classList.add("active");
      renderBlogsTable();
    }
  }

  function setAuthenticated(isAuth) {
    if (isAuth) {
      loginView.classList.add("hidden");
      dashboardView.classList.remove("hidden");
      showView("all");
      syncFromSupabase();
      syncInquiries();
    } else {
      dashboardView.classList.add("hidden");
      loginView.classList.remove("hidden");
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // --- Direct REST / Supabase Sync ---
  async function syncFromSupabase() {
    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    if (!sbUrl || !sbKey) {
      renderBlogsTable();
      return;
    }

    try {
      // 1. Fetch Categories via REST
      try {
        var catRes = await fetch(sbUrl + "/rest/v1/blog_categories?select=*&order=name.asc", {
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
        });
        if (catRes.ok) {
          var catData = await catRes.json();
          if (Array.isArray(catData) && catData.length) {
            allCategories = catData;
            populateCategoryDropdown(allCategories);
          }
        }
      } catch (e) {}

      // 2. Fetch Posts via REST
      var queryUrl = sbUrl + "/rest/v1/blog_posts?select=id,h1,seo_title,slug,category_id,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status,target_url,anchor_text,link_type,is_sponsored&deleted_at=is.null&order=created_at.desc&_t=" + Date.now();
      
      var postsRes = await fetch(queryUrl, {
        headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
      });

      if (!postsRes.ok) {
        throw new Error("HTTP error " + postsRes.status);
      }

      var postsData = await postsRes.json();
      if (Array.isArray(postsData)) {
        var supabasePosts = postsData.map(mapSupabasePost);
        saveLocalBlogs(supabasePosts);
        renderBlogsTable();
        return;
      }
    } catch (err) {
      console.warn("REST sync failed, trying Supabase-js:", err);
    }

    // Fallback: Supabase JS client
    if (supabase) {
      try {
        var postResult = await supabase
          .from("blog_posts")
          .select("id,h1,seo_title,slug,category_id,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status,target_url,anchor_text,link_type,is_sponsored")
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (postResult.data && Array.isArray(postResult.data)) {
          var mapped = postResult.data.map(mapSupabasePost);
          saveLocalBlogs(mapped);
          renderBlogsTable();
        }
      } catch (e) {
        console.warn("Supabase JS sync error:", e);
      }
    }

    renderBlogsTable();
  }

  function populateCategoryDropdown(categories) {
    var currentVal = blogCategoryInput.value;
    var defaultCats = ["Village Life", "Nature", "Food", "Culture", "Adventure", "Wellness", "Remote Work", "Stargazing", "Himalayan Travel", "Homestays", "General"];
    var catNames = categories.map(function (c) { return c.name; });
    var merged = Array.from(new Set(defaultCats.concat(catNames)));

    blogCategoryInput.innerHTML = merged.map(function (name) {
      return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>';
    }).join("");

    if (currentVal) blogCategoryInput.value = currentVal;
  }

  // --- Auth Check ---
  async function checkAuth() {
    var localSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localSession === "authenticated") {
      if (supabase) {
        try {
          var sessionRes = await supabase.auth.getSession();
          if (sessionRes.data && sessionRes.data.session) {
            user = sessionRes.data.session.user;
          }
        } catch (e) {}
      }
      setAuthenticated(true);
      return;
    }

    setAuthenticated(false);
  }

  // --- Login Handler ---
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var enteredUser = loginForm.username.value.trim().toLowerCase();
    var enteredPass = loginForm.password.value;
    var fixedEmail = "admin@himalaya.com";
    var fixedPassword = "admin@123";

    loginMsg.textContent = "Signing in...";
    loginMsg.className = "form-feedback";

    // 1. Try Supabase Auth with entered credentials
    if (supabase) {
      try {
        var authRes = await supabase.auth.signInWithPassword({
          email: enteredUser,
          password: enteredPass
        });

        if (authRes.data && authRes.data.user) {
          user = authRes.data.user;
          loginMsg.textContent = "";
          localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
          setAuthenticated(true);
          return;
        }
      } catch (err) {
        console.warn("Supabase auth attempted:", err);
      }
    }

    // 2. Master fallback
    var isMaster = (enteredUser === fixedEmail || enteredUser === "admin") && enteredPass === fixedPassword;
    if (isMaster) {
      loginMsg.textContent = "";
      localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
      setAuthenticated(true);
      return;
    }

    loginMsg.textContent = "Invalid email or password. Please verify your credentials.";
    loginMsg.className = "form-feedback error";
  });

  // Password toggle
  var togglePasswordBtn = document.getElementById("toggle-password");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function () {
      var passInput = document.getElementById("login-password");
      if (passInput) {
        var isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        togglePasswordBtn.innerHTML = isPass
          ? '<svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
          : '<svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  }

  async function handleLogout() {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch (e) {}
    }
    setAuthenticated(false);
  }

  btnLogout.addEventListener("click", handleLogout);
  sidebarLogout.addEventListener("click", handleLogout);

  // --- Navigation Events ---
  navAllBlogs.addEventListener("click", function () { showView("all"); });
  navAddBlog.addEventListener("click", function () { resetForm(); showView("add"); });
  btnCreateNew.addEventListener("click", function () { resetForm(); showView("add"); });
  btnBackToAll.addEventListener("click", function () { showView("all"); });
  if (navTripInquiries) navTripInquiries.addEventListener("click", function () { showView("trips"); });
  if (navContactMessages) navContactMessages.addEventListener("click", function () { showView("contacts"); });
  if (navNewsletter) navNewsletter.addEventListener("click", function () { showView("newsletter"); });

  // --- Table Rendering & Filtering ---
  function renderBlogsTable() {
    var blogs = getLocalBlogs();
    var searchVal = (searchBlogsInput.value || "").toLowerCase().trim();
    var siteVal = filterSiteSelect.value;

    var filtered = blogs.filter(function (b) {
      var matchSearch = !searchVal ||
        (b.title && b.title.toLowerCase().indexOf(searchVal) !== -1) ||
        (b.category && b.category.toLowerCase().indexOf(searchVal) !== -1) ||
        (b.excerpt && b.excerpt.toLowerCase().indexOf(searchVal) !== -1);
      
      var matchSite = !siteVal || !b.site || (b.site === siteVal) || (b.site === "All sites");
      var matchStatus = currentStatusFilter === "all" || (b.status === currentStatusFilter);

      return matchSearch && matchSite && matchStatus;
    });

    countAll.textContent = blogs.length;
    countPublished.textContent = blogs.filter(function (b) { return b.status === "published"; }).length;
    countDrafts.textContent = blogs.filter(function (b) { return b.status === "draft"; }).length;

    if (!filtered.length) {
      blogsTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No blogs match your filter. Click "Add new blog" to write your first one.</td></tr>';
      return;
    }

    blogsTableBody.innerHTML = filtered.map(function (b) {
      var statusBadge = b.status === "published"
        ? '<span class="badge badge-published">Published</span>'
        : '<span class="badge badge-draft">Draft</span>';

      return '<tr>' +
        '<td class="table-title table-col-title"><a class="table-title-link" data-edit="' + escapeHtml(b.id) + '">' + escapeHtml(b.title) + '</a></td>' +
        '<td class="table-site table-col-site">' + escapeHtml(b.site || "Main site") + '</td>' +
        '<td class="table-col-category"><span class="badge badge-category">' + escapeHtml(b.category || "General") + '</span></td>' +
        '<td class="table-col-status">' + statusBadge + '</td>' +
        '<td class="table-col-date" style="color:var(--text-muted);font-size:12px;">' + formatDate(b.published_at) + '</td>' +
        '<td class="table-col-actions" style="text-align: right;">' +
          '<div class="table-actions">' +
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

  async function deleteBlog(id) {
    var blogs = getLocalBlogs();
    var updated = blogs.filter(function (b) { return String(b.id) !== String(id); });
    saveLocalBlogs(updated);
    renderBlogsTable();

    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    // Delete in Supabase via REST
    if (sbUrl && sbKey) {
      try {
        await fetch(sbUrl + "/rest/v1/blog_posts?id=eq." + encodeURIComponent(id), {
          method: "PATCH",
          headers: {
            "apikey": sbKey,
            "Authorization": "Bearer " + sbKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            deleted_at: new Date().toISOString(),
            status: "unpublished"
          })
        });
      } catch (e) {
        console.warn("Delete error:", e);
      }
    }

    // Re-sync
    syncFromSupabase();
  }

  function resetForm() {
    blogForm.reset();
    blogIdInput.value = "";
    blogStatusInput.value = "published";
    blogDateInput.value = todayISO();
    editorHeading.textContent = "Add new blog";
    var pubBtn = document.getElementById("btn-publish-submit");
    if (pubBtn) pubBtn.textContent = "Publish blog ↗";
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

    editorHeading.textContent = "Edit: " + (blog.title || "Blog");
    var pubBtn = document.getElementById("btn-publish-submit");
    if (pubBtn) pubBtn.textContent = "Update blog ↗";
    showView("add");
  }

  // --- Upload to Supabase Storage Helper ---
  async function uploadImageToSupabase(file) {
    if (!supabase || !file) return null;
    try {
      var safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      var path = "public/" + Date.now() + "-" + safe;
      var uploadRes = await supabase.storage.from("blog-media").upload(path, file, { upsert: false, contentType: file.type });
      if (uploadRes.error) throw uploadRes.error;
      var pubUrl = supabase.storage.from("blog-media").getPublicUrl(path).data.publicUrl;
      return pubUrl;
    } catch (e) {
      console.warn("Supabase storage upload error:", e);
      return null;
    }
  }

  blogImageFileInput.addEventListener("change", async function (e) {
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

      // Attempt background Supabase upload
      var remoteUrl = await uploadImageToSupabase(file);
      if (remoteUrl) {
        blogImageUrlInput.value = remoteUrl;
        imagePreview.src = remoteUrl;
      }
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

  // --- Toolbar Actions ---
  document.querySelectorAll(".editor-toolbar .toolbar-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tag = btn.getAttribute("data-tag");
      var start = blogContentInput.selectionStart;
      var end = blogContentInput.selectionEnd;
      var selected = blogContentInput.value.substring(start, end);
      var replacement = "";

      switch (tag) {
        case "h2": replacement = "<h2>" + (selected || "Heading 2") + "</h2>"; break;
        case "h3": replacement = "<h3>" + (selected || "Heading 3") + "</h3>"; break;
        case "b": replacement = "<strong>" + (selected || "bold text") + "</strong>"; break;
        case "i": replacement = "<em>" + (selected || "italic text") + "</em>"; break;
        case "ul": replacement = "<ul>\n  <li>" + (selected || "List item 1") + "</li>\n  <li>List item 2</li>\n</ul>"; break;
        case "ol": replacement = "<ol>\n  <li>" + (selected || "First step") + "</li>\n  <li>Second step</li>\n</ol>"; break;
        case "quote": replacement = "<blockquote>" + (selected || "Quote text here...") + "</blockquote>"; break;
        case "link":
          var url = prompt("Enter link URL:", "https://");
          if (url) replacement = '<a href="' + url + '">' + (selected || "Link text") + '</a>';
          else return;
          break;
        case "image":
          var imgUrl = prompt("Enter image URL:", "https://");
          if (imgUrl) replacement = '<img src="' + imgUrl + '" alt="' + (selected || "Blog image") + '">';
          else return;
          break;
      }

      blogContentInput.setRangeText(replacement, start, end, "select");
      blogContentInput.focus();
    });
  });

  // --- Add Category ---
  btnAddCategory.addEventListener("click", async function () {
    var newCat = prompt("Enter new category name:");
    if (newCat && newCat.trim()) {
      var catName = newCat.trim();
      var opt = document.createElement("option");
      opt.value = catName;
      opt.textContent = catName;
      blogCategoryInput.appendChild(opt);
      blogCategoryInput.value = catName;

      var sbUrl = window.HIMALAYA_SUPABASE_URL;
      var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
      if (sbUrl && sbKey) {
        try {
          await fetch(sbUrl + "/rest/v1/blog_categories", {
            method: "POST",
            headers: {
              "apikey": sbKey,
              "Authorization": "Bearer " + sbKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: catName, slug: makeSlug(catName) })
          });
        } catch (e) {}
      }
    }
  });

  // --- Save Post ---
  async function savePost(status) {
    var title = blogTitleInput.value.trim();
    if (!title) {
      postMsg.textContent = "Please enter the blog heading (H1).";
      postMsg.className = "form-feedback error";
      blogTitleInput.focus();
      return;
    }

    var id = blogIdInput.value || "story-" + Date.now();
    var existingBlog = getLocalBlogs().find(function (b) { return String(b.id) === String(id); });
    var suffix = isSupabaseId(id) ? String(Date.now()).slice(-4) : String(id).replace(/\D/g, "").slice(-4);
    var slug = existingBlog && existingBlog.slug ? existingBlog.slug : makeSlug(title) + "-" + suffix;

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

    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    if (sbUrl && sbKey) {
      try {
        var payload = {
          h1: blogData.title,
          seo_title: blogData.seo_title,
          slug: blogData.slug,
          category_label: blogData.category,
          excerpt: blogData.excerpt,
          content_html: blogData.content,
          featured_image_url: blogData.image_url,
          featured_image_alt: blogData.image_alt,
          target_url: blogData.target_url,
          anchor_text: blogData.anchor_text,
          link_type: blogData.link_type.toLowerCase() === "nofollow" ? "nofollow" : "dofollow",
          is_sponsored: blogData.post_type === "Sponsored",
          status: status || "published",
          published_at: status === "published" ? toPublishIso(blogData.published_at) : null,
          updated_at: new Date().toISOString()
        };

        var isEdit = isSupabaseId(blogIdInput.value);
        var endpoint = isEdit
          ? sbUrl + "/rest/v1/blog_posts?id=eq." + encodeURIComponent(blogIdInput.value)
          : sbUrl + "/rest/v1/blog_posts";
        var method = isEdit ? "PATCH" : "POST";

        var saveRes = await fetch(endpoint, {
          method: method,
          headers: {
            "apikey": sbKey,
            "Authorization": "Bearer " + sbKey,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(payload)
        });

        if (!saveRes.ok) {
          var errText = await saveRes.text();
          throw new Error("Supabase error: " + errText);
        }

        var savedData = await saveRes.json();
        if (Array.isArray(savedData) && savedData[0]) {
          blogData = mapSupabasePost(savedData[0]);
        }
      } catch (err) {
        console.warn("Supabase post save warning:", err);
        postMsg.textContent = err && err.message ? err.message : "Could not publish this blog to Supabase.";
        postMsg.className = "form-feedback error";
        return;
      }
    }

    var blogs = getLocalBlogs();
    var existingIdx = blogs.findIndex(function (b) { return String(b.id) === String(id) || String(b.id) === String(blogData.id); });

    if (existingIdx !== -1) {
      blogs[existingIdx] = blogData;
    } else {
      blogs.unshift(blogData);
    }
    saveLocalBlogs(blogs);
    blogIdInput.value = blogData.id;

    postMsg.textContent = status === "draft" ? "Saved as draft successfully!" : "Blog published successfully!";
    postMsg.className = "form-feedback success";

    setTimeout(function () {
      showView("all");
      syncFromSupabase();
    }, 600);
  }

  blogForm.addEventListener("submit", function (e) {
    e.preventDefault();
    savePost("published");
  });

  var btnUpdateBlog = document.getElementById("btn-update-blog");
  if (btnUpdateBlog) {
    btnUpdateBlog.addEventListener("click", function () {
      savePost("published");
    });
  }

  btnSaveDraft.addEventListener("click", function () {
    savePost("draft");
  });

  btnClearForm.addEventListener("click", resetForm);

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

  var btnRefresh = document.getElementById("btn-refresh-blogs");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", function () {
      btnRefresh.textContent = "Syncing...";
      syncFromSupabase().then(function () {
        btnRefresh.textContent = "↻ Refresh Live Data";
      });
    });
  }

  // =========================================================================
  // INQUIRIES & LEADS SYSTEM (Trips, Contacts, Newsletters)
  // =========================================================================

  function exportToCsv(filename, rows) {
    if (!rows || !rows.length) {
      alert("No data available to export.");
      return;
    }
    var keys = Object.keys(rows[0]);
    var csvContent = [
      keys.join(","),
      rows.map(function (row) {
        return keys.map(function (k) {
          var val = row[k] === null || row[k] === undefined ? "" : String(row[k]);
          return '"' + val.replace(/"/g, '""') + '"';
        }).join(",");
      }).join("\r\n")
    ].join("\r\n");

    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function syncInquiries() {
    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    try {
      // 1. Try Vercel Serverless API first
      var apiRes = await fetch("/api/inquiries?type=all");
      if (apiRes.ok) {
        var apiData = await apiRes.json();
        if (apiData.success) {
          allTripInquiries = apiData.tripInquiries || [];
          allContactInquiries = apiData.contactInquiries || [];
          allNewsletterSubscribers = apiData.newsletterSubscribers || [];
          updateInquiryBadges();
          renderTripInquiriesTable();
          renderContactInquiriesTable();
          renderNewsletterTable();
          return;
        }
      }
    } catch (e) {
      // API endpoint fallback
    }

    // 2. Direct Supabase REST fallback
    if (sbUrl && sbKey) {
      try {
        var h = { "apikey": sbKey, "Authorization": "Bearer " + sbKey };
        var [tripRes, contactRes, newsRes] = await Promise.allSettled([
          fetch(sbUrl + "/rest/v1/trip_inquiries?select=*&order=created_at.desc", { headers: h }).then(function (r) { return r.ok ? r.json() : []; }),
          fetch(sbUrl + "/rest/v1/contact_inquiries?select=*&order=created_at.desc", { headers: h }).then(function (r) { return r.ok ? r.json() : []; }),
          fetch(sbUrl + "/rest/v1/newsletter_subscribers?select=*&order=created_at.desc", { headers: h }).then(function (r) { return r.ok ? r.json() : []; })
        ]);

        if (tripRes.status === "fulfilled" && Array.isArray(tripRes.value)) allTripInquiries = tripRes.value;
        if (contactRes.status === "fulfilled" && Array.isArray(contactRes.value)) allContactInquiries = contactRes.value;
        if (newsRes.status === "fulfilled" && Array.isArray(newsRes.value)) allNewsletterSubscribers = newsRes.value;
      } catch (err) {
        console.warn("Direct Supabase inquiry fetch error:", err);
      }
    }

    updateInquiryBadges();
    renderTripInquiriesTable();
    renderContactInquiriesTable();
    renderNewsletterTable();
  }

  function updateInquiryBadges() {
    if (badgeTrips) badgeTrips.textContent = allTripInquiries.length;
    if (badgeContacts) badgeContacts.textContent = allContactInquiries.length;
    if (badgeNewsletter) badgeNewsletter.textContent = allNewsletterSubscribers.length;
  }

  // --- Render Trip Inquiries ---
  function renderTripInquiriesTable() {
    if (!tripsTableBody) return;
    var searchVal = (searchTrips ? searchTrips.value : "").toLowerCase().trim();

    var filtered = allTripInquiries.filter(function (t) {
      if (!searchVal) return true;
      var str = [(t.name || ""), (t.phone || ""), (t.destination || ""), (t.trip_type || "")].join(" ").toLowerCase();
      return str.indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      tripsTableBody.innerHTML = '<tr><td colspan="11" class="empty-state">No trip inquiries found yet.</td></tr>';
      return;
    }

    tripsTableBody.innerHTML = filtered.map(function (t) {
      var dateStr = formatDate(t.created_at ? t.created_at.slice(0, 10) : "");
      var status = (t.status || "new").toLowerCase();
      var travelDates = (t.start_date || "") + (t.end_date ? " → " + t.end_date : "");
      var cleanPhone = (t.phone || "").replace(/[^0-9]/g, "");

      return '<tr>' +
        '<td><div style="font-size:12px;color:var(--text-muted);">' + escapeHtml(dateStr) + '</div></td>' +
        '<td><div style="font-weight:600;color:var(--text-main);">' + escapeHtml(t.name || "Anonymous") + '</div>' + (t.email ? '<div style="font-size:11px;color:var(--text-dim);">' + escapeHtml(t.email) + '</div>' : '') + '</td>' +
        '<td><a href="tel:' + escapeHtml(cleanPhone) + '" style="color:var(--mint);text-decoration:none;font-weight:500;">' + escapeHtml(t.phone || "-") + '</a>' + (cleanPhone ? ' <a href="https://wa.me/' + escapeHtml(cleanPhone) + '" target="_blank" title="Open WhatsApp" style="text-decoration:none;font-size:13px;margin-left:4px;">💬</a>' : '') + '</td>' +
        '<td><span style="font-weight:600;color:var(--mint);">' + escapeHtml(t.destination || "Himalayas") + '</span></td>' +
        '<td>' + escapeHtml(t.trip_type || "-") + '</td>' +
        '<td>' + escapeHtml(t.travelers || "1") + '</td>' +
        '<td style="font-size:12px;">' + escapeHtml(travelDates || "-") + '</td>' +
        '<td>' + escapeHtml(t.budget || "-") + '</td>' +
        '<td style="max-width:220px;font-size:12px;color:var(--text-muted);"><div style="white-space:normal;line-height:1.4;">' + escapeHtml(t.message || "-") + '</div></td>' +
        '<td><button type="button" class="inquiry-status ' + status + '" data-toggle-trip-status="' + escapeHtml(t.id) + '" title="Click to toggle status: New / Contacted / Resolved">' + escapeHtml(status) + '</button></td>' +
        '<td style="text-align:right;"><button type="button" class="btn-action delete" data-delete-trip="' + escapeHtml(t.id) + '">Delete</button></td>' +
      '</tr>';
    }).join("");
  }

  // --- Render Contact Inquiries ---
  function renderContactInquiriesTable() {
    if (!contactsTableBody) return;
    var searchVal = (searchContacts ? searchContacts.value : "").toLowerCase().trim();

    var filtered = allContactInquiries.filter(function (c) {
      if (!searchVal) return true;
      var str = [(c.full_name || ""), (c.email || ""), (c.phone || ""), (c.message || "")].join(" ").toLowerCase();
      return str.indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      contactsTableBody.innerHTML = '<tr><td colspan="11" class="empty-state">No contact messages found yet.</td></tr>';
      return;
    }

    contactsTableBody.innerHTML = filtered.map(function (c) {
      var dateStr = formatDate(c.created_at ? c.created_at.slice(0, 10) : "");
      var status = (c.status || "new").toLowerCase();
      var cleanPhone = (c.phone || "").replace(/[^0-9]/g, "");

      return '<tr>' +
        '<td><div style="font-size:12px;color:var(--text-muted);">' + escapeHtml(dateStr) + '</div></td>' +
        '<td><strong style="color:var(--text-main);">' + escapeHtml(c.full_name || "Guest") + '</strong></td>' +
        '<td><a href="mailto:' + escapeHtml(c.email || "") + '" style="color:var(--mint);text-decoration:none;">' + escapeHtml(c.email || "-") + '</a></td>' +
        '<td>' + (c.phone ? '<a href="tel:' + escapeHtml(cleanPhone) + '" style="color:var(--mint);text-decoration:none;">' + escapeHtml(c.phone) + '</a>' : '-') + '</td>' +
        '<td style="font-size:12px;">' + escapeHtml(c.travel_date || "-") + '</td>' +
        '<td>' + escapeHtml(c.travellers || "1") + '</td>' +
        '<td>' + escapeHtml(c.interested || "-") + '</td>' +
        '<td>' + escapeHtml(c.budget || "-") + '</td>' +
        '<td style="max-width:240px;font-size:12px;color:var(--text-muted);"><div style="white-space:normal;line-height:1.4;">' + escapeHtml(c.message || "-") + '</div></td>' +
        '<td><button type="button" class="inquiry-status ' + status + '" data-toggle-contact-status="' + escapeHtml(c.id) + '" title="Click to toggle status: New / Contacted / Resolved">' + escapeHtml(status) + '</button></td>' +
        '<td style="text-align:right;"><button type="button" class="btn-action delete" data-delete-contact="' + escapeHtml(c.id) + '">Delete</button></td>' +
      '</tr>';
    }).join("");
  }

  // --- Render Newsletter Subscribers ---
  function renderNewsletterTable() {
    if (!newsletterTableBody) return;
    var searchVal = (searchNewsletters ? searchNewsletters.value : "").toLowerCase().trim();

    var filtered = allNewsletterSubscribers.filter(function (n) {
      if (!searchVal) return true;
      return (n.email || "").toLowerCase().indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      newsletterTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No newsletter subscribers yet.</td></tr>';
      return;
    }

    newsletterTableBody.innerHTML = filtered.map(function (n, idx) {
      var dateStr = formatDate(n.created_at ? n.created_at.slice(0, 10) : "");

      return '<tr>' +
        '<td>' + (idx + 1) + '</td>' +
        '<td><strong style="color:var(--mint);">' + escapeHtml(n.email) + '</strong></td>' +
        '<td>' + escapeHtml(n.source || "footer") + '</td>' +
        '<td><div style="font-size:12px;color:var(--text-muted);">' + escapeHtml(dateStr) + '</div></td>' +
        '<td style="text-align:right;"><button type="button" class="btn-action delete" data-delete-newsletter="' + escapeHtml(n.id) + '">Remove</button></td>' +
      '</tr>';
    }).join("");
  }

  // Status toggle handler & item actions
  async function toggleStatus(type, id, currentStatus) {
    var nextStatus = currentStatus === "new" ? "contacted" : currentStatus === "contacted" ? "resolved" : "new";
    var table = type === "contact" ? "contact_inquiries" : "trip_inquiries";

    if (type === "contact") {
      var item = allContactInquiries.find(function (c) { return String(c.id) === String(id); });
      if (item) item.status = nextStatus;
      renderContactInquiriesTable();
    } else {
      var trip = allTripInquiries.find(function (t) { return String(t.id) === String(id); });
      if (trip) trip.status = nextStatus;
      renderTripInquiriesTable();
    }

    try {
      await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, id: id, status: nextStatus })
      });
    } catch (e) {
      var sbUrl = window.HIMALAYA_SUPABASE_URL;
      var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
      if (sbUrl && sbKey) {
        fetch(sbUrl + "/rest/v1/" + table + "?id=eq." + encodeURIComponent(id), {
          method: "PATCH",
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey, "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        }).catch(function () {});
      }
    }
  }

  async function deleteInquiryItem(type, id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    var table = type === "contact" ? "contact_inquiries" : type === "newsletter" ? "newsletter_subscribers" : "trip_inquiries";

    if (type === "contact") {
      allContactInquiries = allContactInquiries.filter(function (c) { return String(c.id) !== String(id); });
      renderContactInquiriesTable();
    } else if (type === "newsletter") {
      allNewsletterSubscribers = allNewsletterSubscribers.filter(function (n) { return String(n.id) !== String(id); });
      renderNewsletterTable();
    } else {
      allTripInquiries = allTripInquiries.filter(function (t) { return String(t.id) !== String(id); });
      renderTripInquiriesTable();
    }
    updateInquiryBadges();

    try {
      await fetch("/api/inquiries?type=" + encodeURIComponent(type) + "&id=" + encodeURIComponent(id), { method: "DELETE" });
    } catch (e) {
      var sbUrl = window.HIMALAYA_SUPABASE_URL;
      var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
      if (sbUrl && sbKey) {
        fetch(sbUrl + "/rest/v1/" + table + "?id=eq." + encodeURIComponent(id), {
          method: "DELETE",
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
        }).catch(function () {});
      }
    }
  }

  // Delegated event listeners for inquiry tables
  if (tripsTableBody) {
    tripsTableBody.addEventListener("click", function (e) {
      var toggleId = e.target.getAttribute("data-toggle-trip-status");
      if (toggleId) {
        var trip = allTripInquiries.find(function (t) { return String(t.id) === String(toggleId); });
        toggleStatus("trip", toggleId, trip ? trip.status : "new");
        return;
      }
      var delId = e.target.getAttribute("data-delete-trip");
      if (delId) deleteInquiryItem("trip", delId);
    });
  }

  if (contactsTableBody) {
    contactsTableBody.addEventListener("click", function (e) {
      var toggleId = e.target.getAttribute("data-toggle-contact-status");
      if (toggleId) {
        var item = allContactInquiries.find(function (c) { return String(c.id) === String(toggleId); });
        toggleStatus("contact", toggleId, item ? item.status : "new");
        return;
      }
      var delId = e.target.getAttribute("data-delete-contact");
      if (delId) deleteInquiryItem("contact", delId);
    });
  }

  if (newsletterTableBody) {
    newsletterTableBody.addEventListener("click", function (e) {
      var delId = e.target.getAttribute("data-delete-newsletter");
      if (delId) deleteInquiryItem("newsletter", delId);
    });
  }

  // Filter input listeners
  if (searchTrips) searchTrips.addEventListener("input", renderTripInquiriesTable);
  if (searchContacts) searchContacts.addEventListener("input", renderContactInquiriesTable);
  if (searchNewsletters) searchNewsletters.addEventListener("input", renderNewsletterTable);

  // Refresh buttons
  if (btnRefreshTrips) btnRefreshTrips.addEventListener("click", syncInquiries);
  if (btnRefreshContacts) btnRefreshContacts.addEventListener("click", syncInquiries);
  if (btnRefreshNewsletter) btnRefreshNewsletter.addEventListener("click", syncInquiries);

  // Export buttons
  if (btnExportTrips) {
    btnExportTrips.addEventListener("click", function () {
      exportToCsv("himalaya-trip-inquiries-" + todayISO() + ".csv", allTripInquiries);
    });
  }
  if (btnExportContacts) {
    btnExportContacts.addEventListener("click", function () {
      exportToCsv("himalaya-contact-inquiries-" + todayISO() + ".csv", allContactInquiries);
    });
  }
  if (btnExportNewsletters) {
    btnExportNewsletters.addEventListener("click", function () {
      exportToCsv("himalaya-newsletter-subscribers-" + todayISO() + ".csv", allNewsletterSubscribers);
    });
  }

  checkAuth();
})();
