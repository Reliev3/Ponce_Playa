const fs = require('fs');
const path = require('path');

const directory = './geojsons';
const R = 6378137.0; // Earth radius in meters

function mercatorToLatLon(x, y) {
    const lon = (x / R) * (180 / Math.PI);
    const lat = (Math.atan(Math.exp(y / R)) * 2 - Math.PI / 2) * (180 / Math.PI);
    return [lon, lat];
}

function traverseCoords(coords) {
    if (typeof coords[0] === 'number') {
        // Point [x, y, z] or [x, y]
        const [x, y] = coords;
        return mercatorToLatLon(x, y); // Drop Z if present, or handle it? Let's just return [lon, lat]
    } else if (Array.isArray(coords)) {
        return coords.map(traverseCoords);
    }
    return coords;
}

fs.readdir(directory, (err, files) => {
    if (err) return console.error("Error reading dir:", err);

    files.forEach(file => {
        if (path.extname(file) === '.geojson') {
            const filePath = path.join(directory, file);
            const content = fs.readFileSync(filePath, 'utf8');
            try {
                const json = JSON.parse(content);

                // Check if it looks like Mercator (large numbers)
                // Just check the first feature's first coordinate
                // If it has a CRS 3857 tag or coordinates are > 180, convert.

                let needsConversion = false;
                if (json.crs && json.crs.properties && json.crs.properties.name && json.crs.properties.name.includes("3857")) {
                    needsConversion = true;
                }

                // Fallback check: look at a coordinate
                // Very rough check: if X > 180, it's definitely not WGS84 lon.

                if (needsConversion) {
                    console.log(`Converting ${file}...`);

                    json.features.forEach(feature => {
                        if (feature.geometry && feature.geometry.coordinates) {
                            feature.geometry.coordinates = traverseCoords(feature.geometry.coordinates);
                        }
                    });

                    // Remove or update CRS
                    delete json.crs;

                    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
                    console.log(`Saved ${file}`);
                } else {
                    console.log(`Skipping ${file} (Already WGS84 or unknown)`);
                }

            } catch (e) {
                console.error(`Error parsing ${file}:`, e);
            }
        }
    });
});
