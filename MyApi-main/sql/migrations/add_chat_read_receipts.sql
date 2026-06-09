-- Read receipts: when nutritionist opens chat, client messages get read_by_nutritionist_at
ALTER TABLE chat_messages
  ADD COLUMN read_by_nutritionist_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN read_by_client_at TIMESTAMP NULL DEFAULT NULL;
