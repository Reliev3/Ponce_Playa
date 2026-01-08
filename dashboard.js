// Dashboard Logic (Restored to Simple Version)

// 1. Initialize Supabase
const SUPABASE_URL = 'https://eduxsmumirjcyipuairt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdXhzbXVtaXJqY3lpcHVhaXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjQ0ODMsImV4cCI6MjA4MjM0MDQ4M30.NA7ht8yh9ZsrdYjipyQJh82dD186tMlp4aUBWogohg0';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Initialize Map (Satellite)
const map = L.map('map', { zoomControl: false }).setView([17.973, -66.614], 14);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);

// 3. Load Boundary (Blue)
fetch('geojsons/Playa_Area.geojson').then(r => r.json()).then(data => {
    L.geoJSON(data, {
        style: {
            color: '#00F3FF', // Cyan
            weight: 3,
            fill: false,
            dashArray: '10, 5'
        },
        interactive: false
    }).addTo(map);
}).catch(e => console.error("Boundary error:", e));

// 4. Fetch and Render Reports
async function loadReports() {
    console.log("Fetching reports...");
    const { data, error } = await supabaseClient
        .from('flood_reports')
        .select('*');

    if (error) {
        console.error("Error fetching reports:", error);
        return;
    }

    if (data && data.length > 0) {
        data.forEach(report => {
            if (report.geojson_data) {
                L.geoJSON(report.geojson_data, {
                    style: {
                        color: '#00F3FF', // Cyan Polygons
                        weight: 2,
                        fillColor: '#00F3FF',
                        fillOpacity: 0.5
                    },
                    onEachFeature: (feature, layer) => {
                        const content = `
                            <div style="font-family: sans-serif; padding: 5px;">
                                <h3 style="margin: 0 0 5px 0; color: #007AFF;">${report.sector || 'Desconocido'}</h3>
                                <p style="margin: 0 0 5px 0;"><b>Reportado por:</b> ${report.reporter_name || 'Anónimo'}</p>
                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${new Date(report.created_at).toLocaleString()}</p>
                            </div>
                        `;
                        layer.bindPopup(content);
                    }
                }).addTo(map);
            }
        });
        console.log(`Loaded ${data.length} reports.`);
    }
}

// Load on start
loadReports();
