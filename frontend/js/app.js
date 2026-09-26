const API = '/api';

const incomeCategories = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other'
];

const expenseCategories = [
  'Food',
  'Shopping',
  'Transport',
  'Entertainment',
  'Bills',
  'Health',
  'Education',
  'Travel',
  'Other'
];

const page = document.body.dataset.page;

// Format money as Indian Rupees (₹)
const money = value => {
  const num = Number(value) || 0;
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const prettyDate = value => {
  if (!value) return '';
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

async function request(url, options = {}) {
  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Could not complete your request.');
  }
  return data;
}

// Toast Notifications
function toast(message, kind = 'success') {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    document.body.append(host);
  }
  const node = document.createElement('div');
  node.className = `toast ${kind}`;
  node.innerHTML = `<span class="toast-check">✓</span> <span>${escapeHtml(message)}</span>`;
  host.append(node);
  setTimeout(() => {
    node.classList.add('leaving');
    setTimeout(() => node.remove(), 250);
  }, 3000);
}

// Main App Shell (Sidebar & Topbar)
function shell() {
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const nav = [
    ['dashboard', '🏠', 'Dashboard', 'index.html'],
    ['transactions', '💳', 'Transactions', 'transactions.html'],
    ['analytics', '📊', 'Analytics', 'analytics.html'],
    ['settings', '⚙', 'Settings', 'settings.html']
  ];

  document.querySelector('#app').innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-top">
          <a class="brand" href="index.html">
            <span class="brand-icon">⚡</span>
            <span class="brand-name">Expense<span class="brand-accent">Flow</span></span>
          </a>
        </div>
        
        <nav class="nav-list">
          ${nav.map(([key, icon, label, href]) => `
            <a class="nav-link ${page === key ? 'active' : ''}" href="${href}">
              <span class="nav-icon">${icon}</span>
              <span class="nav-text">${label}</span>
            </a>
          `).join('')}
        </nav>

        <div class="sidebar-bottom">
          <button class="theme-toggle-btn" id="themeToggle" type="button">
            <span class="theme-icon" id="themeIcon">🌙</span>
            <span id="themeLabel">Dark Mode</span>
          </button>
        </div>
      </aside>

      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <main class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <button class="menu-button" id="menuButton" aria-label="Toggle Navigation">
              ☰
            </button>
            <div class="topbar-title">
              <span class="topbar-page-name">${page.charAt(0).toUpperCase() + page.slice(1)}</span>
            </div>
          </div>
          <div class="topbar-right">
            <span class="current-date-badge">${today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        <div class="page-content" id="pageContent"></div>
      </main>
    </div>

    <!-- ADD / EDIT TRANSACTION MODAL -->
    <div class="modal-backdrop" id="transactionModal" aria-hidden="true">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <h2 id="modalTitle">Add Transaction</h2>
          <button class="close-btn close-modal" type="button" aria-label="Close modal">&times;</button>
        </div>
        <form id="transactionForm" novalidate>
          <input type="hidden" name="id">
          
          <div class="form-group">
            <label class="field-label">Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="type" value="income">
                <span class="radio-custom income-radio"></span>
                Income
              </label>
              <label class="radio-label">
                <input type="radio" name="type" value="expense" checked>
                <span class="radio-custom expense-radio"></span>
                Expense
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="txTitle">Title</label>
            <input type="text" id="txTitle" name="title" class="form-input" placeholder="e.g. Food / Lunch" maxlength="150" required>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label class="field-label" for="txAmount">Amount (₹)</label>
              <input type="number" id="txAmount" name="amount" class="form-input" placeholder="0.00" step="0.01" min="0.01" required>
            </div>
            <div class="form-group half">
              <label class="field-label" for="txCategory">Category</label>
              <select id="txCategory" name="category" class="form-select" required></select>
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="txDate">Date</label>
            <input type="date" id="txDate" name="transaction_date" class="form-input" required>
          </div>

          <div class="form-group">
            <label class="field-label" for="txDesc">Description <span class="optional-tag">(Optional)</span></label>
            <textarea id="txDesc" name="description" class="form-textarea" rows="3" placeholder="Add additional details..." maxlength="2000"></textarea>
          </div>

          <div class="form-error" id="formError"></div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary close-modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="saveTransaction">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div class="modal-backdrop" id="confirmModal" aria-hidden="true">
      <div class="modal-dialog confirm-dialog" role="dialog" aria-modal="true">
        <div class="confirm-content">
          <div class="confirm-warning-icon">⚠️</div>
          <h2>Delete Transaction?</h2>
          <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelDelete">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupTheme();
  setupModal();
  setupSidebarToggle();
}

function setupTheme() {
  const saved = localStorage.getItem('expenseflow-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  const themeToggleBtn = document.querySelector('#themeToggle');
  const themeLabel = document.querySelector('#themeLabel');
  const themeIcon = document.querySelector('#themeIcon');

  const applyThemeUI = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    themeIcon.textContent = isDark ? '☀️' : '🌙';
  };

  applyThemeUI();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('expenseflow-theme', next);
      applyThemeUI();
    });
  }
}

function setupSidebarToggle() {
  const menuBtn = document.querySelector('#menuButton');
  const sidebar = document.querySelector('#sidebar');
  const overlay = document.querySelector('#sidebarOverlay');

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

function setCategories(type, selected = '') {
  const select = document.querySelector('#txCategory');
  if (!select) return;
  const list = type === 'income' ? incomeCategories : expenseCategories;
  select.innerHTML = '<option value="" disabled selected>Select Category</option>' + 
    list.map(c => `<option value="${c}" ${selected === c ? 'selected' : ''}>${c}</option>`).join('');
}

function setupModal() {
  const modal = document.querySelector('#transactionModal');
  const form = document.querySelector('#transactionForm');

  document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeTransactionModal));
  
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeTransactionModal();
    });
  }

  if (form) {
    form.querySelectorAll('[name=type]').forEach(input => {
      input.addEventListener('change', () => {
        setCategories(input.value);
      });
    });
    form.addEventListener('submit', saveTransaction);
  }
}

function openTransactionModal(transaction = null) {
  const form = document.querySelector('#transactionForm');
  if (!form) return;
  form.reset();
  form.elements.id.value = transaction?.id || '';

  const type = transaction?.type || 'expense';
  const typeRadio = form.querySelector(`[name=type][value="${type}"]`);
  if (typeRadio) typeRadio.checked = true;

  setCategories(type, transaction?.category || '');

  form.elements.title.value = transaction?.title || '';
  form.elements.amount.value = transaction?.amount || '';
  form.elements.transaction_date.value = transaction?.transaction_date 
    ? String(transaction.transaction_date).slice(0, 10) 
    : new Date().toISOString().slice(0, 10);
  form.elements.description.value = transaction?.description || '';

  const modalTitle = document.querySelector('#modalTitle');
  const saveBtn = document.querySelector('#saveTransaction');
  
  if (modalTitle) modalTitle.textContent = transaction ? 'Edit Transaction' : 'Add Transaction';
  if (saveBtn) saveBtn.textContent = transaction ? 'Save Changes' : 'Add Transaction';

  document.querySelector('#formError').textContent = '';

  const modal = document.querySelector('#transactionModal');
  if (modal) {
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => form.elements.title.focus(), 100);
  }
}

function closeTransactionModal() {
  const modal = document.querySelector('#transactionModal');
  if (modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }
}

async function saveTransaction(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  
  // Validation
  if (!data.title || !data.title.trim()) {
    document.querySelector('#formError').textContent = 'Please enter a transaction title.';
    return;
  }
  if (!data.amount || Number(data.amount) <= 0) {
    document.querySelector('#formError').textContent = 'Amount must be greater than 0.';
    return;
  }
  if (!data.category) {
    document.querySelector('#formError').textContent = 'Please select a category.';
    return;
  }
  if (!data.transaction_date) {
    document.querySelector('#formError').textContent = 'Please select a transaction date.';
    return;
  }

  const id = data.id;
  delete data.id;
  data.amount = Number(data.amount);

  const button = document.querySelector('#saveTransaction');
  button.disabled = true;
  button.textContent = 'Saving…';

  try {
    await request(`/transactions${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    });
    closeTransactionModal();
    toast(id ? 'Transaction updated successfully' : 'Transaction added successfully');
    if (typeof refreshPage === 'function') {
      await refreshPage();
    }
  } catch (error) {
    document.querySelector('#formError').textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = id ? 'Save Changes' : 'Add Transaction';
  }
}

function categoryIcon(category) {
  const map = {
    Food: '🍔',
    Shopping: '🛒',
    Transport: '🚗',
    Entertainment: '🎬',
    Bills: '🧾',
    Health: '🏥',
    Education: '🎓',
    Travel: '✈️',
    Salary: '💼',
    Freelance: '💻',
    Business: '🏢',
    Investment: '📈',
    Gift: '🎁',
    Other: '📌'
  };
  return map[category] || '📌';
}

function transactionRow(t, compact = false) {
  const isIncome = t.type === 'income';
  const amountFormatted = `${isIncome ? '+' : '-'} ${money(t.amount)}`;
  const amountClass = isIncome ? 'amount-income' : 'amount-expense';

  if (compact) {
    return `
      <div class="transaction-item-compact">
        <div class="tx-left">
          <div class="category-avatar icon-${t.category.toLowerCase()}">${categoryIcon(t.category)}</div>
          <div class="tx-info">
            <span class="tx-title-text">${escapeHtml(t.title)}</span>
            <span class="tx-sub-text">${escapeHtml(t.category)} • ${prettyDate(t.transaction_date)}</span>
          </div>
        </div>
        <div class="tx-right ${amountClass}">
          ${amountFormatted}
        </div>
      </div>
    `;
  }

  return `
    <tr class="transaction-table-row">
      <td class="col-date">${prettyDate(t.transaction_date)}</td>
      <td class="col-desc">
        <div class="tx-title-container">
          <span class="category-mini-icon">${categoryIcon(t.category)}</span>
          <div>
            <strong class="tx-name">${escapeHtml(t.title)}</strong>
            ${t.description ? `<span class="tx-description-sub">${escapeHtml(t.description)}</span>` : ''}
          </div>
        </div>
      </td>
      <td class="col-category"><span class="badge badge-category">${escapeHtml(t.category)}</span></td>
      <td class="col-type"><span class="badge badge-${t.type}">${t.type.toUpperCase()}</span></td>
      <td class="col-amount ${amountClass}"><strong>${amountFormatted}</strong></td>
      <td class="col-actions">
        <button class="action-btn edit-action" data-id="${t.id}" title="Edit Transaction">Edit</button>
        <button class="action-btn delete-action" data-id="${t.id}" title="Delete Transaction">Delete</button>
      </td>
    </tr>
  `;
}

function emptyState() {
  return `
    <div class="empty-state-box">
      <div class="empty-state-icon">📋</div>
      <h3>No transactions yet</h3>
      <p>Start tracking your finances by adding your first transaction.</p>
      <button class="btn btn-primary add-transaction-btn">+ Add Transaction</button>
    </div>
  `;
}

function bindTransactionActions(container = document) {
  container.querySelectorAll('.edit-action').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        const tx = await request(`/transactions/${button.dataset.id}`);
        openTransactionModal(tx);
      } catch (error) {
        toast(error.message, 'error');
      }
    });
  });

  container.querySelectorAll('.delete-action').forEach(button => {
    button.addEventListener('click', () => confirmDeleteTransaction(button.dataset.id));
  });

  container.querySelectorAll('.add-transaction-btn, .open-add-modal').forEach(button => {
    button.addEventListener('click', () => openTransactionModal());
  });
}

let deleteId = null;
function confirmDeleteTransaction(id) {
  deleteId = id;
  const modal = document.querySelector('#confirmModal');
  if (modal) modal.classList.add('visible');
}

document.addEventListener('click', event => {
  if (event.target.id === 'cancelDelete' || event.target.id === 'confirmModal') {
    const modal = document.querySelector('#confirmModal');
    if (modal) modal.classList.remove('visible');
  }
  if (event.target.id === 'confirmDelete' && deleteId) {
    performDelete();
  }
});

async function performDelete() {
  const button = document.querySelector('#confirmDelete');
  button.disabled = true;
  button.textContent = 'Deleting…';

  try {
    await request(`/transactions/${deleteId}`, { method: 'DELETE' });
    const modal = document.querySelector('#confirmModal');
    if (modal) modal.classList.remove('visible');
    toast('Transaction deleted successfully');
    deleteId = null;
    if (typeof refreshPage === 'function') {
      await refreshPage();
    }
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Delete';
  }
}

function addHeaderActions() {
  document.querySelectorAll('.open-add-modal').forEach(button => {
    button.addEventListener('click', () => openTransactionModal());
  });
}

// Initialize Shell
shell();
