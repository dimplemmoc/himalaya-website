// Node.js Backend API: Admin Inquiries Management Handler
const { supabaseQuery } = require("./_db");

module.exports = async function handler(req, res) {
  // CORS & Methods
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const method = req.method;
  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const type = urlObj.searchParams.get("type") || "all";
  const id = urlObj.searchParams.get("id");

  try {
    // 1. GET: Fetch inquiries
    if (method === "GET") {
      const results = {};

      if (type === "all" || type === "trip") {
        const tripRes = await supabaseQuery("trip_inquiries?select=*&order=created_at.desc");
        results.tripInquiries = tripRes.ok && Array.isArray(tripRes.data) ? tripRes.data : [];
      }

      if (type === "all" || type === "contact") {
        const contactRes = await supabaseQuery("contact_inquiries?select=*&order=created_at.desc");
        results.contactInquiries = contactRes.ok && Array.isArray(contactRes.data) ? contactRes.data : [];
      }

      if (type === "all" || type === "newsletter") {
        const newsRes = await supabaseQuery("newsletter_subscribers?select=*&order=created_at.desc");
        results.newsletterSubscribers = newsRes.ok && Array.isArray(newsRes.data) ? newsRes.data : [];
      }

      return res.status(200).json({
        success: true,
        ...results
      });
    }

    // 2. PATCH: Update status of an inquiry
    if (method === "PATCH") {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      const targetId = body.id || id;
      const targetTable = body.type === "contact" ? "contact_inquiries" : "trip_inquiries";
      const status = body.status;

      if (!targetId || !status) {
        return res.status(400).json({ success: false, error: "Inquiry ID and status are required." });
      }

      const updateRes = await supabaseQuery(`${targetTable}?id=eq.${encodeURIComponent(targetId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      if (!updateRes.ok) {
        return res.status(500).json({ success: false, error: "Failed to update inquiry status." });
      }

      return res.status(200).json({ success: true, message: "Status updated." });
    }

    // 3. DELETE: Remove an inquiry
    if (method === "DELETE") {
      let targetTable = "trip_inquiries";
      if (type === "contact") targetTable = "contact_inquiries";
      if (type === "newsletter") targetTable = "newsletter_subscribers";

      if (!id) {
        return res.status(400).json({ success: false, error: "Item ID is required for deletion." });
      }

      const deleteRes = await supabaseQuery(`${targetTable}?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE"
      });

      if (!deleteRes.ok) {
        return res.status(500).json({ success: false, error: "Failed to delete item." });
      }

      return res.status(200).json({ success: true, message: "Item deleted successfully." });
    }

    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) {
    console.error("Inquiries API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};
