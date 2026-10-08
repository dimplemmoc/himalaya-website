// Node.js Backend API: Trip Planning Inquiry Handler
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

    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const destination = (body.destination || "").trim();
    const tripType = (body.tripType || "").trim();
    const travelers = (body.travelers || "").trim();
    const startDate = (body.startDate || "").trim();
    const endDate = (body.endDate || "").trim();
    const budget = (body.budget || "").trim();
    const style = (body.style || "").trim();
    const message = (body.message || "").trim();

    if (!name) return res.status(400).json({ success: false, error: "Name is required." });
    if (!phone) return res.status(400).json({ success: false, error: "WhatsApp or phone number is required." });

    // 1. Direct Vercel Postgres Database Check
    if (getPgPool()) {
      try {
        await queryPg(
          `INSERT INTO trip_inquiries (name, phone, email, destination, trip_type, travelers, start_date, end_date, budget, style, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'new')`,
          [name, phone, email || null, destination || null, tripType || null, travelers || null, startDate || null, endDate || null, budget || null, style || null, message || null]
        );
        return res.status(201).json({
          success: true,
          message: `Thank you ${name}! Your custom Himalayan trip inquiry has been saved in Vercel database.`
        });
      } catch (dbErr) {
        console.error("Vercel PG trip insert error:", dbErr);
      }
    }

    // 2. Fallback
    const payload = {
      name,
      phone,
      email: email || null,
      destination: destination || null,
      trip_type: tripType || null,
      travelers: travelers || null,
      start_date: startDate || null,
      end_date: endDate || null,
      budget: budget || null,
      style: style || null,
      message: message || null,
      status: "new",
      created_at: new Date().toISOString()
    };

    await supabaseQuery("trip_inquiries", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return res.status(201).json({
      success: true,
      message: `Thank you ${name}! Your custom Himalayan trip inquiry has been received.`
    });
  } catch (err) {
    console.error("Plan Trip API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};
