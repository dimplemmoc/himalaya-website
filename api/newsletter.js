// Node.js Backend API: Newsletter Subscription Handler
const { supabaseQuery } = require("./_db");

module.exports = async function handler(req, res) {
  // CORS & Methods
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const email = (body.email || "").trim().toLowerCase();
    const source = (body.source || "footer").trim();

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "A valid email address is required." });
    }

    const payload = {
      email,
      source,
      created_at: new Date().toISOString()
    };

    const result = await supabaseQuery("newsletter_subscribers", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!result.ok) {
      const errStr = JSON.stringify(result.data || "");
      if (errStr.includes("23505") || errStr.toLowerCase().includes("duplicate") || errStr.toLowerCase().includes("unique")) {
        return res.status(200).json({
          success: true,
          message: "You are already subscribed to Himalayan stories!"
        });
      }

      console.error("Supabase newsletter insert error:", result.data);
      return res.status(500).json({
        success: false,
        error: "Database error while subscribing.",
        details: result.data
      });
    }

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to Himalayan stories!"
    });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};
