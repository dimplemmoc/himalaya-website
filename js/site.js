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

    function start() {
        document.documentElement.classList.add("motion-ready");
        revealContent();
        handleEmailForms();
        setupDetailCards();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
