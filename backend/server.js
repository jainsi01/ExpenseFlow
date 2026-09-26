const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
require('dotenv').config({ override: true });

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const routes = require('./routes/transactionRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20kb' }));

// API routes
app.use('/api', routes);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Page routing fallback for SPA / MPA navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const file = req.path === '/' || req.path === '/index.html' ? 'index.html' : req.path.slice(1);
  const filePath = path.join(__dirname, '../frontend', file);
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
});

// 404 handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'The requested API endpoint was not found.' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  const databaseUnavailable = ['ER_ACCESS_DENIED_ERROR', 'ECONNREFUSED', 'ER_BAD_DB_ERROR', 'PROTOCOL_CONNECTION_LOST'].includes(err.code);
  console.error('Request error:', databaseUnavailable ? `Database error (${err.code})` : err.message);
  
  if (databaseUnavailable) {
    return res.status(503).json({ error: 'ExpenseFlow cannot connect to MySQL. Verify your environment variables and database host.' });
  }
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function initDB() {
  try {
    await pool.query(`
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
    `);

    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM transactions');
    if (count === 0) {
      console.log('Seeding initial sample transactions into MySQL...');
      await pool.query(`
        INSERT INTO transactions (type, title, amount, category, transaction_date, description) VALUES
        ('income', 'Salary', 50000.00, 'Salary', CURDATE(), 'Monthly salary income'),
        ('income', 'Freelance Project', 10000.00, 'Freelance', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Web design project'),
        ('expense', 'Food & Groceries', 1500.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Supermarket shopping'),
        ('expense', 'Shopping', 2500.00, 'Shopping', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Clothes and essentials'),
        ('expense', 'Transport', 800.00, 'Transport', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Fuel and taxi fares'),
        ('expense', 'Bills', 1200.00, 'Bills', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Electricity & internet bill');
      `);
      console.log('Seed data inserted successfully.');
    }
  } catch (error) {
    console.error('Database initialization warning:', error.message);
  }
}

const port = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(port, async () => {
    console.log(`ExpenseFlow server is running at http://localhost:${port}`);
    await initDB();
  });
}

// Export for serverless environments (Vercel)
module.exports = app;
