import pandas as pd
import pickle
import json
import numpy as np
import sys
from datetime import datetime, timedelta

def run_prediction():
    try:
        # Load model with error handling
        try:
            with open('mosquito_model.pkl', 'rb') as f:
                model = pickle.load(f)
        except FileNotFoundError:
            # Fallback if model doesn't exist yet
            print(json.dumps([]))
            return

        # Generate predictions for the next 7 days
        today = datetime.today()
        dates = [today + timedelta(days=i) for i in range(7)]
        
        # Generate mock weather features for forecast
        # Rationale: In a real app, this would come from a weather API
        np.random.seed(int(datetime.now().timestamp()))
        future_data = {
            'Temperature': np.random.uniform(25, 32, 7),
            'Humidity': np.random.uniform(60, 85, 7),
            'Rainfall': np.random.uniform(0, 20, 7)
        }
        
        X_future = pd.DataFrame(future_data)
        
        # Predict
        predictions = model.predict(X_future)
        
        output = []
        for i, date in enumerate(dates):
            output.append({
                'day': date.strftime("%a"), # e.g. 'Mon'
                'predicted': float(predictions[i]), 
                'actual': None
            })
            
        print(json.dumps(output))

    except Exception as e:
        # Print error details to stderr but valid JSON to stdout if possible, or handle in JS
        print(json.dumps({'error': str(e)}), file=sys.stdout)

if __name__ == "__main__":
    run_prediction()
