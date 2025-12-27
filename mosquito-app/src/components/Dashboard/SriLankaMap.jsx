import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import districtData from '../../assets/data/sri-lanka-districts.json';

const SriLankaMap = ({ selectedDistrict }) => {
    const mapStyle = {
        fillColor: '#2F6A5F',
        weight: 1,
        color: 'white',
        fillOpacity: 0.6,
    };

    const onEachDistrict = (district, layer) => {
        const districtName = district.properties.shapeName || "Unknown District";

        // Random dummy data for demonstration
        const cases = Math.floor(Math.random() * 500);
        const riskLevel = cases > 300 ? "High" : cases > 100 ? "Moderate" : "Low";
        const riskColor = riskLevel === "High" ? "#EF4444" : riskLevel === "Moderate" ? "#F97316" : "#2F6A5F";

        layer.options.fillColor = riskColor;

        layer.bindPopup(`
      <div class="text-center">
        <h3 class="font-bold text-lg">${districtName}</h3>
        <p class="text-sm text-gray-600">Risk Level: <span class="font-semibold" style="color: ${riskColor}">${riskLevel}</span></p>
        <p class="text-sm text-gray-600">Cases: ${cases}</p>
      </div>
    `);

        layer.on({
            mouseover: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.9,
                    weight: 2,
                    color: '#FCD34D'
                });
            },
            mouseout: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.6,
                    weight: 1,
                    color: 'white'
                });
            }
        });
    };

    const filteredData = React.useMemo(() => {
        if (!selectedDistrict || selectedDistrict === 'All') {
            return districtData;
        }
        return {
            ...districtData,
            features: districtData.features.filter(
                feature => feature.properties.shapeName === selectedDistrict
            )
        };
    }, [selectedDistrict]);

    return (
        <MapContainer
            center={[7.8731, 80.7718]}
            zoom={7}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredData && (
                <GeoJSON
                    key={selectedDistrict} // Force re-render when selection changes
                    data={filteredData}
                    style={mapStyle}
                    onEachFeature={onEachDistrict}
                />
            )}
        </MapContainer>
    );
};

export default SriLankaMap;
