// PIP-BOY TERMINAL LOGIC (BLUE THEME)

const SUPABASE_URL = 'https://eduxsmumirjcyipuairt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdXhzbXVtaXJqY3lpcHVhaXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjQ0ODMsImV4cCI6MjA4MjM0MDQ4M30.NA7ht8yh9ZsrdYjipyQJh82dD186tMlp4aUBWogohg0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Initialize Map
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false // Minimal UI
}).setView([17.973, -66.614], 14);

// Satellite Base (Filtered by CSS to look Blue)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
}).addTo(map);

// 2. Load Boundary (Visual Reference)
fetch('geojsons/Playa_Area.geojson').then(r => r.json()).then(data => {
    L.geoJSON(data, {
        style: {
            color: '#00F3FF', // Cyan Boundary
            weight: 2,
            fill: false,
            dashArray: '5, 5',
            opacity: 0.8
        },
        interactive: false
    }).addTo(map);
}).catch(err => console.error("Boundary Load Error:", err));

// 3. Logic Controller
async function initTerminal() {
    console.log(">> CONNECTING TO DATABANKS...");

    // Check connection
    const { data: reports, error } = await supabase
        .from('flood_reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("DATA ERROR:", error);
        alert("SYSTEM ALERT: CONNECTION FAILED");
        document.getElementById('event-log').innerHTML = "<li style='color:red'>ERROR: CONNECTION LOST</li>";
        return;
    }

    if (!reports || reports.length === 0) {
        console.log("No reports found.");
        document.getElementById('total-reports').innerText = "0";
        document.getElementById('event-log').innerHTML = "<li>No Active Reports.</li>";
        return;
    }

    // A. Update Headline Stats
    document.getElementById('total-reports').innerText = reports.length;

    // B. Process Data for Charts
    const sectorCounts = {};
    const eventLog = document.getElementById('event-log');
    eventLog.innerHTML = ""; // Clear Init msg

    reports.forEach((r, index) => {
        // 1. Sector Stats
        const s = r.sector || 'Desconocido';
        sectorCounts[s] = (sectorCounts[s] || 0) + 1;

        // 2. Map Rendering
        if (r.geojson_data) {
            L.geoJSON(r.geojson_data, {
                style: {
                    color: '#00F3FF', // SOLID CYAN
                    weight: 2,
                    fillColor: '#00F3FF',
                    fillOpacity: 0.4
                },
                onEachFeature: (feature, layer) => {
                    const date = new Date(r.created_at).toLocaleDateString();
                    layer.bindPopup(`<div style="color:black"><b>${r.sector}</b><br>${r.reporter_name}<br>${date}</div>`);
                }
            }).addTo(map);
        }

        // 3. Event Log (Top 10)
        if (index < 10) {
            const li = document.createElement('li');
            li.style.marginBottom = "8px";
            li.innerHTML = `> [${new Date(r.created_at).toLocaleTimeString()}] ALERT: ${r.sector}`;
            eventLog.appendChild(li);
        }
    });

    // C. Render Chart
    renderChart(sectorCounts);
}

function renderChart(dataObj) {
    const ctx = document.getElementById('sectorChart').getContext('2d');

    // Sort logic
    const labels = Object.keys(dataObj);
    const data = Object.values(dataObj);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '# Reportes',
                data: data,
                backgroundColor: 'rgba(0, 243, 255, 0.3)',
                borderColor: '#00F3FF',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Minimal look
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 243, 255, 0.1)' },
                    ticks: { color: '#00F3FF', font: { family: "'Share Tech Mono', monospace" } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#00F3FF', font: { family: "'Share Tech Mono', monospace" } }
                }
            }
        }
    });
}

initTerminal();
