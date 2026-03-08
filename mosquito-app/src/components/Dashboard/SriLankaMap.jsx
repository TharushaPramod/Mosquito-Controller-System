import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import districtData from '../../assets/data/sri-lanka-districts.json';

const fetchHeatmap = async (diseaseType) => {
    const base = import.meta.env.VITE_API_URL;
    const url = base + "/heatmap" + (diseaseType && diseaseType !== 'All' ? "?diseaseType=" + diseaseType.toLowerCase() : "");
    const res = await fetch(url);
    const json = await res.json();
    return json.data?.points || [];
};

const RISK_COLOR = { high: '#EF4444', medium: '#F97316', low: '#2F6A5F' };

// Normalize district name for matching
// GeoJSON may say "Colombo District", "Nuwara-Eliya", etc.
// MongoDB has "Colombo", "Nuwara Eliya", etc.
const normalizeName = (name = '') =>
    name.toLowerCase()
        .replace(/\s*district\s*/gi, '')   // remove " District"
        .replace(/[-_]/g, ' ')             // hyphens → spaces
        .replace(/\s+/g, ' ')              // collapse spaces
        .trim();

const SriLankaMap = ({ selectedDistrict, diseaseType }) => {
    const [riskData, setRiskData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchHeatmap(diseaseType)
            .then(setRiskData)
            .catch(() => setRiskData([]))
            .finally(() => setLoading(false));
    }, [diseaseType]);

    // Build a normalized lookup map for fast matching
    const riskMap = useMemo(() => {
        const map = {};
        riskData.forEach(d => {
            map[normalizeName(d.district)] = d;
        });
        return map;
    }, [riskData]);

    const styleFeature = (feature) => {
        const rawName = feature.properties.shapeName || feature.properties.name || '';
        const match = riskMap[normalizeName(rawName)];
        const risk = match?.effectiveRisk || 'low';
        const isGapFill = match?.isGapFill || false;
        return {
            fillColor: RISK_COLOR[risk] || '#2F6A5F',
            fillOpacity: isGapFill ? 0.45 : 0.72,
            weight: 1,
            color: 'white',
        };
    };

    const onEachDistrict = (feature, layer) => {
        const rawName = feature.properties.shapeName || feature.properties.name || 'Unknown';
        const match = riskMap[normalizeName(rawName)];
        const risk = match?.effectiveRisk || 'low';
        const realCases = match?.currentCases || 0;
        const predCases = match?.predictedCases || 0;
        const isGapFill = match?.isGapFill || false;
        const color = RISK_COLOR[risk] || '#2F6A5F';

        layer.bindPopup(
            '<div style="min-width:170px;font-family:sans-serif">' +
            '<h3 style="font-weight:700;font-size:14px;margin:0 0 6px">' + rawName + '</h3>' +
            '<p style="font-size:12px;margin:2px 0">Risk: <strong style="color:' + color + '">' + risk.toUpperCase() + '</strong></p>' +
            (realCases > 0
                ? '<p style="font-size:12px;margin:2px 0">Cases (30d): <strong>' + realCases + '</strong></p>'
                : '<p style="font-size:12px;margin:2px 0;color:#888">No recent real data</p>'
            ) +
            (predCases > 0
                ? '<p style="font-size:11px;margin:2px 0;color:#6366f1">ML Forecast: ~<strong>' + Math.round(predCases) + '</strong> cases</p>'
                : ''
            ) +
            (isGapFill
                ? '<p style="font-size:10px;color:#aaa;margin-top:5px;border-top:1px solid #eee;padding-top:4px">⚠ Coloured from ML gap-fill prediction</p>'
                : ''
            ) +
            '</div>'
        );

        layer.on({
            mouseover: e => e.target.setStyle({ fillOpacity: 0.92, weight: 2, color: '#FCD34D' }),
            mouseout: e => e.target.setStyle({ fillOpacity: isGapFill ? 0.45 : 0.72, weight: 1, color: 'white' }),
        });
    };

    const filteredData = useMemo(() => {
        if (!selectedDistrict || selectedDistrict === 'All') return districtData;
        return {
            ...districtData,
            features: districtData.features.filter(f => {
                const raw = f.properties.shapeName || f.properties.name || '';
                return normalizeName(raw) === normalizeName(selectedDistrict);
            }),
        };
    }, [selectedDistrict]);

    const gapFillCount = riskData.filter(d => d.isGapFill).length;

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {loading && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', borderRadius: '0.75rem' }}>
                    <span style={{ fontSize: 12, color: '#2F6A5F', fontWeight: 700 }}>Loading map data...</span>
                </div>
            )}

            <MapContainer center={[7.8731, 80.7718]} zoom={7} scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredData && riskData.length > 0 && (
                    <GeoJSON
                        key={selectedDistrict + "-" + riskData.length}
                        data={filteredData}
                        style={styleFeature}
                        onEachFeature={onEachDistrict}
                    />
                )}
            </MapContainer>

        </div>
    );
};

export default SriLankaMap;
