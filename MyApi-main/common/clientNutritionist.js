const db = require("../sqlconnection");

const pool = db.promise();

/**
 * Returns the nutritionist id assigned to a client (UserData.assignNutritionist).
 */
async function getClientNutritionistId(userId) {
  if (!userId) return null;
  const [rows] = await pool.execute(
    "SELECT assignNutritionist FROM UserData WHERE userId = ? LIMIT 1",
    [userId]
  );
  return rows[0]?.assignNutritionist ?? null;
}

/**
 * SQL fragment: rows for this nutritionist plus platform-wide defaults (NULL tenant).
 */
function tenantOrGlobalClause(column = "nutritionist_id") {
  return `(${column} = ? OR ${column} IS NULL)`;
}

/**
 * Strict SaaS: only content owned by the client's assigned nutritionist.
 */
function tenantOnlyClause(column = "nutritionist_id") {
  return `${column} = ?`;
}

module.exports = {
  getClientNutritionistId,
  tenantOrGlobalClause,
  tenantOnlyClause,
  pool,
};
