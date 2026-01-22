CREATE DATABASE IF NOT EXISTS cam_orphan;
USE cam_orphan;

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id int NOT NULL AUTO_INCREMENT,
  donorName varchar(255) NOT NULL,
  phone varchar(50) NOT NULL,
  orphanage varchar(255) DEFAULT NULL,
  relayPoint varchar(255) DEFAULT NULL,
  donationType varchar(50) DEFAULT NULL,
  paymentMethod varchar(50) DEFAULT NULL,
  amount decimal(12,2) DEFAULT NULL,
  imagePath varchar(255) DEFAULT NULL,
  description text,
  address text,
  donationDate datetime DEFAULT NULL,
  donationStatus varchar(50) DEFAULT 'Pending',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  userEmail varchar(255) DEFAULT NULL,
  PRIMARY KEY (id)
);

-- Create relay_points table
CREATE TABLE IF NOT EXISTS relay_points (
  id int NOT NULL AUTO_INCREMENT,
  location varchar(255) NOT NULL,
  manager varchar(255) DEFAULT NULL,
  phone varchar(50) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
);
