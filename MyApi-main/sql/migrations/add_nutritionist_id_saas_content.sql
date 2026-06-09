-- SaaS: scope mobile app content (flyers, FAQ, shop, exercises) per nutritionist.
-- NULL nutritionist_id = platform-wide default visible to all clients.

ALTER TABLE flyers
  ADD COLUMN nutritionist_id INT NULL,
  ADD INDEX idx_flyers_nutritionist (nutritionist_id);

ALTER TABLE faq
  ADD COLUMN nutritionist_id INT NULL,
  ADD INDEX idx_faq_nutritionist (nutritionist_id);

ALTER TABLE exercises
  ADD COLUMN nutritionist_id INT NULL,
  ADD INDEX idx_exercises_nutritionist (nutritionist_id);

ALTER TABLE products
  ADD COLUMN nutritionist_id INT NULL,
  ADD INDEX idx_products_nutritionist (nutritionist_id);

ALTER TABLE food_items
  ADD COLUMN nutritionist_id INT NULL,
  ADD INDEX idx_food_items_nutritionist (nutritionist_id);
