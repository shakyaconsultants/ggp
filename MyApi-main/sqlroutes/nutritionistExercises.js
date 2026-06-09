/**
 * Nutritionist exercise library + assign exercises to clients (SaaS).
 */
const express = require("express");
const db = require("../sqlconnection");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");
const {
  getNutritionistClientRelationship,
} = require("../common/nutritionistClientAccess");

const router = express.Router();
const pool = db.promise();

function canAccess(req, nutritionistId) {
  if (req.isAdminApiKey) return true;
  return (
    req.userInfo?.user?.role === "nutritionist" &&
    req.userInfo.user.id === parseInt(nutritionistId, 10)
  );
}

async function getOwnedExercise(nutritionistId, exerciseId) {
  const [rows] = await pool.execute(
    "SELECT * FROM exercises WHERE id = ? AND nutritionist_id = ?",
    [exerciseId, nutritionistId]
  );
  return rows[0] || null;
}

// GET exercise library for nutritionist
router.get(
  "/nutritionists/:nutritionistId/exercises",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId } = req.params;
      if (!canAccess(req, nutritionistId)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const [rows] = await pool.execute(
        `SELECT id, exerciseName, type, videoLink, muscleType, workoutSteps, nutritionist_id
         FROM exercises WHERE nutritionist_id = ? ORDER BY id DESC`,
        [nutritionistId]
      );

      res.json(rows);
    } catch (err) {
      console.error("Error fetching nutritionist exercises:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// POST create exercise
router.post(
  "/nutritionists/:nutritionistId/exercises",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId } = req.params;
      if (!canAccess(req, nutritionistId)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const { exerciseName, type, videoLink, muscleType, workoutSteps } = req.body;
      if (!exerciseName || !type) {
        return res.status(400).json({ error: "exerciseName and type are required" });
      }

      const [result] = await pool.execute(
        `INSERT INTO exercises (exerciseName, type, videoLink, muscleType, workoutSteps, nutritionist_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          exerciseName,
          type,
          videoLink || null,
          muscleType || null,
          workoutSteps || null,
          nutritionistId,
        ]
      );

      res.status(201).json({
        message: "Exercise created successfully",
        exercise: {
          id: result.insertId,
          exerciseName,
          type,
          videoLink,
          muscleType,
          workoutSteps,
          nutritionist_id: Number(nutritionistId),
        },
      });
    } catch (err) {
      console.error("Error creating exercise:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// PUT update exercise
router.put(
  "/nutritionists/:nutritionistId/exercises/:exerciseId",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId, exerciseId } = req.params;
      if (!canAccess(req, nutritionistId)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const existing = await getOwnedExercise(nutritionistId, exerciseId);
      if (!existing) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      const { exerciseName, type, videoLink, muscleType, workoutSteps } = req.body;
      await pool.execute(
        `UPDATE exercises SET exerciseName = ?, type = ?, videoLink = ?, muscleType = ?, workoutSteps = ?
         WHERE id = ? AND nutritionist_id = ?`,
        [
          exerciseName ?? existing.exerciseName,
          type ?? existing.type,
          videoLink ?? existing.videoLink,
          muscleType ?? existing.muscleType,
          workoutSteps ?? existing.workoutSteps,
          exerciseId,
          nutritionistId,
        ]
      );

      res.json({ message: "Exercise updated successfully" });
    } catch (err) {
      console.error("Error updating exercise:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// DELETE exercise
router.delete(
  "/nutritionists/:nutritionistId/exercises/:exerciseId",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId, exerciseId } = req.params;
      if (!canAccess(req, nutritionistId)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const [result] = await pool.execute(
        "DELETE FROM exercises WHERE id = ? AND nutritionist_id = ?",
        [exerciseId, nutritionistId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      res.json({ message: "Exercise deleted successfully" });
    } catch (err) {
      console.error("Error deleting exercise:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// GET exercises assigned to a client
router.get(
  "/nutritionists/:nutritionistId/clients/:clientId/exercises",
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

      const [rows] = await pool.execute(
        `SELECT ue.id AS assignment_id, ue.date, ue.userId, ue.exerciseId,
                e.exerciseName, e.type, e.videoLink, e.muscleType, e.workoutSteps
         FROM user_exercises ue
         JOIN exercises e ON e.id = ue.exerciseId
         WHERE ue.userId = ? AND e.nutritionist_id = ?
         ORDER BY ue.date DESC, ue.id DESC`,
        [clientId, nutritionistId]
      );

      res.json({ assignments: rows });
    } catch (err) {
      console.error("Error fetching client exercise assignments:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// POST assign exercise to client
router.post(
  "/nutritionists/:nutritionistId/clients/:clientId/exercises",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId, clientId } = req.params;
      const { exerciseId, date } = req.body;

      const relationship = await getNutritionistClientRelationship(
        req,
        res,
        nutritionistId,
        clientId
      );
      if (!relationship) return;

      if (!exerciseId) {
        return res.status(400).json({ error: "exerciseId is required" });
      }

      const exercise = await getOwnedExercise(nutritionistId, exerciseId);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found in your library" });
      }

      const assignDate =
        date || new Date().toISOString().slice(0, 10);

      const [result] = await pool.execute(
        "INSERT INTO user_exercises (userId, exerciseId, date) VALUES (?, ?, ?)",
        [clientId, exerciseId, assignDate]
      );

      res.status(201).json({
        message: "Exercise assigned to client successfully",
        assignment: {
          id: result.insertId,
          userId: Number(clientId),
          exerciseId: Number(exerciseId),
          date: assignDate,
          exerciseName: exercise.exerciseName,
        },
      });
    } catch (err) {
      console.error("Error assigning exercise:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// DELETE unassign exercise from client
router.delete(
  "/nutritionists/:nutritionistId/clients/:clientId/exercises/:assignmentId",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const { nutritionistId, clientId, assignmentId } = req.params;

      const relationship = await getNutritionistClientRelationship(
        req,
        res,
        nutritionistId,
        clientId
      );
      if (!relationship) return;

      const [result] = await pool.execute(
        `DELETE ue FROM user_exercises ue
         JOIN exercises e ON e.id = ue.exerciseId
         WHERE ue.id = ? AND ue.userId = ? AND e.nutritionist_id = ?`,
        [assignmentId, clientId, nutritionistId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.json({ message: "Exercise unassigned from client" });
    } catch (err) {
      console.error("Error unassigning exercise:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

module.exports = router;
