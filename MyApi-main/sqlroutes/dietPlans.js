const express = require("express");
const db = require("../sqlconnection");
const auth = require("../routes/auth");
const { normalizeDietMeals } = require("../common/parseMysqlJson");
const router = express.Router();

// POST: Create a new diet plan
router.post("/dietplans", auth, (req, res) => {
  try {
    const { nutritionist_id, client_id, start_date, end_date, notes, meals } = req.body;

    // Validate required fields
    if (!nutritionist_id || !client_id || !start_date || !end_date || !meals) {
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

        // First, insert the diet plan
        const dietPlanQuery = `
          INSERT INTO diet_plans 
          (nutritionist_id, client_id, start_date, end_date, notes)
          VALUES (?, ?, ?, ?, ?)
        `;

        connection.execute(dietPlanQuery, [nutritionist_id, client_id, start_date, end_date, notes || null], (err, result) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error creating diet plan:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          const dietPlanId = result.insertId;
          const mealsQuery = `
            INSERT INTO diet_plan_meals 
            (diet_plan_id, day_of_week, meal_type, food_item_id, template_id, quantity)
            VALUES ?
          `;

          // Prepare the values for bulk insert
          const values = meals.map(meal => [
            dietPlanId,
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
                console.error("Error adding meals to diet plan:", err);
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
                message: "Diet plan created successfully",
                diet_plan: {
                  id: dietPlanId,
                  nutritionist_id,
                  client_id,
                  start_date,
                  end_date,
                  notes,
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

// GET: Get all diet plans for a nutritionist
router.get("/dietplans/nutritionist/:nutritionist_id", auth, (req, res) => {
  const { nutritionist_id } = req.params;

  const query = `
    SELECT 
      dp.id,
      dp.client_id,
      dp.start_date,
      dp.end_date,
      dp.notes,
      dp.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', dpm.id,
          'day_of_week', dpm.day_of_week,
          'meal_type', dpm.meal_type,
          'food_item_id', dpm.food_item_id,
          'template_id', dpm.template_id,
          'quantity', dpm.quantity,
          'food_item', CASE 
            WHEN dpm.food_item_id IS NOT NULL THEN JSON_OBJECT(
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
            WHEN dpm.template_id IS NOT NULL THEN JSON_OBJECT(
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
    FROM diet_plans dp
    LEFT JOIN diet_plan_meals dpm ON dp.id = dpm.diet_plan_id
    LEFT JOIN food_items fi ON dpm.food_item_id = fi.id
    LEFT JOIN food_templates ft ON dpm.template_id = ft.id
    WHERE dp.nutritionist_id = ?
    GROUP BY dp.id
  `;

  db.execute(query, [nutritionist_id], (err, results) => {
    if (err) {
      console.error("Error fetching diet plans:", err);
      return res.status(500).json({ error: "Database error" });
    }

    try {
      // Parse the meals JSON string and handle nested JSON
      const dietPlans = results.map((plan) => ({
        ...plan,
        meals: normalizeDietMeals(plan.meals),
      }));

      res.json(dietPlans);
    } catch (err) {
      console.error("Error processing diet plans:", err);
      res.status(500).json({ error: "Error processing diet plans data" });
    }
  });
});

// GET: Active diet plan for the logged-in client (mobile app)
router.get("/dietplans/me", auth, (req, res) => {
  const clientId = req.userInfo?.user?.id;

  const query = `
    SELECT 
      dp.id,
      dp.client_id,
      dp.nutritionist_id,
      dp.start_date,
      dp.end_date,
      dp.notes,
      dp.created_at,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', dpm.id,
            'day_of_week', dpm.day_of_week,
            'meal_type', dpm.meal_type,
            'food_item_id', dpm.food_item_id,
            'template_id', dpm.template_id,
            'quantity', dpm.quantity,
            'food_item', CASE 
              WHEN dpm.food_item_id IS NOT NULL THEN JSON_OBJECT(
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
              WHEN dpm.template_id IS NOT NULL THEN JSON_OBJECT(
                'id', ft.id,
                'name', ft.name,
                'description', ft.description,
                'food_items', (
                  SELECT COALESCE(
                    JSON_ARRAYAGG(
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
                    ),
                    JSON_ARRAY()
                  )
                  FROM food_template_items fti
                  LEFT JOIN food_items fi ON fti.food_item_id = fi.id
                  WHERE fti.template_id = ft.id
                )
              )
              ELSE NULL
            END
          )
        ),
        JSON_ARRAY()
      ) as meals
    FROM diet_plans dp
    LEFT JOIN diet_plan_meals dpm ON dp.id = dpm.diet_plan_id
    LEFT JOIN food_items fi ON dpm.food_item_id = fi.id
    LEFT JOIN food_templates ft ON dpm.template_id = ft.id
    WHERE dp.client_id = ?
      AND dp.id = (
        SELECT dp2.id FROM diet_plans dp2
        WHERE dp2.client_id = ?
        ORDER BY
          CASE WHEN CURDATE() BETWEEN dp2.start_date AND dp2.end_date THEN 0 ELSE 1 END,
          dp2.end_date DESC,
          dp2.created_at DESC
        LIMIT 1
      )
    GROUP BY dp.id
  `;

  db.execute(query, [clientId, clientId], (err, results) => {
    if (err) {
      console.error("Error fetching client diet plan:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No diet plan assigned yet" });
    }

    const plan = results[0];
    res.json({
      ...plan,
      meals: normalizeDietMeals(plan.meals),
    });
  });
});

// GET: Get a single diet plan
router.get("/dietplans/:id", auth, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      dp.id,
      dp.client_id,
      dp.nutritionist_id,
      dp.start_date,
      dp.end_date,
      dp.notes,
      dp.created_at,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', dpm.id,
            'day_of_week', dpm.day_of_week,
            'meal_type', dpm.meal_type,
            'food_item_id', dpm.food_item_id,
            'template_id', dpm.template_id,
            'quantity', dpm.quantity,
            'food_item', CASE 
              WHEN dpm.food_item_id IS NOT NULL THEN JSON_OBJECT(
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
              WHEN dpm.template_id IS NOT NULL THEN JSON_OBJECT(
                'id', ft.id,
                'name', ft.name,
                'description', ft.description,
                'food_items', (
                  SELECT COALESCE(
                    JSON_ARRAYAGG(
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
                    ),
                    JSON_ARRAY()
                  )
                  FROM food_template_items fti
                  LEFT JOIN food_items fi ON fti.food_item_id = fi.id
                  WHERE fti.template_id = ft.id
                )
              )
              ELSE NULL
            END
          )
        ),
        JSON_ARRAY()
      ) as meals
    FROM diet_plans dp
    LEFT JOIN diet_plan_meals dpm ON dp.id = dpm.diet_plan_id
    LEFT JOIN food_items fi ON dpm.food_item_id = fi.id
    LEFT JOIN food_templates ft ON dpm.template_id = ft.id
    WHERE dp.id = ?
    GROUP BY dp.id
  `;

  db.execute(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching diet plan:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Diet plan not found" });
    }

    const plan = results[0];
    const requesterId = req.userInfo?.user?.id;
    const isClient = plan.client_id === requesterId;
    const isNutritionist = plan.nutritionist_id === requesterId;

    if (!isClient && !isNutritionist) {
      return res.status(403).json({ error: "You can only view your own diet plan" });
    }

    try {
      res.json({
        ...plan,
        meals: normalizeDietMeals(plan.meals),
      });
    } catch (err) {
      console.error("Error processing diet plan:", err);
      res.status(500).json({ error: "Error processing diet plan data" });
    }
  });
});

// PUT: Update a diet plan
router.put("/dietplans/:id", auth, (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, notes, meals } = req.body;

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

        // Update the diet plan
        const dietPlanQuery = `
          UPDATE diet_plans 
          SET start_date = ?, end_date = ?, notes = ?
          WHERE id = ?
        `;

        connection.execute(dietPlanQuery, [start_date, end_date, notes || null, id], (err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error updating diet plan:", err);
              return res.status(500).json({ error: "Database error" });
            });
            return;
          }

          // Delete existing meals
          const deleteQuery = "DELETE FROM diet_plan_meals WHERE diet_plan_id = ?";
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
              // Extract template IDs from meals
              const templateIds = meals
                .map(meal => meal.template_id)
                .filter(id => id !== null);

              // If there are template IDs, validate them first
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

                  // Check if all template IDs exist
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

                  // Proceed with inserting meals
                  insertMeals();
                });
              } else {
                // If no template IDs, proceed with inserting meals
                insertMeals();
              }

              function insertMeals() {
                const insertQuery = `
                  INSERT INTO diet_plan_meals 
                  (diet_plan_id, day_of_week, meal_type, food_item_id, template_id, quantity)
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
                      console.error("Error adding meals to diet plan:", err);
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
                      message: "Diet plan updated successfully",
                      diet_plan: {
                        id,
                        start_date,
                        end_date,
                        notes,
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
                  message: "Diet plan updated successfully",
                  diet_plan: {
                    id,
                    start_date,
                    end_date,
                    notes,
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

// DELETE: Delete a diet plan
router.delete("/dietplans/:id", auth, (req, res) => {
  const { id } = req.params;

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // First delete the meals
    const deleteMealsQuery = "DELETE FROM diet_plan_meals WHERE diet_plan_id = ?";
    db.execute(deleteMealsQuery, [id], (err) => {
      if (err) {
        db.rollback(() => {
          console.error("Error deleting meals:", err);
          return res.status(500).json({ error: "Database error" });
        });
        return;
      }

      // Then delete the diet plan
      const deletePlanQuery = "DELETE FROM diet_plans WHERE id = ?";
      db.execute(deletePlanQuery, [id], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error("Error deleting diet plan:", err);
            return res.status(500).json({ error: "Database error" });
          });
          return;
        }

        if (result.affectedRows === 0) {
          db.rollback(() => {
            return res.status(404).json({ message: "Diet plan not found" });
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
            message: "Diet plan deleted successfully"
          });
        });
      });
    });
  });
});

module.exports = router; 