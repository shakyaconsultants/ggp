/**
 * SaaS portal — nutritionist-scoped client registration.
 * Clients are created by their nutritionist (or admin); there is no public self-signup.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../sqlconnection");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");

const router = express.Router();
const pool = db.promise();

function nameFromEmail(email) {
  const local = (email || "").split("@")[0] || "Client";
  return local.replace(/[._+-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function nutritionistClientSignup(req, res) {
  const nutritionistId = parseInt(req.params.nutritionistId, 10);

  if (
    !req.isAdminApiKey &&
    (req.userInfo.user.id !== nutritionistId ||
      req.userInfo.user.role !== "nutritionist")
  ) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const { name, email, password, notes } = req.body;
  const plainPassword = password;
  const displayName = (name && String(name).trim()) || nameFromEmail(email);

  if (!email || !plainPassword) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!displayName) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  if (plainPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  const trimmedEmail = String(email).trim().toLowerCase();

  let connection;
  try {
    const [existing] = await pool.execute(
      "SELECT id FROM UserLogins WHERE email = ?",
      [trimmedEmail]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "User Already Registred" });
    }

    const [nutritionistRows] = await pool.execute(
      "SELECT id FROM nutritionists WHERE id = ?",
      [nutritionistId]
    );
    if (nutritionistRows.length === 0) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    const signupdate = new Date();

    // Client accounts are active immediately — no email activation step
    const [userResult] = await connection.execute(
      `INSERT INTO UserLogins (name, email, password, signupdate, auth_provider, isActive)
       VALUES (?, ?, ?, ?, 'local', 1)`,
      [displayName, trimmedEmail, hashedPassword, signupdate]
    );

    const clientId = userResult.insertId;

    await connection.execute(
      `INSERT INTO UserData (userId, assignNutritionist, onboarded)
       VALUES (?, ?, 0)`,
      [clientId, nutritionistId]
    );

    await connection.execute(
      `INSERT INTO nutritionist_clients (nutritionist_id, client_id, notes, status)
       VALUES (?, ?, ?, 'active')`,
      [nutritionistId, clientId, notes || null]
    );

    await connection.commit();

    return res.status(201).json({
      msg: "User registred successfully",
      message: "Client signed up and linked to your practice.",
      client: {
        id: clientId,
        name: displayName,
        email: trimmedEmail,
        nutritionist_id: nutritionistId,
        status: "active",
        profileComplete: false,
      },
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Nutritionist client signup error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Client is already assigned to this nutritionist" });
    }
    return res.status(500).json({ error: "Failed to register client" });
  } finally {
    if (connection) connection.release();
  }
}

router.post(
  "/saas/nutritionists/:nutritionistId/clients/signup",
  nutritionistOrAdminAuth,
  nutritionistClientSignup
);

module.exports = router;
