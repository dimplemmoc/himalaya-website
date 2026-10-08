// Node.js Backend API: Contact Form Submission Handler
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

    const fullName = (body.fullName || body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const travelDate = (body.travelDate || "").trim();
    const travellers = body.travellers ? parseInt(body.travellers, 10) : null;
    const interested = (body.interested || "").trim();
    const budget = (body.budget || "").trim();
    const message = (body.message || "").trim();

    if (!fullName) return res.status(400).json({ success: false, error: "Full name is required." });
    if (!email || !email.includes("@")) return res.status(400).json({ success: false, error: "A valid email address is required." });
    if (!message) return res.status(400).json({ success: false, error: "Message is required." });

    // 1. Direct Vercel Postgres Database Check
    if (getPgPool()) {
      try {
        await queryPg(
          `INSERT INTO contact_inquiries (full_name, email, phone, travel_date, travellers, interested, budget, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')`,
          [fullName, email, phone || null, travelDate || null, travellers || null, interested || null, budget || null, message]
        );
        return res.status(201).json({
          success: true,
          message: "Thank you! Your travel enquiry has been saved in Vercel database."
        });
      } catch (dbErr) {
        console.error("Vercel PG contact insert error:", dbErr);
      }
    }

    // 2. Supabase Fallback
    const payload = {
      full_name: fullName,
      email: email,
      phone: phone || null,
      travel_date: travelDate || null,
      travellers: isNaN(travellers) ? null : travellers,
      interested: interested || null,
      budget: budget || null,
      message: message,
      status: "new",
      created_at: new Date().toISOString()
    };

    await supabaseQuery("contact_inquiries", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your travel enquiry has been received successfully."
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};
