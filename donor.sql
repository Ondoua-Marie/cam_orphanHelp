CREATE DATABASE orphanage_db;
USE orphanage_db;

CREATE TABLE donors(
    donor_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), phone VARCHAR(20)
);

CREATE TABLE donations(
    donation_id INT AUTO_INCREMENT PRIMARY KEY, donor_id INT, amount DECIMAL(10,2), donation_date DATE_TIME DEFAULT CURRENT_TIMESTAMP, FOREIGN_KEY (donor_id) REFERENCES donors(donor_id)
);

INSERT INTO donors (name, email, phone)
VALUES();
INSERT INTO donations (donor_id, amount)
VALUES();

SELECT donors.name, donations.amount, donations.donation_date
FROM donors
JOIN donations ON donors.donor_id = donations.donor_id;