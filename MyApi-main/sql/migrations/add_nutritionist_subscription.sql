-- Nutritionist SaaS subscription (15-day trial, then ₹1000/year via Razorpay)

ALTER TABLE nutritionists
  ADD COLUMN subscription_status ENUM('trialing', 'active', 'expired') NOT NULL DEFAULT 'trialing',
  ADD COLUMN trial_ends_at TIMESTAMP NULL,
  ADD COLUMN subscription_ends_at TIMESTAMP NULL,
  ADD COLUMN razorpay_order_id VARCHAR(64) NULL,
  ADD COLUMN razorpay_payment_id VARCHAR(64) NULL,
  ADD COLUMN last_payment_at TIMESTAMP NULL;

-- Existing practices: start trial window from account creation
UPDATE nutritionists
SET
  subscription_status = 'trialing',
  trial_ends_at = DATE_ADD(COALESCE(created_at, NOW()), INTERVAL 15 DAY)
WHERE trial_ends_at IS NULL;
