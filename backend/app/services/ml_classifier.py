import os
import joblib
import pandas as pd

# Path to the trained ML model
MODEL_PATH = "ml/saved_models/disaster_risk_model.joblib"

_model = None

def get_ml_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            _model = None
    return _model

def predict_disaster_risk(temperature: float, humidity: float, precipitation: float, wind_speed: float, weather_code: int):
    model = get_ml_model()
    
    # Fallback to rule-based logic if the model file is missing
    if model is None:
        if precipitation >= 25.0:
            return {"classification": "Flood", "risk": "critical", "confidence": 0.90}
        elif precipitation >= 10.0:
            return {"classification": "Heavy Rain", "risk": "high", "confidence": 0.85}
        elif wind_speed >= 40.0:
            return {"classification": "Storm", "risk": "high", "confidence": 0.85}
        elif temperature >= 40.0 and humidity < 45:
            return {"classification": "Heatwave", "risk": "medium", "confidence": 0.80}
        return {"classification": "Normal Weather", "risk": "low", "confidence": 0.95}

    # Prepare input feature DataFrame
    input_df = pd.DataFrame([{
        "temperature": temperature,
        "humidity": humidity,
        "precipitation": precipitation,
        "wind_speed": wind_speed,
        "weather_code": weather_code
    }])

    # Predict class label and probabilities
    predicted_label = model.predict(input_df)[0]
    probabilities = model.predict_proba(input_df)[0]
    confidence = float(max(probabilities))

    # Map predicted label to risk level
    risk_mapping = {
        "Flood": "critical",
        "Heavy Rain": "high",
        "Storm": "high",
        "Heatwave": "medium",
        "Normal": "low"
    }

    risk_level = risk_mapping.get(predicted_label, "low")
    display_label = "Normal Weather" if predicted_label == "Normal" else predicted_label

    return {
        "classification": display_label,
        "risk": risk_level,
        "confidence": round(confidence, 2)
    }