-- Paid subscription invoices for nutritionist billing history

CREATE TABLE IF NOT EXISTS nutritionist_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutritionist_id INT NOT NULL,
  invoice_number VARCHAR(32) NOT NULL,
  amount_inr DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  description VARCHAR(255) NOT NULL,
  plan_type VARCHAR(32) NOT NULL DEFAULT 'annual',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  razorpay_order_id VARCHAR(64) NULL,
  razorpay_payment_id VARCHAR(64) NULL,
  status ENUM('paid', 'refunded') NOT NULL DEFAULT 'paid',
  paid_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_invoice_number (invoice_number),
  KEY idx_nutritionist_invoices_nutritionist (nutritionist_id),
  CONSTRAINT fk_nutritionist_invoices_nutritionist
    FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id) ON DELETE CASCADE
);
