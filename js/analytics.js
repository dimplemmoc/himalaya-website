/**
 * Google Analytics 4 (GA4) Integration & Event Tracking
 * Live Local Himalaya
 */
(function () {
  "use strict";

  // ========================================================
  // CONFIGURATION: Replace 'G-QVCMVTN7HM' with your GA4 ID
  // ========================================================
  var GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || "G-QVCMVTN7HM";

  // Prevent tracking on admin pages to keep analytics data clean
  if (window.location.pathname.indexOf("admin") !== -1) {
    return;
  }

  // 1. Initialize dataLayer & gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // Initialize only if not already initialized
  if (!window._ga_initialized) {
    window._ga_initialized = true;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: true
    });

    // Dynamically load Google Tag if not present in HTML
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
      document.head.appendChild(script);
    }
  }

  // 2. Global helper function for tracking events
  window.trackAnalyticsEvent = function (action, category, label, value) {
    if (typeof window.gtag === "function") {
      window.gtag("event", action, {
        event_category: category || "general",
        event_label: label || "",
        value: typeof value === "number" ? value : undefined
      });
    }
  };

  // 3. Automated Event Listeners
  function setupAutoTracking() {
    // A. WhatsApp Clicks
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var href = btn.getAttribute("href") || "";
        window.trackAnalyticsEvent("whatsapp_click", "contact", href);
      });
    });

    // B. Phone Call Clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tel = btn.getAttribute("href") || "";
        window.trackAnalyticsEvent("phone_call_click", "contact", tel);
      });
    });

    // C. Call-to-Action (CTA) Buttons
    document.querySelectorAll('.trip-btn, .explore-btn, .story-btn, .details-cta-btn, [data-track="cta"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = (btn.textContent || "").trim().replace(/\s+/g, " ").substring(0, 50);
        window.trackAnalyticsEvent("cta_click", "conversion", text);
      });
    });

    // D. Footer Newsletter Form Submission
    var newsletterForm = document.querySelector(".newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function () {
        window.trackAnalyticsEvent("newsletter_signup", "lead", "footer_form");
      });
    }

    // E. Contact Page Form Submission
    var contactForm = document.querySelector("#contact-form, form.contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", function () {
        window.trackAnalyticsEvent("contact_form_submit", "lead", "contact_page");
      });
    }

    // F. Plan Trip Form Submission
    var tripForm = document.querySelector("#trip-form, form#plan-trip-form, .plan-trip-form");
    if (tripForm) {
      tripForm.addEventListener("submit", function () {
        window.trackAnalyticsEvent("plan_trip_submit", "lead", "plan_trip_page");
      });
    }

    // G. Detail Page Inquiry Button
    var inquiryBtn = document.getElementById("inquiry-btn") || document.querySelector(".inquiry-trigger");
    if (inquiryBtn) {
      inquiryBtn.addEventListener("click", function () {
        var title = document.title || "trip_details";
        window.trackAnalyticsEvent("trip_inquiry_click", "conversion", title);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAutoTracking);
  } else {
    setupAutoTracking();
  }
})();
