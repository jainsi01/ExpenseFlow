CREATE DATABASE IF NOT EXISTS expenseflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expenseflow;

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('income', 'expense') NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transaction_type (type),
    INDEX idx_transaction_category (category)
);

-- Seed sample transactions if table is currently empty
INSERT INTO transactions (type, title, amount, category, transaction_date, description)
SELECT 'income', 'Salary', 50000.00, 'Salary', CURDATE(), 'Monthly salary income'
WHERE NOT EXISTS (SELECT 1 FROM transactions LIMIT 1);

INSERT INTO transactions (type, title, amount, category, transaction_date, description)
SELECT 'income', 'Freelance Project', 10000.00, 'Freelance', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Web development freelance project'
WHERE (SELECT COUNT(*) FROM transactions) = 1;

INSERT INTO transactions (type, title, amount, category, transaction_date, description)
SELECT 'expense', 'Food & Groceries', 1500.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Weekly supermarket groceries'
WHERE (SELECT COUNT(*) FROM transactions) = 2;

INSERT INTO transactions (type, title, amount, category, transaction_date, description)
SELECT 'expense', 'Shopping', 2500.00, 'Shopping', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Clothes and home items'
WHERE (SELECT COUNT(*) FROM transactions) = 3;

INSERT INTO transactions (type, title, amount, category, transaction_date, description)
SELECT 'expense', 'Transport', 800.00, 'Transport', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Cab rides and fuel'
WHERE (SELECT COUNT(*) FROM transactions) = 4;

INSERT INTO transactions (type, title, amount, category, transaction_date, description)
SELECT 'expense', 'Bills', 1200.00, 'Bills', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Electricity & internet bill'
WHERE (SELECT COUNT(*) FROM transactions) = 5;
