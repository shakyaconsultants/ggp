const express = require("express");
const db = require("../sqlconnection");
const router = express.Router();
const optionalAuth = require("../routes/optionalAuth");
const {
  getClientNutritionistId,
  tenantOnlyClause,
} = require("../common/clientNutritionist");

function toAppProduct(row) {
  const price = Number(row.price) || 0;
  return {
    _id: String(row.id),
    name: row.name,
    image: row.image_url || "",
    originalPrice: price,
    discountedPrice: price,
    discount: 0,
    rating: 4.5,
    delivery: "2-3 days",
    description: row.description || "",
  };
}

router.get("/products", optionalAuth, async (req, res) => {
  try {
    const isMobileApp = Boolean(req.header("x-api-key"));
    let { category, min_price, max_price } = req.query;

    let nutritionistId = null;
    const userId = req.userInfo?.user?.id;
    if (userId) {
      nutritionistId = await getClientNutritionistId(userId);
    }

    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (nutritionistId) {
      query += ` AND ${tenantOnlyClause("nutritionist_id")}`;
      params.push(nutritionistId);
    } else if (isMobileApp) {
      query += " AND nutritionist_id IS NULL";
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (min_price) {
      query += " AND price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      query += " AND price <= ?";
      params.push(max_price);
    }

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (isMobileApp) {
        return res.json(results.map(toAppProduct));
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      res.json({
        message: "Products fetched successfully",
        products: results,
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
