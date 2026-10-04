(function () {
    "use strict";

    function slugify(value) {
        return value.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function closest(target, selector) {
        while (target && target.nodeType === 1) {
            var matches = target.matches || target.msMatchesSelector || target.webkitMatchesSelector;
            if (matches && matches.call(target, selector)) return target;
            target = target.parentElement;
        }
        return null;
    }

    function addStoryLinks() {
        var links = document.querySelectorAll(
            ".featured-blog-content a, .blog-card-content a, " +
            ".blog-horizontal-card a, .guide-item"
        );

        Array.prototype.forEach.call(links, function (link) {
            var card = closest(link, ".featured-blog, .blog-card, .blog-horizontal-card, .guide-item");
            if (!card) return;

            var title = card.querySelector("h2, h3");
            if (!title) return;

            var image = card.querySelector("img");
            var category = card.querySelector(".blog-post-category, .blog-card-image span, .blog-horizontal-card span, small");
            var date = card.querySelector(".blog-post-date, .blog-card-content small, .blog-horizontal-card small");
            var excerpt = card.querySelector("p");
            var data = {
                story: slugify(title.textContent.trim()),
                title: title.textContent.replace(/\s+/g, " ").trim(),
                category: category ? category.textContent.replace(/\s+/g, " ").trim() : "HIMALAYAN JOURNAL",
                date: date ? date.textContent.replace(/\s+/g, " ").trim() : "",
                image: image ? image.getAttribute("src") : "",
                alt: image ? image.getAttribute("alt") || "" : "",
                excerpt: excerpt ? excerpt.textContent.replace(/\s+/g, " ").trim() : ""
            };

            var query = Object.keys(data).map(function (key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
            }).join("&");

            var detailHref = link.getAttribute("href") || "";
            if (detailHref.indexOf("slug=") === -1) {
                detailHref = "blog-details.html?" + query;
                link.href = detailHref;
            }

            if (card.tagName.toLowerCase() !== "a") {
                card.setAttribute("data-detail-route", detailHref);
                card.classList.add("detail-link-card");
                card.setAttribute("role", "link");
                card.setAttribute("tabindex", "0");
                card.setAttribute("aria-label", "Read story: " + data.title);
            }

            if (!card.classList.contains("guide-item")) {
                var storyImage = card.querySelector("img");
                var imageParent = storyImage && storyImage.parentElement;
                if (storyImage && imageParent && imageParent.tagName.toLowerCase() !== "a") {
                    var imageLink = document.createElement("a");
                    imageLink.href = detailHref;
                    imageLink.className = "blog-image-link";
                    imageParent.insertBefore(imageLink, storyImage);
                    imageLink.appendChild(storyImage);
                }

                if (title && title.querySelector("a") === null) {
                    var titleLink = document.createElement("a");
                    titleLink.href = detailHref;
                    titleLink.className = "blog-story-title-link";
                    while (title.firstChild) titleLink.appendChild(title.firstChild);
                    title.appendChild(titleLink);
                }
            }
        });
    }

    function sectionCategories(section) {
        return (section.getAttribute("data-blog-section") || "")
            .split(",")
            .map(function (item) { return item.trim(); })
            .filter(Boolean);
    }

    function setupBlogCategoryFilters() {
        var bar = document.getElementById("blog-filter-bar");
        if (!bar) return;

        var buttons = bar.querySelectorAll("[data-blog-filter]");
        var empty = document.querySelector(".blog-filter-empty");
        if (!empty) {
            empty = document.createElement("div");
            empty.className = "blog-filter-empty";
            empty.hidden = true;
            empty.textContent = "No stories found in this category yet. Try All for the complete journal.";
            var categories = document.getElementById("stories");
            if (categories && categories.parentNode) {
                categories.parentNode.insertBefore(empty, categories.nextSibling);
            }
        }

        function applyFilter(filter, shouldScroll) {
            var visibleCount = 0;
            var cmsSection = document.getElementById("cms-stories-section");
            var cmsCards = document.querySelectorAll("#cms-stories [data-blog-card]");

            Array.prototype.forEach.call(buttons, function (button) {
                var active = button.getAttribute("data-blog-filter") === filter;
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", active ? "true" : "false");
            });

            Array.prototype.forEach.call(cmsCards, function (card) {
                var showCard = filter === "all" || card.getAttribute("data-blog-card") === filter;
                card.hidden = !showCard;
                if (showCard) visibleCount += 1;
            });

            if (cmsSection && cmsCards.length) {
                cmsSection.hidden = !(filter === "all" || Array.prototype.some.call(cmsCards, function (card) {
                    return !card.hidden;
                }));
            }

            Array.prototype.forEach.call(document.querySelectorAll("[data-blog-section]:not(#cms-stories-section)"), function (section) {
                var showSection = filter === "all" || sectionCategories(section).indexOf(filter) !== -1;
                section.hidden = !showSection;
                if (showSection) visibleCount += 1;
            });

            empty.hidden = visibleCount !== 0;

            if (shouldScroll) {
                var target = cmsSection && !cmsSection.hidden ? cmsSection : document.querySelector("[data-blog-section]:not([hidden])");
                if (!empty.hidden) target = empty;
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }

        Array.prototype.forEach.call(buttons, function (button) {
            button.addEventListener("click", function () {
                var filter = button.getAttribute("data-blog-filter") || "all";
                applyFilter(filter, true);
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, "", filter === "all" ? "#stories" : "#stories-" + filter);
                }
            });
        });

        document.addEventListener("llh:blog-posts-rendered", function () {
            var active = bar.querySelector(".active[data-blog-filter]");
            addStoryLinks();
            applyFilter(active ? active.getAttribute("data-blog-filter") : "all", false);
        });

        var initial = (window.location.hash || "").replace("#stories-", "");
        var hasInitial = Array.prototype.some.call(buttons, function (button) {
            return button.getAttribute("data-blog-filter") === initial;
        });
        applyFilter(hasInitial ? initial : "all", false);
    }

    function start() {
        addStoryLinks();
        setupBlogCategoryFilters();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
