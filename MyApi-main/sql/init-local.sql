-- Schema for Good Gut Project API
-- Database is selected by scripts/init-db.js via DB_DATABASE in .env
-- Run: npm run db:init

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserLogins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  signupdate DATETIME,
  isActive TINYINT DEFAULT 0,
  auth_token VARCHAR(512),
  auth_provider VARCHAR(50) DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS UserData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  gender VARCHAR(50),
  dob DATE,
  height DECIMAL(10,2),
  weight DECIMAL(10,2),
  medical TEXT,
  goal VARCHAR(255),
  bodyfat DECIMAL(10,2),
  workout VARCHAR(255),
  food VARCHAR(255),
  occupation VARCHAR(255),
  onboarded TINYINT DEFAULT 0,
  targetWeight DECIMAL(10,2),
  assignNutritionist INT,
  FOREIGN KEY (userId) REFERENCES UserLogins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MealByDate (
  mealId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  mealDate DATE NOT NULL,
  name VARCHAR(255),
  quantity VARCHAR(100),
  kcal DECIMAL(10,2),
  p DECIMAL(10,2),
  c DECIMAL(10,2),
  f DECIMAL(10,2),
  image VARCHAR(512),
  isVeg TINYINT,
  mealType VARCHAR(50),
  isSelected TINYINT DEFAULT 0,
  isTargetMeal TINYINT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES UserLogins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DailyTrack (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  selectedDate DATE NOT NULL,
  sleepHours DECIMAL(10,2) DEFAULT 0,
  waterIntake DECIMAL(10,2) DEFAULT 0,
  steps INT DEFAULT 0,
  UNIQUE KEY uk_user_date (userId, selectedDate),
  FOREIGN KEY (userId) REFERENCES UserLogins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  imageUrl VARCHAR(512),
  description TEXT,
  url VARCHAR(512),
  nutritionist_id INT NULL,
  INDEX idx_flyers_nutritionist (nutritionist_id)
);

CREATE TABLE IF NOT EXISTS faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT,
  answer TEXT,
  nutritionist_id INT NULL,
  INDEX idx_faq_nutritionist (nutritionist_id)
);

CREATE TABLE IF NOT EXISTS exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exerciseName VARCHAR(255),
  type VARCHAR(100),
  videoLink VARCHAR(512),
  muscleType VARCHAR(100),
  workoutSteps TEXT,
  nutritionist_id INT NULL,
  INDEX idx_exercises_nutritionist (nutritionist_id)
);

CREATE TABLE IF NOT EXISTS user_exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  exerciseId INT NOT NULL,
  date DATE,
  FOREIGN KEY (userId) REFERENCES UserLogins(id) ON DELETE CASCADE,
  FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nutritionists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  phone_number VARCHAR(50),
  specialty VARCHAR(255),
  years_of_experience INT,
  current_organisation VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(512),
  nutritionist_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_nutritionist (nutritionist_id)
);

CREATE TABLE IF NOT EXISTS food_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity VARCHAR(100),
  kcal DECIMAL(10,2),
  p DECIMAL(10,2),
  c DECIMAL(10,2),
  f DECIMAL(10,2),
  image VARCHAR(512),
  isVeg TINYINT,
  isSelected TINYINT DEFAULT 0,
  mealType VARCHAR(50),
  nutritionist_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_food_items_nutritionist (nutritionist_id)
);

CREATE TABLE IF NOT EXISTS Slots (
  SlotID INT AUTO_INCREMENT PRIMARY KEY,
  SlotTime TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS NutritionistSlots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutritionist_id INT NOT NULL,
  SlotID INT NOT NULL,
  Date DATE NOT NULL,
  availability TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id) ON DELETE CASCADE,
  FOREIGN KEY (SlotID) REFERENCES Slots(SlotID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS userCalls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nutritionist_id INT NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES UserLogins(id) ON DELETE CASCADE,
  FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GenInfo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT
);

-- From sql/migrations/create_nutritionist_clients_table.sql
CREATE TABLE IF NOT EXISTS nutritionist_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutritionist_id INT NOT NULL,
  client_id INT NOT NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id),
  FOREIGN KEY (client_id) REFERENCES UserLogins(id),
  UNIQUE KEY unique_nutritionist_client (nutritionist_id, client_id)
);

-- From sql/food_templates.sql
CREATE TABLE IF NOT EXISTS food_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  nutritionist_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS food_template_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  food_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES food_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- From sql/diet_plans.sql
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

CREATE TABLE IF NOT EXISTS diet_plan_meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diet_plan_id INT NOT NULL,
  day_of_week INT NOT NULL,
  meal_type VARCHAR(50) NOT NULL,
  food_item_id INT,
  template_id INT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES food_templates(id) ON DELETE CASCADE
);

-- From sql/diet_templates.sql
CREATE TABLE IF NOT EXISTS diet_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutritionist_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nutritionist_id) REFERENCES nutritionists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diet_template_meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diet_template_id INT NOT NULL,
  day_of_week INT NOT NULL,
  meal_type VARCHAR(50) NOT NULL,
  food_item_id INT,
  template_id INT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diet_template_id) REFERENCES diet_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES food_templates(id) ON DELETE CASCADE
);
