const content = document.querySelector('#pageContent');
let chartInstance = null;

function analyticsSkeleton() {
  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Visual breakdown of your income, expenses, and savings.</p>
      </div>
    </div>
    <div class="analytics-grid">
      <div class="card skeleton-card"></div>
      <div class="card skeleton-card"></div>
    </div>
  `;
}

async function loadAnalytics() {
  analyticsSkeleton();
  try {
    const data = await request('/analytics');
    const categories = data.categories || [];
    const max = Math.max(...categories.map(c => Number(c.total)), 1);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Analytics</h1>
          <p class="page-subtitle">Visual breakdown of your income, expenses, and savings.</p>
        </div>
        <a href="transactions.html" class="btn btn-secondary">View Transactions →</a>
      </div>

      <div class="analytics-grid">
        <div class="card analytics-card">
          <div class="card-header">
            <h2>Expense by Category</h2>
          </div>
          
          ${categories.length ? `
            <div class="chart-wrapper">
              <canvas id="categoryChart" height="200"></canvas>
            </div>
            
            <div class="category-bars">
              ${categories.map((c, i) => {
                const percent = ((Number(c.total) / max) * 100).toFixed(0);
                return `
                  <div class="bar-row">
                    <div class="bar-label">
                      <span>${categoryIcon(c.category)} ${escapeHtml(c.category)}</span>
                      <strong>${money(c.total)}</strong>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill fill-color-${i % 6}" style="width: ${percent}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state-box">
              <div class="empty-state-icon">📊</div>
              <h3>No expense data yet</h3>
              <p>Add an expense transaction to view your category spending breakdown.</p>
            </div>
          `}
        </div>

        <div class="card overview-card">
          <div class="card-header">
            <h2>Monthly Overview</h2>
          </div>

          <div class="overview-box">
            <div class="overview-row">
              <span class="overview-label">Income</span>
              <strong class="overview-value income-text">+ ${money(data.income)}</strong>
            </div>

            <div class="overview-row">
              <span class="overview-label">Expenses</span>
              <strong class="overview-value expense-text">- ${money(data.expenses)}</strong>
            </div>

            <div class="overview-divider"></div>

            <div class="overview-row savings-highlight">
              <span class="overview-label">Savings</span>
              <strong class="overview-value ${data.savings >= 0 ? 'income-text' : 'expense-text'}">
                ${money(data.savings)}
              </strong>
            </div>
          </div>

          <div class="savings-note">
            <span class="info-icon">💡</span>
            <p><strong>Savings Formula:</strong> Total Income − Total Expenses</p>
          </div>
        </div>
      </div>
    `;

    renderCategoryChart(categories);
  } catch (error) {
    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Analytics</h1>
        </div>
      </div>
      <div class="error-box">
        <h3>Could not load analytics</h3>
        <p>${escapeHtml(error.message)}</p>
        <button class="btn btn-secondary retry-btn">Try Again</button>
      </div>
    `;
    const retryBtn = document.querySelector('.retry-btn');
    if (retryBtn) retryBtn.onclick = loadAnalytics;
  }
}

function renderCategoryChart(categories) {
  const canvas = document.querySelector('#categoryChart');
  if (!canvas || !window.Chart || !categories.length) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const colors = [
    '#2563EB', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#64748B', '#14B8A6'
  ];

  chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.category),
      datasets: [{
        data: categories.map(c => Number(c.total)),
        backgroundColor: colors.slice(0, categories.length),
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1E293B' : '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#94A3B8' : '#334155',
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${money(context.raw)}`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

async function refreshPage() {
  await loadAnalytics();
}

loadAnalytics();
