const pool = require('./backend/config/db');

async function run() {
  try {
    const type = 'expense', title = 'food', amount = 500, category = 'Food', transaction_date = '2026-09-26', description = '';
    console.log('Inserting into MySQL...');
    const [result] = await pool.execute(
      'INSERT INTO transactions (type, title, amount, category, transaction_date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [type, title.trim(), Number(amount), category, transaction_date, description.trim()]
    );
    console.log('Insert result:', result);

    console.log('Querying back inserted row...');
    const [rows] = await pool.execute(
      "SELECT id, type, title, amount, category, DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date, description FROM transactions WHERE id = ?",
      [result.insertId]
    );
    console.log('Select rows:', rows);
  } catch(err) {
    console.error('EXACT ERROR TRACE:', err);
  }
}
run().then(() => process.exit(0));
