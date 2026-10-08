module.exports = async function handler(req, res) {
  const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL ? "Present" : "Missing";
  res.status(200).json({
    ok: true,
    message: "Himalaya Backend API is online!",
    databaseStatus: connStr,
    timestamp: new Date().toISOString()
  });
};
