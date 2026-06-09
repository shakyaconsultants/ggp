// foodItems.js
// This file contains the routes for the food items table in the database.
// It provides endpoints for CRUD operations on the food items.

const express = require("express");
const db = require("../sqlconnection");
const router = express.Router();
const optionalAuth = require("../routes/optionalAuth");
const auth = require("../routes/auth");
const {
  getClientNutritionistId,
  tenantOrGlobalClause,
} = require("../common/clientNutritionist");

// GET: food catalog — scoped to client's nutritionist when Bearer token is sent
router.get("/fooditems", optionalAuth, async (req, res) => {
  try {
    const { nutritionist_id: queryNutritionistId } = req.query;

    let query;
    let params;

    if (queryNutritionistId) {
      query =
        "SELECT * FROM food_items WHERE nutritionist_id = ? ORDER BY created_at DESC";
      params = [queryNutritionistId];
    } else {
      let nutritionistId = null;
      const userId = req.userInfo?.user?.id;
      if (userId) {
        nutritionistId = await getClientNutritionistId(userId);
      }

      if (nutritionistId) {
        query = `SELECT * FROM food_items WHERE ${tenantOrGlobalClause("nutritionist_id")} ORDER BY created_at DESC`;
        params = [nutritionistId];
      } else {
        query = "SELECT * FROM food_items ORDER BY created_at DESC";
        params = [];
      }
    }

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching food items:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// GET: Get food items by meal type (must be after /fooditems/nutritionist routes if any)
router.get("/fooditems/:mealType", optionalAuth, async (req, res) => {
  const { mealType } = req.params;
  if (mealType === "nutritionist") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { nutritionist_id: queryNutritionistId } = req.query;
    let query;
    let params;

    if (queryNutritionistId) {
      query =
        "SELECT * FROM food_items WHERE mealType = ? AND nutritionist_id = ? ORDER BY created_at DESC";
      params = [mealType, queryNutritionistId];
    } else {
      let nutritionistId = null;
      const userId = req.userInfo?.user?.id;
      if (userId) {
        nutritionistId = await getClientNutritionistId(userId);
      }

      if (nutritionistId) {
        query = `SELECT * FROM food_items WHERE mealType = ? AND ${tenantOrGlobalClause("nutritionist_id")} ORDER BY created_at DESC`;
        params = [mealType, nutritionistId];
      } else {
        query =
          "SELECT * FROM food_items WHERE mealType = ? ORDER BY created_at DESC";
        params = [mealType];
      }
    }

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching food items:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// POST: Add a new food item
router.post("/fooditems", (req, res) => {
  try {
    const {
      name,
      quantity,
      kcal,
      p,
      c,
      f,
      image,
      isVeg,
      isSelected,
      mealType,
      nutritionist_id,
    } = req.body;

    if (!name || !quantity || !kcal || !p || !c || !f || !mealType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO food_items 
      (name, quantity, kcal, p, c, f, image, isVeg, isSelected, mealType, nutritionist_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.execute(
      query,
      [name, quantity, kcal, p, c, f, image || null, isVeg, isSelected || false, mealType, nutritionist_id || null],
      (err, result) => {
        if (err) {
          console.error("Error adding food item:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
          message: "Food item added successfully",
          foodItem: {
            id: result.insertId,
            name,
            quantity,
            kcal,
            p,
            c,
            f,
            image,
            isVeg,
            isSelected,
            mealType
          }
        });
      }
    );
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

// PUT: Update a food item
router.put("/fooditems/:id", (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantity,
      kcal,
      p,
      c,
      f,
      image,
      isVeg,
      isSelected,
      mealType
    } = req.body;

    // Build dynamic SET clause based on the provided fields
    let setClause = [];
    let values = [];

    if (name) {
      setClause.push("name = ?");
      values.push(name);
    }
    if (quantity) {
      setClause.push("quantity = ?");
      values.push(quantity);
    }
    if (kcal) {
      setClause.push("kcal = ?");
      values.push(kcal);
    }
    if (p) {
      setClause.push("p = ?");
      values.push(p);
    }
    if (c) {
      setClause.push("c = ?");
      values.push(c);
    }
    if (f) {
      setClause.push("f = ?");
      values.push(f);
    }
    if (image !== undefined) {
      setClause.push("image = ?");
      values.push(image);
    }
    if (isVeg !== undefined) {
      setClause.push("isVeg = ?");
      values.push(isVeg);
    }
    if (isSelected !== undefined) {
      setClause.push("isSelected = ?");
      values.push(isSelected);
    }
    if (mealType) {
      setClause.push("mealType = ?");
      values.push(mealType);
    }

    // If no valid fields are passed for update, return error
    if (setClause.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    // Add the food item ID at the end of values array
    values.push(id);

    // Construct the dynamic query for the update
    const query = `
      UPDATE food_items 
      SET ${setClause.join(", ")}
      WHERE id = ?
    `;

    db.execute(query, values, (err, result) => {
      if (err) {
        console.error("Error updating food item:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.json({
        message: "Food item updated successfully",
        foodItem: {
          id,
          name,
          quantity,
          kcal,
          p,
          c,
          f,
          image,
          isVeg,
          isSelected,
          mealType
        }
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

// DELETE: Delete a food item
router.delete("/fooditems/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM food_items WHERE id = ?";
  
  db.execute(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting food item:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json({
      message: "Food item deleted successfully"
    });
  });
});

module.exports = router; 