import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, LayerGroup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Filter } from 'lucide-react';
import Navbar from '../../components/Mosquito_Density/Navbar';

// Fix for default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Base GeoJSON Geometry (Simplified Polygons for Gampaha District MOH Areas)
const baseGeoJSON = {
    "type": "FeatureCollection",
    "features": [
        // 1. Negombo - Coastal North
        { "type": "Feature", "properties": { "name": "Negombo" }, "geometry": { "type": "Polygon", "coordinates": [[[79.80, 7.22], [79.88, 7.22], [79.88, 7.15], [79.80, 7.15], [79.80, 7.22]]] } },
        // 2. Katana - Near Negombo
        { "type": "Feature", "properties": { "name": "Katana" }, "geometry": { "type": "Polygon", "coordinates": [[[79.88, 7.25], [79.95, 7.25], [79.95, 7.18], [79.88, 7.18], [79.88, 7.25]]] } },
        // 3. Divulapitiya - North
        { "type": "Feature", "properties": { "name": "Divulapitiya" }, "geometry": { "type": "Polygon", "coordinates": [[[79.95, 7.30], [80.05, 7.30], [80.05, 7.22], [79.95, 7.22], [79.95, 7.30]]] } },
        // 4. Mirigama - Far North East
        { "type": "Feature", "properties": { "name": "Mirigama" }, "geometry": { "type": "Polygon", "coordinates": [[[80.05, 7.30], [80.15, 7.30], [80.15, 7.20], [80.05, 7.20], [80.05, 7.30]]] } },
        // 5. Minuwangoda - Central North
        { "type": "Feature", "properties": { "name": "Minuwangoda" }, "geometry": { "type": "Polygon", "coordinates": [[[79.90, 7.18], [80.00, 7.18], [80.00, 7.12], [79.90, 7.12], [79.90, 7.18]]] } },
        // 6. Wattala - Coastal South
        { "type": "Feature", "properties": { "name": "Wattala" }, "geometry": { "type": "Polygon", "coordinates": [[[79.85, 7.02], [79.92, 7.02], [79.92, 6.95], [79.85, 6.95], [79.85, 7.02]]] } },
        // 7. Ja-Ela - Coastal Mid
        { "type": "Feature", "properties": { "name": "Ja-Ela" }, "geometry": { "type": "Polygon", "coordinates": [[[79.88, 7.10], [79.95, 7.10], [79.95, 7.05], [79.88, 7.05], [79.88, 7.10]]] } },
        // 8. Gampaha MOH - Central
        { "type": "Feature", "properties": { "name": "Gampaha MOH" }, "geometry": { "type": "Polygon", "coordinates": [[[79.98, 7.12], [80.05, 7.12], [80.05, 7.05], [79.98, 7.05], [79.98, 7.12]]] } },
        // 9. Attanagalla - East
        { "type": "Feature", "properties": { "name": "Attanagalla" }, "geometry": { "type": "Polygon", "coordinates": [[[80.05, 7.15], [80.12, 7.15], [80.12, 7.08], [80.05, 7.08], [80.05, 7.15]]] } },
        // 10. Dompe - South East
        { "type": "Feature", "properties": { "name": "Dompe" }, "geometry": { "type": "Polygon", "coordinates": [[[80.08, 7.05], [80.18, 7.05], [80.18, 6.95], [80.08, 6.95], [80.08, 7.05]]] } },
        // 11. Mahara - South Central
        { "type": "Feature", "properties": { "name": "Mahara" }, "geometry": { "type": "Polygon", "coordinates": [[[79.95, 7.05], [80.02, 7.05], [80.02, 6.98], [79.95, 6.98], [79.95, 7.05]]] } },
        // 12. Kelaniya - South West
        { "type": "Feature", "properties": { "name": "Kelaniya" }, "geometry": { "type": "Polygon", "coordinates": [[[79.88, 6.98], [79.94, 6.98], [79.94, 6.92], [79.88, 6.92], [79.88, 6.98]]] } },
        // 13. Seeduwa - Near Airport
        { "type": "Feature", "properties": { "name": "Seeduwa" }, "geometry": { "type": "Polygon", "coordinates": [[[79.85, 7.15], [79.90, 7.15], [79.90, 7.10], [79.85, 7.10], [79.85, 7.15]]] } },
        // 14. Biyagama - South East Corner
        { "type": "Feature", "properties": { "name": "Biyagama" }, "geometry": { "type": "Polygon", "coordinates": [[[79.98, 7.00], [80.08, 7.00], [80.08, 6.92], [79.98, 6.92], [79.98, 7.00]]] } }
    ]
};

export const SpatialMap = () => {
    const [map, setMap] = useState(null);
    const [mapData, setMapData] = useState(null); // Holds the API data
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState('All Areas'); // Filter State

    // --- FETCH DATA FROM BACKEND ---
    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5001/api/map-data?t=${new Date().getTime()}`);
                const data = await response.json();
                setMapData(data); // Save { zones: [], hotspots: [] }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching map data:", error);
                setLoading(false);
            }
        };

        fetchMapData();
    }, []);

    // Helper: Find the API data for a specific zone name
    const getZoneData = (zoneName) => {
        if (!mapData) return {};
        // Normalized matching
        return mapData.zones.find(z => z.name === zoneName) || {};
    };

    const getFillColor = (riskLevel) => {
        return riskLevel === 'HIGH' ? '#ef4444' :
            riskLevel === 'MEDIUM' ? '#f59e0b' :
                riskLevel === 'LOW' ? '#10b981' : '#6b7280';
    };

    const styleFeature = (feature) => {
        const apiProps = getZoneData(feature.properties.name);
        const risk = apiProps.risk_level || "LOW";

        return {
            fillColor: getFillColor(risk),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.6
        };
    };

    const onEachFeature = (feature, layer) => {
        // Bind popup dynamically when clicked
        layer.on('click', () => {
            const props = getZoneData(feature.properties.name);

            // If data is missing (loading or error), show generic message
            if (!props.risk_level) return;

            layer.bindPopup(`
                <div class="p-4 min-w-[250px]">
                    <h3 class="font-bold text-lg text-gray-800 mb-2">${props.name}</h3>
                    <div class="space-y-2 text-sm">
                        <p><span class="font-semibold">Risk Level:</span> 
                           <span class="px-2 py-1 rounded-full text-xs font-bold ${props.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' : props.risk_level === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}">
                           ${props.risk_level}</span>
                        </p>
                        <p><span class="font-semibold">AI Probability:</span> ${props.risk_prob}%</p>
                        <p><span class="font-semibold">Predicted Cases:</span> ${props.cases}</p>
                        <p><span class="font-semibold">Population:</span> ${props.population ? props.population.toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
            `).openPopup();
        });
    };

    return (
        <>
            <Navbar />
            <div className="w-full min-h-screen px-4 py-8 bg-[#F0F7F5] sm:px-6 lg:px-12">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">Spatial Prediction Map</h1>
                <p className="text-xl text-gray-600">Real-time Dengue Risk Heatmap - Gampaha District</p>
            </div>

            {/* Legend & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-100 shadow-lg rounded-xl max-w-max">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div><span className="text-sm font-medium">HIGH Risk</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-400 rounded-full"></div><span className="text-sm font-medium">MEDIUM Risk</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div><span className="text-sm font-medium">LOW Risk</span></div>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="block w-full py-3 pl-10 pr-10 text-base border-gray-300 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-lg border"
                    >
                        <option value="All Areas">All Areas</option>
                        <option value="Attanagalla">Attanagalla</option>
                        <option value="Biyagama">Biyagama</option>
                        <option value="Divulapitiya">Divulapitiya</option>
                        <option value="Dompe">Dompe</option>
                        <option value="Gampaha MOH">Gampaha MOH</option>
                        <option value="Ja-Ela">Ja-Ela</option>
                        <option value="Katana">Katana</option>
                        <option value="Kelaniya">Kelaniya</option>
                        <option value="Mahara">Mahara</option>
                        <option value="Minuwangoda">Minuwangoda</option>
                        <option value="Mirigama">Mirigama</option>
                        <option value="Negombo">Negombo</option>
                        <option value="Seeduwa">Seeduwa</option>
                        <option value="Wattala">Wattala</option>
                    </select>
                </div>
            </div>

            {/* MAP CONTAINER */}
            <div className="relative overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin" />
                        <p className="text-lg font-semibold text-gray-700">Analyzing Spatial Data...</p>
                    </div>
                )}

                <MapContainer
                    center={[7.08, 79.98]}
                    zoom={11}
                    style={{ width: '100%', height: '70vh', minHeight: '600px' }}
                    scrollWheelZoom={true}
                    whenCreated={setMap}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    {/* Render Zones only if data is loaded */}
                    {!loading && mapData && (
                        <>
                            <GeoJSON
                                key={selectedArea} // Force re-render when filter changes
                                data={selectedArea === 'All Areas'
                                    ? baseGeoJSON
                                    : { ...baseGeoJSON, features: baseGeoJSON.features.filter(f => f.properties.name === selectedArea) }
                                }
                                style={styleFeature}
                                onEachFeature={onEachFeature}
                            />

                            <LayerGroup>
                                {mapData.hotspots.map((hotspot, index) => (
                                    <Circle
                                        key={index}
                                        center={hotspot.position}
                                        radius={hotspot.cases * 40}
                                        pathOptions={{
                                            fillColor: hotspot.risk === 'HIGH' ? '#ef4444' : '#f59e0b',
                                            fillOpacity: 0.8,
                                            color: 'white',
                                            weight: 2
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2 text-center">
                                                <h4 className="font-bold text-red-600">Hotspot Detected</h4>
                                                <p className="text-sm">Cases: {hotspot.cases}</p>
                                            </div>
                                        </Popup>
                                    </Circle>
                                ))}
                            </LayerGroup>
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    </>
    );
};