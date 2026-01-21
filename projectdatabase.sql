CREATE DATABASE cam_orphan;

USE cam_orphan;

-- ------------------ User TABLE ------------------

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

-- ------------------ Donation TABLE ------------------

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donorName VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  orphanage VARCHAR(255) NOT NULL,
  relayPoint VARCHAR(255) NOT NULL,
  goodsType VARCHAR(255) NOT NULL,
  imagePath VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  pickupFrom DATE NOT NULL,
  pickupStatus VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE donations
MODIFY orphanage VARCHAR(255) NULL,
MODIFY relayPoint VARCHAR(255) NULL,
MODIFY address TEXT NULL,
MODIFY description TEXT NULL;

-- ------------------ RELAY POINTS TABLE ------------------
CREATE TABLE IF NOT EXISTS relay_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    manager VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example relay points
INSERT INTO relay_points (location, manager, phone)
VALUES
('Carrefour des Soeur Messamendongo', 'Alice', '699111222'),
('Santa Lucia Mendong', 'Bob', '699333444'),
('Tradex Simbock', 'Charles', '699555666'),
('DOVV Simbock', 'Diana', '699777888'),
('Tradex Olembe', 'Eve', '699999000'),
('Tradex Emana', 'Frank', '699000111'),
('Neptune Nkozoa', 'Grace', '699222333');



