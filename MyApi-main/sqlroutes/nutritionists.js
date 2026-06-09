const express = require("express");
const db = require("../sqlconnection");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");
const {
  getNutritionistClientRelationship,
} = require("../common/nutritionistClientAccess");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ggpKey = process.env.GGP_SECRET_KEY; // Use the same secret key as the rest of the app
const {
  TRIAL_DAYS,
  subscriptionPayload,
  pickNutritionistRow,
} = require("../common/subscription");

function formatNutritionistPublic(n) {
  return {
    id: n.id,
    first_name: n.first_name,
    last_name: n.last_name,
    email: n.email,
    phone_number: n.phone_number,
    specialty: n.specialty,
    years_of_experience: n.years_of_experience,
    current_organisation: n.current_organisation,
    address: n.address,
    ...subscriptionPayload(pickNutritionistRow(n)),
  };
}

router.post("/nutritionists/signup", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      specialty,
      years_of_experience,
      current_organisation,
      address
    } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if email already exists
    const checkEmailQuery = "SELECT id FROM nutritionists WHERE email = ?";
    db.execute(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new nutritionist into the database
    const query = `
      INSERT INTO nutritionists 
      (first_name, last_name, email, password, phone_number, specialty, years_of_experience, current_organisation, address, subscription_status, trial_ends_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'trialing', DATE_ADD(NOW(), INTERVAL ${TRIAL_DAYS} DAY), NOW(), NOW())
    `;

    db.execute(query, [first_name, last_name, email, hashedPassword, phone_number || null, specialty || null, years_of_experience || null, current_organisation || null, address || null], (err, result) => {
      if (err) {
        console.error("Error signing up nutritionist:", err);
        return res.status(500).json({ error: "Database error" });
      }

        // Generate JWT token
        const payload = { user: { id: result.insertId, role: 'nutritionist' } };
        const token = jwt.sign(payload, ggpKey, { expiresIn: '10h' });

      res.status(201).json({
        message: `Nutritionist signed up successfully. Your ${TRIAL_DAYS}-day free trial (worth ₹1,000) has started.`,
          token,
        nutritionist: formatNutritionistPublic({
          id: result.insertId,
          first_name,
          last_name,
          email,
          phone_number,
          specialty,
          years_of_experience,
          current_organisation,
          address,
          subscription_status: "trialing",
          trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 86400000),
          subscription_ends_at: null,
          created_at: new Date(),
        })
        });
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

router.put("/nutritionists/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone_number, specialty, years_of_experience, current_organisation, address } = req.body;

    // Build dynamic SET clause based on the provided fields
    let setClause = [];
    let values = [];

    if (first_name) {
      setClause.push("first_name = ?");
      values.push(first_name);
    }
    if (last_name) {
      setClause.push("last_name = ?");
      values.push(last_name);
    }
    if (email) {
      setClause.push("email = ?");
      values.push(email);
    }
    if (phone_number) {
      setClause.push("phone_number = ?");
      values.push(phone_number);
    }
    if (specialty) {
      setClause.push("specialty = ?");
      values.push(specialty);
    }
    if (years_of_experience) {
      setClause.push("years_of_experience = ?");
      values.push(years_of_experience);
    }
    if (current_organisation) {
      setClause.push("current_organisation = ?");
      values.push(current_organisation);
    }
    if (address) {
      setClause.push("address = ?");
      values.push(address);
    }

    // If no valid fields are passed for update, return error
    if (setClause.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    // Add the nutritionist ID at the end of values array
    values.push(id);

    // Construct the dynamic query for the update
    const query = `
      UPDATE nutritionists 
      SET ${setClause.join(", ")}, updated_at = NOW() 
      WHERE id = ?
    `;

    db.execute(query, values, (err, result) => {
      if (err) {
        console.error("Error updating nutritionist:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nutritionist not found" });
      }

      res.json({
        message: "Nutritionist updated successfully",
        nutritionist: {
          id,
          first_name,
          last_name,
          email,
          phone_number,
          specialty,
          years_of_experience,
          current_organisation,
          address
        }
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

router.post("/nutritionists/login", async (req, res) => {
  try {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const query = "SELECT * FROM nutritionists WHERE email = ?";
  db.execute(query, [email], async (err, results) => {
    if (err) {
      console.error("Error fetching nutritionist:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const nutritionist = results[0];

      // Verify password
    const isPasswordValid = await bcrypt.compare(password, nutritionist.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
      const payload = { user: { id: nutritionist.id, role: 'nutritionist' } };
      const token = jwt.sign(payload, ggpKey, { expiresIn: '10h' });

    res.json({
      message: "Login successful",
      token,
        nutritionist: formatNutritionistPublic(nutritionist)
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

router.get("/nutritionists/:id/clients", nutritionistOrAdminAuth, async (req, res) => {
  try {
    const nutritionistId = req.params.id;

    if (
      !req.isAdminApiKey &&
      (req.userInfo.user.id !== parseInt(nutritionistId, 10) ||
        req.userInfo.user.role !== "nutritionist")
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const query = `
      SELECT 
        u.id as client_id,
        u.name,
        u.email,
        ud.gender,
        ud.dob,
        ud.height,
        ud.weight,
        ud.targetWeight,
        ud.occupation,
        ud.onboarded,
        ud.medical,
        ud.goal,
        ud.workout,
        ud.food,
        ud.bodyfat,
        nc.status,
        nc.start_date,
        nc.notes
      FROM nutritionist_clients nc
      JOIN UserLogins u ON nc.client_id = u.id
      LEFT JOIN UserData ud ON u.id = ud.userId
      WHERE nc.nutritionist_id = ?
      ORDER BY nc.created_at DESC
    `;

    db.execute(query, [nutritionistId], (err, results) => {
      if (err) {
        console.error("Error fetching clients:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

router.get(
  "/nutritionists/:nutritionistId/clients/:clientId/profile",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId, clientId } = req.params;

      const relationship = await getNutritionistClientRelationship(
        req,
        res,
        nutritionistId,
        clientId
      );
      if (!relationship) return;

      const query = `
        SELECT
          u.id AS client_id,
          u.name,
          u.email,
          ud.gender,
          ud.dob,
          ud.height,
          ud.weight,
          ud.targetWeight,
          ud.bodyfat,
          ud.medical,
          ud.goal,
          ud.workout,
          ud.food,
          ud.occupation,
          ud.onboarded,
          ud.assignNutritionist
        FROM UserLogins u
        LEFT JOIN UserData ud ON u.id = ud.userId
        WHERE u.id = ?
      `;

      db.execute(query, [clientId], (err, results) => {
        if (err) {
          console.error("Error fetching client profile:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Client account not found" });
        }

        const profile = results[0];
        res.json({
          ...profile,
          relationship: {
            status: relationship.status,
            notes: relationship.notes,
            start_date: relationship.start_date,
            created_at: relationship.created_at,
          },
        });
      });
    } catch (err) {
      console.error("Server error:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// PUT: Update client status or notes
router.put("/nutritionists/:nutritionistId/clients/:clientId", nutritionistOrAdminAuth, async (req, res) => {
  try {
    const { nutritionistId, clientId } = req.params;
    const { status, notes } = req.body;

    if (
      !req.isAdminApiKey &&
      (req.userInfo.user.id !== parseInt(nutritionistId, 10) ||
        req.userInfo.user.role !== "nutritionist")
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Build update query based on provided fields
    let updates = [];
    let values = [];

    if (status) {
      updates.push("status = ?");
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(nutritionistId, clientId);

    const query = `
      UPDATE nutritionist_clients
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE nutritionist_id = ? AND client_id = ?
    `;

    db.execute(query, values, (err, result) => {
      if (err) {
        console.error("Error updating client relationship:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Client relationship not found" });
      }

      res.json({
        message: "Client relationship updated successfully",
        updates: { status, notes }
      });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

// DELETE: Remove a client from a nutritionist
router.delete("/nutritionists/:nutritionistId/clients/:clientId", nutritionistOrAdminAuth, async (req, res) => {
  try {
    const { nutritionistId, clientId } = req.params;

    if (
      !req.isAdminApiKey &&
      (req.userInfo.user.id !== parseInt(nutritionistId, 10) ||
        req.userInfo.user.role !== "nutritionist")
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const query = `
      DELETE FROM nutritionist_clients
      WHERE nutritionist_id = ? AND client_id = ?
    `;

    db.execute(query, [nutritionistId, clientId], (err, result) => {
      if (err) {
        console.error("Error removing client:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Client relationship not found" });
      }

      res.json({ message: "Client removed successfully" });
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;