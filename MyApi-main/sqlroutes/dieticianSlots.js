const express = require("express");
const db = require("../sqlconnection");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");
const { canAccessNutritionistRoute } = require("../common/nutritionistClientAccess");
const { ACTIVE_CALL_STATUSES } = require("../common/callScheduling");

const router = express.Router();
const pool = db.promise();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ACTIVE_STATUS_SQL = ACTIVE_CALL_STATUSES.map(() => "?").join(", ");

function normalizeSlotPayload(body) {
  if (Array.isArray(body.slots)) {
    return body.slots.map((slot) => ({
      slotId: Number(slot.slot_id ?? slot.SlotID),
      available: Boolean(slot.available),
    }));
  }

  if (Array.isArray(body.SlotID)) {
    return body.SlotID.map((slot) => ({
      slotId: Number(slot.SlotID ?? slot.slot_id),
      available: Boolean(slot.available),
    }));
  }

  return [];
}

async function fetchSlotGrid(nutritionistId, date) {
  const [rows] = await pool.execute(
    `SELECT s.SlotID,
            s.SlotTime,
            COALESCE(ns.availability, 0) AS availability,
            EXISTS (
              SELECT 1
              FROM userCalls uc
              WHERE uc.nutritionist_id = ?
                AND uc.scheduled_date = ?
                AND uc.scheduled_time = s.SlotTime
                AND uc.status IN (${ACTIVE_STATUS_SQL})
            ) AS is_booked
     FROM Slots s
     LEFT JOIN NutritionistSlots ns
       ON ns.SlotID = s.SlotID
      AND ns.nutritionist_id = ?
      AND DATE(ns.Date) = ?
     ORDER BY s.SlotTime ASC`,
    [nutritionistId, date, ...ACTIVE_CALL_STATUSES, nutritionistId, date]
  );

  return rows.map((row) => ({
    SlotID: row.SlotID,
    SlotTime: row.SlotTime,
    availability: Boolean(row.availability),
    is_booked: Boolean(row.is_booked),
  }));
}

router.post("/nutritionist/slots", nutritionistOrAdminAuth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { nutritionist_id, date } = req.body;
    const nutritionistId = parseInt(nutritionist_id, 10);
    const slots = normalizeSlotPayload(req.body);

    if (!nutritionistId || !date || !DATE_RE.test(date)) {
      return res.status(400).json({ error: "nutritionist_id and date (YYYY-MM-DD) are required" });
    }

    if (!canAccessNutritionistRoute(req, nutritionistId)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    if (slots.length === 0) {
      return res.status(400).json({ error: "Provide slots: [{ slot_id, available }, ...]" });
    }

    await connection.beginTransaction();

    for (const slot of slots) {
      if (!Number.isFinite(slot.slotId)) {
        throw new Error("Invalid slot_id in payload");
      }

      const [validSlot] = await connection.execute(
        "SELECT SlotID FROM Slots WHERE SlotID = ? LIMIT 1",
        [slot.slotId]
      );

      if (validSlot.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: `Slot ${slot.slotId} does not exist` });
      }

      const [booked] = await connection.execute(
        `SELECT 1
         FROM userCalls uc
         JOIN Slots s ON s.SlotID = ?
         WHERE uc.nutritionist_id = ?
           AND uc.scheduled_date = ?
           AND uc.scheduled_time = s.SlotTime
           AND uc.status IN (${ACTIVE_STATUS_SQL})
         LIMIT 1`,
        [slot.slotId, nutritionistId, date, ...ACTIVE_CALL_STATUSES]
      );

      if (booked.length > 0 && slot.available) {
        await connection.rollback();
        return res.status(409).json({
          error: `Slot ${slot.slotId} is already booked and cannot be marked available`,
        });
      }

      const [existing] = await connection.execute(
        `SELECT id FROM NutritionistSlots
         WHERE nutritionist_id = ? AND SlotID = ? AND DATE(Date) = ?
         LIMIT 1`,
        [nutritionistId, slot.slotId, date]
      );

      if (existing.length > 0) {
        await connection.execute(
          `UPDATE NutritionistSlots
           SET availability = ?, updated_at = NOW()
           WHERE id = ?`,
          [slot.available ? 1 : 0, existing[0].id]
        );
      } else if (slot.available) {
        await connection.execute(
          `INSERT INTO NutritionistSlots (nutritionist_id, SlotID, Date, availability, created_at, updated_at)
           VALUES (?, ?, ?, 1, NOW(), NOW())`,
          [nutritionistId, slot.slotId, date]
        );
      }
    }

    await connection.commit();

    const grid = await fetchSlotGrid(nutritionistId, date);
    res.status(200).json({
      message: "Availability saved",
      nutritionist_id: nutritionistId,
      date,
      slots: grid,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error saving nutritionist slots:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
  }
});

// GET: Nutritionist availability grid for a date
router.get("/nutritionist/slots/:nutritionist_id/:date", async (req, res) => {
  try {
    const nutritionistId = parseInt(req.params.nutritionist_id, 10);
    const { date } = req.params;

    if (!Number.isFinite(nutritionistId) || !DATE_RE.test(date)) {
      return res.status(400).json({ error: "Invalid nutritionist_id or date format (YYYY-MM-DD)" });
    }

    const slots = await fetchSlotGrid(nutritionistId, date);

    res.json({
      nutritionist_id: nutritionistId,
      date,
      slots,
    });
  } catch (err) {
    console.error("Error fetching nutritionist slots:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
