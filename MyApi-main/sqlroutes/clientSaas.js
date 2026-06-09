/**
 * Mobile client SaaS helpers — additive routes only.
 * Resolves tenant from JWT → UserData.assignNutritionist.
 */
const express = require("express");
const db = require("../sqlconnection");
const auth = require("../routes/auth");
const { getClientNutritionistId } = require("../common/clientNutritionist");

const router = express.Router();
const pool = db.promise();

// GET assigned nutritionist profile (for appointments, branding)
router.get("/client/nutritionist", auth, async (req, res) => {
  try {
    const userId = req.userInfo?.user?.id;
    const nutritionistId = await getClientNutritionistId(userId);

    if (!nutritionistId) {
      return res.status(404).json({
        error: "No nutritionist assigned to this account",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone_number, specialty,
              years_of_experience, current_organisation, address
       FROM nutritionists WHERE id = ?`,
      [nutritionistId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }

    const n = rows[0];
    res.json({
      id: n.id,
      name: `${n.first_name} ${n.last_name}`.trim(),
      first_name: n.first_name,
      last_name: n.last_name,
      email: n.email,
      phone_number: n.phone_number,
      specialty: n.specialty,
      years_of_experience: n.years_of_experience,
      current_organisation: n.current_organisation,
      address: n.address,
    });
  } catch (err) {
    console.error("Error fetching client nutritionist:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET available slots for the client's assigned nutritionist on a date
router.get("/client/slots/:date", auth, async (req, res) => {
  try {
    const userId = req.userInfo?.user?.id;
    const { date } = req.params;
    const nutritionistId = await getClientNutritionistId(userId);

    if (!nutritionistId) {
      return res.status(400).json({ error: "No nutritionist assigned to this account" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const [rows] = await pool.execute(
      `SELECT ns.SlotID, s.SlotTime, ns.availability
       FROM NutritionistSlots ns
       JOIN Slots s ON ns.SlotID = s.SlotID
       WHERE ns.nutritionist_id = ?
         AND DATE(ns.Date) = ?
         AND ns.availability = 1
         AND NOT EXISTS (
           SELECT 1
           FROM userCalls uc
           WHERE uc.nutritionist_id = ns.nutritionist_id
             AND uc.scheduled_date = DATE(ns.Date)
             AND uc.scheduled_time = s.SlotTime
             AND uc.status IN ('pending', 'scheduled', 'in_progress')
         )
       ORDER BY s.SlotTime`,
      [nutritionistId, date]
    );

    res.json({
      nutritionist_id: nutritionistId,
      date,
      slots: rows,
    });
  } catch (err) {
    console.error("Error fetching client slots:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET exercises assigned to the logged-in client by their nutritionist
router.get("/client/exercises/assigned", auth, async (req, res) => {
  try {
    const userId = req.userInfo?.user?.id;
    const nutritionistId = await getClientNutritionistId(userId);

    if (!nutritionistId) {
      return res.status(400).json({ error: "No nutritionist assigned to this account" });
    }

    const [rows] = await pool.execute(
      `SELECT ue.id AS assignment_id, ue.date, ue.exerciseId,
              e.exerciseName, e.type, e.videoLink, e.muscleType, e.workoutSteps, e.nutritionist_id
       FROM user_exercises ue
       JOIN exercises e ON e.id = ue.exerciseId
       WHERE ue.userId = ? AND e.nutritionist_id = ?
       ORDER BY ue.date DESC, ue.id DESC`,
      [userId, nutritionistId]
    );

    res.json({
      nutritionist_id: nutritionistId,
      assignments: rows,
    });
  } catch (err) {
    console.error("Error fetching assigned exercises:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
