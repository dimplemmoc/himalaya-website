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

            link.href = "blog-details.html?" + query;

            if (card.tagName.toLowerCase() !== "a") {
                card.setAttribute("data-detail-route", link.href);
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
                    imageLink.href = link.href;
                    imageLink.className = "blog-image-link";
                    imageParent.insertBefore(imageLink, storyImage);
                    imageLink.appendChild(storyImage);
                }

                if (title && title.querySelector("a") === null) {
                    var titleLink = document.createElement("a");
                    titleLink.href = link.href;
                    titleLink.className = "blog-story-title-link";
                    while (title.firstChild) titleLink.appendChild(title.firstChild);
                    title.appendChild(titleLink);
                }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addStoryLinks);
    } else {
        addStoryLinks();
    }
}());
