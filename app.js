// MVP Configuration
// const DATA_URL = 'Ponce_Playa.geojson';
let mapInstance;
let allSectorsLayer;
let drawnItems;
let currentSectorLayer;
// Initialized in init()
let supabaseClient;

// Embedded Data
const GEOJSON_DATA = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "Name": "Sector La Playa",
                "Description": "Main beach area"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-66.618, 17.975],
                        [-66.612, 17.975],
                        [-66.612, 17.970],
                        [-66.618, 17.970],
                        [-66.618, 17.975]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "Name": "Salistral",
                "Description": "Western sector"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-66.625, 17.978],
                        [-66.619, 17.978],
                        [-66.619, 17.972],
                        [-66.625, 17.972],
                        [-66.625, 17.978]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "Name": "Puerto Viejo",
                "Description": "Old Port area"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-66.610, 17.980],
                        [-66.605, 17.980],
                        [-66.605, 17.975],
                        [-66.610, 17.975],
                        [-66.610, 17.980]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "Name": "Amalia Marín",
                "Comunidad": "Amalia Marín"
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [[[[-66.637690378504999, 17.98154472952994], [-66.637951548398959, 17.983559636216381], [-66.637516601606933, 17.983852809347614], [-66.636963785199242, 17.98395472060125], [-66.635941804162726, 17.985284251793846], [-66.632953813213248, 17.985490036456017], [-66.632953813213248, 17.985490036456017], [-66.63304931628933, 17.986705802931571], [-66.632649340461214, 17.98672873599067], [-66.632649570957838, 17.986931380100049], [-66.628696986924723, 17.987273196737014], [-66.628489082504373, 17.990740878553844], [-66.62651221170421, 17.990427659866342], [-66.626487961940597, 17.989774719303508], [-66.626887149664086, 17.989031286764543], [-66.625756111658177, 17.987568884999227], [-66.625591280845754, 17.987456470485093], [-66.625425833179207, 17.986781155504637], [-66.625401538609552, 17.986083182708271], [-66.626154504623784, 17.986104941515716], [-66.625940636243143, 17.98419129358037], [-66.628836481265807, 17.985764479693628], [-66.62909183316458, 17.98265700512172], [-66.631397721450355, 17.982699664383919], [-66.63339755438129, 17.982585003796352], [-66.634903251320409, 17.982448327410989], [-66.637067127007043, 17.981770554538457], [-66.637067127007043, 17.981770554538457], [-66.637690378504999, 17.98154472952994]]]]
            }
        },
        { "type": "Feature", "properties": { "Name": "Los Potes (Amalia Marín)" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Los Meros (Amalia Marín)" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Residencial Caribe" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Villa Tabaiba" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "San Tomás" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Res. Ernesto Ramos Antonini (Pámpanos)" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Paseo del Puerto" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Villa del Carmen" }, "geometry": null },
        { "type": "Feature", "properties": { "Name": "Urb. Vistas del Mar" }, "geometry": null }
    ]
};

const PLAYA_AREA_JSON = {
    "type": "FeatureCollection",
    "name": "Playa_Area",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        { "type": "Feature", "properties": { "id": null }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[-66.637693193025214, 17.981388483492907], [-66.637882987631684, 17.981664054153025], [-66.637882987631684, 17.981664054153025], [-66.637882987631684, 17.981664054153025], [-66.638161978996763, 17.983388912585873], [-66.637775683260514, 17.983776748255725], [-66.636981630913766, 17.983980871950202], [-66.636219769878409, 17.984899425654056], [-66.635672517585363, 17.985460761675292], [-66.635693978459614, 17.986399719756236], [-66.636026622010277, 17.98767547001345], [-66.636348535123801, 17.989308416884651], [-66.636477300369236, 17.990502499718673], [-66.63623050031552, 17.992431385687148], [-66.635586674088444, 17.993737709180042], [-66.634814082615932, 17.995697176281112], [-66.633783960652593, 17.996472792661866], [-66.63352643016178, 17.99835058661634], [-66.632453386449953, 18.000350823401323], [-66.630607751265643, 18.002269396549551], [-66.628418742093587, 18.004065488661489], [-66.627302776633314, 18.003412366374224], [-66.626573106909291, 18.003330725918183], [-66.622795993043752, 18.003494006792451], [-66.613138599637509, 18.003616467348902], [-66.609146877029602, 18.003004163716014], [-66.607816302826961, 18.002922523070954], [-66.607859224575435, 18.001738729469437], [-66.607387085342253, 17.999738508427797], [-66.606528650372795, 17.998677157437054], [-66.605627293654877, 17.998105658103952], [-66.604017728087157, 17.997421897539891], [-66.602272020098567, 17.99661056626752], [-66.601113132889822, 17.995916594419011], [-66.599095810711617, 17.994324531037826], [-66.597593549515111, 17.9913444763461], [-66.597679393012044, 17.989140019937413], [-66.598323219239106, 17.984281953968697], [-66.598924123717723, 17.981669157309376], [-66.599525028196339, 17.977627411300485], [-66.599825480435641, 17.974524594014319], [-66.599825480435641, 17.971585032614282], [-66.600480037099857, 17.969120050187993], [-66.601724767805564, 17.96944667509506], [-66.603892316103398, 17.969303776772527], [-66.606810994999506, 17.968487212712084], [-66.607798195214357, 17.968078929266532], [-66.608828317177682, 17.9673236024049], [-66.609193152039722, 17.966180398850625], [-66.609493604279024, 17.965016773351277], [-66.609600908650208, 17.964792213162319], [-66.612777118037144, 17.963444846035799], [-66.613463866012694, 17.963465260765883], [-66.613699935629299, 17.962934477017409], [-66.614129153114021, 17.962689499365055], [-66.615524109939358, 17.962567010411533], [-66.616747379770828, 17.962567010411533], [-66.619150997685253, 17.962669084545354], [-66.61936560427621, 17.962934477017409], [-66.619301223804911, 17.963485675493597], [-66.619022232439832, 17.964077701571608], [-66.618399867086978, 17.964730969424885], [-66.61807795397344, 17.96469014025481], [-66.618099414847677, 17.964220604120872], [-66.617820423482627, 17.964077701571608], [-66.61728390162672, 17.96387355487219], [-66.616790301519288, 17.96373065204229], [-66.615931866549843, 17.963648993230461], [-66.615373883819714, 17.963199869090918], [-66.614172074862481, 17.963220283849292], [-66.613914544371667, 17.963587749096828], [-66.613893083497416, 17.963934798906781], [-66.614107692239784, 17.964241018761335], [-66.61462275322144, 17.964975944247247], [-66.61515927507736, 17.965915011253387], [-66.616318162286078, 17.966894901938865], [-66.616790301519288, 17.967160288064306], [-66.617519971243311, 17.967344016686869], [-66.617734579985679, 17.967486916594552], [-66.618099414847677, 17.967629816386651], [-66.618635936703598, 17.967813544520961], [-66.619429989050317, 17.967936029837681], [-66.620202580522829, 17.967813544520961], [-66.6210180937438, 17.966874487605011], [-66.621211241611917, 17.967099045147663], [-66.620610337133314, 17.968181000216376], [-66.620824945875682, 17.968425970255399], [-66.621254163360405, 17.968875081111392], [-66.618485710583926, 17.970365304408467], [-66.61595332742408, 17.971141032108424], [-66.615288040322781, 17.971426825665478], [-66.615760179555949, 17.972896613797491], [-66.61595332742408, 17.972957854704234], [-66.616296701411869, 17.97297826833509], [-66.61664007539963, 17.973161990906689], [-66.616682997148104, 17.973366126873199], [-66.616983449387405, 17.973509021909376], [-66.618721780200531, 17.973161990906689], [-66.619022232439832, 17.975040032898725], [-66.618807623697492, 17.975223753325537], [-66.618635936703598, 17.975305406787207], [-66.618421327961215, 17.97528499342533], [-66.618163797470402, 17.975305406787207], [-66.617884806105337, 17.975427886908932], [-66.617820423482627, 17.975672846897535], [-66.617777501734153, 17.976060699517909], [-66.617670197362955, 17.976244418882857], [-66.617412666872141, 17.976203592373832], [-66.617262440752484, 17.976244418882857], [-66.617155136381285, 17.976468964513789], [-66.617133675507063, 17.976754749449288], [-66.617305362500957, 17.977163012840514], [-66.617562892991785, 17.977591688385388], [-66.617756040859916, 17.977775406157466], [-66.618035032224995, 17.977857058439259], [-66.618378406212742, 17.97810201505807], [-66.618743241074768, 17.978306145314143], [-66.619172458559504, 17.97842862335451], [-66.619687519541159, 17.97859192727617], [-66.620202580522829, 17.978816469921846], [-66.620481571887893, 17.978938947608214], [-66.620846406749891, 17.979183902726064], [-66.621275624234642, 17.97946968326735], [-66.621468772102745, 17.97959216050058], [-66.621640459096639, 17.97977587619112], [-66.621726302593586, 17.979959591690484], [-66.622005293958665, 17.980286196550654], [-66.622198441826768, 17.980510737041534], [-66.62245597231761, 17.980653626296139], [-66.622906650676555, 17.980796515435081], [-66.623872390017198, 17.981000642575793], [-66.624602059741221, 17.981184356800643], [-66.624709364112391, 17.981225182157978], [-66.625224425094075, 17.98144972145456], [-66.625610720830309, 17.981674260465542], [-66.625911173069625, 17.981755910944187], [-66.626297468805859, 17.981980449565704], [-66.626619381919411, 17.982245813022924], [-66.627198825523791, 17.98234787578486], [-66.62827186923559, 17.982552001131708], [-66.629001538959614, 17.982572413653415], [-66.629580982563994, 17.982654063716623], [-66.630847174143909, 17.982715301239239], [-66.632048983101143, 17.982633651204356], [-66.633164948561415, 17.982490763552438], [-66.633658548668834, 17.982470351021298], [-66.634023383530845, 17.98244993848779], [-66.63460282713524, 17.982368288330171], [-66.63509642724263, 17.982286638134781], [-66.635890479589406, 17.982082512481075], [-66.636899140678494, 17.981674260465542], [-66.637693193025214, 17.981388483492907]]]] } }
    ]
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    try {
        console.log("AG_LOG: Init started");

        // 1. Initialize Supabase (Safe Mode)
        try {
            const SUPABASE_URL = 'https://eduxsmumirjcyipuairt.supabase.co';
            const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdXhzbXVtaXJqY3lpcHVhaXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjQ0ODMsImV4cCI6MjA4MjM0MDQ4M30.NA7ht8yh9ZsrdYjipyQJh82dD186tMlp4aUBWogohg0';

            if (window.supabase) {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log("AG_LOG: Supabase initialized");
            } else {
                console.error("AG_LOG: Supabase library not found!");
            }
        } catch (err) {
            console.error("AG_LOG: Supabase init error:", err);
        }

        // 2. Initialize Map
        mapInstance = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([17.973, -66.614], 14);
        console.log("AG_LOG: Map initialized");

        // 2. Load Tiles (Satellite Hybrid)

        // Base: Satellite Imagery
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        }).addTo(mapInstance);

        // Overlay: Labels (Streets & Places)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        }).addTo(mapInstance);


        // 3. Init Draw Items
        drawnItems = new L.FeatureGroup();
        mapInstance.addLayer(drawnItems);

        // 4. Load Data
        loadData();

        // 4b. Load Community Reports (Map of All)
        // loadAllPolygons(); // DISABLED per user request

        // 5. Setup Listeners
        setupEventListeners();

        // 6. Init Zoom Dropdown
        loadZoomDropdown(mapInstance);
        console.log("AG_LOG: Init finished");
    } catch (e) {
        console.error("AG_LOG: Error in init:", e);
    }
}

function loadData() {
    console.log("AG_LOG: Loading embedded data...");
    if (typeof GEOJSON_DATA === 'undefined') {
        console.error("AG_LOG: GEOJSON_DATA is undefined!");
        return;
    }
    populateSectorSelect(GEOJSON_DATA);
}

function populateSectorSelect(geojson) {
    console.log("AG_LOG: Populating Sector Select");
    const select = document.getElementById('sector-select');
    if (!select) {
        console.error("AG_LOG: Sector select element not found!");
        return;
    }

    select.innerHTML = '<option value="" disabled selected>Elige un sector...</option>';

    const sectors = [];

    if (!geojson.features) {
        console.error("AG_LOG: GeoJSON has no features!");
        return;
    }

    geojson.features.forEach(feature => {
        const name = feature.properties.Name || feature.properties.Sector || feature.properties.Barrio || feature.properties.Comunidad;
        if (name) {
            sectors.push({ name: name, feature: feature });
        }
    });

    console.log("AG_LOG: Found " + sectors.length + " sectors.");

    sectors.sort((a, b) => a.name.localeCompare(b.name));

    sectors.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        select.appendChild(option);
    });

    // Verify specifically for Amalia Marin
    const hasAmalia = sectors.some(s => s.name === "Amalia Marin");
    console.log("AG_LOG: Amalia Marin present? " + hasAmalia);

    window.geoJsonData = geojson;
}

function setupEventListeners() {
    const drawBtn = document.getElementById('draw-btn');
    const startBtn = document.getElementById('start-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const continueBtn = document.getElementById('main-continue-btn');
    const finalSubmitBtn = document.getElementById('final-submit-btn');
    const cancelDetailsBtn = document.getElementById('cancel-details-btn');

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (drawnItems.getLayers().length === 0) {
                alert("Por favor dibuja al menos una zona de inundación.");
                return;
            }
            // Show details modal
            document.getElementById('details-modal').classList.remove('hidden');
        });
    }

    if (cancelDetailsBtn) {
        cancelDetailsBtn.addEventListener('click', () => {
            document.getElementById('details-modal').classList.add('hidden');
        });
    }

    if (finalSubmitBtn) {
        finalSubmitBtn.addEventListener('click', submitReport);
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const select = document.getElementById('sector-select');
            const nameInput = document.getElementById('user-name');
            const selectedName = select.value;
            const reporterName = nameInput.value.trim();

            if (reporterName === "") {
                alert("Por favor escribe tu nombre.");
                return;
            }
            if (!selectedName || selectedName === "") {
                alert("Por favor selecciona un sector.");
                return;
            }

            window.reporterName = reporterName;

            // Show Instruction Overlay
            const overlay = document.getElementById('instruction-overlay');
            if (overlay) {
                overlay.classList.remove('hidden');

                // Wait 4 seconds then reveal map
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    lockAppToSector(selectedName);
                }, 4000);
            } else {
                // Fallback if overlay missing
                lockAppToSector(selectedName);
            }
        });
    }

    // Leaflet Draw Init
    let polygonDrawer;
    try {
        if (L.Draw && L.Draw.Polygon) {
            polygonDrawer = new L.Draw.Polygon(mapInstance, {
                shapeOptions: {
                    color: '#007AFF',
                    fillColor: '#007AFF',
                    fillOpacity: 0.6,
                    weight: 2
                },
                allowIntersection: false,
                showArea: false
            });
        }
    } catch (e) {
        console.error("Leaflet Draw error:", e);
    }

    // Toast Logic
    const toast = document.getElementById('instruction-toast');
    const toastMsg = document.getElementById('toast-message');

    function showToast(msg) {
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('show'), 10);
        }
    }

    function hideToast() {
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }
    }

    // --- CUSTOM FREEHAND DRAWING LOGIC ---
    let isDrawing = false;
    let currentPath = null;
    let tempPolyline = null;

    // Toggle Drawing Mode
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            // Toggle functionality
            if (drawBtn.classList.contains('active')) {
                disableDrawingMode();
            } else {
                enableDrawingMode();
            }
        });
    }

    function enableDrawingMode() {
        if (drawBtn) {
            drawBtn.classList.add('active');
            drawBtn.innerHTML = '<span class="icon">✏️</span> Dibujando...';
        }
        mapInstance.dragging.disable(); // Important: Stop map from moving while painting

        // Add container class for cursor
        document.getElementById('map').style.cursor = 'crosshair';

        // Add Touch/Mouse Events
        mapInstance.on('mousedown touchstart', startFreehand);
        mapInstance.on('mousemove touchmove', moveFreehand);
        mapInstance.on('mouseup touchend', stopFreehand);
    }

    function disableDrawingMode() {
        if (drawBtn) {
            drawBtn.classList.remove('active');
            drawBtn.innerHTML = '<span class="icon">✏️</span> Marcar Área';
        }
        mapInstance.dragging.enable();
        document.getElementById('map').style.cursor = '';

        // Remove Events
        mapInstance.off('mousedown touchstart', startFreehand);
        mapInstance.off('mousemove touchmove', moveFreehand);
        mapInstance.off('mouseup touchend', stopFreehand);
    }

    function getLatLng(e) {
        // Standard Leaflet event with latlng already calculated
        if (e.latlng) return e.latlng;

        let clientX, clientY;
        const evt = e.originalEvent || e; // Handle both Leaflet and Native events

        // Extract touch/mouse client coordinates
        if (evt.touches && evt.touches.length > 0) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
        } else if (evt.changedTouches && evt.changedTouches.length > 0) {
            clientX = evt.changedTouches[0].clientX;
            clientY = evt.changedTouches[0].clientY;
        } else {
            clientX = evt.clientX;
            clientY = evt.clientY;
        }

        if (clientX === undefined) return null;

        // Calculate relative to map container (Fixes offset issues)
        const container = mapInstance.getContainer();
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        return mapInstance.containerPointToLatLng([x, y]);
    }

    // -------------------------------------------------------------
    // Global Event Handlers for Drag Capture
    // -------------------------------------------------------------
    function handleMove(e) {
        // Prevent Pull-to-Refresh / Scroll
        if (e.preventDefault) e.preventDefault();

        if (!isDrawing || !tempPolyline) return;

        const latlng = getLatLng(e);
        if (latlng) {
            currentPath.push(latlng);
            tempPolyline.setLatLngs(currentPath);
        }
    }

    function handleEnd(e) {
        if (e.preventDefault) e.preventDefault();
        stopFreehand();
    }

    function startFreehand(e) {
        // Prevent default on the start event
        if (e.originalEvent && e.originalEvent.preventDefault) {
            e.originalEvent.preventDefault();
        }

        isDrawing = true;
        currentPath = [];

        const latlng = getLatLng(e);
        if (latlng) {
            currentPath.push(latlng);
            tempPolyline = L.polyline(currentPath, {
                color: '#007AFF',
                weight: 4,
                opacity: 0.8
            }).addTo(mapInstance);
        }

        // Bind GLOBAL listeners to document to capture drag outside map
        // Options: capture phase or passive:false to allow preventDefault
        document.addEventListener('mousemove', handleMove, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });

        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);
    }

    // No longer explicitly called by map event, but by global listener
    // Kept the name for consistency references
    function moveFreehand(e) {
        handleMove(e);
    }

    function stopFreehand() {
        if (!isDrawing) return;
        isDrawing = false;

        // Unbind GLOBAL listeners
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);

        // 1. Create Polygon
        if (currentPath && currentPath.length >= 3) { // Minimum 3 points for a valid polygon

            // Note: Leaflet auto-closes polygons, no need to push start point again.

            const polygon = L.polygon(currentPath, {
                color: '#007AFF',
                fillColor: '#007AFF',
                fillOpacity: 0.6,
                weight: 2
            });

            drawnItems.addLayer(polygon);
        }

        // Cleanup temp line
        if (tempPolyline) {
            mapInstance.removeLayer(tempPolyline);
            tempPolyline = null;
        }
        currentPath = [];

        // Auto-exit drawing mode
        disableDrawingMode();
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const layers = drawnItems.getLayers();
            if (layers.length > 0) {
                drawnItems.removeLayer(layers[layers.length - 1]);
            }
        });
    }


}

function lockAppToSector(sectorName) {
    const features = window.geoJsonData.features;
    const targetFeature = features.find(f =>
        (f.properties.Name || f.properties.Sector || f.properties.Barrio || f.properties.Comunidad) === sectorName
    );

    if (!targetFeature) return;

    // UI Updates
    document.getElementById('modal-overlay').classList.add('hidden');
    const toolbar = document.getElementById('drawing-toolbar');
    const footer = document.getElementById('submit-footer');

    if (toolbar) toolbar.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');

    // Map Updates
    if (currentSectorLayer) mapInstance.removeLayer(currentSectorLayer);

    // 1. Add Orange Boundary Layer
    const playaLayer = L.geoJSON(PLAYA_AREA_JSON, {
        style: {
            color: '#FF9500', // Orange
            weight: 3,        // Thinner stroke
            fill: false
        }
    }).addTo(mapInstance);

    currentSectorLayer = playaLayer;
    mapInstance.fitBounds(playaLayer.getBounds(), { padding: [20, 20] });
    window.currSectorName = sectorName;

    // 2. Add Focus Mask (Dim outside area)
    try {
        if (typeof turf !== 'undefined') {
            const worldMask = turf.polygon([[
                [-180, -90],
                [180, -90],
                [180, 90],
                [-180, 90],
                [-180, -90]
            ]]);

            // Get the first polygon from the feature collection
            const boundaryFeature = PLAYA_AREA_JSON.features[0];

            // Buffer the boundary by 10 meters (0.01 km) so the mask starts further out
            const bufferedBoundary = turf.buffer(boundaryFeature, 0.01, { units: 'kilometers' });

            // Calculate difference (World - Buffered Boundary)
            const maskPoly = turf.mask(bufferedBoundary, worldMask);

            L.geoJSON(maskPoly, {
                style: {
                    color: 'transparent',
                    fillColor: '#000000',
                    fillOpacity: 0.6,
                    weight: 0,
                    interactive: false // Allow clicking through to map if needed, or block? usually better to block to focus.
                }
            }).addTo(mapInstance);
        }
    } catch (e) {
        console.error("Error creating mask:", e);
    }
}

async function submitReport() {
    // Note: Validation happens before opening modal now, but good to keep safety check
    if (drawnItems.getLayers().length === 0) {
        return;
    }

    const btn = document.getElementById('final-submit-btn');
    const originalText = btn.innerText;

    btn.innerText = "Enviando...";
    btn.disabled = true;

    // Get Inputs
    const comments = document.getElementById('comments-input').value;
    const contact = document.getElementById('contact-input').value;

    // Get the raw GeoJSON
    const geoJsonPayload = drawnItems.toGeoJSON();

    // Inject details into each feature properties
    if (geoJsonPayload.features) {
        geoJsonPayload.features.forEach(feature => {
            feature.properties = feature.properties || {};
            feature.properties.comments = comments;
            feature.properties.contact_info = contact;
            feature.properties.timestamp = new Date().toISOString();
        });
    }

    // Check if Supabase initialized correctly
    if (!supabaseClient) {
        alert("Error crítico: No se pudo conectar con Supabase. Verifica que el script se cargó correctamente.");
        btn.innerText = "ENVIAR REPORTE";
        btn.disabled = false;
        return;
    }

    try {
        console.log("AG_LOG: Submitting report...");

        // Simple insert into Supabase
        const { data, error } = await supabaseClient
            .from('flood_reports')
            .insert([
                {
                    sector: window.currSectorName,
                    reporter_name: window.reporterName,
                    comments: comments,       // Added
                    contact_info: contact,    // Added
                    geojson_data: geoJsonPayload
                }
            ]);

        if (error) throw error;

        alert("¡Reporte guardado en la nube exitosamente!");

        // Cleanup UI
        document.getElementById('details-modal').classList.add('hidden');
        document.getElementById('comments-input').value = "";
        document.getElementById('contact-input').value = "";

        drawnItems.clearLayers(); // Clear map for next user

        // Immediately show what others drew (Feedback loop)
        // loadAllPolygons(); // DISABLED per user request

    } catch (e) {
        console.error("Error upload:", e);
        // Show the actual error message to the user for debugging
        alert("Error al guardar: " + (e.message || JSON.stringify(e)));
    } finally {
        btn.innerText = "ENVIAR REPORTE";
        btn.disabled = false;
    }
}

async function loadAllPolygons() {
    return; // DISABLED per user request
    console.log("AG_LOG: Loading all community reports...");

    // Select all rows
    const { data, error } = await supabaseClient
        .from('flood_reports')
        .select('geojson_data');

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    // Create or clear the community layer group
    if (window.communityLayer) {
        window.communityLayer.clearLayers();
    } else {
        window.communityLayer = L.geoJSON(null, {
            style: {
                color: '#FF3B30', // Alert Red for others' reports
                weight: 1,
                fillOpacity: 0.2
            },
            onEachFeature: function (feature, layer) {
                // Optional: Show who reported it
                // layer.bindPopup("Reportado por un vecino");
            }
        }).addTo(mapInstance);
    }

    // Loop through rows and add to map
    if (data) {
        data.forEach(row => {
            if (row.geojson_data) {
                window.communityLayer.addData(row.geojson_data);
            }
        });
    }
}

// --- ZOOM DROPDOWN LOGIC ---
function loadZoomDropdown(map) {
    const sectors = [
        { name: "Lirios del Sur", file: "Lirios del Sur" },
        { name: "Los Potes (Amalia Marín)", file: "Los Potes" },
        { name: "Los Meros (Amalia Marín)", file: "amalia marin" },
        { name: "Paseo del Puerto", file: "Paseo del Puerto" },
        { name: "Puerto Viejo", file: "Puerto_Viejo" },
        { name: "Salistral", file: "Salistral" },
        { name: "Villa Tabaiba", file: "Villa Tabaiba" },
        { name: "Res. Ernesto Ramos Antonini (Pámpanos)", file: "pampanos" },
        { name: "Residencial Caribe", file: "res caribe" },
        { name: "San Tomás", file: "san tomas" },
        { name: "Villa del Carmen", file: "villa del carmen" },
        { name: "Urb. Vistas del Mar", file: "vistas del mar" },
        { name: "Amalia Marín", file: "amalia marin" }
    ];

    const zoomSelect = document.getElementById('zoom-select');
    if (!zoomSelect) return;

    // Populate Dropdown
    sectors.sort((a, b) => a.name.localeCompare(b.name));

    sectors.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector.file; // Value is the filename
        option.textContent = sector.name; // Display is the friendly name
        zoomSelect.appendChild(option);
    });

    // Handle Change
    zoomSelect.addEventListener('change', async (e) => {
        const filename = e.target.value;
        if (!filename) return;

        try {
            const response = await fetch(`geojsons/${filename}.geojson`);
            if (!response.ok) throw new Error("Failed to load geojson");
            const data = await response.json();

            // Create a temporary layer just to get bounds
            const tempLayer = L.geoJSON(data);
            const bounds = tempLayer.getBounds();

            // Zoom to bounds (Pad it slightly)
            map.fitBounds(bounds, { padding: [50, 50], animate: true });

            console.log(`Zoomed to ${filename}`);
        } catch (err) {
            console.error("Zoom error:", err);
        }
    });
}
