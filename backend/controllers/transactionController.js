const pool = require('../config/db');

const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Other'];
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function validate(body) {
  const { type, title, amount, category, transaction_date } = body;
  if (!['income', 'expense'].includes(type)) return 'Choose income or expense.';
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 150) return 'Enter a title (up to 150 characters).';
  if (amount === '' || amount === null || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || Number(amount) > 99999999.99) return 'Amount must be greater than 0.';
  const allowed = type === 'income' ? incomeCategories : expenseCategories;
  if (!allowed.includes(category)) return 'Choose a valid category for this transaction type.';
  if (!validDate(transaction_date)) return 'Enter a valid transaction date.';
  if (body.description != null && (typeof body.description !== 'string' || body.description.length > 2000)) return 'Description must be 2,000 characters or fewer.';
  return null;
}

function buildFilters(query) {
  const clauses = [], values = [];
  if (query.type && ['income', 'expense'].includes(query.type)) { clauses.push('type = ?'); values.push(query.type); }
  if (query.category) { clauses.push('category = ?'); values.push(query.category); }
  if (query.search) { clauses.push('(title LIKE ? OR description LIKE ?)'); values.push(`%${query.search}%`, `%${query.search}%`); }
  if (query.startDate && validDate(query.startDate)) { clauses.push('transaction_date >= ?'); values.push(query.startDate); }
  if (query.endDate && validDate(query.endDate)) { clauses.push('transaction_date <= ?'); values.push(query.endDate); }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
}

exports.list = async (req, res, next) => {
  try {
    const { where, values } = buildFilters(req.query);
    const [rows] = await pool.execute(`SELECT id, type, title, amount, category, DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date, description, created_at FROM transactions ${where} ORDER BY transaction_date DESC, id DESC`, values);
    res.json(rows);
  } catch (error) { next(error); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT id, type, title, amount, category, DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date, description FROM transactions WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transaction not found.' });
    res.json(rows[0]);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { type, title, amount, category, transaction_date, description = '' } = req.body;
    const [result] = await pool.execute('INSERT INTO transactions (type, title, amount, category, transaction_date, description) VALUES (?, ?, ?, ?, ?, ?)', [type, title.trim(), Number(amount), category, transaction_date, description.trim()]);
    const [rows] = await pool.execute("SELECT id, type, title, amount, category, DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date, description FROM transactions WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { type, title, amount, category, transaction_date, description = '' } = req.body;
    const [result] = await pool.execute('UPDATE transactions SET type = ?, title = ?, amount = ?, category = ?, transaction_date = ?, description = ? WHERE id = ?', [type, title.trim(), Number(amount), category, transaction_date, description.trim(), req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Transaction not found.' });
    const [rows] = await pool.execute("SELECT id, type, title, amount, category, DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date, description FROM transactions WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (err) { next(err); }
};

exports.dashboard = async (_req, res, next) => {
  try {
    const [[totals]] = await pool.execute(`SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
      COALESCE(SUM(CASE WHEN type = 'expense' AND YEAR(transaction_date) = YEAR(CURDATE()) AND MONTH(transaction_date) = MONTH(CURDATE()) THEN amount ELSE 0 END), 0) AS monthlyExpenses
      FROM transactions`);
    const totalIncome = Number(totals.totalIncome), totalExpenses = Number(totals.totalExpenses);
    res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses, monthlyExpenses: Number(totals.monthlyExpenses) });
  } catch (error) { next(error); }
};

exports.analytics = async (_req, res, next) => {
  try {
    const [[totals]] = await pool.execute(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) AS income, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS expenses FROM transactions`);
    const [categories] = await pool.execute("SELECT category, SUM(amount) AS total FROM transactions WHERE type='expense' GROUP BY category ORDER BY total DESC");
    res.json({ income: Number(totals.income), expenses: Number(totals.expenses), savings: Number(totals.income) - Number(totals.expenses), categories });
  } catch (error) { next(error); }
};
