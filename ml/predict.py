import pandas as pd
import joblib
from build_labels import load_real_data

FEATURE_COLS = [
    "pre_season_total_rain",
    "pre_season_rainy_days",
    "pre_season_max_daily",
    "early_rain",
    "late_rain",
    "district_avg_rain",
    "prev_year_onset",
    "Latitude",
    "Longitude",
]

import os

_ml_dir = os.path.dirname(os.path.abspath(__file__))
COASTAL_DISTRICTS = ["Uttara Kannada", "Dakshina Kannada", "Udupi"]

_models = {}
for name in ["coastal", "interior"]:
    _models[name] = {
        "model": joblib.load(os.path.join(_ml_dir, f"onset_model_{name}.joblib")),
        "low": joblib.load(os.path.join(_ml_dir, f"onset_model_{name}_low.joblib")),
        "high": joblib.load(os.path.join(_ml_dir, f"onset_model_{name}_high.joblib")),
    }


def day_of_year_to_date(day: float, year: int) -> str:
    date = pd.Timestamp(year=year, month=1, day=1) + pd.Timedelta(days=int(round(day)) - 1)
    return str(date.date())


def get_station_features(station_id: str, year: int, df: pd.DataFrame) -> dict:
    pre_season = df[(df["station_id"] == station_id) & (df["year"] == year) & (df["day_of_year"] <= 120)]
    if pre_season.empty:
        return None

    early = pre_season[pre_season["day_of_year"] <= 60]["rainfall_mm"].sum()
    late = pre_season[pre_season["day_of_year"] > 60]["rainfall_mm"].sum()
    district = pre_season["District"].iloc[0]
    lat = pre_season["Latitude"].iloc[0]
    lon = pre_season["Longitude"].iloc[0]

    district_data = df[(df["District"] == district) & (df["year"] == year) & (df["day_of_year"] <= 120)]
    district_avg_rain = district_data.groupby("station_id")["rainfall_mm"].sum().mean()

    prev_year_onset = 150  # regional-average fallback - see note in the positioning guide

    return {
        "pre_season_total_rain": pre_season["rainfall_mm"].sum(),
        "pre_season_rainy_days": (pre_season["rainfall_mm"] > 2.5).sum(),
        "pre_season_max_daily": pre_season["rainfall_mm"].max(),
        "early_rain": early,
        "late_rain": late,
        "district_avg_rain": district_avg_rain,
        "prev_year_onset": prev_year_onset,
        "Latitude": lat,
        "Longitude": lon,
    }


def predict_onset(station_id: str, year: int, df: pd.DataFrame = None) -> dict:
    df = df if df is not None else load_real_data()
    features = get_station_features(station_id, year, df)
    if features is None:
        return {"station_id": station_id, "error": "no pre-season data available for this station/year"}

    row = df[df["station_id"] == station_id]
    district = row["District"].iloc[0] if not row.empty else None
    region = "coastal" if district in COASTAL_DISTRICTS else "interior"
    m = _models[region]

    X = pd.DataFrame([features])[FEATURE_COLS]
    pred_day = m["model"].predict(X)[0]
    low_day = m["low"].predict(X)[0]
    high_day = m["high"].predict(X)[0]

    return {
        "station_id": station_id,
        "region": region,
        "predicted_onset_date": day_of_year_to_date(pred_day, year),
        "confidence_low": day_of_year_to_date(low_day, year),
        "confidence_high": day_of_year_to_date(high_day, year),
    }

    X = pd.DataFrame([features])[FEATURE_COLS]
    pred_day = _model.predict(X)[0]
    low_day = _model_low.predict(X)[0]
    high_day = _model_high.predict(X)[0]

    return {
        "station_id": station_id,
        "predicted_onset_date": day_of_year_to_date(pred_day, year),
        "confidence_low": day_of_year_to_date(low_day, year),
        "confidence_high": day_of_year_to_date(high_day, year),
    }


def predict_break_risk(station_id: str, year: int, as_of_day: int, df: pd.DataFrame = None,
                        window: int = 9, dry_day_threshold_mm: float = 2.5, break_day_count: int = 5) -> dict:
    df = df if df is not None else load_real_data()
    recent = df[
        (df["station_id"] == station_id) & (df["year"] == year) &
        (df["day_of_year"] > as_of_day - window) & (df["day_of_year"] <= as_of_day)
    ].sort_values("day_of_year")

    if recent.empty:
        return {
            "station_id": station_id,
            "break_risk": {"score": None, "level": "unknown", "explanation": "no rainfall data available for this window"},
        }

    dry_days = int((recent["rainfall_mm"] < dry_day_threshold_mm).sum())
    score = round(dry_days / len(recent), 2)
    level = "high" if dry_days >= break_day_count + 2 else "moderate" if dry_days >= break_day_count else "low"

    return {
        "station_id": station_id,
        "break_risk": {"score": score, "level": level, "explanation": f"{dry_days} of last {len(recent)} days below rainfall threshold"},
    }


if __name__ == "__main__":
    # Demo run: pretend 2025 is "this year"
    df = load_real_data()
    result = predict_onset("KC1GHSN557", year=2024, df=df)
    print("Onset prediction:", result)

    break_result = predict_break_risk("KC1GHSN557", year=2024, as_of_day=170, df=df)
    print("Break risk:", break_result)