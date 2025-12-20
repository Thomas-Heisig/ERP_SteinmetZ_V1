/**
 * ERP SteinmetZ - System Diagnose Dashboard
 * Echtzeit-Monitoring mit echten API-Daten
 */

// ============================================================================
// CONFIG & STATE
// ============================================================================

const API_BASE = "/api/system";
const DIAGNOSTICS_BASE = "/api/diagnostics";
const CONFIG = {
  autoRefreshInterval: 30000, // 30 seconds
  adminCredentials: { username: "admin", password: "admin123" },
};

let appState = {
  loggedIn: false,
  autoRefreshEnabled: false,
  refreshInterval: null,
  lastRefresh: null,
  refreshCount: 0,
};

// ============================================================================
// LOGIN & AUTH
// ============================================================================

function initLogin() {
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginError = document.getElementById("login-error");

  // Check existing session
  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    showDashboard();
    initDashboard();
    return;
  }

  // Pre-fill for testing
  document.getElementById("username").value = "admin";
  document.getElementById("password").value = "admin123";

  loginBtn.addEventListener("click", handleLogin);
  document.getElementById("password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  function handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (
      username === CONFIG.adminCredentials.username &&
      password === CONFIG.adminCredentials.password
    ) {
      sessionStorage.setItem("adminLoggedIn", "true");
      appState.loggedIn = true;
      loginError.style.display = "none";
      showDashboard();
      initDashboard();
    } else {
      loginError.style.display = "block";
    }
  }

  function showDashboard() {
    loginScreen.style.display = "none";
    dashboard.style.display = "block";
  }

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("adminLoggedIn");
    appState.loggedIn = false;
    location.reload();
  });
}

// ============================================================================
// DASHBOARD INITIALIZATION
// ============================================================================

function initDashboard() {
  console.log("Dashboard initialized");

  // Button Events
  document
    .getElementById("refresh-btn")
    .addEventListener("click", () => loadAllData());

  document
    .getElementById("auto-refresh-toggle")
    .addEventListener("click", toggleAutoRefresh);

  // Tab Navigation
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tabId = e.target.dataset.tab;
      switchTab(tabId);
    });
  });

  // Initial load
  loadAllData();

  // Set backend URL in footer
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : "";
  document.getElementById("backend-url").textContent =
    `${protocol}//${hostname}${port}`;
}

// ============================================================================
// AUTO-REFRESH MANAGEMENT
// ============================================================================

function toggleAutoRefresh() {
  const btn = document.getElementById("auto-refresh-toggle");
  const status = document.getElementById("refresh-status");

  appState.autoRefreshEnabled = !appState.autoRefreshEnabled;

  if (appState.autoRefreshEnabled) {
    btn.style.background = "var(--success)";
    btn.textContent = "⏱️ Auto-Refresh AN";
    status.textContent = "Auto-Refresh: an (alle 30s)";

    appState.refreshInterval = setInterval(() => {
      appState.refreshCount++;
      loadAllData();
    }, CONFIG.autoRefreshInterval);
  } else {
    btn.style.background = "var(--warning)";
    btn.textContent = "⏱️ Auto-Refresh AUS";
    status.textContent = "Auto-Refresh: aus";

    if (appState.refreshInterval) {
      clearInterval(appState.refreshInterval);
      appState.refreshInterval = null;
    }
  }
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllData() {
  appState.lastRefresh = new Date();
  updateTimestamp();

  console.log("🔄 Loading dashboard data...");

  // Load all data in parallel with correct endpoints
  const [
    health,
    services,
    system,
    database,
    performance,
    features,
    routes,
    resources,
    environment,
    dependencies,
    diagnostics,
    functions,
  ] = await Promise.allSettled([
    fetchAPI(`${API_BASE}/health`),
    fetchAPI(`${API_BASE}/status`),
    fetchAPI(`${API_BASE}/system`),
    fetchAPI(`${API_BASE}/database`),
    fetchAPI(`${API_BASE}/resources`),
    fetchAPI(`${API_BASE}/features`),
    fetchAPI(`${API_BASE}/routes`),
    fetchAPI(`${API_BASE}/resources`),
    fetchAPI(`${API_BASE}/environment`),
    fetchAPI(`${API_BASE}/dependencies`),
    fetchAPI(`${DIAGNOSTICS_BASE}/health`),
    fetchAPI(`${API_BASE}/functions`),
  ]);

  // Display data
  displayHealth(extractData(health));
  displayServiceStatus(extractData(services));
  displaySystemInfo(extractData(system));
  displayDatabaseInfo(extractData(database));
  displayPerformance(extractData(performance));
  displayFeatures(extractData(features));
  displayRoutes(extractData(routes));
  displayResources(extractData(resources));
  displayEnvironment(extractData(environment));
  displayDependencies(extractData(dependencies));
  displayDiagnostics(extractData(diagnostics));
  displayFunctions(extractData(functions));
}

async function fetchAPI(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

function extractData(result) {
  if (result.status === "fulfilled") {
    const data = result.value;
    return data?.data || data?.success ? data.data : null;
  }
  return null;
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

function displayHealth(data) {
  const content = document.getElementById("health-content");
  if (!data) {
    content.innerHTML =
      '<div class="error" style="color: #ef4444; padding: 1rem;">❌ Health data unavailable - Check backend connection</div>';
    return;
  }

  console.log("💚 Health data:", data);
  const status = data.status || data.health || "unknown";
  const isHealthy = status === "healthy" || status === "ok";
  const statusClass = isHealthy ? "status-healthy" : "status-danger";

  let checksHTML = "";

  // Handle checks array
  if (data.checks && Array.isArray(data.checks)) {
    checksHTML = data.checks
      .map(
        (check) => `
      <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding: 0.5rem; background: #f8fafc; border-radius: 4px;">
        <span style="font-weight: 500;">${check.name || check.component}</span>
        <span class="status-badge ${check.status === "pass" || check.status === "healthy" ? "status-healthy" : check.status === "warn" ? "status-warning" : "status-danger"}">
          ${check.status === "pass" || check.status === "healthy" ? "✅ OK" : check.status === "warn" ? "⚠️ Warning" : "❌ Error"}
        </span>
      </div>
    `,
      )
      .join("");
  } else if (data.database || data.ai || data.functions) {
    // Handle object with service statuses
    checksHTML = Object.entries(data)
      .filter(([key]) => !["status", "timestamp"].includes(key))
      .map(([key, value]) => {
        const statusValue = typeof value === "object" ? value.status : value;
        const isOk =
          statusValue === "connected" ||
          statusValue === "ready" ||
          statusValue === "operational" ||
          statusValue === "healthy";
        return `
        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding: 0.5rem; background: #f8fafc; border-radius: 4px;">
          <span style="font-weight: 500;">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <span class="status-badge ${isOk ? "status-healthy" : "status-danger"}">
            ${isOk ? "✅ " + statusValue : "❌ " + statusValue}
          </span>
        </div>
      `;
      })
      .join("");
  }

  content.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span style="font-size: 1.1rem; font-weight: bold;">Overall Status:</span>
        <span class="status-badge ${statusClass}" style="font-size: 1rem; padding: 0.5rem 1rem;">
          ${isHealthy ? "✅ Healthy" : "❌ Unhealthy"}
        </span>
      </div>
      ${checksHTML || '<div style="color: #6b7280; font-style: italic;">No detailed checks available</div>'}
    </div>
  `;
}

function displayServiceStatus(data) {
  const content = document.getElementById("service-status-content");
  if (!data) {
    content.innerHTML =
      '<div class="error" style="color: #ef4444; padding: 1rem;">❌ Service status unavailable</div>';
    return;
  }

  console.log("⚙️ Service status:", data);

  const db = data.database || {};
  const ai = data.ai || {};
  const functions = data.functions || {};

  content.innerHTML = `
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-value">${db.tables || 0}</div>
        <div class="metric-label">DB Tables</div>
      </div>
      <div class="metric">
        <div class="metric-value">${db.totalRows || db.total_rows || 0}</div>
        <div class="metric-label">Rows</div>
      </div>
      <div class="metric">
        <div class="metric-value">${functions.nodes || functions.count || 0}</div>
        <div class="metric-label">Nodes</div>
      </div>
      <div class="metric">
        <div class="metric-value">${ai.provider || "N/A"}</div>
        <div class="metric-label">AI Provider</div>
      </div>
    </div>
    <div style="margin-top: 1rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding: 0.5rem; background: #f8fafc; border-radius: 4px;">
        <span style="font-weight: 500;">💾 Database:</span>
        <span class="status-badge ${db.connected || db.status === "connected" ? "status-healthy" : "status-danger"}">
          ${db.connected || db.status === "connected" ? "✅ Connected" : "❌ Disconnected"}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding: 0.5rem; background: #f8fafc; border-radius: 4px;">
        <span style="font-weight: 500;">🤖 AI Service:</span>
        <span class="status-badge ${ai.available || ai.status === "ready" ? "status-healthy" : "status-warning"}">
          ${ai.available || ai.status === "ready" ? "✅ Available" : "⚠️ Unavailable"}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8fafc; border-radius: 4px;">
        <span style="font-weight: 500;">⚙️ Functions:</span>
        <span class="status-badge ${functions.loaded || functions.status === "operational" ? "status-healthy" : "status-warning"}">
          ${functions.loaded || functions.status === "operational" ? "✅ Loaded" : "⚠️ Not Loaded"}
        </span>
      </div>
    </div>
  `;
}

function displaySystemInfo(data) {
  const content = document.getElementById("system-info-content");
  if (!data) {
    content.innerHTML = '<div class="error">System info unavailable</div>';
    return;
  }

  const uptime = formatSeconds(data.process?.uptime || 0);
  const sysUptime = formatSeconds(data.system?.uptime || 0);
  const loadAvg = data.system?.loadAverage?.[0]?.toFixed(2) || "N/A";

  content.innerHTML = `
    <div style="margin-bottom: 1rem; font-size: 0.9rem;">
      <div><strong>Node.js:</strong> ${data.nodejs?.version || "N/A"}</div>
      <div><strong>Platform:</strong> ${data.system?.platform || "N/A"} ${data.system?.arch || ""}</div>
      <div><strong>Hostname:</strong> ${data.system?.hostname || "N/A"}</div>
      <div><strong>Process Uptime:</strong> ${uptime}</div>
      <div><strong>System Uptime:</strong> ${sysUptime}</div>
    </div>
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-value">${data.system?.cpus || 0}</div>
        <div class="metric-label">CPUs</div>
      </div>
      <div class="metric">
        <div class="metric-value">${formatBytes(data.process?.memory?.rss || 0)}</div>
        <div class="metric-label">Memory</div>
      </div>
      <div class="metric">
        <div class="metric-value">${loadAvg}</div>
        <div class="metric-label">Load (1m)</div>
      </div>
      <div class="metric">
        <div class="metric-value">${data.process?.pid || "N/A"}</div>
        <div class="metric-label">PID</div>
      </div>
    </div>
  `;
}

function displayDatabaseInfo(data) {
  const content = document.getElementById("database-content");
  if (!data) {
    content.innerHTML = '<div class="error">Database info unavailable</div>';
    return;
  }

  let tablesHTML = "";
  if (data.tables && Array.isArray(data.tables)) {
    tablesHTML =
      "<div class='scrollable-table'><table><thead><tr><th>Table</th><th>Rows</th></tr></thead><tbody>";
    data.tables.forEach((table) => {
      tablesHTML += `<tr><td>${table.name}</td><td>${table.count || 0}</td></tr>`;
    });
    tablesHTML += "</tbody></table></div>";
  }

  content.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between;">
        <span><strong>Tables:</strong> ${data.tables ? data.tables.length : 0}</span>
        <span><strong>Total Rows:</strong> ${data.totalRows || 0}</span>
      </div>
      <div style="font-size: 0.9rem; color: var(--secondary); margin-top: 0.5rem;">
        Type: ${data.type || "SQLite"} | File: ${data.file || "dev.sqlite3"}
      </div>
    </div>
    ${tablesHTML}
  `;
}

function displayPerformance(data) {
  const content = document.getElementById("performance-content");
  if (!data) {
    content.innerHTML = '<div class="error">Performance data unavailable</div>';
    return;
  }

  const heapUsed = data.heap?.used || 0;
  const heapTotal = data.heap?.total || 0;
  const heapPercent = ((heapUsed / heapTotal) * 100).toFixed(1);
  const externalMemory = data.external || 0;

  content.innerHTML = `
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-value">${formatBytes(heapUsed)}</div>
        <div class="metric-label">Heap Used</div>
      </div>
      <div class="metric">
        <div class="metric-value">${formatBytes(heapTotal)}</div>
        <div class="metric-label">Heap Total</div>
      </div>
      <div class="metric">
        <div class="metric-value">${heapPercent}%</div>
        <div class="metric-label">Heap Usage</div>
      </div>
      <div class="metric">
        <div class="metric-value">${formatBytes(externalMemory)}</div>
        <div class="metric-label">External</div>
      </div>
    </div>
  `;
}

function displayFeatures(data) {
  const content = document.getElementById("features-content");
  if (!data) {
    content.innerHTML = '<div class="error">Features data unavailable</div>';
    return;
  }

  let featuresHTML = "";
  if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      const status =
        value === true
          ? "status-healthy"
          : value === false
            ? "status-danger"
            : "status-warning";
      const icon = value === true ? "✅" : value === false ? "❌" : "⚠️";
      featuresHTML += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>${key}:</span>
          <span class="status-badge ${status}">${icon}</span>
        </div>
      `;
    });
  }

  content.innerHTML =
    featuresHTML || '<div class="error">No features available</div>';
}

function displayRoutes(data) {
  const content = document.getElementById("routes-content");
  if (!data) {
    content.innerHTML =
      '<div class="error" style="color: #ef4444; padding: 1rem;">❌ Routes data unavailable - Check backend connection</div>';
    return;
  }

  console.log("🛣️ Routes data:", data);

  // Extract routes from different possible formats
  const routes = data.endpoints || data.routes || data || [];

  if (!Array.isArray(routes) || routes.length === 0) {
    content.innerHTML =
      '<div style="color: #6b7280; padding: 1rem; font-style: italic;">⚠️ No routes found</div>';
    return;
  }

  const methodColors = {
    GET: "method-get",
    POST: "method-post",
    PUT: "method-put",
    DELETE: "method-delete",
    PATCH: "method-patch",
  };

  // Group routes by method
  const grouped = {};
  routes.forEach((route) => {
    const method = route.method || "GET";
    if (!grouped[method]) grouped[method] = [];
    grouped[method].push(route);
  });

  let html = '<div style="margin-top: 1rem;">';
  Object.entries(grouped).forEach(([method, methodRoutes]) => {
    html += `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span class="method-badge ${methodColors[method]}">${method}</span>
          <span style="color: #6b7280; font-weight: normal; font-size: 0.9rem;">(${methodRoutes.length} routes)</span>
        </h4>
        <div class="scrollable-table">
          <table style="font-size: 0.9rem; width: 100%;">
            <thead>
              <tr>
                <th style="width: 80px;">Methode</th>
                <th>Pfad</th>
                <th style="width: 100px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${methodRoutes
                .slice(0, 50)
                .map(
                  (route) => `
              <tr>
                <td><span class="method-badge ${methodColors[method]}">${method}</span></td>
                <td style="font-family: monospace; color: #1f2937;">${route.path || route.route || "/"}</td>
                <td><span class="status-badge status-healthy" style="font-size: 0.75rem;">✅ Active</span></td>
              </tr>
            `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        ${methodRoutes.length > 50 ? `<p style="color: var(--secondary); font-size: 0.8rem; margin-top: 0.5rem; text-align: center;">+ ${methodRoutes.length - 50} weitere Routen...</p>` : ""}
      </div>
    `;
  });

  html += "</div>";
  html += `<div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
    <strong style="color: #1e40af;">📊 Gesamt: ${routes.length} Routen</strong> | 
    <span style="color: #6b7280;">GET: ${grouped.GET?.length || 0}</span> | 
    <span style="color: #6b7280;">POST: ${grouped.POST?.length || 0}</span> | 
    <span style="color: #6b7280;">PUT: ${grouped.PUT?.length || 0}</span> | 
    <span style="color: #6b7280;">DELETE: ${grouped.DELETE?.length || 0}</span> | 
    <span style="color: #6b7280;">PATCH: ${grouped.PATCH?.length || 0}</span>
  </div>`;

  html += "</div>";
  content.innerHTML = html;
}

function displayResources(data) {
  const content = document.getElementById("resources-content");
  if (!data) {
    content.innerHTML = '<div class="error">Resources data unavailable</div>';
    return;
  }

  const memPercent = data.memoryUsagePercent || 0;
  const memStatus =
    memPercent > 80
      ? "status-danger"
      : memPercent > 60
        ? "status-warning"
        : "status-healthy";

  content.innerHTML = `
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-value">${data.memoryUsagePercent?.toFixed(1) || 0}%</div>
        <div class="metric-label">Memory %</div>
      </div>
      <div class="metric">
        <div class="metric-value">${data.totalMemory ? formatBytes(data.totalMemory) : "N/A"}</div>
        <div class="metric-label">Total Memory</div>
      </div>
      <div class="metric">
        <div class="metric-value">${data.cpuUsagePercent?.toFixed(1) || 0}%</div>
        <div class="metric-label">CPU %</div>
      </div>
      <div class="metric">
        <div class="metric-value">${data.uptime ? formatSeconds(data.uptime) : "N/A"}</div>
        <div class="metric-label">Uptime</div>
      </div>
    </div>
    <div style="margin-top: 1rem;">
      <div style="display: flex; justify-content: space-between;">
        <span>Memory Status:</span>
        <span class="status-badge ${memStatus}">
          ${memPercent > 80 ? "❌ Critical" : memPercent > 60 ? "⚠️ High" : "✅ Normal"}
        </span>
      </div>
    </div>
  `;
}

function displayEnvironment(data) {
  const content = document.getElementById("environment-content");
  if (!data) {
    content.innerHTML = '<div class="error">Environment data unavailable</div>';
    return;
  }

  let envHTML =
    '<div style="font-family: monospace; background: var(--light); padding: 1rem; border-radius: 8px; max-height: 400px; overflow-y: auto;">';
  Object.entries(data).forEach(([key, value]) => {
    envHTML += `<div style="margin-bottom: 0.5rem;"><strong>${key}:</strong> ${String(value).substring(0, 100)}</div>`;
  });
  envHTML += "</div>";

  content.innerHTML = envHTML;
}

function displayDependencies(data) {
  const content = document.getElementById("dependencies-content");
  if (!data) {
    content.innerHTML =
      '<div class="error">Dependencies data unavailable</div>';
    return;
  }

  let depsHTML =
    "<div class='scrollable-table'><table><thead><tr><th>Package</th><th>Version</th></tr></thead><tbody>";

  if (data.packages && Array.isArray(data.packages)) {
    data.packages.slice(0, 30).forEach((pkg) => {
      depsHTML += `<tr><td>${pkg.name}</td><td style="font-family: monospace;">${pkg.version}</td></tr>`;
    });
  }

  depsHTML += "</tbody></table></div>";
  if (data.packages && data.packages.length > 30) {
    depsHTML += `<p style="color: var(--secondary); font-size: 0.8rem; margin-top: 0.5rem;">+ ${data.packages.length - 30} more packages</p>`;
  }

  content.innerHTML = depsHTML;
}

function displayDiagnostics(data) {
  const content = document.getElementById("diagnostics-content");
  if (!data) {
    content.innerHTML = '<div class="error">Diagnostics data unavailable</div>';
    return;
  }

  const systemInfo = data.systemInfo || {};
  const schedulerInfo = data.schedulerInfo || {};

  let html = `
    <div style="margin-bottom: 1rem;">
      <h4>System Diagnostics:</h4>
      <div style="background: var(--light); padding: 1rem; border-radius: 8px; font-size: 0.9rem;">
        <div><strong>Free Memory:</strong> ${formatBytes(systemInfo.freeMemory || 0)}</div>
        <div><strong>Total Memory:</strong> ${formatBytes(systemInfo.totalMemory || 0)}</div>
        <div><strong>CPU Count:</strong> ${systemInfo.cpuCount || 0}</div>
        <div><strong>Platform:</strong> ${systemInfo.platform || "N/A"}</div>
      </div>
    </div>
    <div>
      <h4>Scheduler Info:</h4>
      <div style="background: var(--light); padding: 1rem; border-radius: 8px; font-size: 0.9rem;">
        <div><strong>Running:</strong> ${schedulerInfo.isRunning ? "✅" : "❌"}</div>
        <div><strong>Last Run:</strong> ${schedulerInfo.lastRun || "Never"}</div>
        <div><strong>Next Scheduled:</strong> ${schedulerInfo.nextScheduled || "N/A"}</div>
      </div>
    </div>
  `;

  content.innerHTML = html;
}

function displayFunctions(data) {
  const content = document.getElementById("functions-content");
  if (!data) {
    content.innerHTML = '<div class="error">Functions data unavailable</div>';
    return;
  }

  const functions = data.functions || [];
  const categories = data.categories || {};

  let html = `
    <div style="margin-bottom: 1rem;">
      <div class="metric-grid">
        <div class="metric">
          <div class="metric-value">${functions.length}</div>
          <div class="metric-label">Total Functions</div>
        </div>
        <div class="metric">
          <div class="metric-value">${Object.keys(categories).length}</div>
          <div class="metric-label">Categories</div>
        </div>
      </div>
    </div>
    <div class="scrollable-table">
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Status</th></tr></thead>
        <tbody>
  `;

  functions.slice(0, 20).forEach((func) => {
    const status =
      func.enabled === false
        ? "status-danger"
        : func.enabled === true
          ? "status-healthy"
          : "status-warning";
    html += `
      <tr>
        <td>${func.name || "Unknown"}</td>
        <td>${func.category || "General"}</td>
        <td><span class="status-badge ${status}">${func.enabled ? "✅" : "❌"}</span></td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  if (functions.length > 20) {
    html += `<p style="color: var(--secondary); font-size: 0.8rem; margin-top: 0.5rem;">+ ${functions.length - 20} more functions</p>`;
  }

  content.innerHTML = html;
}

// ============================================================================
// UTILITIES
// ============================================================================

function updateTimestamp() {
  const now = new Date();
  document.getElementById("timestamp").textContent =
    now.toLocaleTimeString("de-DE");
  document.getElementById("last-update").textContent =
    now.toLocaleString("de-DE");
}

function formatSeconds(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Deactivate all buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add("active");
  }

  // Activate button
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add("active");
}

// ============================================================================
// MAINTENANCE CALENDAR
// ============================================================================

function displayMaintenanceCalendar() {
  // Sample maintenance and backup schedule
  const maintenanceEvents = [
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      title: "Datenbank-Wartung",
      type: "maintenance",
      priority: "medium",
    },
    {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      title: "System-Update",
      type: "maintenance",
      priority: "high",
    },
    {
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      title: "Security Audit",
      type: "maintenance",
      priority: "high",
    },
  ];

  const backupEvents = [
    {
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      title: "Tägliches Backup",
      type: "backup",
      frequency: "täglich",
    },
    {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      title: "Wöchentliches Vollbackup",
      type: "backup",
      frequency: "wöchentlich",
    },
    {
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      title: "Monatliches Archiv",
      type: "backup",
      frequency: "monatlich",
    },
  ];

  // Display maintenance events
  const maintenanceList = document.getElementById("maintenance-list");
  if (maintenanceList) {
    const html = maintenanceEvents
      .map((event) => {
        const dateStr = event.date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const priorityClass =
          event.priority === "high"
            ? "status-danger"
            : event.priority === "medium"
              ? "status-warning"
              : "status-healthy";
        const priorityIcon =
          event.priority === "high"
            ? "🔴"
            : event.priority === "medium"
              ? "🟡"
              : "🟢";

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem;">
          <div>
            <div style="font-weight: 600; color: #1f2937;">${event.title}</div>
            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">📅 ${dateStr}</div>
          </div>
          <span class="status-badge ${priorityClass}" style="font-size: 0.75rem;">
            ${priorityIcon} ${event.priority.toUpperCase()}
          </span>
        </div>
      `;
      })
      .join("");

    maintenanceList.innerHTML =
      html ||
      '<div style="color: #6b7280; font-style: italic;">Keine Wartungstermine geplant</div>';
  }

  // Display backup schedule
  const backupSchedule = document.getElementById("backup-schedule");
  if (backupSchedule) {
    const html = backupEvents
      .map((event) => {
        const dateStr = event.date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; margin-bottom: 0.5rem; border-left: 3px solid #3b82f6;">
          <div>
            <div style="font-weight: 600; color: #1f2937;">💾 ${event.title}</div>
            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">🕒 ${dateStr}</div>
          </div>
          <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
            ${event.frequency}
          </span>
        </div>
      `;
      })
      .join("");

    backupSchedule.innerHTML =
      html ||
      '<div style="color: #6b7280; font-style: italic;">Keine Backups geplant</div>';
  }
}

// ============================================================================
// INIT
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  // Display maintenance calendar
  setTimeout(() => {
    displayMaintenanceCalendar();
  }, 500);
});
