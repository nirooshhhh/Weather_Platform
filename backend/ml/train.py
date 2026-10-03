import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from app.database import engine

def train_model():
    print("Loading historical weather dataset from database...")
    query = "SELECT temperature, humidity, precipitation, wind_speed, weather_code, disaster_label FROM historical_weather"
    df = pd.read_sql(query, con=engine)

    X = df[["temperature", "humidity", "precipitation", "wind_speed", "weather_code"]]
    y = df["disaster_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Classifier model...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("\nModel Evaluation Performance:")
    print(classification_report(y_test, y_pred))

    os.makedirs("ml/saved_models", exist_ok=True)
    model_path = "ml/saved_models/disaster_risk_model.joblib"
    joblib.dump(clf, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_model()