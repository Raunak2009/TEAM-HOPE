from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys, os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ml"))
from predict import predict_onset, predict_break_risk
from build_labels import load_real_data
from advisory_engine import get_advisory

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_df = load_real_data()
DEMO_YEAR = 2024


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/blocks")
def get_blocks():
    stations = _df[["station_id", "District", "Latitude", "Longitude"]].drop_duplicates("station_id")
    return stations.to_dict(orient="records")


@app.get("/predict/onset")
def get_onset(station_id: str):
    result = predict_onset(station_id, year=DEMO_YEAR, df=_df)
    return result


@app.get("/predict/break-risk")
def get_break_risk(station_id: str, as_of_day: int = 170):
    return predict_break_risk(station_id, year=DEMO_YEAR, as_of_day=as_of_day, df=_df)

@app.get("/blocks/risk-map")
def get_risk_map():
    as_of_day = 170
    window = 9
    dry_threshold = 2.5

    recent = _df[
        (_df["year"] == DEMO_YEAR) &
        (_df["day_of_year"] > as_of_day - window) &
        (_df["day_of_year"] <= as_of_day)
    ]

    grouped = recent.groupby("station_id")["rainfall_mm"].apply(
        lambda x: (x < dry_threshold).sum()
    ).reset_index(name="dry_days")
    grouped["total_days"] = recent.groupby("station_id")["rainfall_mm"].count().values

    def level_for(row):
        if row["total_days"] == 0:
            return "unknown"
        dry_days = row["dry_days"]
        if dry_days >= 7:
            return "high"
        elif dry_days >= 5:
            return "moderate"
        return "low"

    grouped["risk_level"] = grouped.apply(level_for, axis=1)

    stations = _df[["station_id", "District", "Latitude", "Longitude"]].drop_duplicates("station_id")
    result = stations.merge(grouped[["station_id", "risk_level"]], on="station_id", how="left")
    result["risk_level"] = result["risk_level"].fillna("unknown")

    return result.to_dict(orient="records")


@app.get("/advisory")
def advisory(station_id: str, crop: str = "paddy", language: str = "en"):
    onset = predict_onset(station_id, year=DEMO_YEAR, df=_df)
    risk = predict_break_risk(station_id, year=DEMO_YEAR, as_of_day=170, df=_df)
    level = risk["break_risk"]["level"]

    onset_confidence_days = 5
    if "confidence_low" in onset and "confidence_high" in onset:
        import pandas as pd
        low = pd.Timestamp(onset["confidence_low"])
        high = pd.Timestamp(onset["confidence_high"])
        onset_confidence_days = (high - low).days

    result = get_advisory(crop, level, onset_confidence_days, language=language)
    result["station_id"] = station_id
    result["onset"] = onset
    result["break_risk"] = risk["break_risk"]
    return result


@app.post("/advisory/send")
def send_advisory(station_id: str, crop: str, phone_number: str, language: str = "en"):
    result = advisory(station_id, crop, language)
    message = f"HOPE Advisory ({station_id}): {result['advisory_text']}"
    # Simulated send - real WhatsApp delivery requires a paid, approved
    # WhatsApp Business sender account; this is a scoped-out production step,
    # not something we could complete within this prototype.
    return {"status": "simulated", "message_preview": message, "would_send_to": phone_number}