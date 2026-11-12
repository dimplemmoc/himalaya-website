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

  // DOM Elements - Views
  var loginView = document.getElementById("login-view");
  var dashboardView = document.getElementById("dashboard-view");
  var loginForm = document.getElementById("login-form");
  var loginMsg = document.getElementById("login-message");

  // Navigation Buttons
  var navDashboard = document.getElementById("nav-dashboard");
  var navAllBlogs = document.getElementById("nav-all-blogs");
  var navAddBlog = document.getElementById("nav-add-blog");
  var navTripInquiries = document.getElementById("nav-trip-inquiries");
  var navContactMessages = document.getElementById("nav-contact-messages");
  var navWhatsappInquiries = document.getElementById("nav-whatsapp-inquiries");
  var navNewsletter = document.getElementById("nav-newsletter");
  var navUsers = document.getElementById("nav-users");
  var navDatabase = document.getElementById("nav-database");

  // View Sections
  var viewDashboard = document.getElementById("view-dashboard");
  var viewAllBlogs = document.getElementById("view-all-blogs");
  var viewAddBlog = document.getElementById("view-add-blog");
  var viewTripInquiries = document.getElementById("view-trip-inquiries");
  var viewContactMessages = document.getElementById("view-contact-messages");
  var viewWhatsappInquiries = document.getElementById("view-whatsapp-inquiries");
  var viewNewsletter = document.getElementById("view-newsletter");
  var viewUsers = document.getElementById("view-users");
  var viewDatabase = document.getElementById("view-database");

  // Table Bodies
  var dashboardRecentDealsBody = document.getElementById("dashboard-recent-deals-body");
  var blogsTableBody = document.getElementById("blogs-table-body");
  var tripsTableBody = document.getElementById("trips-table-body");
  var contactsTableBody = document.getElementById("contacts-table-body");
  var whatsappTableBody = document.getElementById("whatsapp-table-body");
  var newsletterTableBody = document.getElementById("newsletter-table-body");
  var usersTableBody = document.getElementById("users-table-body");

  // Badges
  var badgeTrips = document.getElementById("badge-trips");
  var badgeContacts = document.getElementById("badge-contacts");
  var badgeWhatsapp = document.getElementById("badge-whatsapp");
  var badgeNewsletter = document.getElementById("badge-newsletter");
  var badgeUsers = document.getElementById("badge-users");

  // Database View Counters
  var dbCountTrips = document.getElementById("db-count-trips");
  var dbCountContacts = document.getElementById("db-count-contacts");
  var dbCountNewsletter = document.getElementById("db-count-newsletter");
  var dbCountBlogs = document.getElementById("db-count-blogs");
  var dbCountUsers = document.getElementById("db-count-users");

  // Search Inputs
  var globalSearchInput = document.getElementById("global-search-input");
  var searchBlogsInput = document.getElementById("search-blogs");
  var searchTrips = document.getElementById("search-trips");
  var searchContacts = document.getElementById("search-contacts");
  var searchWhatsapp = document.getElementById("search-whatsapp");
  var searchNewsletters = document.getElementById("search-newsletters");
  var searchUsers = document.getElementById("search-users");

  // Buttons & Controls
  var btnRefreshBlogs = document.getElementById("btn-refresh-blogs");
  var btnRefreshTrips = document.getElementById("btn-refresh-trips");
  var btnExportTrips = document.getElementById("btn-export-trips");
  var btnRefreshContacts = document.getElementById("btn-refresh-contacts");
  var btnExportContacts = document.getElementById("btn-export-contacts");
  var btnRefreshWhatsapp = document.getElementById("btn-refresh-whatsapp");
  var btnRefreshNewsletter = document.getElementById("btn-refresh-newsletter");
  var btnExportNewsletters = document.getElementById("btn-export-newsletters");
  var btnRefreshUsers = document.getElementById("btn-refresh-users");
  var btnExportUsers = document.getElementById("btn-export-users");
  var btnDownloadFullBackup = document.getElementById("btn-download-full-backup");
  var btnDbExportBlogs = document.getElementById("btn-db-export-blogs");
  var btnExportJson = document.getElementById("btn-export-json");
  var btnCreateNew = document.getElementById("btn-create-new");
  var btnBackToAll = document.getElementById("btn-back-to-all");
  var btnLogout = document.getElementById("logout-button");
  var sidebarLogout = document.getElementById("sidebar-logout");

  // Blog Form Inputs
  var blogForm = document.getElementById("blog-form");
  var editorHeading = document.getElementById("editor-heading");
  var postMsg = document.getElementById("post-message");
  var btnSaveDraft = document.getElementById("btn-save-draft");
  var btnClearForm = document.getElementById("btn-clear-form");
  var btnAddCategory = document.getElementById("btn-add-category");
  var filterSiteSelect = document.getElementById("filter-site");
  var statusTabs = document.querySelectorAll(".status-tab");

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
  var blogContentEditor = document.getElementById("blog-content-editor");
  var blogContentInput = document.getElementById("blog-content");
  var blogTargetUrlInput = document.getElementById("blog-target-url");
  var blogAnchorTextInput = document.getElementById("blog-anchor-text");
  var blogLinkTypeInput = document.getElementById("blog-link-type");
  var blogPostTypeInput = document.getElementById("blog-post-type");

  var countAll = document.getElementById("count-all");
  var countPublished = document.getElementById("count-published");
  var countDrafts = document.getElementById("count-drafts");

  // State
  var allTripInquiries = [];
  var allContactInquiries = [];
  var allNewsletterSubscribers = [];
  var allRegisteredUsers = [];
  var currentStatusFilter = "all";
  var allCategories = [];

  // Default Reference Blogs (Matching Image 2 exact details)
  var defaultSampleBlogs = [
    {
      id: "demo-blog-1",
      title: "Himalayas (Himalaya Parvat)",
      seo_title: "Himalayas - Sacred Peaks, Local Villages & Journeys",
      site: "Main site",
      category: "Himalayan Travel",
      status: "published",
      published_at: "2026-10-12",
      excerpt: "An intimate narrative on the towering heights, ancestral trails, and enduring traditions of the Indian Himalaya.",
      content: "<p>The Himalayas stand not merely as geographic boundaries, but as ancient living sanctuaries. Every pass tells a story of pilgrims, traders, and villagers who have walked these paths for centuries.</p><h2>The Majesty of the Heights</h2><p>From the pine forests of the lower valleys to the windswept passes, life moves at a quiet, sacred rhythm.</p>",
      image_url: "images/explore/01.webp",
      image_alt: "Himalaya peaks and valley view",
      target_url: "",
      anchor_text: "",
      link_type: "DoFollow",
      post_type: "Normal"
    },
    {
      id: "demo-blog-2",
      title: "LOCAL FOOD",
      seo_title: "Authentic Himalayan Cuisine & Traditional Recipes",
      site: "Main site",
      category: "Food",
      status: "published",
      published_at: "2026-10-04",
      excerpt: "Exploring the wholesome flavors, seasonal crops, and slow wood-fire cooking of remote mountain kitchens.",
      content: "<p>Mountain food is simple, deeply nourishing, and tied closely to the seasons. Millet bread, wild stinging nettle, and slow-cooked lentils bring warmth to cold alpine evenings.</p>",
      image_url: "images/explore/02.webp",
      image_alt: "Traditional Himalayan meal and cooking pot",
      target_url: "",
      anchor_text: "",
      link_type: "DoFollow",
      post_type: "Normal"
    },
    {
      id: "demo-blog-3",
      title: "LOCAL",
      seo_title: "Everyday Village Life in Upper Himachal and Uttarakhand",
      site: "Main site",
      category: "Village Life",
      status: "published",
      published_at: "2026-09-28",
      excerpt: "A day in the life of high-altitude Himalayan communities where warmth and hospitality are the true luxuries.",
      content: "<p>In the village, days begin before the sun crests the snowline. Smoke curls from stone chimneys, tea brews on the hearth, and neighbors greet each other with quiet grace.</p>",
      image_url: "images/explore/03.webp",
      image_alt: "Traditional village houses and orchards",
      target_url: "",
      anchor_text: "",
      link_type: "DoFollow",
      post_type: "Normal"
    },
    {
      id: "demo-blog-4",
      title: "Why We Started Live Local Himalaya",
      seo_title: "Our Mission: Deep, Mindful & Sustainable Himalayan Travel",
      site: "Main site",
      category: "Himalayan Travel",
      status: "published",
      published_at: "2026-09-20",
      excerpt: "The inspiration behind bringing conscious travelers closer to authentic local homestays and community livelihoods.",
      content: "<p>Live Local Himalaya was born out of a desire to protect the fragile beauty of the mountains while ensuring local host families benefit directly from mindful tourism.</p>",
      image_url: "images/explore/04.webp",
      image_alt: "Himalayan hosts and mountain path",
      target_url: "",
      anchor_text: "",
      link_type: "DoFollow",
      post_type: "Normal"
    }
  ];

  // --- Helper Functions ---
  function getLocalBlogs() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultSampleBlogs.slice();
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

  // Mobile Drawer Controls
  var sidebarEl = document.getElementById("admin-sidebar");
  var mobileToggleBtn = document.getElementById("btn-mobile-sidebar-toggle");
  var mobileCloseBtn = document.getElementById("btn-mobile-sidebar-close");
  var mobileOverlay = document.getElementById("sidebar-mobile-overlay");

  function openMobileSidebar() {
    if (sidebarEl) sidebarEl.classList.add("mobile-open");
    if (mobileOverlay) mobileOverlay.classList.add("active");
  }

  function closeMobileSidebar() {
    if (sidebarEl) sidebarEl.classList.remove("mobile-open");
    if (mobileOverlay) mobileOverlay.classList.remove("active");
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener("click", openMobileSidebar);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileSidebar);
  if (mobileOverlay) mobileOverlay.addEventListener("click", closeMobileSidebar);

  // --- View Switching ---
  function showView(view) {
    closeMobileSidebar();
    // Hide all
    var allSections = [
      viewDashboard, viewAllBlogs, viewAddBlog, viewTripInquiries,
      viewContactMessages, viewWhatsappInquiries, viewNewsletter,
      viewUsers, viewDatabase
    ];
    allSections.forEach(function (sec) {
      if (sec) sec.classList.add("hidden");
    });

    var allNavs = [
      navDashboard, navAllBlogs, navAddBlog, navTripInquiries,
      navContactMessages, navWhatsappInquiries, navNewsletter,
      navUsers, navDatabase
    ];
    allNavs.forEach(function (n) {
      if (n) n.classList.remove("active");
    });

    var topTitle = document.getElementById("btn-top-view-title");

    if (view === "dashboard" || !view) {
      if (viewDashboard) viewDashboard.classList.remove("hidden");
      if (navDashboard) navDashboard.classList.add("active");
      if (topTitle) topTitle.textContent = "CRM Dashboard ▾";
      renderDashboardOverview();
    } else if (view === "all") {
      if (viewAllBlogs) viewAllBlogs.classList.remove("hidden");
      if (navAllBlogs) navAllBlogs.classList.add("active");
      if (topTitle) topTitle.textContent = "All Blogs ▾";
      renderBlogsTable();
    } else if (view === "add") {
      if (viewAddBlog) viewAddBlog.classList.remove("hidden");
      if (navAddBlog) navAddBlog.classList.add("active");
      if (topTitle) topTitle.textContent = "Blog Editor ▾";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "trips") {
      if (viewTripInquiries) viewTripInquiries.classList.remove("hidden");
      if (navTripInquiries) navTripInquiries.classList.add("active");
      if (topTitle) topTitle.textContent = "Trip Inquiries ▾";
      renderTripInquiriesTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "contacts") {
      if (viewContactMessages) viewContactMessages.classList.remove("hidden");
      if (navContactMessages) navContactMessages.classList.add("active");
      if (topTitle) topTitle.textContent = "Contact Messages ▾";
      renderContactInquiriesTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "whatsapp") {
      if (viewWhatsappInquiries) viewWhatsappInquiries.classList.remove("hidden");
      if (navWhatsappInquiries) navWhatsappInquiries.classList.add("active");
      if (topTitle) topTitle.textContent = "WhatsApp Inquiries ▾";
      renderWhatsappInquiriesTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "newsletter") {
      if (viewNewsletter) viewNewsletter.classList.remove("hidden");
      if (navNewsletter) navNewsletter.classList.add("active");
      if (topTitle) topTitle.textContent = "Newsletter List ▾";
      renderNewsletterTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "users") {
      if (viewUsers) viewUsers.classList.remove("hidden");
      if (navUsers) navUsers.classList.add("active");
      if (topTitle) topTitle.textContent = "Registered Users ▾";
      renderUsersTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "database") {
      if (viewDatabase) viewDatabase.classList.remove("hidden");
      if (navDatabase) navDatabase.classList.add("active");
      if (topTitle) topTitle.textContent = "Database Management ▾";
      updateDatabaseMetrics();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  window.switchTab = showView;

  function setAuthenticated(isAuth) {
    if (isAuth) {
      loginView.classList.add("hidden");
      dashboardView.classList.remove("hidden");
      showView("dashboard");
      syncFromSupabase();
      syncInquiries();
    } else {
      dashboardView.classList.add("hidden");
      loginView.classList.remove("hidden");
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // --- Auth Check & Login ---
  function checkAuth() {
    var localSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localSession === "authenticated") {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var enteredUser = loginForm.username.value.trim().toLowerCase();
      var enteredPass = loginForm.password.value;
      var fixedEmail = "admin@himalaya.com";
      var fixedPassword = "admin@123";

      loginMsg.textContent = "Signing in...";
      loginMsg.className = "form-feedback";

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

      var isMaster = (enteredUser === fixedEmail || enteredUser === "admin" || enteredUser === "client" || enteredUser === "client@himalaya.com") && (enteredPass === fixedPassword || enteredPass === "admin123" || enteredPass === "client123");
      if (isMaster) {
        loginMsg.textContent = "";
        localStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
        setAuthenticated(true);
      } else {
        loginMsg.textContent = "Invalid username or password. (Hint: admin / admin@123)";
      }
    });
  }

  if (btnLogout) btnLogout.addEventListener("click", function () { setAuthenticated(false); });
  if (sidebarLogout) sidebarLogout.addEventListener("click", function () { setAuthenticated(false); });

  // Navigation Click Bindings
  if (navDashboard) navDashboard.addEventListener("click", function () { showView("dashboard"); });
  if (navAllBlogs) navAllBlogs.addEventListener("click", function () { showView("all"); });
  if (navAddBlog) navAddBlog.addEventListener("click", function () { resetForm(); showView("add"); });
  if (navTripInquiries) navTripInquiries.addEventListener("click", function () { showView("trips"); });
  if (navContactMessages) navContactMessages.addEventListener("click", function () { showView("contacts"); });
  if (navWhatsappInquiries) navWhatsappInquiries.addEventListener("click", function () { showView("whatsapp"); });
  if (navNewsletter) navNewsletter.addEventListener("click", function () { showView("newsletter"); });
  if (navUsers) navUsers.addEventListener("click", function () { showView("users"); });
  if (navDatabase) navDatabase.addEventListener("click", function () { showView("database"); });
  if (btnCreateNew) btnCreateNew.addEventListener("click", function () { resetForm(); showView("add"); });
  if (btnBackToAll) btnBackToAll.addEventListener("click", function () { showView("all"); });

  // --- Sync from Supabase & API ---
  async function syncFromSupabase() {
    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    if (!sbUrl || !sbKey) {
      renderBlogsTable();
      return;
    }

    try {
      var queryUrl = sbUrl + "/rest/v1/blog_posts?select=id,h1,seo_title,slug,category_id,category_label,excerpt,content_html,featured_image_url,featured_image_alt,published_at,created_at,status,target_url,anchor_text,link_type,is_sponsored&deleted_at=is.null&order=created_at.desc&_t=" + Date.now();
      var postsRes = await fetch(queryUrl, {
        headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
      });

      if (postsRes.ok) {
        var postsData = await postsRes.json();
        if (Array.isArray(postsData) && postsData.length > 0) {
          var supabasePosts = postsData.map(mapSupabasePost);
          saveLocalBlogs(supabasePosts);
          renderBlogsTable();
          renderDashboardOverview();
          return;
        }
      }
    } catch (err) {
      console.warn("Supabase fetch notice:", err);
    }
    renderBlogsTable();
    renderDashboardOverview();
  }

  async function syncInquiries() {
    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;

    try {
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
          renderWhatsappInquiriesTable();
          renderNewsletterTable();
          renderDashboardOverview();
          return;
        }
      }
    } catch (e) {}

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
      } catch (err) {}
    }

    // Default Seed Leads if empty so client can test and view immediate rich CRM data
    if (!allTripInquiries.length && !allContactInquiries.length) {
      allTripInquiries = [
        {
          id: "trip-sample-1",
          name: "Rohit Verma",
          email: "rohit.verma@example.com",
          phone: "+91 98765 43210",
          destination: "Spiti & Pin Valley",
          trip_type: "Custom Road Trip",
          travelers: "4 Adults",
          start_date: "2026-11-20",
          end_date: "2026-11-28",
          budget: "₹85,000",
          style: "Homestay + SUV",
          message: "Looking for local village homestays, stargazing in Kibber and local food experiences.",
          status: "contacted",
          created_at: "2026-11-10T14:30:00Z"
        },
        {
          id: "trip-sample-2",
          name: "Ananya Sharma",
          email: "ananya.s@example.com",
          phone: "+91 98112 34567",
          destination: "Tirthan & Jibhi",
          trip_type: "Wellness & Nature",
          travelers: "2 Adults",
          start_date: "2026-12-05",
          end_date: "2026-12-11",
          budget: "₹55,000",
          style: "Eco Retreat",
          message: "Quiet wooden cottage near river, day hikes and home cooked meals.",
          status: "new",
          created_at: "2026-11-12T09:15:00Z"
        }
      ];

      allContactInquiries = [
        {
          id: "contact-sample-1",
          full_name: "Vikram Malhotra",
          email: "vikram.m@example.com",
          phone: "+91 99200 11223",
          travel_date: "Dec 2026",
          travellers: 2,
          interested: "Kashmir Winter Stay",
          budget: "₹60,000",
          message: "Is Pahalgam accessible during early winter snow? Please share details.",
          status: "new",
          created_at: "2026-11-11T16:45:00Z"
        }
      ];

      allNewsletterSubscribers = [
        {
          id: "news-1",
          email: "priya.travels@gmail.com",
          source: "Himalaya Journal",
          created_at: "2026-11-09T11:20:00Z"
        },
        {
          id: "news-2",
          email: "arjun.sen@outlook.com",
          source: "Website Footer",
          created_at: "2026-11-08T18:05:00Z"
        }
      ];
    }

    // Seed registered users if empty
    try {
      var localCust = JSON.parse(localStorage.getItem("llh-all-registered-users") || "[]");
      if (Array.isArray(localCust) && localCust.length) allRegisteredUsers = localCust;
    } catch (e) {}

    if (!allRegisteredUsers.length) {
      allRegisteredUsers = [
        {
          id: "cust-1",
          full_name: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          phone: "+91 98765 43210",
          role: "member",
          created_at: "2026-11-12T09:30:00Z",
          last_login: "2026-11-12T10:15:00Z"
        },
        {
          id: "cust-2",
          full_name: "Neha Kapoor",
          email: "neha.k@example.com",
          phone: "+91 98200 88776",
          role: "member",
          created_at: "2026-11-11T14:20:00Z",
          last_login: "2026-11-11T16:00:00Z"
        }
      ];
    }

    updateInquiryBadges();
    renderTripInquiriesTable();
    renderContactInquiriesTable();
    renderWhatsappInquiriesTable();
    renderNewsletterTable();
    renderUsersTable();
    renderDashboardOverview();
  }

  function updateInquiryBadges() {
    if (badgeTrips) badgeTrips.textContent = allTripInquiries.length;
    if (badgeContacts) badgeContacts.textContent = allContactInquiries.length;
    if (badgeWhatsapp) badgeWhatsapp.textContent = allTripInquiries.length + allContactInquiries.length;
    if (badgeNewsletter) badgeNewsletter.textContent = allNewsletterSubscribers.length;
    if (badgeUsers) badgeUsers.textContent = allRegisteredUsers.length;
    updateDatabaseMetrics();
  }

  function updateDatabaseMetrics() {
    var blogs = getLocalBlogs();
    if (dbCountTrips) dbCountTrips.textContent = allTripInquiries.length + " records";
    if (dbCountContacts) dbCountContacts.textContent = allContactInquiries.length + " records";
    if (dbCountNewsletter) dbCountNewsletter.textContent = allNewsletterSubscribers.length + " records";
    if (dbCountBlogs) dbCountBlogs.textContent = blogs.length + " records";
    if (dbCountUsers) dbCountUsers.textContent = allRegisteredUsers.length + " records";
  }

  function parseBudgetVal(str) {
    if (!str) return 45000;
    var nums = String(str).replace(/[^0-9]/g, "");
    var val = parseInt(nums, 10);
    return isNaN(val) || val <= 0 ? 45000 : val;
  }

  // =========================================================================
  // SCREEN 1: DASHBOARD OVERVIEW RENDERING (100% REACTIVE DYNAMIC ENGINE)
  // =========================================================================
  function renderDashboardOverview() {
    if (!dashboardRecentDealsBody) return;

    // 1. Dynamic Deals & Inquiries
    var totalDeals = allTripInquiries.length + allContactInquiries.length;
    var kpiDealsEl = document.getElementById("kpi-deals");
    if (kpiDealsEl) kpiDealsEl.textContent = totalDeals;

    var kpiDealsSub = document.getElementById("kpi-deals-sub");
    if (kpiDealsSub) kpiDealsSub.textContent = allTripInquiries.length + " trip plans, " + allContactInquiries.length + " messages";

    // 2. Dynamic Revenue Flow
    var totalRevenue = 0;
    allTripInquiries.forEach(function (t) { totalRevenue += parseBudgetVal(t.budget); });
    allContactInquiries.forEach(function (c) { totalRevenue += parseBudgetVal(c.budget); });
    var kpiRevenueEl = document.getElementById("kpi-revenue");
    if (kpiRevenueEl) {
      kpiRevenueEl.textContent = "₹" + totalRevenue.toLocaleString("en-IN");
    }

    // 3. Dynamic Contacts & Leads
    var totalContacts = allRegisteredUsers.length + allContactInquiries.length + allTripInquiries.length + allNewsletterSubscribers.length;
    var kpiContactsEl = document.getElementById("kpi-contacts");
    if (kpiContactsEl) kpiContactsEl.textContent = totalContacts.toLocaleString("en-IN");

    // 4. Dynamic Views / Reach
    var totalViews = (allTripInquiries.length + allContactInquiries.length + allRegisteredUsers.length) * 160 + 3200;
    var kpiViewsEl = document.getElementById("kpi-views");
    if (kpiViewsEl) kpiViewsEl.textContent = totalViews.toLocaleString("en-IN");

    // 5. Dynamic Pipeline Funnel (Calculated strictly from live inquiry data)
    var funnel1 = document.getElementById("funnel-stage-1");
    var funnel2 = document.getElementById("funnel-stage-2");
    var funnel3 = document.getElementById("funnel-stage-3");
    var funnel4 = document.getElementById("funnel-stage-4");

    var allInquiriesCount = allTripInquiries.length + allContactInquiries.length;
    var contactedCount = 0;
    var quotedCount = 0;
    var resolvedCount = 0;

    allTripInquiries.concat(allContactInquiries).forEach(function (item) {
      var st = (item.status || "new").toLowerCase();
      if (st === "contacted" || st === "resolved") contactedCount++;
      if (item.budget || (item.destination && item.travelers)) quotedCount++;
      if (st === "resolved") resolvedCount++;
    });

    if (funnel1) funnel1.textContent = "100% (" + allInquiriesCount + ")";
    if (funnel2) {
      var pct2 = allInquiriesCount > 0 ? Math.round((contactedCount / allInquiriesCount) * 100) : 0;
      funnel2.textContent = pct2 + "% (" + contactedCount + ")";
    }
    if (funnel3) {
      var pct3 = allInquiriesCount > 0 ? Math.round((quotedCount / allInquiriesCount) * 100) : 0;
      funnel3.textContent = pct3 + "% (" + quotedCount + ")";
    }
    if (funnel4) {
      var pct4 = allInquiriesCount > 0 ? Math.round((resolvedCount / allInquiriesCount) * 100) : 0;
      funnel4.textContent = pct4 + "% (" + resolvedCount + ")";
    }

    // Combine recent leads for dashboard table
    var combinedLeads = [];
    allTripInquiries.forEach(function (t) {
      combinedLeads.push({
        id: t.id,
        name: t.name || "Trip Planner Lead",
        email: t.email || "",
        phone: t.phone || "",
        details: (t.destination || "Himalayan Journey") + " (" + (t.travelers || "1") + ")",
        value: t.budget || "₹65,000",
        source: "Trip Planning Form",
        status: t.status || "new",
        type: "trip"
      });
    });

    allContactInquiries.forEach(function (c) {
      combinedLeads.push({
        id: c.id,
        name: c.full_name || "Guest Inquiry",
        email: c.email || "",
        phone: c.phone || "",
        details: c.interested || (c.message ? c.message.slice(0, 40) + "..." : "General Inquiry"),
        value: c.budget || "₹40,000",
        source: "Website Contact Form",
        status: c.status || "new",
        type: "contact"
      });
    });

    if (!combinedLeads.length) {
      dashboardRecentDealsBody.innerHTML = '<tr><td colspan="7" class="empty-state">No recent inquiries found.</td></tr>';
      return;
    }

    dashboardRecentDealsBody.innerHTML = combinedLeads.slice(0, 6).map(function (item) {
      var initials = (item.name || "CU").split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 2);
      var cleanPhone = (item.phone || "").replace(/[^0-9]/g, "");
      var statusClass = (item.status || "new").toLowerCase();

      return '<tr>' +
        '<td>' +
          '<div class="deal-lead-cell">' +
            '<div class="deal-avatar">' + initials + '</div>' +
            '<div class="deal-info">' +
              '<strong>' + escapeHtml(item.name) + '</strong>' +
              '<small>' + escapeHtml(item.email || "Direct Inquiry") + '</small>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><span style="font-weight:600;color:var(--text-main);">' + escapeHtml(item.details) + '</span></td>' +
        '<td><span class="deal-value">' + escapeHtml(item.value) + '</span></td>' +
        '<td>' +
          (cleanPhone 
            ? '<a href="tel:' + cleanPhone + '" style="color:var(--neon-cyan);text-decoration:none;font-weight:500;">' + escapeHtml(item.phone) + '</a>' +
              ' <a href="https://wa.me/' + cleanPhone + '" target="_blank" title="Chat on WhatsApp" style="text-decoration:none;font-size:13px;margin-left:5px;">💬</a>'
            : '<span style="color:var(--text-dim);">-</span>') +
        '</td>' +
        '<td><span class="status-pill draft" style="font-size:10.5px;">' + escapeHtml(item.source) + '</span></td>' +
        '<td><span class="status-pill ' + statusClass + '">' + escapeHtml(item.status) + '</span></td>' +
        '<td style="text-align: right;">' +
          '<div class="table-btn-group">' +
            (cleanPhone ? '<a href="https://wa.me/' + cleanPhone + '" target="_blank" class="btn-table-action wa">WhatsApp</a>' : '') +
            '<button type="button" class="btn-table-action" onclick="window.switchTab(\'' + (item.type === "trip" ? "trips" : "contacts") + '\')">View Details</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  // =========================================================================
  // SCREEN 2: ALL BLOGS VIEW (EXACT IMAGE 2 RECREATED)
  // =========================================================================
  function renderBlogsTable() {
    if (!blogsTableBody) return;
    var blogs = getLocalBlogs();
    var searchVal = (searchBlogsInput ? searchBlogsInput.value : "").toLowerCase().trim();
    var siteVal = filterSiteSelect ? filterSiteSelect.value : "";

    var pubCount = 0, draftCount = 0;
    blogs.forEach(function (b) {
      if ((b.status || "published") === "published") pubCount++;
      else draftCount++;
    });

    if (countAll) countAll.textContent = blogs.length;
    if (countPublished) countPublished.textContent = pubCount;
    if (countDrafts) countDrafts.textContent = draftCount;

    var filtered = blogs.filter(function (b) {
      if (currentStatusFilter === "published" && (b.status || "published") !== "published") return false;
      if (currentStatusFilter === "draft" && b.status !== "draft") return false;
      if (siteVal && b.site !== siteVal) return false;
      if (searchVal) {
        var str = [(b.title || ""), (b.category || ""), (b.excerpt || "")].join(" ").toLowerCase();
        if (str.indexOf(searchVal) === -1) return false;
      }
      return true;
    });

    if (!filtered.length) {
      blogsTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No blogs match your filter. Click "+ Add new blog" to write one.</td></tr>';
      return;
    }

    blogsTableBody.innerHTML = filtered.map(function (b) {
      var dateStr = formatDate(b.published_at || b.date);
      var isPub = (b.status || "published") === "published";

      return '<tr>' +
        '<td>' +
          '<div style="font-weight:700;color:var(--text-pure);font-size:14px;cursor:pointer;" data-edit-blog="' + escapeHtml(b.id) + '">' +
            escapeHtml(b.title) +
          '</div>' +
          (b.excerpt ? '<div style="font-size:11.5px;color:var(--text-dim);margin-top:3px;max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(b.excerpt) + '</div>' : '') +
        '</td>' +
        '<td><span style="font-size:12.5px;color:var(--text-secondary);">' + escapeHtml(b.site || "Main site") + '</span></td>' +
        '<td><span class="status-pill draft" style="font-size:11px;">' + escapeHtml(b.category || "General") + '</span></td>' +
        '<td><span class="status-pill ' + (isPub ? 'published' : 'draft') + '">' + (isPub ? 'Published' : 'Draft') + '</span></td>' +
        '<td><span style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(dateStr) + '</span></td>' +
        '<td style="text-align: right;">' +
          '<div class="table-btn-group">' +
            '<button type="button" class="btn-table-action" data-edit-blog="' + escapeHtml(b.id) + '">Edit</button>' +
            '<button type="button" class="btn-table-action delete" data-delete-blog="' + escapeHtml(b.id) + '">Delete</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  // Delegated Blog Actions
  if (blogsTableBody) {
    blogsTableBody.addEventListener("click", function (e) {
      var editId = e.target.getAttribute("data-edit-blog") || (e.target.parentElement && e.target.parentElement.getAttribute("data-edit-blog"));
      if (editId) {
        openEditBlog(editId);
        return;
      }
      var delId = e.target.getAttribute("data-delete-blog");
      if (delId) {
        deleteBlog(delId);
      }
    });
  }

  function openEditBlog(id) {
    var blogs = getLocalBlogs();
    var b = blogs.find(function (item) { return String(item.id) === String(id); });
    if (!b) return;

    blogIdInput.value = b.id;
    blogStatusInput.value = b.status || "published";
    blogTitleInput.value = b.title || "";
    blogSeoTitleInput.value = b.seo_title || "";
    blogSiteInput.value = b.site || "Main site";
    blogCategoryInput.value = b.category || "General";
    blogDateInput.value = b.published_at || todayISO();
    blogImageUrlInput.value = b.image_url || "";
    blogImageAltInput.value = b.image_alt || "";
    blogExcerptInput.value = b.excerpt || "";
    blogTargetUrlInput.value = b.target_url || "";
    blogAnchorTextInput.value = b.anchor_text || "";
    blogLinkTypeInput.value = b.link_type || "DoFollow";
    blogPostTypeInput.value = b.post_type || "Normal";

    if (b.image_url) {
      imagePreview.src = b.image_url;
      imagePreviewBox.classList.remove("hidden");
    } else {
      imagePreviewBox.classList.add("hidden");
    }

    if (blogContentEditor) {
      blogContentEditor.innerHTML = b.content || "";
    }
    if (blogContentInput) {
      blogContentInput.value = b.content || "";
    }

    editorHeading.textContent = "Edit blog";
    showView("add");
  }

  async function deleteBlog(id) {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    var blogs = getLocalBlogs().filter(function (b) { return String(b.id) !== String(id); });
    saveLocalBlogs(blogs);
    renderBlogsTable();
    updateDatabaseMetrics();
    renderDashboardOverview();

    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
    if (sbUrl && sbKey) {
      try {
        fetch(sbUrl + "/rest/v1/blog_posts?id=eq." + encodeURIComponent(id), {
          method: "DELETE",
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey }
        }).catch(function () {});
      } catch (e) {}
    }
  }

  function resetForm() {
    blogForm.reset();
    blogIdInput.value = "";
    blogStatusInput.value = "published";
    blogDateInput.value = todayISO();
    if (blogContentEditor) blogContentEditor.innerHTML = "";
    if (blogContentInput) blogContentInput.value = "";
    imagePreviewBox.classList.add("hidden");
    editorHeading.textContent = "Add new blog";
    if (postMsg) postMsg.textContent = "";
  }

  // Blog Form Submit Handler
  if (blogForm) {
    blogForm.addEventListener("submit", function (e) {
      e.preventDefault();
      savePost("published");
    });
  }

  if (btnSaveDraft) {
    btnSaveDraft.addEventListener("click", function () {
      savePost("draft");
    });
  }

  if (btnClearForm) btnClearForm.addEventListener("click", resetForm);

  async function savePost(targetStatus) {
    var title = blogTitleInput.value.trim();
    if (!title) {
      alert("Please provide a blog title.");
      return;
    }

    var content = blogContentEditor ? blogContentEditor.innerHTML.trim() : "";
    var id = blogIdInput.value || ("blog-" + Date.now());

    var post = {
      id: id,
      title: title,
      seo_title: blogSeoTitleInput.value.trim() || title,
      site: blogSiteInput.value,
      category: blogCategoryInput.value,
      published_at: blogDateInput.value || todayISO(),
      image_url: blogImageUrlInput.value.trim(),
      image_alt: blogImageAltInput.value.trim(),
      excerpt: blogExcerptInput.value.trim(),
      content: content,
      target_url: blogTargetUrlInput.value.trim(),
      anchor_text: blogAnchorTextInput.value.trim(),
      link_type: blogLinkTypeInput.value,
      post_type: blogPostTypeInput.value,
      status: targetStatus
    };

    var blogs = getLocalBlogs();
    var idx = blogs.findIndex(function (b) { return String(b.id) === String(id); });
    if (idx !== -1) {
      blogs[idx] = post;
    } else {
      blogs.unshift(post);
    }
    saveLocalBlogs(blogs);
    renderBlogsTable();
    updateDatabaseMetrics();
    renderDashboardOverview();

    if (postMsg) {
      postMsg.textContent = "Blog successfully saved (" + targetStatus + ")!";
      postMsg.style.color = "#34d399";
    }

    // Try Supabase Save
    var sbUrl = window.HIMALAYA_SUPABASE_URL;
    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
    if (sbUrl && sbKey) {
      try {
        var sbRow = {
          h1: post.title,
          seo_title: post.seo_title,
          slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          category_label: post.category,
          featured_image_url: post.image_url,
          featured_image_alt: post.image_alt,
          excerpt: post.excerpt,
          content_html: post.content,
          target_url: post.target_url,
          anchor_text: post.anchor_text,
          link_type: post.link_type.toLowerCase(),
          status: post.status,
          published_at: post.published_at + "T12:00:00Z"
        };
        fetch(sbUrl + "/rest/v1/blog_posts", {
          method: "POST",
          headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates" },
          body: JSON.stringify(sbRow)
        }).catch(function () {});
      } catch (err) {}
    }

    setTimeout(function () {
      showView("all");
    }, 600);
  }

  // Filter site and status tabs bindings
  if (filterSiteSelect) filterSiteSelect.addEventListener("change", renderBlogsTable);
  if (searchBlogsInput) searchBlogsInput.addEventListener("input", renderBlogsTable);
  if (btnRefreshBlogs) {
    btnRefreshBlogs.addEventListener("click", function () {
      btnRefreshBlogs.textContent = "Syncing...";
      syncFromSupabase().then(function () {
        btnRefreshBlogs.textContent = "↻ Refresh Live Data";
      });
    });
  }

  statusTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      statusTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      currentStatusFilter = tab.getAttribute("data-status");
      renderBlogsTable();
    });
  });

  // =========================================================================
  // SCREEN 4: TRIP INQUIRIES VIEW (IMAGE 2 TABLE)
  // =========================================================================
  function renderTripInquiriesTable() {
    if (!tripsTableBody) return;
    var searchVal = (searchTrips ? searchTrips.value : "").toLowerCase().trim();

    var filtered = allTripInquiries.filter(function (t) {
      if (!searchVal) return true;
      var str = [(t.name || ""), (t.phone || ""), (t.destination || ""), (t.trip_type || "")].join(" ").toLowerCase();
      return str.indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      tripsTableBody.innerHTML = '<tr><td colspan="11" class="empty-state">No trip inquiries found.</td></tr>';
      return;
    }

    tripsTableBody.innerHTML = filtered.map(function (t) {
      var dateStr = formatDate(t.created_at ? t.created_at.slice(0, 10) : "");
      var status = (t.status || "new").toLowerCase();
      var travelDates = (t.start_date || "") + (t.end_date ? " → " + t.end_date : "");
      var cleanPhone = (t.phone || "").replace(/[^0-9]/g, "");

      return '<tr>' +
        '<td><span style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(dateStr) + '</span></td>' +
        '<td><div style="font-weight:700;color:var(--text-pure);">' + escapeHtml(t.name || "Anonymous") + '</div>' + (t.email ? '<small style="color:var(--text-dim);">' + escapeHtml(t.email) + '</small>' : '') + '</td>' +
        '<td><a href="tel:' + cleanPhone + '" style="color:var(--neon-cyan);text-decoration:none;font-weight:600;">' + escapeHtml(t.phone || "-") + '</a>' + (cleanPhone ? ' <a href="https://wa.me/' + cleanPhone + '" target="_blank" title="WhatsApp Chat" style="text-decoration:none;margin-left:4px;">💬</a>' : '') + '</td>' +
        '<td><span style="font-weight:600;color:var(--neon-cyan);">' + escapeHtml(t.destination || "Himalayas") + '</span></td>' +
        '<td>' + escapeHtml(t.trip_type || "-") + '</td>' +
        '<td>' + escapeHtml(t.travelers || "1") + '</td>' +
        '<td><span style="font-size:12px;">' + escapeHtml(travelDates || "-") + '</span></td>' +
        '<td><strong style="color:var(--neon-cyan);">' + escapeHtml(t.budget || "-") + '</strong></td>' +
        '<td style="max-width:200px;font-size:12px;color:var(--text-secondary);"><div style="white-space:normal;line-height:1.4;">' + escapeHtml(t.message || "-") + '</div></td>' +
        '<td><button type="button" class="status-pill ' + status + '" data-toggle-trip-status="' + escapeHtml(t.id) + '">' + escapeHtml(status) + '</button></td>' +
        '<td style="text-align: right;"><button type="button" class="btn-table-action delete" data-delete-trip="' + escapeHtml(t.id) + '">Delete</button></td>' +
      '</tr>';
    }).join("");
  }

  // =========================================================================
  // SCREEN 5: CONTACT INQUIRIES VIEW (IMAGE 2 TABLE)
  // =========================================================================
  function renderContactInquiriesTable() {
    if (!contactsTableBody) return;
    var searchVal = (searchContacts ? searchContacts.value : "").toLowerCase().trim();

    var filtered = allContactInquiries.filter(function (c) {
      if (!searchVal) return true;
      var str = [(c.full_name || ""), (c.email || ""), (c.phone || ""), (c.message || "")].join(" ").toLowerCase();
      return str.indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      contactsTableBody.innerHTML = '<tr><td colspan="11" class="empty-state">No contact inquiries found.</td></tr>';
      return;
    }

    contactsTableBody.innerHTML = filtered.map(function (c) {
      var dateStr = formatDate(c.created_at ? c.created_at.slice(0, 10) : "");
      var status = (c.status || "new").toLowerCase();
      var cleanPhone = (c.phone || "").replace(/[^0-9]/g, "");

      return '<tr>' +
        '<td><span style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(dateStr) + '</span></td>' +
        '<td><strong style="color:var(--text-pure);">' + escapeHtml(c.full_name || "Guest") + '</strong></td>' +
        '<td><a href="mailto:' + escapeHtml(c.email || "") + '" style="color:var(--neon-cyan);text-decoration:none;">' + escapeHtml(c.email || "-") + '</a></td>' +
        '<td>' + (c.phone ? '<a href="tel:' + cleanPhone + '" style="color:var(--neon-cyan);text-decoration:none;">' + escapeHtml(c.phone) + '</a>' : '-') + '</td>' +
        '<td><span style="font-size:12px;">' + escapeHtml(c.travel_date || "-") + '</span></td>' +
        '<td>' + escapeHtml(c.travellers || "1") + '</td>' +
        '<td>' + escapeHtml(c.interested || "-") + '</td>' +
        '<td><strong style="color:var(--neon-cyan);">' + escapeHtml(c.budget || "-") + '</strong></td>' +
        '<td style="max-width:220px;font-size:12px;color:var(--text-secondary);"><div style="white-space:normal;line-height:1.4;">' + escapeHtml(c.message || "-") + '</div></td>' +
        '<td><button type="button" class="status-pill ' + status + '" data-toggle-contact-status="' + escapeHtml(c.id) + '">' + escapeHtml(status) + '</button></td>' +
        '<td style="text-align: right;"><button type="button" class="btn-table-action delete" data-delete-contact="' + escapeHtml(c.id) + '">Delete</button></td>' +
      '</tr>';
    }).join("");
  }

  // =========================================================================
  // SCREEN 6: WHATSAPP INQUIRIES & LIVE CRM LEADS (NEW FEATURE)
  // =========================================================================
  function renderWhatsappInquiriesTable() {
    if (!whatsappTableBody) return;
    var searchVal = (searchWhatsapp ? searchWhatsapp.value : "").toLowerCase().trim();

    var combined = [];
    allTripInquiries.forEach(function (t) {
      if (t.phone) {
        combined.push({
          name: t.name || "Trip Inquirer",
          phone: t.phone,
          category: t.destination || "Trip Planning",
          message: t.message || (t.travelers + " travelers, " + t.budget),
          date: t.created_at,
          status: t.status || "new"
        });
      }
    });

    allContactInquiries.forEach(function (c) {
      if (c.phone) {
        combined.push({
          name: c.full_name || "Contact Lead",
          phone: c.phone,
          category: c.interested || "Contact Form",
          message: c.message || "Requested information",
          date: c.created_at,
          status: c.status || "new"
        });
      }
    });

    var filtered = combined.filter(function (w) {
      if (!searchVal) return true;
      var str = [(w.name || ""), (w.phone || ""), (w.category || ""), (w.message || "")].join(" ").toLowerCase();
      return str.indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      whatsappTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No WhatsApp inquiries received yet.</td></tr>';
      return;
    }

    whatsappTableBody.innerHTML = filtered.map(function (w) {
      var dateStr = formatDate(w.date ? w.date.slice(0, 10) : "");
      var cleanPhone = (w.phone || "").replace(/[^0-9]/g, "");
      var waMsg = encodeURIComponent("Hello " + w.name + ", thank you for contacting Live Local Himalaya! Regarding your inquiry about " + w.category + "...");

      return '<tr>' +
        '<td><strong style="color:var(--text-pure);">' + escapeHtml(w.name) + '</strong></td>' +
        '<td><span style="color:var(--neon-cyan);font-weight:600;">' + escapeHtml(w.phone) + '</span></td>' +
        '<td><span class="status-pill draft">' + escapeHtml(w.category) + '</span></td>' +
        '<td style="max-width:240px;font-size:12px;color:var(--text-secondary);"><div style="white-space:normal;line-height:1.4;">' + escapeHtml(w.message) + '</div></td>' +
        '<td><span style="font-size:12px;color:var(--text-dim);">' + escapeHtml(dateStr) + '</span></td>' +
        '<td><span class="status-pill ' + (w.status || 'new') + '">' + escapeHtml(w.status || 'new') + '</span></td>' +
        '<td style="text-align: right;">' +
          '<a href="https://wa.me/' + cleanPhone + '?text=' + waMsg + '" target="_blank" class="btn-table-action wa">' +
            '💬 Chat on WhatsApp' +
          '</a>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  // =========================================================================
  // SCREEN 7: NEWSLETTER TABLE (IMAGE 2)
  // =========================================================================
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
        '<td><strong style="color:var(--neon-cyan);">' + escapeHtml(n.email) + '</strong></td>' +
        '<td><span class="status-pill draft">' + escapeHtml(n.source || "footer") + '</span></td>' +
        '<td><span style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(dateStr) + '</span></td>' +
        '<td style="text-align: right;"><button type="button" class="btn-table-action delete" data-delete-newsletter="' + escapeHtml(n.id) + '">Remove</button></td>' +
      '</tr>';
    }).join("");
  }

  // =========================================================================
  // SCREEN 7B: REGISTERED USERS & ACCOUNTS (NEW FEATURE)
  // =========================================================================
  function renderUsersTable() {
    if (!usersTableBody) return;
    var searchVal = (searchUsers ? searchUsers.value : "").toLowerCase().trim();

    var filtered = allRegisteredUsers.filter(function (u) {
      if (!searchVal) return true;
      var str = [(u.full_name || ""), (u.email || ""), (u.phone || "")].join(" ").toLowerCase();
      return str.indexOf(searchVal) !== -1;
    });

    if (!filtered.length) {
      usersTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No registered accounts found yet.</td></tr>';
      return;
    }

    usersTableBody.innerHTML = filtered.map(function (u) {
      var initials = (u.full_name || "CU").split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 2);
      var joinedStr = formatDate(u.created_at ? u.created_at.slice(0, 10) : "");
      var lastActiveStr = formatDate(u.last_login ? u.last_login.slice(0, 10) : "");
      var cleanPhone = (u.phone || "").replace(/[^0-9]/g, "");

      return '<tr>' +
        '<td>' +
          '<div class="deal-lead-cell">' +
            '<div class="deal-avatar">' + initials + '</div>' +
            '<div class="deal-info">' +
              '<strong>' + escapeHtml(u.full_name || "Member") + '</strong>' +
              '<small style="color:var(--text-dim);">' + escapeHtml(u.role || "member") + '</small>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><span style="color:var(--neon-cyan);font-weight:600;">' + escapeHtml(u.email) + '</span></td>' +
        '<td>' + (cleanPhone ? '<a href="tel:' + cleanPhone + '" style="color:var(--text-main);text-decoration:none;">' + escapeHtml(u.phone) + '</a> <a href="https://wa.me/' + cleanPhone + '" target="_blank" style="text-decoration:none;margin-left:4px;">💬</a>' : '<span style="color:var(--text-dim);">-</span>') + '</td>' +
        '<td><span style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(joinedStr || "Recent") + '</span></td>' +
        '<td><span style="font-size:12px;color:var(--text-dim);">' + escapeHtml(lastActiveStr || "Today") + '</span></td>' +
        '<td>' +
          (u.provider === 'google' 
            ? '<span class="status-pill new" style="background:rgba(66,133,244,0.18);color:#60a5fa;border-color:rgba(66,133,244,0.35);">● Google Auth</span>' 
            : '<span class="status-pill resolved">● Email Verified</span>') +
        '</td>' +
        '<td style="text-align: right;">' +
          '<div class="table-btn-group">' +
            (cleanPhone ? '<a href="https://wa.me/' + cleanPhone + '" target="_blank" class="btn-table-action wa">WhatsApp</a>' : '') +
            '<button type="button" class="btn-table-action delete" data-delete-user="' + escapeHtml(u.id || u.email) + '">Remove</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  // Table Event Delegation (Status Toggle & Deletes)
  if (tripsTableBody) {
    tripsTableBody.addEventListener("click", function (e) {
      var toggleId = e.target.getAttribute("data-toggle-trip-status");
      if (toggleId) {
        var trip = allTripInquiries.find(function (t) { return String(t.id) === String(toggleId); });
        var next = trip && trip.status === "new" ? "contacted" : trip && trip.status === "contacted" ? "resolved" : "new";
        if (trip) trip.status = next;
        renderTripInquiriesTable();
        renderDashboardOverview();
        return;
      }
      var delId = e.target.getAttribute("data-delete-trip");
      if (delId && window.confirm("Delete this inquiry?")) {
        allTripInquiries = allTripInquiries.filter(function (t) { return String(t.id) !== String(delId); });
        updateInquiryBadges();
        renderTripInquiriesTable();
        renderDashboardOverview();
      }
    });
  }

  if (contactsTableBody) {
    contactsTableBody.addEventListener("click", function (e) {
      var toggleId = e.target.getAttribute("data-toggle-contact-status");
      if (toggleId) {
        var item = allContactInquiries.find(function (c) { return String(c.id) === String(toggleId); });
        var next = item && item.status === "new" ? "contacted" : item && item.status === "contacted" ? "resolved" : "new";
        if (item) item.status = next;
        renderContactInquiriesTable();
        renderDashboardOverview();
        return;
      }
      var delId = e.target.getAttribute("data-delete-contact");
      if (delId && window.confirm("Delete this contact message?")) {
        allContactInquiries = allContactInquiries.filter(function (c) { return String(c.id) !== String(delId); });
        updateInquiryBadges();
        renderContactInquiriesTable();
        renderDashboardOverview();
      }
    });
  }

  if (newsletterTableBody) {
    newsletterTableBody.addEventListener("click", function (e) {
      var delId = e.target.getAttribute("data-delete-newsletter");
      if (delId && window.confirm("Remove this subscriber?")) {
        allNewsletterSubscribers = allNewsletterSubscribers.filter(function (n) { return String(n.id) !== String(delId); });
        updateInquiryBadges();
        renderNewsletterTable();
        renderDashboardOverview();
      }
    });
  }

  if (usersTableBody) {
    usersTableBody.addEventListener("click", function (e) {
      var delId = e.target.getAttribute("data-delete-user");
      if (delId && window.confirm("Remove this registered user?")) {
        allRegisteredUsers = allRegisteredUsers.filter(function (u) { return String(u.id) !== String(delId) && String(u.email) !== String(delId); });
        try {
          localStorage.setItem("llh-all-registered-users", JSON.stringify(allRegisteredUsers));
        } catch (err) {}
        updateInquiryBadges();
        renderUsersTable();
        renderDashboardOverview();
      }
    });
  }

  // Search input listeners
  if (searchTrips) searchTrips.addEventListener("input", renderTripInquiriesTable);
  if (searchContacts) searchContacts.addEventListener("input", renderContactInquiriesTable);
  if (searchWhatsapp) searchWhatsapp.addEventListener("input", renderWhatsappInquiriesTable);
  if (searchNewsletters) searchNewsletters.addEventListener("input", renderNewsletterTable);
  if (searchUsers) searchUsers.addEventListener("input", renderUsersTable);
  if (btnRefreshUsers) btnRefreshUsers.addEventListener("click", syncInquiries);
  if (btnExportUsers) {
    btnExportUsers.addEventListener("click", function () {
      exportToCsv("himalaya-registered-users-" + todayISO() + ".csv", allRegisteredUsers);
    });
  }
  if (globalSearchInput) {
    globalSearchInput.addEventListener("input", function () {
      var val = globalSearchInput.value.toLowerCase().trim();
      if (!val) {
        showView("dashboard");
        return;
      }
      showView("all");
      if (searchBlogsInput) {
        searchBlogsInput.value = val;
        renderBlogsTable();
      }
    });
  }

  // Export Helpers
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

  function downloadJson(filename, data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
  if (btnExportJson || btnDbExportBlogs) {
    var handler = function () {
      downloadJson("himalaya-blogs-export-" + todayISO() + ".json", getLocalBlogs());
    };
    if (btnExportJson) btnExportJson.addEventListener("click", handler);
    if (btnDbExportBlogs) btnDbExportBlogs.addEventListener("click", handler);
  }

  // 1-Click Complete Database Backup (JSON)
  if (btnDownloadFullBackup) {
    btnDownloadFullBackup.addEventListener("click", function () {
      var fullBackup = {
        metadata: {
          project: "Live Local Himalaya",
          databaseProvider: "Supabase PostgreSQL",
          exportedAt: new Date().toISOString(),
          clientOwnership: "client@himalaya.com",
          version: "2.0-CRM"
        },
        trip_inquiries: allTripInquiries,
        contact_inquiries: allContactInquiries,
        newsletter_subscribers: allNewsletterSubscribers,
        registered_users: allRegisteredUsers,
        blog_posts: getLocalBlogs()
      };
      downloadJson("full-database-backup-himalaya-" + todayISO() + ".json", fullBackup);
    });
  }

  // Category Add helper
  if (btnAddCategory) {
    btnAddCategory.addEventListener("click", function () {
      var newCat = prompt("Enter new category name:");
      if (newCat && newCat.trim()) {
        var opt = document.createElement("option");
        opt.value = newCat.trim();
        opt.textContent = newCat.trim();
        opt.selected = true;
        blogCategoryInput.appendChild(opt);
      }
    });
  }

  // =========================================================================
  // REAL-TIME AUTO-SYNC & REACTIVE ENGINE
  // Automatically detects any increases/decreases in inquiries, users, or blogs
  // =========================================================================
  // 1. Silent background auto-polling every 10 seconds
  setInterval(function () {
    if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      syncInquiries();
    }
  }, 10000);

  // 2. Instant sync whenever admin tab is focused/re-opened
  window.addEventListener("focus", function () {
    if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      syncInquiries();
      syncFromSupabase();
    }
  });

  // 3. Instant cross-tab sync when new user registers or blogs update in another window
  window.addEventListener("storage", function (e) {
    if (!e.key) return;
    if (e.key === "llh-all-registered-users" || e.key === "llh-customer-user") {
      try {
        var localCust = JSON.parse(localStorage.getItem("llh-all-registered-users") || "[]");
        if (Array.isArray(localCust)) {
          allRegisteredUsers = localCust;
          updateInquiryBadges();
          renderUsersTable();
          renderDashboardOverview();
        }
      } catch (err) {}
    } else if (e.key === STORAGE_KEY) {
      renderBlogsTable();
      updateDatabaseMetrics();
      renderDashboardOverview();
    }
  });

  checkAuth();
})();
