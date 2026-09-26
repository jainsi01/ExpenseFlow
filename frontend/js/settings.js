const content = document.querySelector('#pageContent');

async function loadSettings() {
  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure application options and view system status.</p>
      </div>
    </div>

    <div class="settings-grid">
      <div class="card settings-card">
        <div class="card-header">
          <h2>Appearance & Theme</h2>
        </div>
        <div class="setting-item">
          <div>
            <strong>Dark Mode</strong>
            <p>Switch between light and dark themes.</p>
          </div>
          <button class="btn btn-secondary" id="settingsThemeToggle">Toggle Theme</button>
        </div>
      </div>

      <div class="card settings-card">
        <div class="card-header">
          <h2>System & Database</h2>
        </div>
        <div class="setting-item">
          <div>
            <strong>Database Status</strong>
            <p>Connected to MySQL (<code>expenseflow</code> database)</p>
          </div>
          <span class="badge badge-income">Connected</span>
        </div>
        <div class="setting-item">
          <div>
            <strong>Backend API</strong>
            <p>Node.js & Express.js server running on port 5000</p>
          </div>
          <span class="badge badge-income">Active</span>
        </div>
      </div>

      <div class="card settings-card">
        <div class="card-header">
          <h2>About ExpenseFlow</h2>
        </div>
        <div class="about-info">
          <p><strong>ExpenseFlow – Personal Expense Tracker</strong></p>
          <p class="text-muted">A full-stack financial management web application built with Vanilla HTML5, CSS3, JavaScript, Node.js, Express.js, and MySQL.</p>
          <div class="tech-stack-tags">
            <span class="tech-tag">Node.js</span>
            <span class="tech-tag">Express.js</span>
            <span class="tech-tag">MySQL</span>
            <span class="tech-tag">HTML5/CSS3</span>
            <span class="tech-tag">Vanilla JS</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const btn = document.querySelector('#settingsThemeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const toggleBtn = document.querySelector('#themeToggle');
      if (toggleBtn) toggleBtn.click();
    });
  }
}

loadSettings();
