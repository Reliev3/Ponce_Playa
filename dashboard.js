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

mapLayerGroup.addTo(map);

// 2. Load Boundary
fetch('geojsons/Playa_Area.geojson').then(r => r.json()).then(data => {
    L.geoJSON(data, {
        style: { color: '#00F3FF', weight: 2, fill: false, dashArray: '5, 5', opacity: 0.6 },
        interactive: false
    }).addTo(map);
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

    // B. Populate Filters
    populateFilters();

    // C. Initial Render
    renderDashboard(allReports);

    // D. Setup Event Listeners
    document.getElementById('filter-sector').addEventListener('change', runFilters);
    document.getElementById('filter-reporter').addEventListener('change', runFilters);
}

function populateFilters() {
    const sectorSet = new Set();
    const reporterSet = new Set();

    allReports.forEach(r => {
        if (r.sector) sectorSet.add(r.sector);
        if (r.reporter_name) reporterSet.add(r.reporter_name);
    });

    const sectorSelect = document.getElementById('filter-sector');
    const reporterSelect = document.getElementById('filter-reporter');

    sectorSet.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.innerText = s;
        sectorSelect.appendChild(opt);
    });

    reporterSet.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.innerText = r;
        reporterSelect.appendChild(opt);
    });
}

function runFilters() {
    const sector = document.getElementById('filter-sector').value;
    const reporter = document.getElementById('filter-reporter').value;

    const filtered = allReports.filter(r => {
        const matchSector = (sector === 'all') || (r.sector === sector);
        const matchReporter = (reporter === 'all') || (r.reporter_name === reporter);
        return matchSector && matchReporter;
    });

    renderDashboard(filtered);
}

function renderDashboard(reports) {
    // 1. Update Scorecards
    document.getElementById('total-reports').innerText = reports.length;
    const uniqueSectors = new Set(reports.map(r => r.sector)).size;
    document.getElementById('active-sectors').innerText = uniqueSectors;

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

    // 3. Update List
    const listContainer = document.getElementById('report-list');
    listContainer.innerHTML = "";

    reports.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString();
        // Comment Logic: Show prominent or fallback
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
        // Click to zoom
        div.onclick = () => {
            if (r.geojson_data) {
                const l = L.geoJSON(r.geojson_data);
                map.fitBounds(l.getBounds(), { maxZoom: 18, padding: [50, 50] });
            }
        };
        listContainer.appendChild(div);
    });
}

// Start
initDashboard();
