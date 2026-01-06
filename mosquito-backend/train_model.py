import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import pickle

def train_model():
    # Load dataset
    input_file = 'mosquito_data.csv'
    try:
        # Check for user-specified temp file first
        import os
        if os.path.exists('mosquito_data_temp.csv'):
            print("Found mosquito_data_temp.csv, using it for training...")
            input_file = 'mosquito_data_temp.csv'
        
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print(f"Error: {input_file} not found. Run generate_data.py first.")
        return

    # Features and Target
    # Dropping 'Date' for simple regression as models often need preprocessing for dates
    # Dropping Lat/Lon if we want a general weather-based model, but keeping them if valid features
    X = df[['Temperature', 'Humidity', 'Rainfall']] 
    y = df['Mosquito_Count']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Save model
    with open('mosquito_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Model trained and saved as mosquito_model.pkl")

if __name__ == "__main__":
    train_model()
