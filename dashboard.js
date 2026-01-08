// Dashboard Logic

// 1. Initialize Supabase
// (Using same credentials as app.js)
const SUPABASE_URL = 'https://eduxsmumirjcyipuairt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdXhzbXVtaXJqY3lpcHVhaXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjQ0ODMsImV4cCI6MjA4MjM0MDQ4M30.NA7ht8yh9ZsrdYjipyQJh82dD186tMlp4aUBWogohg0';

let supabaseClient;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Dashboard: Supabase initialized");
} else {
    console.error("Dashboard: Supabase library not found!");
}

// 2. Initialize Map (Satellite Hybrid)
const map = L.map('map', { zoomControl: false }).setView([17.973, -66.614], 14);

// Base: Satellite Imagery
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
}).addTo(map);

// Overlay: Labels
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
}).addTo(map);

// 3. Fetch and Render Data
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
                        color: '#FF3B30', // Red for reports
                        weight: 2,
                        fillOpacity: 0.4
                    },
                    onEachFeature: (feature, layer) => {
                        const content = `
                            <div style="font-family: sans-serif; min-width: 200px;">
                                <h3 style="margin: 0 0 5px 0; color: #007AFF;">${report.sector || 'Desconocido'}</h3>
                                <p style="margin: 0 0 5px 0;"><b>Reportado por:</b> ${report.reporter_name || 'Anónimo'}</p>
                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${new Date(report.created_at).toLocaleString()}</p>
                                ${feature.properties.comments ? `<p style="margin: 5px 0; font-style: italic;">"${feature.properties.comments}"</p>` : ''}
                            </div>
                        `;
                        layer.bindPopup(content);
                    }
                }).addTo(map);
            }
        });
        console.log(`Loaded ${data.length} reports.`);
    } else {
        console.log("No reports found.");
    }
}

// Load on start
loadReports();
