# ExpenseFlow – Personal Expense Tracker

**ExpenseFlow** is a modern, fast, and full-stack personal finance application built to track income, expenses, categories, savings, and spending analytics in real-time. All data is dynamically stored and retrieved using a MySQL database and Express REST API backend.

---

## 🌟 Features

- **Financial Dashboard**: Overview of Total Balance, Total Income, Total Expenses, and Current Month Spending calculated live from MySQL.
- **Transaction Management**: Add, Edit, Delete, Search, and Filter transactions with instant UI updates and toast notifications.
- **Categorization**: Expense categories (*Food, Shopping, Transport, Entertainment, Bills, Health, Education, Travel, Other*) and Income categories (*Salary, Freelance, Business, Investment, Gift, Other*).
- **Search & Filters**: Search transactions by title/description, filter by income/expense type, category, and date range (`From` → `To`).
- **Spending Analytics**: Interactive category breakdown chart (Chart.js) and dynamic monthly overview (Income, Expenses, Savings = Income − Expenses).
- **Dark Mode**: Persistent dark mode preference stored in `localStorage`.
- **Responsive UI**: Clean SaaS-inspired dashboard design that adapts seamlessly from desktop sidebars to mobile menus.
- **RESTful API Backend**: Express.js server connected to MySQL via connection pooling with parameterized SQL queries.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** – Semantic markup & layout
- **CSS3** – Custom variables, light/dark mode, flexbox/grid layout, animations
- **Vanilla JavaScript (ES6+)** – Fetch API, DOM manipulation, state & modal management

### Backend
- **Node.js** – Server runtime
- **Express.js** – REST API routing & middleware
- **mysql2** – MySQL driver with Promise support & connection pool
- **cors** & **dotenv** – Security & configuration management

### Database
- **MySQL** – Permanent relational database persistence

---

## 🏗️ Architecture

```text
  ┌────────────────────────┐
  │   HTML5 / CSS3 / JS    │  (Frontend Interface)
  └───────────┬────────────┘
              │  Fetch API
              ▼
  ┌────────────────────────┐
  │   Express.js REST API  │  (Backend Server - Port 5000)
  └───────────┬────────────┘
              │  mysql2 Pool
              ▼
  ┌────────────────────────┐
  │    MySQL Database      │  (Database - 'expenseflow')
  └────────────────────────┘
```

---

## 📁 Project Structure

```text
ExpenseFlow/
│
├── frontend/
│   ├── index.html            # Dashboard page
│   ├── transactions.html     # Transactions management page
│   ├── analytics.html        # Category breakdown & insights page
│   ├── settings.html         # User preferences & system info page
│   │
│   ├── css/
│   │   └── style.css         # Complete UI styling & dark mode rules
│   │
│   └── js/
│       ├── app.js            # Main shell, modal logic, toast notifications
│       ├── dashboard.js      # Dashboard summary cards & recent transactions
│       ├── transactions.js   # Transactions table, search & filters
│       ├── analytics.js      # Chart.js visualization & savings logic
│       └── settings.js       # Settings page functionality
│
├── backend/
│   ├── server.js             # Express application & DB initialization
│   ├── package.json          # Server dependencies
│   ├── .env                  # MySQL connection credentials (git-ignored)
│   ├── .env.example          # Template environment file
│   │
│   ├── config/
│   │   └── db.js             # MySQL pool connection setup
│   │
│   ├── routes/
│   │   └── transactionRoutes.js # REST API endpoint definitions
│   │
│   └── controllers/
│       └── transactionController.js # SQL logic & response handlers
│
├── database/
│   └── schema.sql            # Table schema & initial sample seed data
│
└── README.md                 # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 2. Configure Database & Environment
1. Start your local MySQL service.
2. Create or copy the `.env` file inside `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=expenseflow
   ```

### 3. Database Initialization
Option A: Run `database/schema.sql` directly in MySQL Workbench, MySQL Shell, or command line:
```bash
mysql -u root -p < database/schema.sql
```

Option B: The Express server will **automatically create** the `transactions` table and insert initial seed data on its first run if the table does not exist.

### 4. Install Dependencies & Run
Navigate to the root or `backend` folder and start the server:
```bash
cd backend
npm install
npm start
```

Open your browser and visit:
```text
http://localhost:5000
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Fetch summary stats (`totalIncome`, `totalExpenses`, `balance`, `monthlyExpenses`) |
| `GET` | `/api/transactions` | Fetch transactions (supports `?search=`, `?type=`, `?category=`, `?startDate=`, `?endDate=`) |
| `GET` | `/api/transactions/:id` | Fetch details of a single transaction by ID |
| `POST` | `/api/transactions` | Create a new transaction |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction by ID |
| `GET` | `/api/analytics` | Fetch category expense totals & savings calculations |

---

## 💻 Placement Interview Demo Guide

1. **Architecture & Clean Code**: Explain how the front-end makes modular `fetch()` requests to Express routes, which execute parameterized SQL queries to prevent SQL injection.
2. **Dynamic DB Calculations**: Demonstrate how financial totals (`SUM(amount)` where `type = 'income' / 'expense'`) and savings (`Income - Expenses`) are computed dynamically in MySQL rather than hardcoded in JavaScript.
3. **Responsive & Accessible UI**: Show the responsive drawer menu on mobile, dark mode persistence in `localStorage`, and toast feedback upon adding/editing/deleting transactions.
