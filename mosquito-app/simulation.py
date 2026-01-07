import requests
import json
import random
import time
from datetime import datetime

# --- CONFIGURATION ---
DATABASE_URL = "https://mosquito-trap-01-default-rtdb.firebaseio.com"
CATEGORIES = ["aedes", "culex", "anopheles", "other", "insects"]

# --- HELPER: Generate Incremental Batches ---
def get_small_catch(hour):
    """
    Simulates a small catch of insects for a specific interval.
    Adjusts weights based on peak mosquito activity hours.
    """
    counts = {}
    # Define peak hours (Dawn: 6-9 AM, Dusk: 5-8 PM)
    is_peak = (6 <= hour <= 9) or (17 <= hour <= 20) 
    
    for cat in CATEGORIES:
        if cat == "aedes":
            # Aedes specific logic: 80% chance of 0, 20% chance of 1
            counts[cat] = random.choices([0, 1], weights=[80, 20])[0]

        elif cat == "other":
            # Higher activity for 'other' species during peak hours
            if is_peak:
                counts[cat] = random.randint(1, 4) 
            else:
                counts[cat] = random.randint(0, 2)
        
        else:
            # Baseline catch for Anopheles, Culex, and non-target insects
            counts[cat] = random.randint(0, 1)
            
    return counts

# --- STEP 1: INITIALIZE SYSTEM ---
def initialize_day(day_number):
    """
    Prepares the database for a new simulation day.
    Calculates predictions based on historical averages.
    """
    print(f"\n--- 🌅 Starting New Day: Day {day_number} ---")
    
    try:
        history_ref = requests.get(f"{DATABASE_URL}/history.json").json()
    except:
        history_ref = None
    
    predictions = {}

    # Create dummy baseline data if history is empty
    if not history_ref:
        print("Creating dummy baseline for initial prediction...")
        history_ref = {}
        for d in range(1, 4):
            history_ref[f"day_{d}"] = {}
            for h in range(24):
                history_ref[f"day_{d}"][f"{h:02d}"] = {c: random.randint(1, 10) for c in CATEGORIES}

    # Calculate Predicted counts for the graph using historical averages
    print("Calculating Hourly Predictions...")
    for h in range(24):
        hour_key = f"{h:02d}"
        predictions[hour_key] = 0
        total_hist_count = 0
        days_count = 0
        for day in history_ref:
            if hour_key in history_ref[day]:
                day_data = history_ref[day][hour_key]
                # Exclude non-target 'insects' from the predicted total
                total_hist_count += sum([day_data[c] for c in CATEGORIES if c != 'insects'])
                days_count += 1
        if days_count > 0:
            predictions[hour_key] = int(total_hist_count / days_count)

    # Initialize the Hourly Data structure in Firebase
    hourly_structure = {}
    for h in range(24):
        hour_key = f"{h:02d}"
        hourly_structure[hour_key] = {
            "time": f"{h:02d}:00",
            "predicted": predictions[hour_key], 
            "total_actual": 0
        }
        for cat in CATEGORIES:
            hourly_structure[hour_key][cat] = 0

    requests.put(f"{DATABASE_URL}/hourly.json", json=hourly_structure)
    print("✅ Initialization Complete. Ready to Start.")

# --- STEP 2: RUN SIMULATION ---
def start_simulation():
    """
    Main loop to simulate the passage of time (24 hours).
    Updates Firebase in real-time to reflect trap activity.
    """
    day_counter = 1
    initialize_day(day_counter)

    current_hour = 0 
    
    while True:
        time_str_hour = f"{current_hour:02d}" 
        
        # --- RESET DASHBOARD CARDS AT START OF HOUR ---
        current_hour_totals = {c: 0 for c in CATEGORIES}
        
        reset_payload = current_hour_totals.copy()
        reset_payload["timestamp"] = f"{current_hour:02d}:00"
        requests.patch(f"{DATABASE_URL}/live.json", json=reset_payload)
        
        print(f"⏳ Hour {current_hour}:00 Simulation Started...")

        # --- INNER LOOP (Incremental updates every 10 simulated minutes) ---
        for minute in range(10, 61, 10): 
            
            # 1. Simulate a catch batch for this interval
            small_catch = get_small_catch(current_hour)
            
            # 2. Accumulate counts for the current hour
            total_mosquitoes_now = 0
            for cat in CATEGORIES:
                current_hour_totals[cat] += small_catch[cat]
                if cat != 'insects':
                    total_mosquitoes_now += current_hour_totals[cat]

            # 3. Update Live Data (For Dashboard Cards)
            display_time = f"{current_hour:02d}:{minute}"
            if minute == 60: display_time = f"{current_hour:02d}:59"

            live_payload = current_hour_totals.copy()
            live_payload["timestamp"] = display_time
            requests.patch(f"{DATABASE_URL}/live.json", json=live_payload)

            # 4. Update Hourly Data (For Chart and Table)
            try:
                update_payload = current_hour_totals.copy()
                update_payload["total_actual"] = total_mosquitoes_now
                requests.patch(f"{DATABASE_URL}/hourly/{time_str_hour}.json", json=update_payload)
            except Exception as e:
                print(f"Update Error: {e}")
            
          
            time.sleep(1) 

        # --- END OF HOUR SUMMARY ---
        print(f"✅ Hour {current_hour:02d} Summary | Ae: {current_hour_totals['aedes']} | Cu: {current_hour_totals['culex']} | An: {current_hour_totals['anopheles']} | Total: {total_mosquitoes_now}")

        current_hour += 1 

        # --- END OF DAY LOGIC ---
        if current_hour == 24:
            print("\n🌙 Day Cycle Complete! Saving today's data to History...")
            
            today_full_data = requests.get(f"{DATABASE_URL}/hourly.json").json()
            history_save_data = {}
            for h in range(24):
                h_key = f"{h:02d}"
                history_save_data[h_key] = {}
                for cat in CATEGORIES:
                    history_save_data[h_key][cat] = today_full_data[h_key][cat]

            requests.patch(f"{DATABASE_URL}/history/day_{day_counter}.json", json=history_save_data)
            print("✅ History Data Saved Successfully.")
            
            day_counter += 1
            current_hour = 0
            initialize_day(day_counter)

if __name__ == "__main__":
    start_simulation()