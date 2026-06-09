const express = require("express");
const cors = require("../routes/cors");
const db = require("../sqlconnection");
const router = express.Router();
const optionalAuth = require("../routes/optionalAuth");
const {
  getClientNutritionistId,
  tenantOnlyClause,
} = require("../common/clientNutritionist");

router.get("/faq", cors, optionalAuth, async (req, res) => {
  try {
    let nutritionistId = null;
    const userId = req.userInfo?.user?.id;
    if (userId) {
      nutritionistId = await getClientNutritionistId(userId);
    }

    let query;
    let params;
    if (nutritionistId) {
      query = `SELECT id, question, answer, nutritionist_id FROM faq
               WHERE ${tenantOnlyClause("nutritionist_id")} ORDER BY id`;
      params = [nutritionistId];
    } else {
      query =
        "SELECT id, question, answer, nutritionist_id FROM faq WHERE nutritionist_id IS NULL ORDER BY id";
      params = [];
    }

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching FAQ:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
