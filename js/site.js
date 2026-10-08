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
        document.addEventListener("submit", async function (event) {
            var form = event.target;
            if (!form) return;
            var matches = form.matches || form.msMatchesSelector || form.webkitMatchesSelector;
            if (!matches) return;

            var isContactForm = matches.call(form, "#travelForm");
            var isNewsletterForm = matches.call(form, ".newsletter-form");
            if (!isContactForm && !isNewsletterForm) return;

            event.preventDefault();

            if (isContactForm) {
                var submitBtn = form.querySelector("button[type=submit]");
                var status = document.getElementById("formStatus");
                var origBtnText = submitBtn ? submitBtn.innerHTML : "SEND ENQUIRY";

                var payload = {
                    fullName: (form.querySelector("#fullName") ? form.querySelector("#fullName").value : "").trim(),
                    email: (form.querySelector("#email") ? form.querySelector("#email").value : "").trim(),
                    phone: (form.querySelector("#phone") ? form.querySelector("#phone").value : "").trim(),
                    travelDate: form.querySelector("#travelDate") ? form.querySelector("#travelDate").value : "",
                    travellers: form.querySelector("#travellers") ? form.querySelector("#travellers").value : "",
                    interested: (form.querySelector("#interested") ? form.querySelector("#interested").value : "").trim(),
                    budget: (form.querySelector("#budget") ? form.querySelector("#budget").value : "").trim(),
                    message: (form.querySelector("#message") ? form.querySelector("#message").value : "").trim()
                };

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Sending enquiry...";
                }

                try {
                    var res = await fetch("/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    var data = await res.json().catch(function () { return {}; });

                    if (res.ok && data.success) {
                        form.reset();
                        if (status) {
                            status.innerHTML = '<div style="margin-top:14px;padding:12px 16px;background:rgba(126,204,159,0.18);border:1px solid #7ecc9f;color:#123f34;border-radius:8px;font-size:14px;font-weight:600;">✓ Thank you! Your enquiry has been received and saved. Our team will contact you shortly.</div>';
                        }
                    } else {
                        // Fallback to Supabase direct REST if /api/contact is unavailable
                        var sbUrl = window.HIMALAYA_SUPABASE_URL;
                        var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
                        if (sbUrl && sbKey) {
                            await fetch(sbUrl + "/rest/v1/contact_inquiries", {
                                method: "POST",
                                headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    full_name: payload.fullName,
                                    email: payload.email,
                                    phone: payload.phone || null,
                                    travel_date: payload.travelDate || null,
                                    travellers: payload.travellers ? parseInt(payload.travellers, 10) : null,
                                    interested: payload.interested || null,
                                    budget: payload.budget || null,
                                    message: payload.message,
                                    status: "new"
                                })
                            });
                            form.reset();
                            if (status) {
                                status.innerHTML = '<div style="margin-top:14px;padding:12px 16px;background:rgba(126,204,159,0.18);border:1px solid #7ecc9f;color:#123f34;border-radius:8px;font-size:14px;font-weight:600;">✓ Thank you! Your enquiry has been saved. We will contact you soon.</div>';
                            }
                        } else {
                            throw new Error(data.error || "Unable to save inquiry");
                        }
                    }
                } catch (err) {
                    if (status) {
                        status.innerHTML = '<div style="margin-top:14px;padding:12px 16px;background:rgba(224,108,117,0.15);border:1px solid #e06c75;color:#851a22;border-radius:8px;font-size:14px;">Could not connect to server. Opening your email app instead...</div>';
                    }
                    setTimeout(function () {
                        window.location.href = "mailto:hello@livelocalhimalaya.com?subject=Himalayan trip enquiry&body=" + encodeURIComponent(formValues(form));
                    }, 1200);
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origBtnText;
                    }
                }
            }

            if (isNewsletterForm) {
                var emailInput = form.querySelector("input[type=email]");
                var emailVal = emailInput ? emailInput.value.trim() : "";
                var statusBox = form.nextElementSibling;

                try {
                    var nRes = await fetch("/api/newsletter", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: emailVal })
                    });
                    var nData = await nRes.json().catch(function () { return {}; });

                    if (emailInput) emailInput.value = "";
                    if (statusBox) {
                        statusBox.textContent = nData.message || "✓ Thank you for subscribing to Himalayan stories!";
                        statusBox.style.color = "#7ecc9f";
                    } else {
                        alert(nData.message || "✓ Thank you for subscribing!");
                    }
                } catch (e) {
                    // Supabase direct fallback
                    var sbUrl = window.HIMALAYA_SUPABASE_URL;
                    var sbKey = window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
                    if (sbUrl && sbKey && emailVal) {
                        fetch(sbUrl + "/rest/v1/newsletter_subscribers", {
                            method: "POST",
                            headers: { "apikey": sbKey, "Authorization": "Bearer " + sbKey, "Content-Type": "application/json" },
                            body: JSON.stringify({ email: emailVal })
                        }).catch(function () {});
                    }
                    if (emailInput) emailInput.value = "";
                    if (statusBox) {
                        statusBox.textContent = "✓ Thank you for subscribing!";
                        statusBox.style.color = "#7ecc9f";
                    }
                }
            }
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
