const content = document.querySelector('#pageContent');
let debounceTimer;

content.innerHTML = `
  <div class="page-header">
    <div>
      <h1 class="page-title">Transactions</h1>
      <p class="page-subtitle">Manage, search, and filter all income and expenses.</p>
    </div>
    <button class="btn btn-primary open-add-modal">+ Add Transaction</button>
  </div>

  <div class="card filter-card">
    <div class="filter-grid">
      <div class="filter-group search-group">
        <label class="filter-label" for="searchInput">Search</label>
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input id="searchInput" type="search" class="form-input" placeholder="Search transactions...">
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="typeFilter">Type</label>
        <select id="typeFilter" class="form-select">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="categoryFilter">Category</label>
        <select id="categoryFilter" class="form-select">
          <option value="">All Categories</option>
          <optgroup label="Expense">
            ${expenseCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </optgroup>
          <optgroup label="Income">
            ${incomeCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </optgroup>
        </select>
      </div>

      <div class="filter-group date-group">
        <label class="filter-label">Date Range</label>
        <div class="date-inputs">
          <input id="startDate" type="date" class="form-input" aria-label="From Date">
          <span class="date-separator">→</span>
          <input id="endDate" type="date" class="form-input" aria-label="To Date">
        </div>
      </div>

      <div class="filter-group filter-actions">
        <button id="clearFilters" class="btn btn-secondary btn-sm" type="button">Clear Filters</button>
      </div>
    </div>
  </div>

  <div class="card table-card">
    <div class="table-header-meta">
      <span id="resultCount">Loading transactions...</span>
    </div>
    <div id="tableContainer">
      <div class="table-loading">Loading transactions...</div>
    </div>
  </div>
`;

const filterControls = ['searchInput', 'typeFilter', 'categoryFilter', 'startDate', 'endDate'].map(id => document.getElementById(id));

function getFilterParams() {
  const params = new URLSearchParams();
  const [search, type, category, startDate, endDate] = filterControls.map(el => el.value.trim());

  if (search) params.set('search', search);
  if (type) params.set('type', type);
  if (category) params.set('category', category);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  return params.toString();
}

async function loadTransactions() {
  const container = document.querySelector('#tableContainer');
  const countSpan = document.querySelector('#resultCount');
  
  if (!container) return;
  container.innerHTML = '<div class="table-loading">Loading transactions...</div>';

  try {
    const qs = getFilterParams();
    const rows = await request(`/transactions${qs ? `?${qs}` : ''}`);
    
    if (countSpan) {
      countSpan.textContent = `${rows.length} ${rows.length === 1 ? 'transaction' : 'transactions'} found`;
    }

    if (!rows.length) {
      if (qs) {
        container.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">🔍</div>
            <h3>No matching transactions</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        `;
      } else {
        container.innerHTML = emptyState();
      }
      bindTransactionActions(container);
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(t => transactionRow(t)).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindTransactionActions(container);
  } catch (error) {
    if (countSpan) countSpan.textContent = 'Error loading transactions';
    container.innerHTML = `
      <div class="error-box">
        <h3>Could not load transactions</h3>
        <p>${escapeHtml(error.message)}</p>
        <button class="btn btn-secondary retry-btn">Try Again</button>
      </div>
    `;
    const retryBtn = container.querySelector('.retry-btn');
    if (retryBtn) retryBtn.onclick = loadTransactions;
  }
}

filterControls.forEach(control => {
  if (!control) return;
  control.addEventListener(control.id === 'searchInput' ? 'input' : 'change', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadTransactions, control.id === 'searchInput' ? 250 : 0);
  });
});

const clearBtn = document.querySelector('#clearFilters');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    filterControls.forEach(el => { if (el) el.value = ''; });
    loadTransactions();
  });
}

async function refreshPage() {
  await loadTransactions();
}

addHeaderActions();
loadTransactions();
