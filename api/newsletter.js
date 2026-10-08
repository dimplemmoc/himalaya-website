// Node.js Backend API: Newsletter Subscription Handler
const { getPgPool, queryPg, supabaseQuery } = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });

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

    // 1. Direct Vercel Postgres Database Check
    if (getPgPool()) {
      try {
        await queryPg(
          `INSERT INTO newsletter_subscribers (email, source)
           VALUES ($1, $2)
           ON CONFLICT (email) DO NOTHING;`,
          [email, source]
        );
        return res.status(201).json({
          success: true,
          message: "Thank you for subscribing to Himalayan stories!"
        });
      } catch (dbErr) {
        console.error("Vercel PG newsletter insert error:", dbErr);
      }
    }

    // 2. Fallback
    const payload = { email, source, created_at: new Date().toISOString() };
    await supabaseQuery("newsletter_subscribers", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to Himalayan stories!"
    });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};
