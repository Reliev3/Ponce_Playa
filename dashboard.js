// DASHBOARD LOGIC (2-COLUMN + FILTERS)

const SUPABASE_URL = 'https://eduxsmumirjcyipuairt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdXhzbXVtaXJqY3lpcHVhaXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjQ0ODMsImV4cCI6MjA4MjM0MDQ4M30.NA7ht8yh9ZsrdYjipyQJh82dD186tMlp4aUBWogohg0';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let allReports = [];
let mapLayerGroup = L.layerGroup();

// 1. Initialize Map
const map = L.map('map', { zoomControl: false }).setView([17.973, -66.614], 14);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);

// Create labels pane for better visibility
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri',
    maxZoom: 19,
    pane: 'labels'
}).addTo(map);

mapLayerGroup.addTo(map);

// 2. Load Boundary & Mask
fetch('geojsons/Playa_Area.geojson').then(r => r.json()).then(data => {
    // A. Add White Boundary
    L.geoJSON(data, {
        style: {
            color: '#FFFFFF',
            weight: 3,
            fill: false,
            opacity: 1
        },
        interactive: false
    }).addTo(map);

    // B. Add Inverted Focus Mask
    try {
        if (typeof turf !== 'undefined') {
            const worldMask = turf.polygon([[
                [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
            ]]);
            const boundaryFeature = data.features[0];
            const bufferedBoundary = turf.buffer(boundaryFeature, 0.01, { units: 'kilometers' });
            const maskPoly = turf.mask(bufferedBoundary, worldMask);

            L.geoJSON(maskPoly, {
                style: {
                    color: 'transparent',
                    fillColor: '#000000',
                    fillOpacity: 0.7, // Dark dim
                    weight: 0,
                    interactive: false
                }
            }).addTo(map);
        }
    } catch (e) {
        console.error("Mask Error:", e);
    }

}).catch(e => console.error(e));

// 3. Main Init
async function initDashboard() {
    // A. Fetch Data
    const { data, error } = await supabaseClient
        .from('flood_reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        alert("Error loading data");
        return;
    }

    allReports = data || [];

    // B. Populate Filters (Removed)

    // C. Initial Render
    renderDashboard(allReports);

    // D. Setup Event Listeners (Removed)
}

// Filters removed per user request


let chartInstance = null;

function renderDashboard(reports) {
    // 1. Update Scorecards
    document.getElementById('total-reports').innerText = reports.length;


    // 2. Update Map
    mapLayerGroup.clearLayers();
    reports.forEach(r => {
        if (r.geojson_data) {
            const layer = L.geoJSON(r.geojson_data, {
                style: {
                    color: '#00F3FF',
                    weight: 2,
                    fillColor: '#00F3FF',
                    fillOpacity: 0.4
                }
            });

            // Popup
            const date = new Date(r.created_at).toLocaleDateString();
            const comments = r.comments ? `<br><i>"${r.comments}"</i>` : '';
            const contact = r.contact_info ? `<br>📞 ${r.contact_info}` : '';

            const content = `
                <div style="font-family:sans-serif; color:#333; min-width: 200px;">
                    <b style="color: #007AFF; font-size: 1.1em;">${r.sector}</b><br>
                    <span style="color: #555;">👤 ${r.reporter_name}</span>
                    <hr style="margin: 5px 0; border: 0; border-top: 1px solid #eee;">
                    ${comments}
                    ${contact}
                    <div style="margin-top:5px; font-size: 0.8em; color: #888;">${date}</div>
                </div>
            `;
            layer.bindPopup(content);
            mapLayerGroup.addLayer(layer);
        }
    });

    // 3. Update Feed List
    const listContainer = document.getElementById('report-list');
    listContainer.innerHTML = "";

    reports.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString();
        const commentHTML = r.comments
            ? `<div class="feed-comment">"${r.comments}"</div>`
            : `<div class="feed-comment feed-empty-comment">Sin comentarios...</div>`;

        const div = document.createElement('div');
        div.className = 'feed-item';
        div.innerHTML = `
            <div class="feed-header">
                <span class="feed-reporter">👤 ${r.reporter_name || 'Anónimo'}</span>
                <span class="feed-date">${date}</span>
            </div>
            ${commentHTML}
            <div class="feed-sector-badge">${r.sector || 'Desconocido'}</div>
        `;
        div.onclick = () => {
            if (r.geojson_data) {
                const l = L.geoJSON(r.geojson_data);
                map.fitBounds(l.getBounds(), { maxZoom: 18, padding: [50, 50] });
            }
        };
        listContainer.appendChild(div);
    });

    // 4. Render/Update Charts
    renderChart(reports);       // Trend
}

// ... trend chart logic ...


function renderChart(reports) {
    const ctx = document.getElementById('trend-chart');
    if (!ctx) return;

    // Aggregate by Date
    const counts = {};
    reports.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString(); // Simple aggregation
        counts[date] = (counts[date] || 0) + 1;
    });

    // Sort Dates
    const labels = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b));
    const data = labels.map(l => counts[l]);

    if (chartInstance) {
        chartInstance.destroy();
    }

    // Custom Chart Theme
    Chart.defaults.color = '#888';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reportes',
                data: data,
                borderColor: '#00F3FF',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            scales: {
                x: { ticks: { font: { size: 10 } } },
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } }
            }
        }
    });
});
}

// Start
initDashboard();
