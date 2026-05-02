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

const normalizeName = (name = '') =>
    name.toLowerCase()
        .replace(/\s*district\s*/gi, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
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
            fillOpacity: isGapFill ? 0.35 : 0.65,
            weight: 1.5,
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
            `<div style="min-width:180px; font-family:'Outfit', sans-serif; padding: 4px;">
                <h3 style="font-weight:900; font-size:15px; margin:0 0 8px; color:#1A3D37; text-transform:uppercase; letter-spacing:0.05em;">${rawName}</h3>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; align-items:center; justify-content:between;">
                        <span style="font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Risk Level</span>
                        <span style="font-size:10px; font-weight:900; color:${color}; text-transform:uppercase;">${risk}</span>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:between; border-top:1px solid #f3f4f6; padding-top:6px;">
                        <span style="font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Confirmed</span>
                        <span style="font-size:11px; font-weight:900; color:#1A3D37;">${realCases}</span>
                    </div>
                    ${predCases > 0 ? `
                    <div style="display:flex; align-items:center; justify-content:between;">
                        <span style="font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase;">Forecast</span>
                        <span style="font-size:11px; font-weight:900; color:#6366f1;">~${Math.round(predCases)}</span>
                    </div>` : ''}
                    ${isGapFill ? `
                    <div style="margin-top:4px; padding:4px 8px; background:#fef2f2; border-radius:6px; font-size:9px; color:#ef4444; font-weight:700; text-align:center;">
                        ML GAP-FILL ACTIVE
                    </div>` : ''}
                </div>
            </div>`
        );

        layer.on({
            mouseover: e => e.target.setStyle({ fillOpacity: 0.85, weight: 2.5, color: '#FCD34D' }),
            mouseout: e => e.target.setStyle({ fillOpacity: isGapFill ? 0.35 : 0.65, weight: 1.5, color: 'white' }),
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

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', background: '#F8FAFC' }}>
            {loading && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ padding: '12px 24px', background: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9', display: 'flex', itemsCenter: 'center', gap: '10px' }}>
                        <div className="w-4 h-4 border-2 border-[#2F6A5F] border-t-transparent rounded-full animate-spin"></div>
                        <span style={{ fontSize: 11, color: '#1A3D37', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Updating Map Matrix</span>
                    </div>
                </div>
            )}

            <MapContainer center={[7.8731, 80.7718]} zoom={7.2} scrollWheelZoom={false} zoomControl={false}
                style={{ height: '100%', width: '100%', zIndex: 0, background: '#F8FAFC' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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

            {/* Floating Legend */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 900, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '12px', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Risk Legend</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(RISK_COLOR).map(([label, color]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', background: color, borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default SriLankaMap;
