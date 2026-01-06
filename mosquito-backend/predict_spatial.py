import pandas as pd
import pickle
import json
import numpy as np
import sys

# Define Zones with approximate populations
ZONES = [
    {"name": "Attanagalla", "population": 179000},
    {"name": "Biyagama", "population": 185000},
    {"name": "Divulapitiya", "population": 145000},
    {"name": "Dompe", "population": 155000},
    {"name": "Gampaha MOH", "population": 198000},
    {"name": "Ja-Ela", "population": 205000},
    {"name": "Katana", "population": 133000},
    {"name": "Kelaniya", "population": 115000},
    {"name": "Mahara", "population": 210000},
    {"name": "Minuwangoda", "population": 180000},
    {"name": "Mirigama", "population": 165000},
    {"name": "Negombo", "population": 145000},
    {"name": "Seeduwa", "population": 120000},
    {"name": "Wattala", "population": 180000},
    {"name": "Mahara", "population": 210000}
]

def get_risk_level(density):
    if density >= 75:
        return "HIGH"
    elif density >= 40:
        return "MEDIUM"
    else:
        return "LOW"

def run_spatial_prediction():
    try:
        # Load model
        try:
            with open('mosquito_model.pkl', 'rb') as f:
                model = pickle.load(f)
        except FileNotFoundError:
            # Return fallback data if model is missing
            print(json.dumps({"error": "Model not found"}))
            return

        # Generate random weather conditions for each zone to simulate spatial variance
        # In a real system, you'd fetch weather by Lat/Lon
        np.random.seed(None) # Random everytime
        
        zones_output = []
        hotspots_output = []
        
        for zone in ZONES:
            # Random weather for this zone
            weather_features = pd.DataFrame({
                'Temperature': [np.random.uniform(25, 34)],
                'Humidity': [np.random.uniform(55, 90)],
                'Rainfall': [np.random.uniform(0, 30)]
            })
            
            # Predict density
            predicted_density = float(model.predict(weather_features)[0])
            risk_level = get_risk_level(predicted_density)
            
            # Calculate a "Risk Probability" and "Cases" based on density roughly
            risk_prob = min(99, int((predicted_density / 100) * 100))
            estimated_cases = int(predicted_density * np.random.uniform(0.5, 1.5))
            
            zones_output.append({
                "name": zone["name"],
                "risk_level": risk_level,
                "risk_prob": risk_prob,
                "cases": estimated_cases,
                "population": zone["population"]
            })

            # Create a hotspot for High/Medium zones
            if risk_level in ["HIGH", "MEDIUM"]:
                # Approximate generic coordinates for demo (these would be specific in real app)
                # Gampaha: ~7.09, 79.99
                lat_base = 7.0 + np.random.uniform(0, 0.2)
                lon_base = 79.9 + np.random.uniform(0, 0.1)
                
                hotspots_output.append({
                    "position": [lat_base, lon_base],
                    "cases": int(estimated_cases * 0.2), # Isolate a cluster
                    "risk": risk_level
                })

        output = {
            "zones": zones_output,
            "hotspots": hotspots_output
        }
            
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)

if __name__ == "__main__":
    run_spatial_prediction()
