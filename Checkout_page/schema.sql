CREATE DATABASE IF NOT EXISTS checkout;
USE checkout;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    checkout_request_id VARCHAR(50) NOT NULL,
    merchant_request_id VARCHAR(50),
    result_code INT NOT NULL,
    result_desc VARCHAR(255),
    amount DECIMAL(10,2),
    phone_number VARCHAR(20),
    mpesa_receipt_number VARCHAR(50),
    transaction_date DATETIME,
    status ENUM('pending','success','failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS callbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    raw_payload JSON NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE INDEX idx_checkout_request_id ON transactions(checkout_request_id);
CREATE INDEX idx_phone_number ON transactions(phone_number);
CREATE INDEX idx_product_id ON transactions(product_id);