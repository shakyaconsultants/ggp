-- Nutritionist ↔ client chat messages (1 thread per pair)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutritionist_id INT NOT NULL,
  client_id INT NOT NULL,
  sender_type ENUM('nutritionist', 'client') NOT NULL,
  sender_id INT NOT NULL,
  body TEXT NOT NULL,
  read_by_nutritionist_at TIMESTAMP NULL DEFAULT NULL,
  read_by_client_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat_thread (nutritionist_id, client_id, created_at),
  INDEX idx_chat_client (client_id, created_at)
);
