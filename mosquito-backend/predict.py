import sys
import json
import pandas as pd
from xgboost import XGBRegressor

model = XGBRegressor()
model.load_model("mosquito_model.json")

input_data = json.loads(sys.argv[1])

df = pd.DataFrame(input_data)

predictions = model.predict(df)

print(json.dumps(predictions.tolist()))