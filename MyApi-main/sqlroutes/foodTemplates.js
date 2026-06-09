const express = require("express");
const db = require("../sqlconnection");
const auth = require("../routes/auth");
const { parseJsonArray } = require("../common/parseMysqlJson");
const router = express.Router();

// POST: Create a new food template
router.post("/foodtemplates", auth, (req, res) => {
  try {
    const { name, description, food_items, nutritionist_id } = req.body;

    // Validate required fields
    if (!name || !food_items || !nutritionist_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get a connection from the pool
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Start a transaction
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return res.status(500).json({ error: "Database error" });
        }

        // First, insert the template
        const templateQuery = `
          INSERT INTO food_templates 
          (name, description, nutritionist_id, created_at)
          VALUES (?, ?, ?, NOW())
        `;

        connection.execute(templateQuery, [name, description || null, nutritionist_id], (err, result) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error creating template:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          const templateId = result.insertId;
          const foodItemsQuery = `
            INSERT INTO food_template_items 
            (template_id, food_item_id, quantity)
            VALUES ?
          `;

          // Prepare the values for bulk insert
          const values = food_items.map(item => [templateId, item.food_item_id, item.quantity]);

          connection.query(foodItemsQuery, [values], (err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                console.error("Error adding food items to template:", err);
                return res.status(500).json({ error: "Database error" });
              });
              return;
            }

            // Commit the transaction
            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  connection.release();
                  console.error("Error committing transaction:", err);
                  return res.status(500).json({ error: "Database error" });
                });
                return;
              }

              connection.release();
              res.status(201).json({
                message: "Food template created successfully",
                template: {
                  id: templateId,
                  name,
                  description,
                  nutritionist_id,
                  food_items
                }
              });
            });
          });
        });
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

// GET: Get all food templates for a nutritionist
router.get("/foodtemplates/nutritionist/:nutritionist_id", auth, (req, res) => {
  const { nutritionist_id } = req.params;

  const query = `
    SELECT 
      ft.id,
      ft.name,
      ft.description,
      ft.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'food_item_id', fti.food_item_id,
          'quantity', fti.quantity,
          'name', fi.name,
          'kcal', fi.kcal,
          'p', fi.p,
          'c', fi.c,
          'f', fi.f,
          'image', fi.image,
          'isVeg', fi.isVeg,
          'mealType', fi.mealType
        )
      ) as food_items
    FROM food_templates ft
    LEFT JOIN food_template_items fti ON ft.id = fti.template_id
    LEFT JOIN food_items fi ON fti.food_item_id = fi.id
    WHERE ft.nutritionist_id = ?
    GROUP BY ft.id
  `;

  db.execute(query, [nutritionist_id], (err, results) => {
    if (err) {
      console.error("Error fetching food templates:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const templates = results.map((template) => ({
      ...template,
      food_items: parseJsonArray(template.food_items),
    }));

    res.json(templates);
  });
});

// GET: Get a single food template
router.get("/foodtemplates/:id", auth, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      ft.id,
      ft.name,
      ft.description,
      ft.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'food_item_id', fti.food_item_id,
          'quantity', fti.quantity,
          'name', fi.name,
          'kcal', fi.kcal,
          'p', fi.p,
          'c', fi.c,
          'f', fi.f,
          'image', fi.image,
          'isVeg', fi.isVeg,
          'mealType', fi.mealType
        )
      ) as food_items
    FROM food_templates ft
    LEFT JOIN food_template_items fti ON ft.id = fti.template_id
    LEFT JOIN food_items fi ON fti.food_item_id = fi.id
    WHERE ft.id = ?
    GROUP BY ft.id
  `;

  db.execute(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching food template:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Food template not found" });
    }

    const template = {
      ...results[0],
      food_items: parseJsonArray(results[0].food_items),
    };

    res.json(template);
  });
});

// PUT: Update a food template
router.put("/foodtemplates/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, food_items } = req.body;

    // Get a connection from the pool
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Start a transaction
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return res.status(500).json({ error: "Database error" });
        }

        // Update the template
        const templateQuery = `
          UPDATE food_templates 
          SET name = ?, description = ?
          WHERE id = ?
        `;

        connection.execute(templateQuery, [name, description || null, id], (err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error updating template:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          // Delete existing food items
          const deleteQuery = "DELETE FROM food_template_items WHERE template_id = ?";
          connection.execute(deleteQuery, [id], (err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                console.error("Error deleting existing food items:", err);
                return res.status(500).json({ error: "Database error" });
              });
              return;
            }

            // Insert new food items
            if (food_items && food_items.length > 0) {
              const insertQuery = `
                INSERT INTO food_template_items 
                (template_id, food_item_id, quantity)
                VALUES ?
              `;

              const values = food_items.map(item => [id, item.food_item_id, item.quantity]);

              connection.query(insertQuery, [values], (err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.error("Error adding food items to template:", err);
                    return res.status(500).json({ error: "Database error" });
                  });
                  return;
                }

                // Commit the transaction
                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => {
                      connection.release();
                      console.error("Error committing transaction:", err);
                      return res.status(500).json({ error: "Database error" });
                    });
                    return;
                  }

                  connection.release();
                  res.json({
                    message: "Food template updated successfully",
                    template: {
                      id,
                      name,
                      description,
                      food_items
                    }
                  });
                });
              });
            } else {
              // Commit the transaction if no food items to add
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.error("Error committing transaction:", err);
                    return res.status(500).json({ error: "Database error" });
                  });
                  return;
                }

                connection.release();
                res.json({
                  message: "Food template updated successfully",
                  template: {
                    id,
                    name,
                    description,
                    food_items: []
                  }
                });
              });
            }
          });
        });
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

// DELETE: Delete a food template
router.delete("/foodtemplates/:id", auth, (req, res) => {
  const { id } = req.params;

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // First delete the food items
    const deleteItemsQuery = "DELETE FROM food_template_items WHERE template_id = ?";
    db.execute(deleteItemsQuery, [id], (err) => {
      if (err) {
        db.rollback(() => {
          console.error("Error deleting food items:", err);
          return res.status(500).json({ error: "Database error" });
        });
        return;
      }

      // Then delete the template
      const deleteTemplateQuery = "DELETE FROM food_templates WHERE id = ?";
      db.execute(deleteTemplateQuery, [id], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error("Error deleting template:", err);
            return res.status(500).json({ error: "Database error" });
          });
          return;
        }

        if (result.affectedRows === 0) {
          db.rollback(() => {
            return res.status(404).json({ message: "Food template not found" });
          });
          return;
        }

        // Commit the transaction
        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              console.error("Error committing transaction:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          res.json({
            message: "Food template deleted successfully"
          });
        });
      });
    });
  });
});

module.exports = router; 