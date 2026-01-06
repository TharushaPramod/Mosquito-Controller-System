import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_data(num_days=365):
    # Set a seed for reproducibility
    np.random.seed(42)

    start_date = datetime.today() - timedelta(days=num_days)
    dates = [start_date + timedelta(days=i) for i in range(num_days)]

    data = {
        'Date': dates,
        'Temperature': np.random.uniform(20, 35, num_days), # Celsius
        'Humidity': np.random.uniform(50, 90, num_days),   # Percentage
        'Rainfall': np.random.uniform(0, 50, num_days),    # mm
        'Latitude': np.random.uniform(6.0, 10.0, num_days), # Approximate range for Sri Lanka or similar tropical
        'Longitude': np.random.uniform(79.0, 82.0, num_days)
    }

    df = pd.DataFrame(data)

    # Simple synthetic relation: More rain + humidity + temp = more mosquitoes
    # This is just for demonstration purposes
    df['Mosquito_Count'] = (
        (df['Temperature'] * 2) + 
        (df['Humidity'] * 0.5) + 
        (df['Rainfall'] * 3) + 
        np.random.normal(0, 10, num_days)
    ).astype(int)

    # Ensure no negative counts
    df['Mosquito_Count'] = df['Mosquito_Count'].apply(lambda x: max(0, x))

    df.to_csv('mosquito_data.csv', index=False)
    print("mosquito_data.csv generated successfully.")

if __name__ == "__main__":
    generate_data()
