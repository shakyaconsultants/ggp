const db = require("../sqlconnection");
const pool = db.promise();

function canAccessNutritionistRoute(req, nutritionistId) {
  if (req.isAdminApiKey) return true;
  return (
    req.userInfo?.user?.role === "nutritionist" &&
    req.userInfo.user.id === parseInt(nutritionistId, 10)
  );
}

/**
 * Ensures client belongs to nutritionist via nutritionist_clients + assignNutritionist.
 * Returns relationship row or null (response already sent on auth failure).
 */
async function getNutritionistClientRelationship(req, res, nutritionistId, clientId) {
  if (!canAccessNutritionistRoute(req, nutritionistId)) {
    res.status(403).json({ error: "Unauthorized access" });
    return null;
  }

  const [rows] = await pool.execute(
    `SELECT nc.client_id, nc.status, nc.notes, nc.start_date, nc.created_at,
            ud.assignNutritionist
     FROM nutritionist_clients nc
     LEFT JOIN UserData ud ON ud.userId = nc.client_id
     WHERE nc.nutritionist_id = ? AND nc.client_id = ?
     LIMIT 1`,
    [nutritionistId, clientId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Client not found for this nutritionist" });
    return null;
  }

  const relationship = rows[0];
  if (
    relationship.assignNutritionist != null &&
    Number(relationship.assignNutritionist) !== Number(nutritionistId)
  ) {
    res.status(403).json({ error: "Client is not assigned to your practice" });
    return null;
  }

  return relationship;
}

module.exports = {
  canAccessNutritionistRoute,
  getNutritionistClientRelationship,
};
