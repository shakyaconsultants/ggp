const jwt = require("jsonwebtoken");
const db = require("../sqlconnection");
const { getClientNutritionistId } = require("./clientNutritionist");

const pool = db.promise();
const ggpKey = process.env.GGP_SECRET_KEY;

function formatMessage(row) {
  return {
    id: row.id,
    nutritionist_id: row.nutritionist_id,
    client_id: row.client_id,
    sender_type: row.sender_type,
    sender_id: row.sender_id,
    body: row.body,
    read_by_nutritionist_at: row.read_by_nutritionist_at || null,
    read_by_client_at: row.read_by_client_at || null,
    created_at: row.created_at,
  };
}

async function assertNutritionistClientPair(nutritionistId, clientId) {
  const [rows] = await pool.execute(
    `SELECT nc.client_id, ud.assignNutritionist
     FROM nutritionist_clients nc
     LEFT JOIN UserData ud ON ud.userId = nc.client_id
     WHERE nc.nutritionist_id = ? AND nc.client_id = ?
     LIMIT 1`,
    [nutritionistId, clientId]
  );

  if (rows.length === 0) {
    const err = new Error("Client not found for this nutritionist");
    err.status = 404;
    throw err;
  }

  const rel = rows[0];
  if (
    rel.assignNutritionist != null &&
    Number(rel.assignNutritionist) !== Number(nutritionistId)
  ) {
    const err = new Error("Client is not assigned to this practice");
    err.status = 403;
    throw err;
  }

  return { nutritionistId: Number(nutritionistId), clientId: Number(clientId) };
}

function verifyToken(token) {
  if (!token) {
    const err = new Error("Access denied");
    err.status = 401;
    throw err;
  }
  try {
    return jwt.verify(token, ggpKey);
  } catch {
    const err = new Error("Invalid token");
    err.status = 401;
    throw err;
  }
}

async function authNutritionistChat(token, nutritionistId, clientId) {
  const decoded = verifyToken(token);
  if (
    decoded?.user?.role !== "nutritionist" ||
    Number(decoded.user.id) !== Number(nutritionistId)
  ) {
    const err = new Error("Unauthorized");
    err.status = 403;
    throw err;
  }
  await assertNutritionistClientPair(nutritionistId, clientId);
  return {
    role: "nutritionist",
    userId: Number(decoded.user.id),
    nutritionistId: Number(nutritionistId),
    clientId: Number(clientId),
  };
}

async function authClientChat(token) {
  const decoded = verifyToken(token);
  const clientId = decoded?.user?.id;
  if (!clientId) {
    const err = new Error("Unauthorized");
    err.status = 403;
    throw err;
  }

  const nutritionistId = await getClientNutritionistId(clientId);
  if (!nutritionistId) {
    const err = new Error("No nutritionist assigned");
    err.status = 404;
    throw err;
  }

  await assertNutritionistClientPair(nutritionistId, clientId);
  return {
    role: "client",
    userId: Number(clientId),
    nutritionistId: Number(nutritionistId),
    clientId: Number(clientId),
  };
}

async function listMessages(nutritionistId, clientId, limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const [rows] = await pool.execute(
    `SELECT id, nutritionist_id, client_id, sender_type, sender_id, body,
            read_by_nutritionist_at, read_by_client_at, created_at
     FROM chat_messages
     WHERE nutritionist_id = ? AND client_id = ?
     ORDER BY created_at ASC, id ASC
     LIMIT ${safeLimit}`,
    [nutritionistId, clientId]
  );
  return rows.map(formatMessage);
}

async function createMessage({ nutritionistId, clientId, senderType, senderId, body }) {
  const text = String(body || "").trim();
  if (!text) {
    const err = new Error("Message cannot be empty");
    err.status = 400;
    throw err;
  }
  if (text.length > 4000) {
    const err = new Error("Message is too long (max 4000 characters)");
    err.status = 400;
    throw err;
  }

  const [result] = await pool.execute(
    `INSERT INTO chat_messages (nutritionist_id, client_id, sender_type, sender_id, body)
     VALUES (?, ?, ?, ?, ?)`,
    [nutritionistId, clientId, senderType, senderId, text]
  );

  const [rows] = await pool.execute(
    `SELECT id, nutritionist_id, client_id, sender_type, sender_id, body,
            read_by_nutritionist_at, read_by_client_at, created_at
     FROM chat_messages WHERE id = ?`,
    [result.insertId]
  );

  return formatMessage(rows[0]);
}

async function markMessagesRead(nutritionistId, clientId, readerRole) {
  const column =
    readerRole === "nutritionist" ? "read_by_nutritionist_at" : "read_by_client_at";
  const senderType = readerRole === "nutritionist" ? "client" : "nutritionist";

  const [pending] = await pool.execute(
    `SELECT id FROM chat_messages
     WHERE nutritionist_id = ? AND client_id = ? AND sender_type = ? AND ${column} IS NULL`,
    [nutritionistId, clientId, senderType]
  );

  if (!pending.length) return [];

  const ids = pending.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  await pool.execute(
    `UPDATE chat_messages SET ${column} = NOW() WHERE id IN (${placeholders})`,
    ids
  );

  const [updated] = await pool.execute(
    `SELECT id, read_by_nutritionist_at, read_by_client_at FROM chat_messages
     WHERE id IN (${placeholders})`,
    ids
  );

  return updated.map((row) => ({
    id: row.id,
    read_by_nutritionist_at: row.read_by_nutritionist_at || null,
    read_by_client_at: row.read_by_client_at || null,
  }));
}

function roomKey(nutritionistId, clientId) {
  return `${nutritionistId}:${clientId}`;
}

module.exports = {
  assertNutritionistClientPair,
  authNutritionistChat,
  authClientChat,
  listMessages,
  createMessage,
  markMessagesRead,
  roomKey,
  formatMessage,
};
