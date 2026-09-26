const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
require('dotenv').config({ path: path.join(__dirname, '../../.env'), override: true });

const mysql = require('mysql2/promise');

const isLocalhost = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'jainsi',
  database: process.env.DB_NAME || 'expenseflow',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true,
  ssl: isLocalhost ? undefined : { rejectUnauthorized: false }
});

module.exports = pool;
