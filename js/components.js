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
    var navbarUrl = rootUrl + "components/navbar.html";
    var footerUrl = rootUrl + "components/footer.html";

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

        var currentPage = window.location.pathname.split("/").pop() || "index.html";
        if (currentPage === "blog-details.html") currentPage = "blog.html";
        var links = container.querySelectorAll(".navbar a, .logo");
        Array.prototype.forEach.call(links, function (link) {
            var target = link.getAttribute("href");
            if (target && target.split("#")[0] === currentPage) {
                link.setAttribute("aria-current", "page");
            }
        });
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
