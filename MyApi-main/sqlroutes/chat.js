const express = require("express");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");
const auth = require("../routes/auth");
const {
  getNutritionistClientRelationship,
} = require("../common/nutritionistClientAccess");
const {
  authClientChat,
  createMessage,
  listMessages,
  markMessagesRead,
} = require("../common/chatService");

const router = express.Router();

function broadcastReadReceipts(req, nutritionistId, clientId, readerRole, receipts) {
  if (!receipts?.length || !req.app.locals.broadcastChatReadReceipts) return;
  req.app.locals.broadcastChatReadReceipts(
    nutritionistId,
    clientId,
    readerRole,
    receipts
  );
}

router.get(
  "/nutritionists/:nutritionistId/clients/:clientId/chat/messages",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const nutritionistId = parseInt(req.params.nutritionistId, 10);
      const clientId = parseInt(req.params.clientId, 10);
      const rel = await getNutritionistClientRelationship(
        req,
        res,
        nutritionistId,
        clientId
      );
      if (!rel) return;

      const messages = await listMessages(nutritionistId, clientId, req.query.limit);
      res.json({ messages });
    } catch (err) {
      console.error("Chat history error:", err);
      res.status(err.status || 500).json({ error: err.message || "Server error" });
    }
  }
);

router.post(
  "/nutritionists/:nutritionistId/clients/:clientId/chat/messages",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const nutritionistId = parseInt(req.params.nutritionistId, 10);
      const clientId = parseInt(req.params.clientId, 10);
      const rel = await getNutritionistClientRelationship(
        req,
        res,
        nutritionistId,
        clientId
      );
      if (!rel) return;

      const message = await createMessage({
        nutritionistId,
        clientId,
        senderType: "nutritionist",
        senderId: nutritionistId,
        body: req.body?.body ?? req.body?.text,
      });

      if (req.app.locals.broadcastChatMessage) {
        req.app.locals.broadcastChatMessage(message);
      }

      res.status(201).json({ message });
    } catch (err) {
      console.error("Chat send error:", err);
      res.status(err.status || 500).json({ error: err.message || "Server error" });
    }
  }
);

router.post(
  "/nutritionists/:nutritionistId/clients/:clientId/chat/read",
  nutritionistOrAdminAuth,
  async (req, res) => {
    try {
      const nutritionistId = parseInt(req.params.nutritionistId, 10);
      const clientId = parseInt(req.params.clientId, 10);
      const rel = await getNutritionistClientRelationship(
        req,
        res,
        nutritionistId,
        clientId
      );
      if (!rel) return;

      const receipts = await markMessagesRead(nutritionistId, clientId, "nutritionist");
      broadcastReadReceipts(req, nutritionistId, clientId, "nutritionist", receipts);
      res.json({ receipts });
    } catch (err) {
      console.error("Chat read error:", err);
      res.status(err.status || 500).json({ error: err.message || "Server error" });
    }
  }
);

router.get("/client/chat/messages", auth, async (req, res) => {
  try {
    const session = await authClientChat(
      req.header("Authorization")?.replace("Bearer ", "")
    );
    const messages = await listMessages(
      session.nutritionistId,
      session.clientId,
      req.query.limit
    );
    res.json({ messages, nutritionist_id: session.nutritionistId });
  } catch (err) {
    console.error("Client chat history error:", err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

router.post("/client/chat/messages", auth, async (req, res) => {
  try {
    const session = await authClientChat(
      req.header("Authorization")?.replace("Bearer ", "")
    );
    const message = await createMessage({
      nutritionistId: session.nutritionistId,
      clientId: session.clientId,
      senderType: "client",
      senderId: session.clientId,
      body: req.body?.body ?? req.body?.text,
    });

    if (req.app.locals.broadcastChatMessage) {
      req.app.locals.broadcastChatMessage(message);
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error("Client chat send error:", err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

router.post("/client/chat/read", auth, async (req, res) => {
  try {
    const session = await authClientChat(
      req.header("Authorization")?.replace("Bearer ", "")
    );
    const receipts = await markMessagesRead(
      session.nutritionistId,
      session.clientId,
      "client"
    );
    broadcastReadReceipts(
      req,
      session.nutritionistId,
      session.clientId,
      "client",
      receipts
    );
    res.json({ receipts });
  } catch (err) {
    console.error("Client chat read error:", err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
