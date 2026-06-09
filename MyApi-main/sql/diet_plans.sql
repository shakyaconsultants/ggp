-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nutritionist_id INT NOT NULL,
    client_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES UserLogins(id) ON DELETE CASCADE
);

-- Create diet_plan_meals table
CREATE TABLE IF NOT EXISTS diet_plan_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diet_plan_id INT NOT NULL,
    day_of_week INT NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
    meal_type VARCHAR(50) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    food_item_id INT,
    template_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES food_templates(id) ON DELETE CASCADE,
    CHECK (food_item_id IS NOT NULL OR template_id IS NOT NULL),
    CHECK (food_item_id IS NULL OR template_id IS NULL)
); 