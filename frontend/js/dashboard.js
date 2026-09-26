const content = document.querySelector('#pageContent');

function dashboardSkeleton() {
  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="welcome-heading">Good morning 👋</h1>
        <p class="welcome-subtext">Here's your financial overview.</p>
      </div>
    </div>
    <div class="summary-grid">
      <div class="card skeleton-card"></div>
      <div class="card skeleton-card"></div>
      <div class="card skeleton-card"></div>
      <div class="card skeleton-card"></div>
    </div>
    <div class="dashboard-panel loading-panel">Loading financial data...</div>
  `;
}

async function loadDashboard() {
  dashboardSkeleton();
  try {
    const [summary, transactions] = await Promise.all([
      request('/dashboard'),
      request('/transactions')
    ]);

    const hour = new Date().getHours();
    const greetingText = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const recent = transactions.slice(0, 5);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="welcome-heading">${greetingText} 👋</h1>
          <p class="welcome-subtext">Here's your financial overview.</p>
        </div>
        <button class="btn btn-primary open-add-modal">+ Add Transaction</button>
      </div>

      <div class="summary-grid">
        <div class="summary-card balance-card">
          <div class="summary-title">Total Balance</div>
          <div class="summary-amount">${money(summary.balance)}</div>
          <div class="summary-footer">Remaining Balance</div>
        </div>

        <div class="summary-card income-card">
          <div class="summary-title">Total Income</div>
          <div class="summary-amount income-text">${money(summary.totalIncome)}</div>
          <div class="summary-footer">Total Cash Inflow</div>
        </div>

        <div class="summary-card expense-card">
          <div class="summary-title">Total Expenses</div>
          <div class="summary-amount expense-text">${money(summary.totalExpenses)}</div>
          <div class="summary-footer">Total Cash Outflow</div>
        </div>

        <div class="summary-card month-card">
          <div class="summary-title">This Month</div>
          <div class="summary-amount">${money(summary.monthlyExpenses)}</div>
          <div class="summary-footer">Current Month Outflow</div>
        </div>
      </div>

      <div class="card recent-card">
        <div class="recent-header">
          <h2>Recent Transactions</h2>
          <a href="transactions.html" class="view-all-link">View All →</a>
        </div>
        ${recent.length 
          ? `<div class="recent-list">${recent.map(t => transactionRow(t, true)).join('')}</div>`
          : emptyState()
        }
      </div>
    `;

    addHeaderActions();
    bindTransactionActions();
  } catch (error) {
    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="welcome-heading">Good morning 👋</h1>
          <p class="welcome-subtext">Here's your financial overview.</p>
        </div>
        <button class="btn btn-primary open-add-modal">+ Add Transaction</button>
      </div>
      <div class="error-box">
        <h3>Unable to load dashboard data</h3>
        <p>${escapeHtml(error.message)}</p>
        <button class="btn btn-secondary retry-btn">Try Again</button>
      </div>
    `;
    addHeaderActions();
    const retryBtn = document.querySelector('.retry-btn');
    if (retryBtn) retryBtn.onclick = loadDashboard;
  }
}

async function refreshPage() {
  await loadDashboard();
}

loadDashboard();
