from flask import Flask, request, jsonify
import pandas as pd
from xgboost import XGBRegressor

app = Flask(__name__)

# Load model once when server starts
model = XGBRegressor()
model.load_model("mosquito_model.json")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        df = pd.DataFrame(data)
        predictions = model.predict(df)

        return jsonify({
            "success": True,
            "predictions": predictions.tolist()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)