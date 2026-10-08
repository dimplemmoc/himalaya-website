// Shared database helper: Supports native Vercel Postgres / Prisma Postgres + Supabase
let pgPool = null;

function getPgPool() {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL;
  if (!connStr) return null;

  if (!pgPool) {
    try {
      const { Pool } = require("pg");
      pgPool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
      });
    } catch (e) {
      console.warn("pg module pool error:", e);
    }
  }
  return pgPool;
}

async function queryPg(sqlText, params = []) {
  const pool = getPgPool();
  if (!pool) return null;
  const res = await pool.query(sqlText, params);
  return res.rows;
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
  getPgPool,
  queryPg,
  supabaseQuery
};
