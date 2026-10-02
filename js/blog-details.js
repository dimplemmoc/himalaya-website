(function () {
    "use strict";

    function getParameter(name) {
        var query = window.location.search.replace(/^\?/, "").split("&");
        for (var i = 0; i < query.length; i += 1) {
            var pair = query[i].split("=");
            if (decodeURIComponent(pair[0].replace(/\+/g, " ")) === name) {
                return decodeURIComponent((pair[1] || "").replace(/\+/g, " "));
            }
        }
        return "";
    }

    function start() {
        var title = getParameter("title");
        var image = getParameter("image");
        var category = getParameter("category");
        var date = getParameter("date");
        var excerpt = getParameter("excerpt");
        var titleElement = document.getElementById("article-title");
        var imageElement = document.getElementById("article-image");
        var body = document.getElementById("article-body");

        if (!title || !titleElement || !body) {
            if (titleElement) titleElement.textContent = "Story not found";
            if (body) body.textContent = "Choose a story from the journal to read it here.";
            return;
        }

        document.title = title + " | Live Local Himalaya";
        titleElement.textContent = title;
        document.getElementById("article-category").textContent = category || "HIMALAYAN JOURNAL";
        document.getElementById("article-meta").textContent = date;

        if (imageElement && image && /^images\//.test(image)) {
            imageElement.src = image;
            imageElement.alt = getParameter("alt") || title;
            imageElement.hidden = false;
        } else if (imageElement) {
            imageElement.hidden = true;
        }

        var lead = document.createElement("p");
        lead.className = "article-lead";
        lead.textContent = excerpt || "A story from the people and places of the Himalayas.";
        body.appendChild(lead);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
