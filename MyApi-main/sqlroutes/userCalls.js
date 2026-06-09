const express = require("express");
const db = require("../sqlconnection");
const auth = require("../routes/auth");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");
const { canAccessNutritionistRoute } = require("../common/nutritionistClientAccess");
const { buildJoinPayload } = require("../common/jitsiService");
const {
  ACTIVE_CALL_STATUSES,
  canJoinCall,
  joinWindowMessage,
  normalizeDateValue,
  formatDateLabel,
  normalizeTimeValue,
  formatTimeLabel,
} = require("../common/callScheduling");
const { getClientNutritionistId } = require("../common/clientNutritionist");

const router = express.Router();
const pool = db.promise();

const ACTIVE_STATUS_SQL = ACTIVE_CALL_STATUSES.map(() => "?").join(", ");

async function getCallById(callId) {
  const [rows] = await pool.execute(
    `SELECT uc.id, uc.user_id, uc.nutritionist_id, uc.slot_id,
            uc.scheduled_date, uc.scheduled_time, uc.status,
            ul.name AS client_name, ul.email AS client_email,
            CONCAT(n.first_name, ' ', n.last_name) AS nutritionist_name
     FROM userCalls uc
     JOIN UserLogins ul ON ul.id = uc.user_id
     JOIN nutritionists n ON n.id = uc.nutritionist_id
     WHERE uc.id = ?
     LIMIT 1`,
    [callId]
  );
  return rows[0] || null;
}

function decorateCallRow(call) {
  const scheduledDate = normalizeDateValue(call.scheduled_date);
  const inWindow = canJoinCall(scheduledDate, call.scheduled_time, "scheduled");
  const waitingForNutritionist =
    inWindow &&
    call.status !== "in_progress" &&
    call.status !== "completed" &&
    call.status !== "cancelled";

  return {
    ...call,
    scheduled_date: scheduledDate,
    scheduled_date_label: formatDateLabel(scheduledDate),
    scheduled_time_label: formatTimeLabel(call.scheduled_time),
    can_join: call.status === "in_progress",
    in_join_window: inWindow,
    waiting_for_nutritionist: waitingForNutritionist,
    join_window_message: waitingForNutritionist
      ? "Your nutritionist will start the call. Join opens once they are in the room."
      : joinWindowMessage(scheduledDate, call.scheduled_time),
  };
}

async function markCallInProgress(callId) {
  await pool.execute(
    "UPDATE userCalls SET status = 'in_progress', updated_at = NOW() WHERE id = ?",
    [callId]
  );
}

// POST: Schedule a call (client books an open slot)
router.post("/call", auth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.userInfo?.user?.id;
    const { scheduled_date, slot_id, scheduled_time } = req.body;
    const slotId = parseInt(slot_id, 10);

    if (!userId || !scheduled_date || !Number.isFinite(slotId)) {
      return res.status(400).json({
        error: "Missing required fields: scheduled_date and slot_id",
      });
    }

    const nutritionistId = await getClientNutritionistId(userId);
    if (!nutritionistId) {
      return res.status(400).json({ error: "No nutritionist assigned to this user" });
    }

    await connection.beginTransaction();

    const [slotRows] = await connection.execute(
      `SELECT s.SlotID, s.SlotTime
       FROM Slots s
       JOIN NutritionistSlots ns
         ON ns.SlotID = s.SlotID
        AND ns.nutritionist_id = ?
        AND DATE(ns.Date) = ?
       WHERE s.SlotID = ? AND ns.availability = 1
       LIMIT 1`,
      [nutritionistId, scheduled_date, slotId]
    );

    if (slotRows.length === 0) {
      await connection.rollback();
      return res.status(409).json({ error: "This time slot is not available" });
    }

    const slotTime = normalizeTimeValue(slotRows[0].SlotTime);
    const requestedTime = scheduled_time ? normalizeTimeValue(scheduled_time) : slotTime;

    if (requestedTime !== slotTime) {
      await connection.rollback();
      return res.status(400).json({ error: "slot_id does not match scheduled_time" });
    }

    const [existing] = await connection.execute(
      `SELECT id FROM userCalls
       WHERE nutritionist_id = ?
         AND scheduled_date = ?
         AND scheduled_time = ?
         AND status IN (${ACTIVE_STATUS_SQL})
       LIMIT 1`,
      [nutritionistId, scheduled_date, slotTime, ...ACTIVE_CALL_STATUSES]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: "This slot is already booked" });
    }

    const [duplicateUserCall] = await connection.execute(
      `SELECT id FROM userCalls
       WHERE user_id = ?
         AND scheduled_date = ?
         AND scheduled_time = ?
         AND status IN (${ACTIVE_STATUS_SQL})
       LIMIT 1`,
      [userId, scheduled_date, slotTime, ...ACTIVE_CALL_STATUSES]
    );

    if (duplicateUserCall.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: "You already have a call booked at this time" });
    }

    const [result] = await connection.execute(
      `INSERT INTO userCalls
         (user_id, nutritionist_id, slot_id, scheduled_date, scheduled_time, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'scheduled', NOW(), NOW())`,
      [userId, nutritionistId, slotId, scheduled_date, slotTime]
    );

    await connection.commit();

    res.status(201).json({
      message: "Call scheduled successfully",
      call_id: result.insertId,
      scheduled_date: normalizeDateValue(scheduled_date),
      scheduled_date_label: formatDateLabel(scheduled_date),
      scheduled_time: slotTime,
      scheduled_time_label: formatTimeLabel(slotTime),
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error scheduling call:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
  }
});

// GET: Client's scheduled calls
router.get("/calls", auth, async (req, res) => {
  try {
    const userId = req.userInfo?.user?.id;

    const [rows] = await pool.execute(
      `SELECT id, user_id, nutritionist_id, slot_id, scheduled_date, scheduled_time, status, created_at, updated_at
       FROM userCalls
       WHERE user_id = ?
       ORDER BY scheduled_date DESC, scheduled_time DESC`,
      [userId]
    );

    res.json({
      message: "User's scheduled calls fetched successfully",
      calls: rows.map(decorateCallRow),
    });
  } catch (err) {
    console.error("Error fetching user calls:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: Client updates own call (cancel)
router.put("/call/:call_id", auth, async (req, res) => {
  try {
    const userId = req.userInfo?.user?.id;
    const callId = parseInt(req.params.call_id, 10);
    const { status } = req.body;

    if (!Number.isFinite(callId) || !status) {
      return res.status(400).json({ error: "call_id and status are required" });
    }

    const call = await getCallById(callId);
    if (!call || call.user_id !== userId) {
      return res.status(404).json({ error: "Call not found" });
    }

    if (status === "cancelled") {
      if (call.status === "completed" || call.status === "cancelled") {
        return res.status(409).json({ error: `Cannot cancel a ${call.status} call` });
      }

      await pool.execute(
        "UPDATE userCalls SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
        [callId]
      );
      return res.json({ message: "Call cancelled" });
    }

    return res.status(400).json({ error: "Clients can only cancel calls" });
  } catch (err) {
    console.error("Error updating call:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Client join info for Jitsi
router.get("/calls/:call_id/join", auth, async (req, res) => {
  try {
    const userId = req.userInfo?.user?.id;
    const callId = parseInt(req.params.call_id, 10);

    if (!userId || Number.isNaN(callId)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const call = await getCallById(callId);
    if (!call || call.user_id !== userId) {
      return res.status(404).json({ error: "Call not found" });
    }

    const canJoin = canJoinCall(call.scheduled_date, call.scheduled_time, call.status);
    if (!canJoin) {
      return res.status(403).json({
        error: "Call is not open for joining yet",
        join_window_message: joinWindowMessage(call.scheduled_date, call.scheduled_time),
      });
    }

    if (call.status === "scheduled" || call.status === "pending") {
      return res.status(403).json({
        error: "Waiting for your nutritionist to start the call",
        waiting_for_nutritionist: true,
        join_window_message:
          "Your nutritionist must join first. You will be able to enter once the call has started.",
      });
    }

    const join = buildJoinPayload(call.id, call.client_name || "Client", {
      isModerator: false,
    });

    res.json({
      ...join,
      status: call.status,
      nutritionist_name: call.nutritionist_name,
      can_join: true,
      is_moderator: false,
    });
  } catch (err) {
    console.error("Error building client join info:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Nutritionist scheduled calls
router.get("/nutritionists/:nutritionistId/calls", nutritionistOrAdminAuth, async (req, res) => {
  try {
    const nutritionistId = parseInt(req.params.nutritionistId, 10);
    if (!canAccessNutritionistRoute(req, nutritionistId)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const [rows] = await pool.execute(
      `SELECT uc.id, uc.user_id, uc.nutritionist_id, uc.slot_id, uc.scheduled_date, uc.scheduled_time,
              uc.status, uc.created_at, uc.updated_at,
              ul.name AS client_name, ul.email AS client_email
       FROM userCalls uc
       JOIN UserLogins ul ON ul.id = uc.user_id
       WHERE uc.nutritionist_id = ?
       ORDER BY uc.scheduled_date DESC, uc.scheduled_time DESC`,
      [nutritionistId]
    );

    res.json({
      message: "Scheduled calls fetched successfully",
      calls: rows.map(decorateCallRow),
    });
  } catch (err) {
    console.error("Error fetching nutritionist calls:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: Nutritionist updates call status
router.put(
  "/nutritionists/:nutritionistId/calls/:call_id",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const nutritionistId = parseInt(req.params.nutritionistId, 10);
      const callId = parseInt(req.params.call_id, 10);
      const { status } = req.body;

      if (!canAccessNutritionistRoute(req, nutritionistId) || Number.isNaN(callId) || !status) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const call = await getCallById(callId);
      if (!call || call.nutritionist_id !== nutritionistId) {
        return res.status(404).json({ error: "Call not found" });
      }

      const allowed = ["scheduled", "in_progress", "completed", "cancelled"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await pool.execute(
        "UPDATE userCalls SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, callId]
      );

      res.json({ message: "Call updated", status });
    } catch (err) {
      console.error("Error updating nutritionist call:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET: Nutritionist join info for Jitsi
router.get(
  "/nutritionists/:nutritionistId/calls/:call_id/join",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const nutritionistId = parseInt(req.params.nutritionistId, 10);
      const callId = parseInt(req.params.call_id, 10);

      if (!canAccessNutritionistRoute(req, nutritionistId) || Number.isNaN(callId)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const call = await getCallById(callId);
      if (!call || call.nutritionist_id !== nutritionistId) {
        return res.status(404).json({ error: "Call not found" });
      }

      const canJoin = canJoinCall(call.scheduled_date, call.scheduled_time, call.status);
      if (!canJoin) {
        return res.status(403).json({
          error: "Call is not open for joining yet",
          join_window_message: joinWindowMessage(call.scheduled_date, call.scheduled_time),
        });
      }

      if (call.status === "scheduled" || call.status === "pending") {
        await markCallInProgress(callId);
        call.status = "in_progress";
      }

      const displayName =
        req.userInfo?.user?.first_name && req.userInfo?.user?.last_name
          ? `${req.userInfo.user.first_name} ${req.userInfo.user.last_name}`
          : call.nutritionist_name || "Nutritionist";

      const join = buildJoinPayload(call.id, displayName, { isModerator: true });

      res.json({
        ...join,
        status: call.status,
        client_name: call.client_name,
        can_join: true,
        is_moderator: true,
      });
    } catch (err) {
      console.error("Error building nutritionist join info:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
