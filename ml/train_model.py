import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
from sklearn.model_selection import GridSearchCV, cross_val_score, KFold

from build_labels import load_real_data, build_onset_labels  # reuses your tuned detector
import os
_ml_dir = os.path.dirname(os.path.abspath(__file__))


def build_pre_season_features(df, labels):
    pre_season = df[df["day_of_year"] <= 120].copy()

    early = pre_season[pre_season["day_of_year"] <= 60]
    late = pre_season[(pre_season["day_of_year"] > 60) & (pre_season["day_of_year"] <= 120)]

    early_feat = early.groupby(["station_id", "year"])["rainfall_mm"].sum().reset_index(name="early_rain")
    late_feat = late.groupby(["station_id", "year"])["rainfall_mm"].sum().reset_index(name="late_rain")

    features = (
        pre_season.groupby(["station_id", "year"])
        .agg(
            pre_season_total_rain=("rainfall_mm", "sum"),
            pre_season_rainy_days=("rainfall_mm", lambda x: (x > 2.5).sum()),
            pre_season_max_daily=("rainfall_mm", "max"),
        )
        .reset_index()
    )
    features = features.merge(early_feat, on=["station_id", "year"], how="left")
    features = features.merge(late_feat, on=["station_id", "year"], how="left")
    features["early_rain"] = features["early_rain"].fillna(0)
    features["late_rain"] = features["late_rain"].fillna(0)

    locations = df.groupby("station_id")[["Latitude", "Longitude", "District"]].first().reset_index()
    features = features.merge(locations, on="station_id")

    district_avg = features.groupby(["District", "year"])["pre_season_total_rain"].mean().reset_index(
        name="district_avg_rain"
    )
    features = features.merge(district_avg, on=["District", "year"])

    prev_year_onset = labels.copy()
    prev_year_onset["year"] = prev_year_onset["year"] + 1
    prev_year_onset = prev_year_onset.rename(columns={"onset_day_of_year": "prev_year_onset"})
    features = features.merge(prev_year_onset, on=["station_id", "year"], how="left")

    station_avg_onset = labels.groupby("station_id")["onset_day_of_year"].mean()
    features["prev_year_onset"] = features.apply(
        lambda row: row["prev_year_onset"] if pd.notna(row["prev_year_onset"])
        else station_avg_onset.get(row["station_id"], labels["onset_day_of_year"].mean()),
        axis=1,
    )

    return features


def filter_confident_labels(labels, keep_fraction=0.7):
    """Keep only the most confidently-detected onset labels - drops the
    borderline/noisiest cases before training, to reduce label noise."""
    threshold = labels["confidence"].quantile(1 - keep_fraction)
    return labels[labels["confidence"] >= threshold]


def build_training_dataset(use_confident_only=True, keep_fraction=0.7):
    df = load_real_data()
    labels = build_onset_labels(df)
    if use_confident_only:
        labels = filter_confident_labels(labels, keep_fraction=0.7)
    features = build_pre_season_features(df, labels)
    dataset = features.merge(labels, on=["station_id", "year"], how="inner")
    return dataset


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


COASTAL_DISTRICTS = ["Uttara Kannada", "Dakshina Kannada", "Udupi"]

def train_regional_models():
    dataset = build_training_dataset()
    coastal = dataset[dataset["District"].isin(COASTAL_DISTRICTS)]
    interior = dataset[~dataset["District"].isin(COASTAL_DISTRICTS)]
    print(f"Coastal rows: {len(coastal)} | Interior rows: {len(interior)}")

    param_grid = {"max_depth": [2, 3, 4], "n_estimators": [50, 100, 200], "learning_rate": [0.05, 0.1, 0.2]}

    for name, data in [("coastal", coastal), ("interior", interior)]:
        X, y = data[FEATURE_COLS], data["onset_day_of_year"]
        grid = GridSearchCV(GradientBoostingRegressor(random_state=42), param_grid, cv=KFold(n_splits=5, shuffle=True, random_state=42), scoring="neg_mean_absolute_error")
        grid.fit(X, y)
        model = grid.best_estimator_
        cv_scores = cross_val_score(model, X, y, cv=KFold(n_splits=5, shuffle=True, random_state=42), scoring="neg_mean_absolute_error")
        mae = -cv_scores.mean()
        print(f"{name} MAE: {mae:.2f} | best params: {grid.best_params_}")

        model.fit(X, y)
        model_low = GradientBoostingRegressor(loss="quantile", alpha=0.10, random_state=42, **grid.best_params_)
        model_high = GradientBoostingRegressor(loss="quantile", alpha=0.90, random_state=42, **grid.best_params_)
        model_low.fit(X, y)
        model_high.fit(X, y)

        joblib.dump(model, os.path.join(_ml_dir, f"onset_model_{name}.joblib"))
        joblib.dump(model_low, os.path.join(_ml_dir, f"onset_model_{name}_low.joblib"))
        joblib.dump(model_high, os.path.join(_ml_dir, f"onset_model_{name}_high.joblib"))

if __name__ == "__main__":
    train_regional_models()