// Shared database helper: Supports native Vercel Postgres (Storage) + Supabase
// Production deployment with connected Vercel Postgres storage
let tablesInitialized = false;

function isVercelPostgres() {
  return Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING);
}

async function getVercelSql() {
  try {
    const { sql } = require("@vercel/postgres");
    return sql;
  } catch (err) {
    console.warn("@vercel/postgres not loaded yet:", err);
    return null;
  }
}

async function initVercelTables() {
  if (tablesInitialized) return;
  const sql = await getVercelSql();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        travel_date TEXT,
        travellers INTEGER,
        interested TEXT,
        budget TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS trip_inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        destination TEXT,
        trip_type TEXT,
        travelers TEXT,
        start_date TEXT,
        end_date TEXT,
        budget TEXT,
        style TEXT,
        message TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        source TEXT DEFAULT 'footer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    tablesInitialized = true;
  } catch (e) {
    console.warn("Table auto-creation note:", e.message || e);
  }
}

// Supabase fallback helper
const SUPABASE_URL = process.env.SUPABASE_URL || "https://cwhqpfdncpnakztxkoxk.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_wUuJt7BUd_LpMTxoDnIikA_ze_mT7xI";

async function supabaseQuery(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  return { ok: response.ok, status: response.status, data };
}

module.exports = {
  isVercelPostgres,
  getVercelSql,
  initVercelTables,
  supabaseQuery
};
