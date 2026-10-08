// Node.js Backend API: Admin Inquiries Management Handler
const { getPgPool, queryPg, supabaseQuery } = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const method = req.method;
  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const type = urlObj.searchParams.get("type") || "all";
  const id = urlObj.searchParams.get("id");

  try {
    if (getPgPool()) {
      try {
        if (method === "GET") {
          let tripInquiries = [];
          let contactInquiries = [];
          let newsletterSubscribers = [];

          if (type === "all" || type === "trip") {
            tripInquiries = (await queryPg("SELECT * FROM trip_inquiries ORDER BY created_at DESC;")) || [];
          }
          if (type === "all" || type === "contact") {
            contactInquiries = (await queryPg("SELECT * FROM contact_inquiries ORDER BY created_at DESC;")) || [];
          }
          if (type === "all" || type === "newsletter") {
            newsletterSubscribers = (await queryPg("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC;")) || [];
          }

          return res.status(200).json({
            success: true,
            tripInquiries,
            contactInquiries,
            newsletterSubscribers
          });
        }

        if (method === "PATCH") {
          let body = req.body;
          if (typeof body === "string") {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
          }
          body = body || {};
          const targetId = body.id || id;
          const status = body.status;
          const table = body.type === "contact" ? "contact_inquiries" : "trip_inquiries";
          await queryPg(`UPDATE ${table} SET status = $1 WHERE id = $2;`, [status, targetId]);
          return res.status(200).json({ success: true, message: "Status updated." });
        }

        if (method === "DELETE") {
          let table = "trip_inquiries";
          if (type === "contact") table = "contact_inquiries";
          if (type === "newsletter") table = "newsletter_subscribers";
          await queryPg(`DELETE FROM ${table} WHERE id = $1;`, [id]);
          return res.status(200).json({ success: true, message: "Deleted." });
        }
      } catch (pgErr) {
        console.error("Vercel PG inquiries error:", pgErr);
      }
    }

    // Fallback Supabase
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
      return res.status(200).json({ success: true, ...results });
    }

    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) {
    console.error("Inquiries API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};
