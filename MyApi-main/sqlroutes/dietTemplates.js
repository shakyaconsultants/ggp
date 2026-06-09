const express = require("express");
const db = require("../sqlconnection");
const auth = require("../routes/auth");
const { normalizeDietMeals } = require("../common/parseMysqlJson");
const router = express.Router();

// POST: Create a new diet template
router.post("/diettemplates", auth, (req, res) => {
  try {
    const { nutritionist_id, name, description, meals } = req.body;

    // Validate required fields
    if (!nutritionist_id || !name || !meals) {
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

        // First, insert the diet template
        const dietTemplateQuery = `
          INSERT INTO diet_templates 
          (nutritionist_id, name, description)
          VALUES (?, ?, ?)
        `;

        connection.execute(dietTemplateQuery, [nutritionist_id, name, description || null], (err, result) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error creating diet template:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          const dietTemplateId = result.insertId;
          const mealsQuery = `
            INSERT INTO diet_template_meals 
            (diet_template_id, day_of_week, meal_type, food_item_id, template_id, quantity)
            VALUES ?
          `;

          // Prepare the values for bulk insert
          const values = meals.map(meal => [
            dietTemplateId,
            meal.day_of_week,
            meal.meal_type,
            meal.food_item_id || null,
            meal.template_id || null,
            meal.quantity || 1
          ]);

          connection.query(mealsQuery, [values], (err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                console.error("Error adding meals to diet template:", err);
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
                message: "Diet template created successfully",
                diet_template: {
                  id: dietTemplateId,
                  nutritionist_id,
                  name,
                  description,
                  meals
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

// GET: Get all diet templates for a nutritionist
router.get("/diettemplates/nutritionist/:nutritionist_id", auth, (req, res) => {
  const { nutritionist_id } = req.params;

  const query = `
    SELECT 
      dt.id,
      dt.name,
      dt.description,
      dt.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', dtm.id,
          'day_of_week', dtm.day_of_week,
          'meal_type', dtm.meal_type,
          'food_item_id', dtm.food_item_id,
          'template_id', dtm.template_id,
          'quantity', dtm.quantity,
          'food_item', CASE 
            WHEN dtm.food_item_id IS NOT NULL THEN JSON_OBJECT(
              'id', fi.id,
              'name', fi.name,
              'kcal', fi.kcal,
              'p', fi.p,
              'c', fi.c,
              'f', fi.f,
              'image', fi.image,
              'isVeg', fi.isVeg,
              'mealType', fi.mealType
            )
            ELSE NULL
          END,
          'template', CASE 
            WHEN dtm.template_id IS NOT NULL THEN JSON_OBJECT(
              'id', ft.id,
              'name', ft.name,
              'description', ft.description,
              'food_items', (
                SELECT GROUP_CONCAT(
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
                )
                FROM food_template_items fti
                LEFT JOIN food_items fi ON fti.food_item_id = fi.id
                WHERE fti.template_id = ft.id
              )
            )
            ELSE NULL
          END
        )
      ) as meals
    FROM diet_templates dt
    LEFT JOIN diet_template_meals dtm ON dt.id = dtm.diet_template_id
    LEFT JOIN food_items fi ON dtm.food_item_id = fi.id
    LEFT JOIN food_templates ft ON dtm.template_id = ft.id
    WHERE dt.nutritionist_id = ?
    GROUP BY dt.id
  `;

  db.execute(query, [nutritionist_id], (err, results) => {
    if (err) {
      console.error("Error fetching diet templates:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const dietTemplates = results.map((template) => ({
      ...template,
      meals: normalizeDietMeals(template.meals),
    }));

    res.json(dietTemplates);
  });
});

// GET: Get a single diet template
router.get("/diettemplates/:id", auth, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      dt.id,
      dt.name,
      dt.description,
      dt.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', dtm.id,
          'day_of_week', dtm.day_of_week,
          'meal_type', dtm.meal_type,
          'food_item_id', dtm.food_item_id,
          'template_id', dtm.template_id,
          'quantity', dtm.quantity,
          'food_item', CASE 
            WHEN dtm.food_item_id IS NOT NULL THEN JSON_OBJECT(
              'id', fi.id,
              'name', fi.name,
              'kcal', fi.kcal,
              'p', fi.p,
              'c', fi.c,
              'f', fi.f,
              'image', fi.image,
              'isVeg', fi.isVeg,
              'mealType', fi.mealType
            )
            ELSE NULL
          END,
          'template', CASE 
            WHEN dtm.template_id IS NOT NULL THEN JSON_OBJECT(
              'id', ft.id,
              'name', ft.name,
              'description', ft.description,
              'food_items', (
                SELECT GROUP_CONCAT(
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
                )
                FROM food_template_items fti
                LEFT JOIN food_items fi ON fti.food_item_id = fi.id
                WHERE fti.template_id = ft.id
              )
            )
            ELSE NULL
          END
        )
      ) as meals
    FROM diet_templates dt
    LEFT JOIN diet_template_meals dtm ON dt.id = dtm.diet_template_id
    LEFT JOIN food_items fi ON dtm.food_item_id = fi.id
    LEFT JOIN food_templates ft ON dtm.template_id = ft.id
    WHERE dt.id = ?
    GROUP BY dt.id
  `;

  db.execute(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching diet template:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Diet template not found" });
    }

    const dietTemplate = {
      ...results[0],
      meals: normalizeDietMeals(results[0].meals),
    };

    res.json(dietTemplate);
  });
});

// PUT: Update a diet template
router.put("/diettemplates/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, meals } = req.body;

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

        // Update the diet template
        const dietTemplateQuery = `
          UPDATE diet_templates 
          SET name = ?, description = ?
          WHERE id = ?
        `;

        connection.execute(dietTemplateQuery, [name, description || null, id], (err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error updating diet template:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          // Delete existing meals
          const deleteQuery = "DELETE FROM diet_template_meals WHERE diet_template_id = ?";
          connection.execute(deleteQuery, [id], (err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                console.error("Error deleting existing meals:", err);
                return res.status(500).json({ error: "Database error" });
              });
              return;
            }

            // Insert new meals
            if (meals && meals.length > 0) {
              // First, validate all template IDs
              const templateIds = meals
                .filter(meal => meal.template_id)
                .map(meal => meal.template_id);

              if (templateIds.length > 0) {
                const validateQuery = "SELECT id FROM food_templates WHERE id IN (?)";
                connection.query(validateQuery, [templateIds], (err, results) => {
                  if (err) {
                    connection.rollback(() => {
                      connection.release();
                      console.error("Error validating template IDs:", err);
                      return res.status(500).json({ error: "Database error" });
                    });
                    return;
                  }

                  const validTemplateIds = results.map(row => row.id);
                  const invalidTemplateIds = templateIds.filter(id => !validTemplateIds.includes(id));

                  if (invalidTemplateIds.length > 0) {
                    connection.rollback(() => {
                      connection.release();
                      return res.status(400).json({ 
                        error: "Invalid template IDs", 
                        invalidIds: invalidTemplateIds 
                      });
                    });
                    return;
                  }

                  // If all template IDs are valid, proceed with inserting meals
                  const insertQuery = `
                    INSERT INTO diet_template_meals 
                    (diet_template_id, day_of_week, meal_type, food_item_id, template_id, quantity)
                    VALUES ?
                  `;

                  const values = meals.map(meal => [
                    id,
                    meal.day_of_week,
                    meal.meal_type,
                    meal.food_item_id || null,
                    meal.template_id || null,
                    meal.quantity || 1
                  ]);

                  connection.query(insertQuery, [values], (err) => {
                    if (err) {
                      connection.rollback(() => {
                        connection.release();
                        console.error("Error adding meals to diet template:", err);
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
                        message: "Diet template updated successfully",
                        diet_template: {
                          id,
                          name,
                          description,
                          meals
                        }
                      });
                    });
                  });
                });
              } else {
                // If no template IDs to validate, proceed with inserting meals
                const insertQuery = `
                  INSERT INTO diet_template_meals 
                  (diet_template_id, day_of_week, meal_type, food_item_id, template_id, quantity)
                  VALUES ?
                `;

                const values = meals.map(meal => [
                  id,
                  meal.day_of_week,
                  meal.meal_type,
                  meal.food_item_id || null,
                  meal.template_id || null,
                  meal.quantity || 1
                ]);

                connection.query(insertQuery, [values], (err) => {
                  if (err) {
                    connection.rollback(() => {
                      connection.release();
                      console.error("Error adding meals to diet template:", err);
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
                      message: "Diet template updated successfully",
                      diet_template: {
                        id,
                        name,
                        description,
                        meals
                      }
                    });
                  });
                });
              }
            } else {
              // Commit the transaction if no meals to add
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
                  message: "Diet template updated successfully",
                  diet_template: {
                    id,
                    name,
                    description,
                    meals: []
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

// DELETE: Delete a diet template
router.delete("/diettemplates/:id", auth, (req, res) => {
  const { id } = req.params;

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // First delete the meals
    const deleteMealsQuery = "DELETE FROM diet_template_meals WHERE diet_template_id = ?";
    db.execute(deleteMealsQuery, [id], (err) => {
      if (err) {
        db.rollback(() => {
          console.error("Error deleting meals:", err);
          return res.status(500).json({ error: "Database error" });
        });
        return;
      }

      // Then delete the diet template
      const deleteTemplateQuery = "DELETE FROM diet_templates WHERE id = ?";
      db.execute(deleteTemplateQuery, [id], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error("Error deleting diet template:", err);
            return res.status(500).json({ error: "Database error" });
          });
          return;
        }

        if (result.affectedRows === 0) {
          db.rollback(() => {
            return res.status(404).json({ message: "Diet template not found" });
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
            message: "Diet template deleted successfully"
          });
        });
      });
    });
  });
});

module.exports = router; 