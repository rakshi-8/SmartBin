// ==========================================================================
// SmartBin - IoT Waste Monitoring System MVP (Vanilla JS)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    const depotLocation = { lat: 9.9312, lng: 78.1111 }; // Madurai Corporation Office Mock

    let bins = [];
    const isLocalFile = window.location.protocol === 'file:';

    async function loadDatabase() {
        if (isLocalFile) {
            let localData = localStorage.getItem('smartbins_data');
            if (localData) {
                bins = JSON.parse(localData);
            } else {
                bins = defaultBins; // Load defaults
            }
            return;
        }

        try {
            const res = await fetch('/api/bins');
            let data = await res.json();
            if (data && data.length > 0) {
                bins = data;
            } else {
                bins = defaultBins; // Fallback to defaults
            }
        } catch (e) {
            console.error('Failed to load API DB, falling back to LocalStorage', e);
            let localData = localStorage.getItem('smartbins_data');
            bins = localData ? JSON.parse(localData) : defaultBins;
        }
    }

    async function saveDatabase() {
        if (isLocalFile) {
            localStorage.setItem('smartbins_data', JSON.stringify(bins));
            return;
        }

        try {
            await fetch('/api/bins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bins)
            });
        } catch (e) {
            console.error('Failed to save API DB, saving to LocalStorage', e);
            localStorage.setItem('smartbins_data', JSON.stringify(bins)); // Local fallback
        }
    }

    let alerts = [];
    let map;
    let markers = {};
    let trendChart, areaChart;

    // --- UI Elements ---
    const elements = {
        themeToggle: document.getElementById('theme-toggle'),
        liveClock: document.getElementById('live-clock'),
        navItems: document.querySelectorAll('.nav-item'),
        pageViews: document.querySelectorAll('.page-view'),
        pageTitle: document.getElementById('page-title'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        sidebar: document.querySelector('.sidebar'),

        // Dashboard KPIs
        kpiTotal: document.getElementById('kpi-total'),
        kpiEmpty: document.getElementById('kpi-empty'),
        kpiHalf: document.getElementById('kpi-half'),
        kpiFull: document.getElementById('kpi-full'),
        kpiFullCard: document.getElementById('kpi-full-card'),

        // Panels
        quickAlertsList: document.getElementById('quick-alerts-list'),
        routeList: document.getElementById('optimized-route-list'),
        alertsTableBody: document.getElementById('alerts-table-body'),
        navAlertBadge: document.getElementById('nav-alert-badge'),
        binsTableBody: document.getElementById('bins-table-body'),

        // Modals
        alertModal: document.getElementById('alert-modal'),
        modalTitle: document.getElementById('modal-alert-title'),
        modalText: document.getElementById('modal-alert-text'),
        dismissBtn: document.getElementById('dismiss-alert-btn'),

        // Bin Form
        binModal: document.getElementById('bin-modal'),
        addBinBtn: document.getElementById('add-bin-btn'),
        cancelBinBtn: document.getElementById('cancel-bin-btn'),
        binForm: document.getElementById('bin-form')
    };

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    async function init() {
        await loadDatabase();
        startClock();
        setupNavigation();
        setupThemeToggle();
        initMap();
        initCharts();
        updateDashboard();
        renderBinsTable();

        // Start IoT Simulation loop (every 5 seconds)
        setInterval(simulateIoTData, 5000);

        // Event Listeners
        elements.dismissBtn.addEventListener('click', () => { elements.alertModal.classList.add('hidden'); });
        elements.mobileMenuBtn.addEventListener('click', () => { elements.sidebar.classList.toggle('open'); });
        elements.addBinBtn.addEventListener('click', () => { elements.binForm.reset(); document.getElementById('form-bin-id').value = ''; elements.binModal.classList.remove('hidden'); });
        elements.cancelBinBtn.addEventListener('click', () => { elements.binModal.classList.add('hidden'); });
        elements.binForm.addEventListener('submit', handleBinSubmit);
        document.getElementById('clear-alerts-btn').addEventListener('click', () => { alerts = []; updateAlertsUI(); });
        document.getElementById('bin-search').addEventListener('input', renderBinsTable);
        document.getElementById('bin-filter').addEventListener('change', renderBinsTable);
    }

    // ==========================================================================
    // CORE LOGIC & SIMULATION
    // ==========================================================================
    function simulateIoTData() {
        let changed = false;
        bins.forEach(bin => {
            // Randomly increase fill level by 1-5% occasionally
            if (Math.random() > 0.5) {
                bin.fillLevel += Math.floor(Math.random() * 6);
                if (bin.fillLevel > 100) bin.fillLevel = 100;

                // Update status
                let oldStatus = bin.status;
                if (bin.fillLevel >= 80) bin.status = "critical";
                else if (bin.fillLevel >= 50) bin.status = "warning";
                else bin.status = "ok";

                bin.lastUpdated = Date.now();
                changed = true;

                // Trigger alert if transitioning to critical
                if (oldStatus !== "critical" && bin.status === "critical") {
                    triggerAlert(bin);
                }
            }
        });

        if (changed) {
            saveDatabase();
            updateDashboard();
            if (!elements.binModal.classList.contains('hidden')) return; // Don't interrupt if editing
            renderBinsTable();
        }
    }

    function triggerAlert(bin) {
        const time = new Date().toLocaleTimeString();
        const alertObj = {
            id: Date.now(),
            time: time,
            binId: bin.id,
            area: bin.area,
            fillLevel: bin.fillLevel
        };

        alerts.unshift(alertObj); // Add to top

        // Show Modal Popup for critical alert
        elements.modalTitle.innerText = `Emergency: Bin Overflow`;
        elements.modalText.innerText = `Bin ${bin.id} in ${bin.area} has reached ${bin.fillLevel}% capacity. Immediate collection required.`;
        elements.alertModal.classList.remove('hidden');

        updateAlertsUI();
    }

    // ==========================================================================
    // ROUTE OPTIMIZATION (Greedy TSP Simulation)
    // ==========================================================================
    function calculateRoute() {
        const criticalBins = bins.filter(b => b.fillLevel >= 80);

        if (criticalBins.length < 2) {
            elements.routeList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-truck-fast text-muted" style="font-size:2rem; margin-bottom:10px;"></i><p class="text-muted">No optimal route needed right now. Everything is under control.</p></div>`;
            return;
        }

        // Simple Greedy TSP
        let unvisited = [...criticalBins];
        let currentPos = depotLocation;
        let route = [];

        while (unvisited.length > 0) {
            // Find nearest
            let nearestIdx = 0;
            let minDist = getDistance(currentPos, unvisited[0]);

            for (let i = 1; i < unvisited.length; i++) {
                let dist = getDistance(currentPos, unvisited[i]);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }

            let nextStop = unvisited.splice(nearestIdx, 1)[0];
            route.push(nextStop);
            currentPos = { lat: nextStop.lat, lng: nextStop.lng };
        }

        // Render Route
        elements.routeList.innerHTML = '';
        route.forEach((stop, index) => {
            elements.routeList.innerHTML += `
                <div class="route-item">
                    <span class="route-num">${index + 1}</span>
                    <div>
                        <strong>${stop.area}</strong> (${stop.id})<br>
                        <span class="text-red" style="font-size:0.75rem;"><i class="fa-solid fa-battery-full"></i> ${stop.fillLevel}%</span>
                    </div>
                </div>
            `;
        });
    }

    // Haversine formula for distance between coords
    function getDistance(p1, p2) {
        const R = 6371; // km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLng = (p2.lng - p1.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ==========================================================================
    // UI UPDATES
    // ==========================================================================
    function updateDashboard() {
        let empty = 0, half = 0, full = 0;

        bins.forEach(b => {
            if (b.status === 'ok') empty++;
            else if (b.status === 'warning') half++;
            else full++;
        });

        elements.kpiTotal.innerText = bins.length;
        elements.kpiEmpty.innerText = empty;
        elements.kpiHalf.innerText = half;
        elements.kpiFull.innerText = full;

        // Pulse effect if critical
        if (full > 0) elements.kpiFullCard.classList.add('urgency-pulse');
        else elements.kpiFullCard.classList.remove('urgency-pulse');

        updateMapMarkers();
        calculateRoute();
    }

    function updateAlertsUI() {
        // Badge
        elements.navAlertBadge.innerText = alerts.length;
        if (alerts.length > 0) elements.navAlertBadge.classList.remove('hidden');
        else elements.navAlertBadge.classList.add('hidden');

        // Quick sidebar list (last 3)
        if (alerts.length === 0) {
            elements.quickAlertsList.innerHTML = `<p class="text-muted text-center" style="padding: 1rem;">No recent alerts</p>`;
        } else {
            elements.quickAlertsList.innerHTML = alerts.slice(0, 3).map(a => `
                <div class="alert-item-mini">
                    <strong>${a.area}</strong>
                    <span><i class="fa-regular fa-clock"></i> ${a.time} - Bin ${a.binId} at ${a.fillLevel}%</span>
                </div>
            `).join('');
        }

        // Main Alerts Table
        if (alerts.length === 0) {
            elements.alertsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-2">No alerts generated yet.</td></tr>`;
        } else {
            elements.alertsTableBody.innerHTML = alerts.map(a => `
                <tr>
                    <td>${a.time}</td>
                    <td><strong>${a.binId}</strong></td>
                    <td>${a.area}</td>
                    <td><span class="text-red font-bold">${a.fillLevel}%</span></td>
                    <td><span class="status-badge bg-red-light text-red">Critical</span></td>
                </tr>
            `).join('');
        }
    }

    function renderBinsTable() {
        const search = document.getElementById('bin-search').value.toLowerCase();
        const filter = document.getElementById('bin-filter').value;

        let filteredBins = bins.filter(b => {
            const matchSearch = b.area.toLowerCase().includes(search) || b.id.toLowerCase().includes(search);
            const matchFilter = filter === 'all' || b.status === filter;
            return matchSearch && matchFilter;
        });

        if (filteredBins.length === 0) {
            elements.binsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-2">No bins found.</td></tr>`;
            return;
        }

        elements.binsTableBody.innerHTML = filteredBins.map(b => {
            let colorMap = { 'ok': 'green', 'warning': 'yellow', 'critical': 'red' };
            let color = colorMap[b.status];
            let lastUpdatedStr = new Date(b.lastUpdated).toLocaleTimeString();

            return `
                <tr>
                    <td><strong>${b.id}</strong></td>
                    <td>${b.area}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="flex:1; background:var(--bg-main); height:8px; border-radius:4px; overflow:hidden;">
                                <div style="width:${b.fillLevel}%; background:var(--${color}); height:100%;"></div>
                            </div>
                            <span class="text-${color}" style="font-size:0.8rem; font-weight:bold; min-width:35px;">${b.fillLevel}%</span>
                        </div>
                    </td>
                    <td>${b.battery}% <i class="fa-solid fa-battery-three-quarters text-muted"></i></td>
                    <td class="text-muted" style="font-size:0.85rem;">${lastUpdatedStr}</td>
                    <td>
                        <button class="icon-btn" onclick="window.editBin('${b.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" onclick="window.deleteBin('${b.id}')" title="Delete" style="color:var(--red);"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================================================
    // MAP & CHARTS
    // ==========================================================================
    function initMap() {
        // Madurai coords
        map = L.map('map').setView([9.9252, 78.1198], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            className: document.body.classList.contains('dark-mode') ? 'map-dark' : ''
        }).addTo(map);

        // Add custom CSS for dark mode map tiles (CSS filter approach)
        let style = document.createElement('style');
        style.innerHTML = `
            .map-dark { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); }
        `;
        document.head.appendChild(style);

        updateMapMarkers();

        // Invalidate size when map tab is shown to fix rendering
        document.querySelector('[data-target="dashboard"]').addEventListener('click', () => {
            setTimeout(() => map.invalidateSize(), 300);
        });
    }

    function getMarkerIcon(status) {
        let colorMap = { 'ok': '#2ecc71', 'warning': '#f1c40f', 'critical': '#e74c3c' };
        let color = colorMap[status];

        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3); ${status === 'critical' ? 'animation: pulse 1s infinite;' : ''}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }

    function updateMapMarkers() {
        // Clear old markers
        Object.values(markers).forEach(m => map.removeLayer(m));
        markers = {};

        bins.forEach(bin => {
            let marker = L.marker([bin.lat, bin.lng], { icon: getMarkerIcon(bin.status) })
                .bindPopup(`
                    <div style="font-family:Inter,sans-serif; text-align:center;">
                        <h3 style="margin:0 0 5px 0; font-size:14px; display:flex; gap:5px; align-items:center justify-content:center;">
                            <i class="fa-solid fa-dumpster" style="color:${bin.status === 'ok' ? '#2ecc71' : bin.status === 'warning' ? '#f1c40f' : '#e74c3c'}"></i> 
                            ${bin.area}
                        </h3>
                        <p style="margin:0; font-size:12px; color:#666;">ID: <strong>${bin.id}</strong></p>
                        <p style="margin:5px 0 0 0; font-size:16px; font-weight:bold;">Fill: ${bin.fillLevel}%</p>
                        <p style="margin:2px 0 0 0; font-size:11px; color:#888;">Battery: ${bin.battery}%</p>
                    </div>
                `);
            marker.addTo(map);
            markers[bin.id] = marker;
        });
    }

    function initCharts() {
        // Chart Defaults
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = "#718096";

        const ctx1 = document.getElementById('trendChart').getContext('2d');
        trendChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Garbage Collected (Tons)',
                    data: [12, 19, 15, 17, 22, 28, 25],
                    borderColor: '#028090',
                    backgroundColor: 'rgba(2, 128, 144, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#028090'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        const ctx2 = document.getElementById('areaChart').getContext('2d');
        areaChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Temple', 'Market', 'Periyar Bus', 'Goripalayam', 'Railway Stn'],
                datasets: [{
                    label: 'Alerts Triggered',
                    data: [8, 15, 12, 4, 10],
                    backgroundColor: [
                        'rgba(2, 128, 144, 0.8)',
                        'rgba(244, 162, 97, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(241, 196, 15, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // ==========================================================================
    // UTILITIES & EVENTS
    // ==========================================================================
    function startClock() {
        setInterval(() => {
            elements.liveClock.innerText = new Date().toLocaleTimeString();
        }, 1000);
        elements.liveClock.innerText = new Date().toLocaleTimeString();
    }

    function setupThemeToggle() {
        elements.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            elements.themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

            // Re-render map tiles filter
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                className: isDark ? 'map-dark' : ''
            }).addTo(map);

            // Update charts grid colors
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            const textColor = isDark ? '#94a3b8' : '#718096';

            trendChart.options.scales.x.ticks.color = textColor;
            trendChart.options.scales.y.ticks.color = textColor;
            trendChart.options.scales.y.grid.color = gridColor;
            trendChart.update();

            areaChart.options.scales.x.ticks.color = textColor;
            areaChart.options.scales.y.ticks.color = textColor;
            areaChart.options.scales.y.grid.color = gridColor;
            areaChart.update();
        });
    }

    function setupNavigation() {
        elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Update nav classes
                elements.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update views
                const target = item.getAttribute('data-target');
                elements.pageViews.forEach(view => view.classList.remove('active'));
                document.getElementById(`view-${target}`).classList.add('active');

                // Update title
                const titles = {
                    'dashboard': 'Dashboard Overview',
                    'analytics': 'City Analytics',
                    'alerts': 'System Alerts Log',
                    'management': 'Bin Directory'
                };
                elements.pageTitle.innerText = titles[target];

                if (window.innerWidth <= 768) elements.sidebar.classList.remove('open');
            });
        });
    }

    function handleBinSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('form-bin-id').value;
        const area = document.getElementById('form-area').value;
        const lat = parseFloat(document.getElementById('form-lat').value);
        const lng = parseFloat(document.getElementById('form-lng').value);

        if (id) {
            // Edit
            let bin = bins.find(b => b.id === id);
            bin.area = area;
            bin.lat = lat;
            bin.lng = lng;
        } else {
            // Add new
            const newId = `B-${Math.floor(Math.random() * 900) + 100}`;
            bins.push({
                id: newId,
                area: area,
                lat: lat,
                lng: lng,
                fillLevel: 0,
                status: 'ok',
                lastUpdated: Date.now(),
                battery: 100
            });
        }

        saveDatabase();
        elements.binModal.classList.add('hidden');
        updateDashboard();
        renderBinsTable();
    }

    // Global exposed functions for inline HTML event handlers
    window.editBin = function (id) {
        const bin = bins.find(b => b.id === id);
        if (!bin) return;

        document.getElementById('form-bin-id').value = bin.id;
        document.getElementById('form-area').value = bin.area;
        document.getElementById('form-lat').value = bin.lat;
        document.getElementById('form-lng').value = bin.lng;

        document.getElementById('bin-form-title').innerText = "Edit Bin " + bin.id;
        elements.binModal.classList.remove('hidden');
    }

    window.deleteBin = function (id) {
        if (confirm('Are you sure you want to delete Bin ' + id + '?')) {
            bins = bins.filter(b => b.id !== id);
            saveDatabase();
            updateDashboard();
            renderBinsTable();
        }
    }

    // Run application
    init();
});
