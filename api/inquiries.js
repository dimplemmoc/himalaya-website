// Node.js Backend API: Admin Inquiries Management Handler
const { isVercelPostgres, getVercelSql, initVercelTables, supabaseQuery } = require("./_db");

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
    // Check if Vercel Postgres is connected
    if (isVercelPostgres()) {
      const sql = await getVercelSql();
      if (sql) {
        await initVercelTables();

        if (method === "GET") {
          let tripInquiries = [];
          let contactInquiries = [];
          let newsletterSubscribers = [];

          if (type === "all" || type === "trip") {
            const r = await sql`SELECT * FROM trip_inquiries ORDER BY created_at DESC;`;
            tripInquiries = r.rows;
          }
          if (type === "all" || type === "contact") {
            const r = await sql`SELECT * FROM contact_inquiries ORDER BY created_at DESC;`;
            contactInquiries = r.rows;
          }
          if (type === "all" || type === "newsletter") {
            const r = await sql`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC;`;
            newsletterSubscribers = r.rows;
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
          if (body.type === "contact") {
            await sql`UPDATE contact_inquiries SET status = ${status} WHERE id = ${targetId};`;
          } else {
            await sql`UPDATE trip_inquiries SET status = ${status} WHERE id = ${targetId};`;
          }
          return res.status(200).json({ success: true, message: "Status updated." });
        }

        if (method === "DELETE") {
          if (type === "contact") {
            await sql`DELETE FROM contact_inquiries WHERE id = ${id};`;
          } else if (type === "newsletter") {
            await sql`DELETE FROM newsletter_subscribers WHERE id = ${id};`;
          } else {
            await sql`DELETE FROM trip_inquiries WHERE id = ${id};`;
          }
          return res.status(200).json({ success: true, message: "Deleted." });
        }
      }
    }

    // Supabase Fallback
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
