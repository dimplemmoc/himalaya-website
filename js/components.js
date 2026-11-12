(function () {
    "use strict";

    var scriptUrl = document.currentScript ? document.currentScript.src : "";
    if (!scriptUrl) {
        var scripts = document.getElementsByTagName("script");
        for (var scriptIndex = scripts.length - 1; scriptIndex >= 0; scriptIndex -= 1) {
            if (/js\/components\.js(?:[?#]|$)/.test(scripts[scriptIndex].src)) {
                scriptUrl = scripts[scriptIndex].src;
                break;
            }
        }
    }
    if (!scriptUrl) scriptUrl = window.location.href.replace(/[^/]*$/, "js/components.js");
    var rootUrl = scriptUrl.replace(/js\/components\.js(?:\?.*)?$/, "");
    var navbarUrl = rootUrl + "components/navbar.html?v=" + Date.now();
    var footerUrl = rootUrl + "components/footer.html?v=" + Date.now();

    function closest(target, selector) {
        if (target && target.nodeType !== 1) target = target.parentElement;
        while (target && target.nodeType === 1) {
            var matches = target.matches || target.msMatchesSelector || target.webkitMatchesSelector;
            if (matches && matches.call(target, selector)) return target;
            target = target.parentElement;
        }
        return null;
    }

    function loadFragment(url, containerId) {
        var container = document.getElementById(containerId);
        if (!container || !window.fetch) return Promise.resolve();

        return fetch(url)
            .then(function (response) {
                if (!response.ok) throw new Error("Unable to load " + url);
                return response.text();
            })
            .then(function (markup) {
                container.innerHTML = markup;
            })
            .catch(function (error) {
                container.setAttribute("data-load-error", "true");
                if (window.console && console.warn) console.warn(error.message);
            });
    }

    function setupNavigation() {
        var container = document.getElementById("navbar-container");
        if (!container) return;

        container.addEventListener("click", function (event) {
            var menuButton = closest(event.target, ".menu-btn");
            var link = closest(event.target, ".navbar a");
            var navbar = container.querySelector(".navbar");
            var button = container.querySelector(".menu-btn");

            if (menuButton && navbar) {
                var isOpen = navbar.classList.toggle("active");
                menuButton.setAttribute("aria-expanded", String(isOpen));
                return;
            }

            if (link && navbar && button) {
                navbar.classList.remove("active");
                button.setAttribute("aria-expanded", "false");
            }
        });

        container.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                var navbar = container.querySelector(".navbar");
                var button = container.querySelector(".menu-btn");
                if (navbar) navbar.classList.remove("active");
                if (button) {
                    button.setAttribute("aria-expanded", "false");
                    button.focus();
                }
            }
        });

        var rawPath = (window.location.pathname || "").toLowerCase();
        var currentPage = rawPath.split("/").pop().split("?")[0].split("#")[0] || "index.html";
        if (!currentPage || currentPage === "" || currentPage === "/" || currentPage === "index") {
            currentPage = "index.html";
        }
        if (currentPage.indexOf(".") === -1) {
            currentPage = currentPage + ".html";
        }
        if (currentPage === "blog-details.html") {
            currentPage = "blog.html";
        }
        if (currentPage === "details.html") {
            currentPage = "experience.html";
        }

        var pageAliases = {
            "experience.html": "explore",
            "experience": "explore",
            "explore.html": "explore",
            "explore": "explore",
            "stays.html": "stays",
            "stays": "stays",
            "journeys.html": "journeys",
            "journeys": "journeys",
            "our-story.html": "our-story",
            "our-story": "our-story",
            "about.html": "our-story",
            "about": "our-story",
            "journal.html": "journal",
            "journal": "journal",
            "blog.html": "journal",
            "blog": "journal",
            "contact.html": "contact",
            "contact": "contact",
            "index.html": "home",
            "index": "home"
        };

        var currentNormalized = pageAliases[currentPage] || pageAliases[rawPath.split("/").pop()] || currentPage;

        var links = container.querySelectorAll(".navbar a");
        Array.prototype.forEach.call(links, function (link) {
            var target = (link.getAttribute("href") || "").toLowerCase().split("#")[0].split("?")[0].replace(/^\//, "");
            var targetNormalized = pageAliases[target] || target;
            var isMatch = (targetNormalized === currentNormalized) || (target === currentPage);
            if (isMatch) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            } else {
                link.classList.remove("active");
                link.removeAttribute("aria-current");
            }
        });

        var tripBtn = container.querySelector(".trip-btn");
        if (tripBtn) {
            if (currentPage === "plan-trip.html") {
                tripBtn.classList.add("active");
            } else {
                tripBtn.classList.remove("active");
            }
        }

        setupCustomerAuth();
    }

    // Customer Authentication Management (Login, Sign Up, State Sync)
    function setupCustomerAuth() {
        var authBtn = document.getElementById("btn-user-auth");
        var authModal = document.getElementById("auth-modal");
        var modalClose = document.getElementById("auth-modal-close");
        var navAuthText = document.getElementById("nav-auth-text");

        var tabLogin = document.getElementById("tab-login");
        var tabSignup = document.getElementById("tab-signup");
        var formLogin = document.getElementById("form-customer-login");
        var formSignup = document.getElementById("form-customer-signup");
        var loggedPanel = document.getElementById("auth-logged-in-panel");
        var btnLogout = document.getElementById("btn-customer-logout");

        var modalTitle = document.getElementById("auth-modal-title");
        var modalSubtitle = document.getElementById("auth-modal-subtitle");
        var modalUserName = document.getElementById("modal-user-name");
        var modalUserEmail = document.getElementById("modal-user-email");
        var modalUserAvatar = document.getElementById("modal-user-avatar");

        var loginMsg = document.getElementById("cust-login-msg");
        var signupMsg = document.getElementById("cust-signup-msg");

        var STORAGE_USER_KEY = "llh-customer-user";
        var ALL_USERS_KEY = "llh-all-registered-users";

        function getCustomerSession() {
            try {
                var raw = localStorage.getItem(STORAGE_USER_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        }

        function saveCustomerSession(user) {
            try {
                localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
                // Also store in shared registered users array for offline/instant admin access
                var allUsers = [];
                try {
                    allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || "[]");
                } catch (e) {}
                var idx = allUsers.findIndex(function (u) { return u.email === user.email; });
                if (idx !== -1) {
                    allUsers[idx].last_login = new Date().toISOString();
                } else {
                    allUsers.unshift({
                        id: user.id || ("user-" + Date.now()),
                        full_name: user.full_name || user.name || "Member",
                        email: user.email,
                        phone: user.phone || "",
                        role: "member",
                        last_login: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });
                }
                localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
            } catch (e) {}
        }

        function updateNavState() {
            var user = getCustomerSession();
            if (!navAuthText) return;

            if (user && user.email) {
                var displayName = (user.full_name || user.name || user.email.split("@")[0]);
                navAuthText.textContent = "HI, " + displayName.toUpperCase();
                if (authBtn) {
                    authBtn.style.background = "rgba(20, 83, 65, 0.15)";
                    authBtn.style.borderColor = "#145341";
                }
            } else {
                navAuthText.textContent = "LOGIN / SIGN UP";
                if (authBtn) {
                    authBtn.style.background = "";
                    authBtn.style.borderColor = "";
                }
            }
        }

        function openModal() {
            if (!authModal) return;
            var user = getCustomerSession();
            authModal.style.display = "grid";
            authModal.setAttribute("aria-hidden", "false");

            if (user && user.email) {
                // Show Logged-in profile view
                if (formLogin) formLogin.style.display = "none";
                if (formSignup) formSignup.style.display = "none";
                if (document.querySelector(".auth-tabs-nav")) document.querySelector(".auth-tabs-nav").style.display = "none";
                if (loggedPanel) loggedPanel.style.display = "block";

                var displayName = user.full_name || user.name || "Member";
                if (modalTitle) modalTitle.textContent = "My Member Account";
                if (modalSubtitle) modalSubtitle.textContent = "Welcome to your Himalayan journeys profile.";
                if (modalUserName) modalUserName.textContent = displayName;
                if (modalUserEmail) modalUserEmail.textContent = user.email;
                if (modalUserAvatar) modalUserAvatar.textContent = displayName.slice(0, 2).toUpperCase();
            } else {
                // Show Login or Signup Form
                if (loggedPanel) loggedPanel.style.display = "none";
                if (document.querySelector(".auth-tabs-nav")) document.querySelector(".auth-tabs-nav").style.display = "grid";
                showTab("login");
            }
        }

        function closeModal() {
            if (!authModal) return;
            authModal.style.display = "none";
            authModal.setAttribute("aria-hidden", "true");
            if (loginMsg) loginMsg.textContent = "";
            if (signupMsg) signupMsg.textContent = "";
        }

        function showTab(tab) {
            if (tab === "signup") {
                if (tabSignup) tabSignup.classList.add("active");
                if (tabLogin) tabLogin.classList.remove("active");
                if (formSignup) formSignup.style.display = "flex";
                if (formLogin) formLogin.style.display = "none";
                if (modalTitle) modalTitle.textContent = "Create an Account";
                if (modalSubtitle) modalSubtitle.textContent = "Join our community of mindful mountain travelers.";
            } else {
                if (tabLogin) tabLogin.classList.add("active");
                if (tabSignup) tabSignup.classList.remove("active");
                if (formLogin) formLogin.style.display = "flex";
                if (formSignup) formSignup.style.display = "none";
                if (modalTitle) modalTitle.textContent = "Welcome Back";
                if (modalSubtitle) modalSubtitle.textContent = "Sign in to save favorite stays and track your custom trips.";
            }
        }

        if (authBtn) authBtn.addEventListener("click", openModal);
        if (modalClose) modalClose.addEventListener("click", closeModal);
        if (authModal) {
            authModal.addEventListener("click", function (e) {
                if (e.target === authModal) closeModal();
            });
        }

        if (tabLogin) tabLogin.addEventListener("click", function () { showTab("login"); });
        if (tabSignup) tabSignup.addEventListener("click", function () { showTab("signup"); });

        // Handle Customer Login
        if (formLogin) {
            formLogin.addEventListener("submit", async function (e) {
                e.preventDefault();
                var email = formLogin.email.value.trim().toLowerCase();
                var password = formLogin.password.value;

                if (loginMsg) {
                    loginMsg.textContent = "Signing in...";
                    loginMsg.style.color = "#145341";
                }

                var userObj = { email: email, full_name: email.split("@")[0], last_login: new Date().toISOString() };

                // Try backend sync
                try {
                    var res = await fetch("/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: email, password: password, action: "login" })
                    });
                    if (res.ok) {
                        var data = await res.json();
                        if (data.user) userObj = data.user;
                    }
                } catch (err) {}

                saveCustomerSession(userObj);
                updateNavState();

                if (loginMsg) {
                    loginMsg.textContent = "Welcome back! Redirecting...";
                    loginMsg.style.color = "#145341";
                }

                setTimeout(function () {
                    closeModal();
                }, 800);
            });
        }

        // Handle Customer Signup
        if (formSignup) {
            formSignup.addEventListener("submit", async function (e) {
                e.preventDefault();
                var fullName = formSignup.full_name.value.trim();
                var email = formSignup.email.value.trim().toLowerCase();
                var phone = formSignup.phone.value.trim();
                var password = formSignup.password.value;

                if (signupMsg) {
                    signupMsg.textContent = "Creating your account...";
                    signupMsg.style.color = "#145341";
                }

                var userObj = {
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                };

                // Try backend API & Supabase sync
                try {
                    var res = await fetch("/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            full_name: fullName,
                            email: email,
                            phone: phone,
                            password: password,
                            action: "signup"
                        })
                    });
                    if (res.ok) {
                        var data = await res.json();
                        if (data.user) userObj = data.user;
                    }
                } catch (err) {}

                saveCustomerSession(userObj);
                updateNavState();

                if (signupMsg) {
                    signupMsg.textContent = "Account created successfully! Welcome to Live Local Himalaya.";
                    signupMsg.style.color = "#145341";
                }

                setTimeout(function () {
                    closeModal();
                }, 900);
            });
        }

        // Handle Logout
        if (btnLogout) {
            btnLogout.addEventListener("click", function () {
                localStorage.removeItem(STORAGE_USER_KEY);
                updateNavState();
                closeModal();
            });
        }

        updateNavState();
    }

    function start() {
        loadFragment(navbarUrl, "navbar-container").then(setupNavigation);
        loadFragment(footerUrl, "footer-container");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
