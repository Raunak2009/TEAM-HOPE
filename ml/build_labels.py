import pandas as pd
import os

def load_real_data(path=None):
    if path is None:
        _ml_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(_ml_dir, "karnataka_rainfall_data_2023_2025.csv")
    df = pd.read_csv(path)
    df["date"] = pd.to_datetime(df["Monitoring Date"], format="%d-%m-%Y")
    df = df.rename(columns={"Station Code": "station_id", "Rainfall (MM)": "rainfall_mm"})
    df["year"] = df["date"].dt.year
    df["day_of_year"] = df["date"].dt.dayofyear
    return df[df["year"].between(2023, 2025)]


def detect_local_onset(station_year_df, window=10, threshold_mm=8.0, check_days=15, max_dry_days=2):
    window_df = station_year_df[
        (station_year_df["day_of_year"] >= 121) & (station_year_df["day_of_year"] <= 181)
    ].sort_values("day_of_year")

    daily = window_df.set_index("day_of_year")["rainfall_mm"].reindex(range(121, 182), fill_value=0.0)
    rolling_sum = daily.rolling(window).sum()

    for day in rolling_sum.index:
        wetness = rolling_sum.get(day, 0)
        if wetness >= threshold_mm * window:
            following = daily.loc[day + 1: day + check_days]
            is_dry = following < 2.5
            longest_dry_streak = (
                is_dry.groupby((~is_dry).cumsum()).cumsum().max()
                if len(following) > 0 else 0
            )
            if pd.isna(longest_dry_streak):
                longest_dry_streak = 0

            if longest_dry_streak <= max_dry_days:
                # Confidence = how far past the threshold it was (wetness margin)
                # plus how far under the dry-day limit it stayed (dryness margin).
                # Bigger number = more clearly a real onset, not a borderline case.
                wetness_margin = wetness - (threshold_mm * window)
                dryness_margin = max_dry_days - longest_dry_streak
                confidence = wetness_margin + (dryness_margin * 10)  # weight dryness more heavily
                return day, confidence
    return None, None


def build_onset_labels(df, window=10, threshold_mm=8.0, check_days=15, max_dry_days=2):
    rows = []
    for (station, year), one_station_one_year in df.groupby(["station_id", "year"]):
        onset_day, confidence = detect_local_onset(
            one_station_one_year, window=window, threshold_mm=threshold_mm,
            check_days=check_days, max_dry_days=max_dry_days,
        )
        if onset_day is not None:
            rows.append({"station_id": station, "year": year, "onset_day_of_year": onset_day, "confidence": confidence})
    return pd.DataFrame(rows)


# --- Actually run it ---
if __name__ == "__main__":
    df = load_real_data()
    labels = build_onset_labels(df)
    print(labels.head(20))
    print("Total stations with a detected onset:", len(labels))
    print(labels.groupby("year")["onset_day_of_year"].mean())

    # coastal vs interior check
    merged = labels.merge(df[["station_id", "District"]].drop_duplicates(), on="station_id")
    coastal_districts = ["Uttara Kannada", "Dakshina Kannada", "Udupi"]
    print(merged[merged["District"].isin(coastal_districts)].groupby("year")["onset_day_of_year"].mean())
    print(merged[~merged["District"].isin(coastal_districts)].groupby("year")["onset_day_of_year"].mean())