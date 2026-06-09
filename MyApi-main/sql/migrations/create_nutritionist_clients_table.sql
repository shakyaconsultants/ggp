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