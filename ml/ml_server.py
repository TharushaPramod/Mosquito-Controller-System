from flask import Flask, request, jsonify
import pandas as pd
from xgboost import XGBRegressor
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = XGBRegressor()
model.load_model("mosquito_model.json")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        df = pd.DataFrame(data)
        
        # Rename columns to match model training features
        df = df.rename(columns={
            'year': 'Year',
            'month': 'Month',
            'rainfall': 'Rainfall',
            'humidity': 'Humidity',
            'temperature': 'Temperature',
        })

        # Add lag features
        df['Rainfall_lag1'] = df['Rainfall'].shift(1).fillna(df['Rainfall'].mean())
        df['Density_lag1']  = df['cumulative'].shift(1).fillna(0) if 'cumulative' in df.columns else 0

        # Keep only model features
        df = df[['Year', 'Month', 'Rainfall', 'Humidity', 'Temperature', 'Rainfall_lag1', 'Density_lag1']]

        print("Final columns:", df.columns.tolist())
        predictions = model.predict(df)
        return jsonify({
            "success": True,
            "predictions": predictions.tolist()
        })
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)