-- MySQL schema for users_db
CREATE DATABASE IF NOT EXISTS users_db;
USE users_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Optional seed (commented out)
-- INSERT INTO users (username, email, password) VALUES ('admin', 'admin@example.com', '123456');

