// API Base URLs
const API_BASE = '/api/system';
const AI_BASE = '/api/ai-annotator';
const FUNCTIONS_BASE = '/api/functions';

// Gesamter System State
let systemState = {};
let autoRefreshInterval;
let refreshCount = 0;

// Einfacher Admin Login - komplett im Frontend gelöst
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Login Handler - komplett im Frontend
function initLogin() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginError = document.getElementById('login-error');

    // Check if already logged in (Session Storage für bessere Sicherheit)
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    console.log('Admin-Sitzung erkannt → Dashboard öffnen');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    initDashboard();
    return;
    }



    // Pre-fill credentials for testing
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'admin123';

    loginBtn.addEventListener('click', handleLogin);
    
    
    // Enter key login
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    function handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Login erfolgreich
            sessionStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
            loginError.style.display = 'none';
        } else {
            // Login fehlgeschlagen
            loginError.style.display = 'block';
            loginError.textContent = 'Falsche Anmeldedaten! Benutzername: admin, Passwort: admin123';
        }
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        initDashboard();
    }

    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        dashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'admin123';
        loginError.style.display = 'none';
        
        // Clear auto-refresh
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    });
}

// Dashboard Initialisierung
function initDashboard() {
    console.log('Dashboard initialisiert');
    
    // Event Listeners
    document.getElementById('refresh-btn').addEventListener('click', function() {
        console.log('Manuelles Refresh');
        loadSystemData();
    });
    
    document.getElementById('load-all-btn').addEventListener('click', function() {
        console.log('Lade alle Daten');
        loadAllData();
    });
    
    // Quick Actions
    document.querySelectorAll('.quick-btn[data-endpoint]').forEach(btn => {
        btn.addEventListener('click', function() {
            const endpoint = this.getAttribute('data-endpoint');
            console.log('Quick Action:', endpoint);
            testAPI(endpoint);
        });
    });
    
    document.getElementById('quick-load-all').addEventListener('click', function() {
        console.log('Quick Load All');
        loadAllData();
    });
    
    document.getElementById('open-system-api').addEventListener('click', function() {
        console.log('Öffne System API');
        window.open('/api/system', '_blank');
    });

    // Tab Navigation
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.tab-container');
            const containerId = container ? container.id : 'routes-tab';
            const tabId = this.getAttribute('data-tab');
            console.log('Tab gewechselt:', tabId);
            switchTab(containerId, tabId, this);
        });
    });

    // Initial load
    loadSystemData();

    // Auto-refresh alle 30 Sekunden
    autoRefreshInterval = setInterval(function() {
        console.log('Auto-Refresh');
        loadSystemData();
    }, 30000);

    // Auto-refresh Indicator
    const existingIndicator = document.querySelector('.auto-refresh-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'auto-refresh-indicator';
    indicator.textContent = '🔄 0';
    document.body.appendChild(indicator);

    setInterval(() => {
        refreshCount++;
        indicator.textContent = `🔄 ${refreshCount}`;
    }, 30000);
}

// Systemdaten laden
async function loadSystemData() {
    const timestamp = document.getElementById('timestamp');
    const lastUpdate = document.getElementById('last-update');
    const now = new Date();
    
    timestamp.textContent = `Lädt... ${now.toLocaleTimeString()}`;

    try {
        console.log('Lade Systemdaten von:', API_BASE);
        const response = await fetch(API_BASE);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Systemdaten erhalten:', result);

        if (result.success) {
            systemState = result.data;
            displaySystemOverview(result.data);
            lastUpdate.textContent = now.toLocaleString();
            timestamp.textContent = `Aktualisiert: ${now.toLocaleTimeString()}`;
            
            // Zusätzliche Daten laden
            loadAIData();
            loadFunctionsData();
        } else {
            throw new Error(result.error || 'Unbekannter Fehler');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Systemdaten:', error);
        showError('Fehler beim Laden der Systemdaten: ' + error.message);
        
        // Zeige Fehler in allen Bereichen an
        document.querySelectorAll('.loading').forEach(el => {
            el.innerHTML = `<div style="color: var(--danger);">Verbindungsfehler: ${error.message}</div>`;
        });
    }
}

// Alle Daten laden
async function loadAllData() {
    console.log('Lade alle verfügbaren Daten');
    await loadSystemData();
    // Zusätzliche API Calls können hier hinzugefügt werden
}

// AI Daten laden
async function loadAIData() {
    try {
        console.log('Lade AI-Daten von:', AI_BASE + '/status');
        const response = await fetch(AI_BASE + '/status');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('AI-Daten erhalten:', result);
        
        if (result.success) {
            displayAIData(result.data);
        } else {
            throw new Error(result.error || 'AI Service nicht verfügbar');
        }
    } catch (error) {
        console.error('Fehler beim Laden der AI-Daten:', error);
        document.getElementById('ai-content').innerHTML = 
            `<div style="color: var(--danger);">Fehler beim Laden der AI-Daten: ${error.message}</div>`;
    }
}

// Functions Daten laden
async function loadFunctionsData() {
    try {
        console.log('Lade Functions-Daten von:', FUNCTIONS_BASE);
        const response = await fetch(FUNCTIONS_BASE);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Functions-Daten erhalten:', result);
        
        if (result.success) {
            displayFunctionsData(result.data);
        } else {
            throw new Error(result.error || 'Functions nicht verfügbar');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Functions-Daten:', error);
        document.getElementById('functions-content').innerHTML = 
            `<div style="color: var(--danger);">Fehler beim Laden der Functions-Daten: ${error.message}</div>`;
    }
}

// System-Übersicht anzeigen
function displaySystemOverview(data) {
    console.log('Zeige System-Übersicht an');
    displayServiceStatus(data.serviceStatus);
    displaySystemInfo(data.systemInfo);
    displayDatabaseInfo(data.database);
    displayRoutes(data.routes);
    displayDetailedInfo(data);
}

// Service Status anzeigen
function displayServiceStatus(status) {
    const content = document.getElementById('status-content');
    
    if (!status) {
        content.innerHTML = '<div style="color: var(--danger);">Keine Statusdaten verfügbar</div>';
        return;
    }

    const dbStatus = status.database?.connected ? 'status-healthy' : 'status-danger';
    const aiStatus = status.ai?.available ? 'status-healthy' : 'status-warning';
    const funcStatus = status.functions?.loaded ? 'status-healthy' : 'status-warning';

    content.innerHTML = `
        <div class="metric-grid">
            <div class="metric">
                <div class="metric-value">${status.database?.tables || 0}</div>
                <div class="metric-label">Tabellen</div>
            </div>
            <div class="metric">
                <div class="metric-value">${status.database?.totalRows || 0}</div>
                <div class="metric-label">Datensätze</div>
            </div>
            <div class="metric">
                <div class="metric-value">${status.functions?.nodes || 0}</div>
                <div class="metric-label">Knoten</div>
            </div>
            <div class="metric">
                <div class="metric-value">${status.ai?.provider || 'N/A'}</div>
                <div class="metric-label">AI Provider</div>
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Datenbank:</span>
                <span class="status-badge ${dbStatus}">
                    ${status.database?.connected ? '✅ Verbunden' : '❌ Getrennt'}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>AI Service:</span>
                <span class="status-badge ${aiStatus}">
                    ${status.ai?.available ? '✅ Verfügbar' : '⚠️ Nicht verfügbar'}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Functions:</span>
                <span class="status-badge ${funcStatus}">
                    ${status.functions?.loaded ? '✅ Geladen' : '⚠️ Nicht geladen'}
                </span>
            </div>
        </div>
    `;

    // Status-Card Farbe anpassen
    const statusCard = document.getElementById('status-card');
    if (statusCard) {
        statusCard.className = 'card ' + (
            !status.database?.connected ? 'danger' :
            !status.ai?.available || !status.functions?.loaded ? 'warning' : 'success'
        );
    }
}

// System-Informationen anzeigen
function displaySystemInfo(systemInfo) {
    const content = document.getElementById('system-content');
    
    if (!systemInfo) {
        content.innerHTML = '<div style="color: var(--danger);">Keine Systeminformationen verfügbar</div>';
        return;
    }

    const uptime = formatUptime(systemInfo.process?.uptime || 0);
    const systemUptime = formatUptime(systemInfo.system?.uptime || 0);
    const loadAvg = systemInfo.system?.loadAverage ? systemInfo.system.loadAverage[0].toFixed(2) : 'N/A';

    content.innerHTML = `
        <div style="margin-bottom: 1rem; font-size: 0.9rem;">
            <div><strong>Node.js:</strong> ${systemInfo.nodejs?.version || 'N/A'}</div>
            <div><strong>Plattform:</strong> ${systemInfo.system?.platform || 'N/A'} ${systemInfo.system?.arch || ''}</div>
            <div><strong>Hostname:</strong> ${systemInfo.system?.hostname || 'N/A'}</div>
            <div><strong>Prozess Uptime:</strong> ${uptime}</div>
            <div><strong>System Uptime:</strong> ${systemUptime}</div>
        </div>
        <div class="metric-grid">
            <div class="metric">
                <div class="metric-value">${systemInfo.system?.cpus || 0}</div>
                <div class="metric-label">CPUs</div>
            </div>
            <div class="metric">
                <div class="metric-value">${systemInfo.process?.memory?.rss || 'N/A'}</div>
                <div class="metric-label">Memory</div>
            </div>
            <div class="metric">
                <div class="metric-value">${loadAvg}</div>
                <div class="metric-label">Load (1min)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${systemInfo.process?.pid || 'N/A'}</div>
                <div class="metric-label">PID</div>
            </div>
        </div>
    `;
}

// Datenbank-Informationen anzeigen
function displayDatabaseInfo(database) {
    const content = document.getElementById('database-content');
    
    if (!database) {
        content.innerHTML = '<div style="color: var(--danger);">Keine Datenbankinformationen verfügbar</div>';
        return;
    }

    let tablesHTML = '';
    if (database.tables && database.tables.length > 0) {
        tablesHTML = `
            <div class="scrollable-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tabelle</th>
                            <th style="text-align: right;">Zeilen</th>
                            <th style="text-align: right;">Größe</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${database.tables.map(table => {
                            const rowCount = database.rowCounts ? database.rowCounts[table] || 0 : 0;
                            const size = database.sizeInfo ? (database.sizeInfo[table] || '?') : '?';
                            return `
                                <tr>
                                    <td><strong>${table}</strong></td>
                                    <td style="text-align: right;">${rowCount}</td>
                                    <td style="text-align: right;">${size}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        tablesHTML = '<div style="color: var(--secondary); text-align: center;">Keine Tabellen gefunden</div>';
    }

    content.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between;">
                <span><strong>Tabellen:</strong> ${database.tables ? database.tables.length : 0}</span>
                <span><strong>Zeilen gesamt:</strong> ${systemState.serviceStatus?.database?.totalRows || 0}</span>
            </div>
        </div>
        ${tablesHTML}
    `;
}

// AI Daten anzeigen
function displayAIData(aiData) {
    const content = document.getElementById('ai-content');
    
    if (!aiData) {
        content.innerHTML = '<div style="color: var(--secondary);">Keine AI-Daten verfügbar</div>';
        return;
    }

    const status = aiData.available ? 'status-healthy' : 'status-warning';
    
    content.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Provider:</span>
                <span><strong>${aiData.provider || 'N/A'}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Modell:</span>
                <span>${aiData.model || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Status:</span>
                <span class="status-badge ${status}">
                    ${aiData.available ? '✅ Verfügbar' : '⚠️ Nicht verfügbar'}
                </span>
            </div>
        </div>
        <div class="metric-grid">
            <div class="metric">
                <div class="metric-value">${aiData.capabilities ? aiData.capabilities.length : 0}</div>
                <div class="metric-label">Funktionen</div>
            </div>
            <div class="metric">
                <div class="metric-value">${aiData.provider === 'none' ? '❌' : '✅'}</div>
                <div class="metric-label">Aktiv</div>
            </div>
        </div>
    `;
}

// Functions Daten anzeigen
function displayFunctionsData(functionsData) {
    const content = document.getElementById('functions-content');
    
    if (!functionsData) {
        content.innerHTML = '<div style="color: var(--secondary);">Keine Functions-Daten verfügbar</div>';
        return;
    }

    const nodeCount = functionsData.nodes ? functionsData.nodes.length : 0;
    const rootNodes = functionsData.nodes ? functionsData.nodes.filter(node => !node.parentId).length : 0;

    content.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Gesamt Knoten:</span>
                <span><strong>${nodeCount}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Wurzel-Knoten:</span>
                <span>${rootNodes}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Typen:</span>
                <span>${countNodeTypes(functionsData.nodes)}</span>
            </div>
        </div>
        <div class="metric-grid">
            <div class="metric">
                <div class="metric-value">${nodeCount}</div>
                <div class="metric-label">Knoten</div>
            </div>
            <div class="metric">
                <div class="metric-value">${rootNodes}</div>
                <div class="metric-label">Wurzeln</div>
            </div>
        </div>
    `;
}

// Routes anzeigen
function displayRoutes(routes) {
    const content = document.getElementById('routes-content');
    const routesCount = document.getElementById('routes-count');
    
    if (!routes || !routes.endpoints) {
        content.innerHTML = '<div style="color: var(--secondary);">Keine Routes verfügbar</div>';
        routesCount.textContent = '0 Routes';
        return;
    }

    routesCount.textContent = `${routes.endpoints.length} Routes`;

    // Alle Routes
    content.innerHTML = createRoutesTable(routes.endpoints);
    
    // AI Routes
    const aiRoutes = routes.endpoints.filter(route => 
        route.path.includes('/ai') || route.path.includes('ai-annotator')
    );
    document.getElementById('ai-routes-content').innerHTML = createRoutesTable(aiRoutes);
    
    // Function Routes
    const functionRoutes = routes.endpoints.filter(route => 
        route.path.includes('/functions')
    );
    document.getElementById('function-routes-content').innerHTML = createRoutesTable(functionRoutes);
}

function createRoutesTable(routes) {
    if (!routes || routes.length === 0) {
        return '<div style="color: var(--secondary); text-align: center;">Keine Routes in dieser Kategorie</div>';
    }

    // Defensive Normalisierung: akzeptiere Strings oder Objekte
    const normalized = routes.map(r => {
        if (typeof r === 'string') {
            // Erwarte Format "GET /path" oder "GET,POST /path"
            const m = r.match(/^([A-Z,]+)\s+(.+)$/);
            if (m) {
                return { methods: m[1].split(',').map(s => s.trim()), path: m[2].trim() };
            }
            // Fallback: kein Methodenpräfix → nur Pfad
            return { methods: ['GET'], path: r.trim() };
        }
        // Objekt mit {path, methods}
        return {
            path: r.path || '/',
            methods: Array.isArray(r.methods) ? r.methods : ['GET']
        };
    });

    return `
        <div class="scrollable-table">
            <table>
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Path</th>
                    </tr>
                </thead>
                <tbody>
                    ${normalized.map(route => `
                        <tr>
                            <td>
                                ${route.methods.map(method =>
                                    `<span class="method-badge method-${method.toLowerCase()}">${method}</span>`
                                ).join(' ')}
                            </td>
                            <td style="font-family: monospace; font-size: 0.75rem;">
                                ${route.path}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}


// Detaillierte Informationen anzeigen
function displayDetailedInfo(data) {
    const content = document.getElementById('detailed-content');
    
    if (!data) {
        content.innerHTML = '<div style="color: var(--danger);">Keine detaillierten Informationen verfügbar</div>';
        return;
    }

    const envVars = data.systemInfo?.environment || {};
    
    content.innerHTML = `
        <div class="scrollable-table">
            <table>
                <thead>
                    <tr>
                        <th>Bereich</th>
                        <th>Metrik</th>
                        <th>Wert</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Datenbank</td>
                        <td>Verbindung</td>
                        <td>${data.serviceStatus?.database?.connected ? 'Aktiv' : 'Inaktiv'}</td>
                        <td>
                            <span class="status-badge ${data.serviceStatus?.database?.connected ? 'status-healthy' : 'status-danger'}">
                                ${data.serviceStatus?.database?.connected ? 'OK' : 'FEHLER'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Datenbank</td>
                        <td>Tabellen</td>
                        <td>${data.serviceStatus?.database?.tables || 0}</td>
                        <td>
                            <span class="status-badge status-healthy">OK</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Functions</td>
                        <td>Knoten</td>
                        <td>${data.serviceStatus?.functions?.nodes || 0}</td>
                        <td>
                            <span class="status-badge ${data.serviceStatus?.functions?.loaded ? 'status-healthy' : 'status-warning'}">
                                ${data.serviceStatus?.functions?.loaded ? 'OK' : 'WARNUNG'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>AI Service</td>
                        <td>Provider</td>
                        <td>${data.serviceStatus?.ai?.provider || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${data.serviceStatus?.ai?.available ? 'status-healthy' : 'status-warning'}">
                                ${data.serviceStatus?.ai?.available ? 'OK' : 'NICHT VERFÜGBAR'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>System</td>
                        <td>Node.js Version</td>
                        <td>${data.systemInfo?.nodejs?.version || 'N/A'}</td>
                        <td>
                            <span class="status-badge status-healthy">OK</span>
                        </td>
                    </tr>
                    <tr>
                        <td>System</td>
                        <td>Speicherverbrauch</td>
                        <td>${data.systemInfo?.process?.memory?.rss || 'N/A'}</td>
                        <td>
                            <span class="status-badge status-healthy">OK</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Environment</td>
                        <td>NODE_ENV</td>
                        <td>${envVars.NODE_ENV || 'N/A'}</td>
                        <td>
                            <span class="status-badge status-healthy">OK</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Environment</td>
                        <td>PORT</td>
                        <td>${envVars.PORT || 'N/A'}</td>
                        <td>
                            <span class="status-badge status-healthy">OK</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Hilfsfunktionen
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function countNodeTypes(nodes) {
    if (!nodes) return '0';
    const types = {};
    nodes.forEach(node => {
        types[node.kind] = (types[node.kind] || 0) + 1;
    });
    return Object.keys(types).length;
}

function switchTab(containerId, tabId, button) {
    // Tab Buttons
    document.querySelectorAll(`#${containerId} .tab-button`).forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Tab Contents
    document.querySelectorAll(`#${containerId} .tab-content`).forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

function testAPI(endpoint) {
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            alert(`✅ ${endpoint}\nStatus: ${data.success ? 'Erfolg' : 'Fehler'}\n${data.error || ''}`);
        })
        .catch(error => {
            alert(`❌ ${endpoint}\nFehler: ${error.message}`);
        });
}

async function testMultipleAPIs() {
    const apis = [
        '/api/health',
        '/api/ai-annotator/status', 
        '/api/functions',
        '/api/routes',
        '/api/dashboard'
    ];
    
    for (const api of apis) {
        await testAPI(api);
    }
}

function showError(message) {
    const content = document.getElementById('status-content');
    content.innerHTML = `<div style="color: var(--danger); text-align: center;">${message}</div>`;
}
// App starten – sicheres Initialisieren nach DOM-Ladung
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM vollständig geladen → Initialisiere Login');

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');

    // Sicherheitshalber Anzeigezustand zurücksetzen
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';

    try {
        initLogin();
    } catch (err) {
        console.error('Login-Initialisierung fehlgeschlagen:', err);
    }
});
