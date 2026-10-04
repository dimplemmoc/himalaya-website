(function () {
  "use strict";

  var STORAGE_KEY = "llh-blogs-store";
  var AUTH_STORAGE_KEY = "llh-admin-auth-session";
  var supabase = null;
  var user = null;

  // Initialize Supabase if available
  if (window.supabase && window.HIMALAYA_SUPABASE_URL && window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY) {
    try {
      supabase = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
    } catch (e) {
      console.warn("Supabase init error:", e);
    }
  }

  // Initial sample blogs
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
  var allCategories = [];

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
    var d = new Date(isoStr + (isoStr.length === 10 ? "T12:00:00" : ""));
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
      syncFromSupabase();
    } else {
      dashboardView.classList.add("hidden");
      loginView.classList.remove("hidden");
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // --- Sync with Supabase ---
  async function syncFromSupabase() {
    if (!supabase) return;
    try {
      // 1. Fetch Categories
      var catResult = await supabase.from("blog_categories").select("*").order("name");
      if (catResult.data && catResult.data.length) {
        allCategories = catResult.data;
        populateCategoryDropdown(allCategories);
      }

      // 2. Fetch Posts
      var postResult = await supabase.from("blog_posts").select("*").is("deleted_at", null).order("published_at", { ascending: false });
      if (postResult.data && postResult.data.length) {
        var supabasePosts = postResult.data.map(function (p) {
          return {
            id: p.id,
            slug: p.slug,
            title: p.h1 || p.title,
            seo_title: p.seo_title || p.h1,
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
            link_type: p.link_type || "DoFollow",
            post_type: p.is_sponsored ? "Sponsored" : "Normal",
            status: p.status || "published"
          };
        });

        saveLocalBlogs(supabasePosts);
        renderBlogsTable();
      }
    } catch (err) {
      console.warn("Supabase sync warning:", err);
    }
  }

  function populateCategoryDropdown(categories) {
    var currentVal = blogCategoryInput.value;
    var defaultCats = ["General", "Himalayan Travel", "Local Life", "Food & Culture", "Travel Guide", "Nature"];
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
      setAuthenticated(true);
      return;
    }

    if (supabase) {
      var sessionRes = await supabase.auth.getSession();
      if (sessionRes.data && sessionRes.data.session) {
        user = sessionRes.data.session.user;
        localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
        setAuthenticated(true);
        return;
      }
    }

    setAuthenticated(false);
  }

  // --- Login Handler ---
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var enteredUser = loginForm.username.value.trim().toLowerCase();
    var enteredPass = loginForm.password.value;

    loginMsg.textContent = "Signing in...";
    loginMsg.className = "form-feedback";

    var isMaster = (enteredUser === "admin@himalaya.com" || enteredUser === "admin") && (enteredPass === "admin@123" || enteredPass === "admin123");

    // 1. Try Supabase Auth
    if (supabase) {
      try {
        var authRes = await supabase.auth.signInWithPassword({
          email: enteredUser.includes("@") ? enteredUser : "admin@himalaya.com",
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

    // 2. Fixed Master Credentials Check
    if (isMaster) {
      loginMsg.textContent = "";
      localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
      setAuthenticated(true);
    } else {
      loginMsg.textContent = "Invalid credentials. Use admin@himalaya.com / admin@123";
      loginMsg.className = "form-feedback error";
    }
  });

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
      
      var matchSite = !siteVal || (b.site === siteVal);
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

    if (supabase) {
      try {
        await supabase.from("blog_posts").update({ deleted_at: new Date().toISOString(), status: "unpublished" }).eq("id", id);
      } catch (e) {}
    }
  }

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

      if (supabase) {
        try {
          await supabase.from("blog_categories").insert({ name: catName, slug: makeSlug(catName) });
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

    // Save to Supabase if connected
    if (supabase) {
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
          published_at: status === "published" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        };

        if (blogIdInput.value && blogIdInput.value.includes("-") && blogIdInput.value.length > 20) {
          await supabase.from("blog_posts").update(payload).eq("id", blogIdInput.value);
        } else {
          await supabase.from("blog_posts").insert(payload);
        }
      } catch (err) {
        console.warn("Supabase post save warning:", err);
      }
    }

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

  checkAuth();
})();
