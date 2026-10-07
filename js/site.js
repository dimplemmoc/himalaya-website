(function () {
    "use strict";

    function revealContent() {
        var targets = document.querySelectorAll(
            "main > section, .journey-card, .experience-card, .blog-card, " +
            ".blog-horizontal-card, .guide-item, .package-card, .stay-card"
        );

        if (!targets.length || !("IntersectionObserver" in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

        Array.prototype.forEach.call(targets, function (target, index) {
            target.classList.add("scroll-reveal");
            target.style.setProperty("--reveal-delay", (index % 4) * 70 + "ms");
            observer.observe(target);
        });
    }

    function updateShareUrls() {
        var canonical = document.querySelector('link[rel="canonical"]');
        var pageUrl = window.location.origin + window.location.pathname + window.location.search;
        var origin = window.location.origin;

        if (canonical) canonical.setAttribute("href", pageUrl);

        Array.prototype.forEach.call(document.querySelectorAll('meta[property="og:url"]'), function (meta) {
            meta.setAttribute("content", pageUrl);
        });

        Array.prototype.forEach.call(document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]'), function (meta) {
            var value = meta.getAttribute("content") || "";
            if (value.charAt(0) === "/") {
                meta.setAttribute("content", origin + value);
            }
        });
    }

    function formValues(form) {
        var values = [];
        Array.prototype.forEach.call(form.elements, function (field) {
            if (field.name && !field.disabled && field.type !== "submit" && field.type !== "button") {
                values.push(field.name + ": " + (field.value || "Not provided"));
            }
        });
        return values.join("\n");
    }

    function handleEmailForms() {
        document.addEventListener("submit", function (event) {
            var form = event.target;
            if (!form) return;
            var matches = form.matches || form.msMatchesSelector || form.webkitMatchesSelector;
            if (!matches) return;

            var isContactForm = matches.call(form, "#travelForm");
            var isNewsletterForm = matches.call(form, ".newsletter-form");
            if (!isContactForm && !isNewsletterForm) return;

            event.preventDefault();
            var subject = isContactForm ? "Himalayan trip enquiry" : "Himalayan stories newsletter sign-up";
            var body = isContactForm ? formValues(form) : "Please add this email address to the Himalayan stories newsletter: " + form.querySelector("input[type=email]").value;
            var status = isContactForm ? document.getElementById("formStatus") : form.nextElementSibling;

            if (status) status.textContent = "Your email app will open with this message ready to send.";
            window.location.href = "mailto:hello@livelocalhimalaya.com?subject=" +
                encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        }, true);
    }

    function closestElement(target, selector) {
        if (target && target.nodeType !== 1) target = target.parentElement;
        while (target && target.nodeType === 1) {
            var matches = target.matches || target.msMatchesSelector || target.webkitMatchesSelector;
            if (matches && matches.call(target, selector)) return target;
            target = target.parentElement;
        }
        return null;
    }

    function setupDetailCards() {
        var cards = document.querySelectorAll("[data-detail-route]");
        Array.prototype.forEach.call(cards, function (card) {
            if (card.tagName.toLowerCase() === "a") return;
            var heading = card.querySelector("h2, h3");
            if (heading) card.setAttribute("aria-label", "View details: " + heading.textContent.replace(/\s+/g, " ").trim());
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
        });

        document.addEventListener("click", function (event) {
            var card = closestElement(event.target, "[data-detail-route]");
            if (!card || card.tagName.toLowerCase() === "a") return;
            if (closestElement(event.target, "a, button, input, select, textarea")) return;
            window.location.href = card.getAttribute("data-detail-route");
        });

        document.addEventListener("keydown", function (event) {
            var card = closestElement(event.target, "[data-detail-route]");
            if (!card || card.tagName.toLowerCase() === "a" || event.target !== card) return;
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            window.location.href = card.getAttribute("data-detail-route");
        });
    }

    function setupCategoryFilters() {
        var filterGroups = document.querySelectorAll("[data-category-filters]");
        Array.prototype.forEach.call(filterGroups, function (group) {
            var target = group.getAttribute("data-category-filters");
            var cards = document.querySelectorAll("[data-filter-items='" + target + "'] [data-categories]");
            if (!cards.length) return;

            var buttons = group.querySelectorAll("[data-category]");
            var emptyState = document.querySelector("[data-category-empty='" + target + "']");
            var results = document.querySelector("[data-filter-items='" + target + "']");

            function showCategory(category) {
                var visibleCount = 0;
                Array.prototype.forEach.call(cards, function (card) {
                    var categories = (card.getAttribute("data-categories") || "").split(",");
                    var visible = category === "all" || categories.indexOf(category) !== -1;
                    card.hidden = !visible;
                    if (visible) visibleCount += 1;
                });

                Array.prototype.forEach.call(buttons, function (button) {
                    var active = button.getAttribute("data-category") === category;
                    button.classList.toggle("active", active);
                    button.setAttribute("aria-pressed", active ? "true" : "false");
                });

                if (emptyState) emptyState.hidden = visibleCount !== 0;
            }

            Array.prototype.forEach.call(buttons, function (button) {
                button.addEventListener("click", function () {
                    var category = button.getAttribute("data-category");
                    showCategory(category);

                    if (category !== "all") {
                        var scrollTarget = emptyState && !emptyState.hidden ? emptyState : results;
                        if (scrollTarget) scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                });
            });

            showCategory("all");
        });
    }

    function setupFaqAccordions() {
        document.addEventListener("click", function (event) {
            var btn = closestElement(event.target, ".faq-question");
            if (!btn) return;
            var item = closestElement(btn, ".faq-item");
            if (!item) return;
            var isExpanded = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", String(!isExpanded));
            item.classList.toggle("open", !isExpanded);
            var icon = btn.querySelector(".faq-icon");
            if (icon) icon.textContent = isExpanded ? "+" : "−";
        });
    }

    function start() {
        document.documentElement.classList.add("motion-ready");
        updateShareUrls();
        revealContent();
        handleEmailForms();
        setupDetailCards();
        setupCategoryFilters();
        setupFaqAccordions();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
