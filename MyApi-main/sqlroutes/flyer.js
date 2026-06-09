const express = require("express");
const cors = require("../routes/cors");
const db = require("../sqlconnection");
const router = express.Router();
const optionalAuth = require("../routes/optionalAuth");
const {
  getClientNutritionistId,
  tenantOnlyClause,
} = require("../common/clientNutritionist");

router.get("/flyer", cors, optionalAuth, async (req, res) => {
  try {
    let nutritionistId = null;
    const userId = req.userInfo?.user?.id;
    if (userId) {
      nutritionistId = await getClientNutritionistId(userId);
    }

    let query;
    let params;
    if (nutritionistId) {
      query = `SELECT id, name, imageUrl, description, url, nutritionist_id
               FROM flyers WHERE ${tenantOnlyClause("nutritionist_id")}
               ORDER BY id DESC`;
      params = [nutritionistId];
    } else {
      query =
        "SELECT id, name, imageUrl, description, url, nutritionist_id FROM flyers WHERE nutritionist_id IS NULL ORDER BY id DESC";
      params = [];
    }

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching flyers:", err);
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
