// Node.js Backend API: Registered Users & Customer Auth Management Handler
const { getPgPool, queryPg, supabaseQuery } = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const method = req.method;
  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const id = urlObj.searchParams.get("id");

  try {
    // 1. GET: List all registered users for Admin Panel
    if (method === "GET") {
      let users = [];

      if (getPgPool()) {
        try {
          await queryPg(`
            CREATE TABLE IF NOT EXISTS public.registered_users (
              id uuid primary key default gen_random_uuid(),
              full_name text not null,
              email text not null unique,
              phone text,
              password_hash text,
              provider text default 'email',
              role text default 'member',
              last_login timestamptz default now(),
              created_at timestamptz not null default now()
            );
            ALTER TABLE public.registered_users ADD COLUMN IF NOT EXISTS provider text default 'email';
          `);
          users = (await queryPg("SELECT id, full_name, email, phone, provider, role, last_login, created_at FROM registered_users ORDER BY created_at DESC;")) || [];
          return res.status(200).json({ success: true, users });
        } catch (pgErr) {
          console.warn("Vercel PG users query warning:", pgErr);
        }
      }

      // Supabase fallback
      const sbRes = await supabaseQuery("registered_users?select=id,full_name,email,phone,provider,role,last_login,created_at&order=created_at.desc");
      if (sbRes.ok && Array.isArray(sbRes.data)) {
        users = sbRes.data;
      }
      return res.status(200).json({ success: true, users });
    }

    // 2. POST: Register new user or record login
    if (method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      const fullName = (body.full_name || body.name || "Member").trim();
      const email = (body.email || "").trim().toLowerCase();
      const phone = (body.phone || "").trim();
      const provider = (body.provider || "email").toLowerCase();
      const action = body.action || "signup";

      if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
      }

      // Postgres attempt
      if (getPgPool()) {
        try {
          await queryPg(`
            CREATE TABLE IF NOT EXISTS public.registered_users (
              id uuid primary key default gen_random_uuid(),
              full_name text not null,
              email text not null unique,
              phone text,
              password_hash text,
              provider text default 'email',
              role text default 'member',
              last_login timestamptz default now(),
              created_at timestamptz not null default now()
            );
            ALTER TABLE public.registered_users ADD COLUMN IF NOT EXISTS provider text default 'email';
          `);

          if (action === "login") {
            const rows = await queryPg("SELECT * FROM registered_users WHERE email = $1 LIMIT 1;", [email]);
            if (rows && rows.length > 0) {
              await queryPg("UPDATE registered_users SET last_login = now(), provider = COALESCE($2, registered_users.provider) WHERE email = $1;", [email, provider]);
              return res.status(200).json({ success: true, user: rows[0], message: "Logged in successfully" });
            }
          }

          const insertRes = await queryPg(`
            INSERT INTO registered_users (full_name, email, phone, provider, last_login)
            VALUES ($1, $2, $3, $4, now())
            ON CONFLICT (email) 
            DO UPDATE SET full_name = EXCLUDED.full_name, phone = COALESCE(EXCLUDED.phone, registered_users.phone), provider = EXCLUDED.provider, last_login = now()
            RETURNING id, full_name, email, phone, provider, role, last_login, created_at;
          `, [fullName, email, phone, provider]);

          return res.status(200).json({ success: true, user: insertRes[0], message: "Account saved successfully" });
        } catch (pgErr) {
          console.warn("Vercel PG user save warning:", pgErr);
        }
      }

      // Supabase attempt
      const sbRow = {
        full_name: fullName,
        email: email,
        phone: phone,
        provider: provider,
        last_login: new Date().toISOString()
      };

      await supabaseQuery("registered_users", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify(sbRow)
      });

      return res.status(200).json({
        success: true,
        user: { full_name: fullName, email: email, phone: phone, provider: provider },
        message: "User saved successfully"
      });
    }

    // 3. DELETE: Remove a user
    if (method === "DELETE") {
      if (getPgPool() && id) {
        try {
          await queryPg("DELETE FROM registered_users WHERE id = $1;", [id]);
        } catch (e) {}
      }
      if (id) {
        await supabaseQuery(`registered_users?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      }
      return res.status(200).json({ success: true, message: "User deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("User auth API error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
