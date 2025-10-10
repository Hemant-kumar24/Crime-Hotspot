import argparse
import json
from datetime import datetime
from pathlib import Path

import pandas as pd

try:
  from prophet import Prophet
except ImportError:
  from fbprophet import Prophet  # type: ignore

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "crime_dataset.csv"

def load_dataset() -> pd.DataFrame:
  df = pd.read_csv(DATA_PATH)
  df["date"] = pd.to_datetime(df["date"])
  df["Area"] = df["Area"].fillna("Unknown Area")
  df["City"] = df["City"].fillna("Unknown City")
  return df

def prepare_area_series(df: pd.DataFrame) -> pd.DataFrame:
  grouped = (
      df.groupby(["City", "Area", "date"], as_index=False)
      .size()
      .rename(columns={"size": "count"})
  )
  grouped = grouped.sort_values("date")
  return grouped

def build_area_locations(df: pd.DataFrame) -> dict:
  location_data = (
      df.groupby(["City", "Area"], as_index=False)[["lat", "lon"]]
      .median()
      .rename(columns={"lat": "latitude", "lon": "longitude"})
  )
  return {
      (row["City"], row["Area"]): {
          "city": row["City"],
          "area": row["Area"],
          "lat": float(row["latitude"]),
          "lon": float(row["longitude"]),
      }
      for _, row in location_data.iterrows()
  }

def forecast_area(area_key, area_df: pd.DataFrame, periods: int) -> dict:
  prophet_df = area_df.rename(columns={"date": "ds", "count": "y"})
  prophet_df = prophet_df[["ds", "y"]]

  model = Prophet(daily_seasonality=True, weekly_seasonality=True, yearly_seasonality=False)
  model.fit(prophet_df)
  future = model.make_future_dataframe(periods=periods, freq="D")
  forecast = model.predict(future)
  future_forecast = forecast.tail(periods)[["ds", "yhat", "yhat_lower", "yhat_upper"]]

  history_points = [
      {"date": row.ds.strftime("%Y-%m-%d"), "count": round(float(row.y), 3)}
      for row in prophet_df.itertuples()
  ]

  forecast_points = [
      {
          "date": row.ds.strftime("%Y-%m-%d"),
          "prediction": round(float(row.yhat), 3),
          "lower": round(float(row.yhat_lower), 3),
          "upper": round(float(row.yhat_upper), 3),
      }
      for row in future_forecast.itertuples()
  ]

  return {
      "key": f"{area_key[0]}::{area_key[1]}",
      "city": area_key[0],
      "area": area_key[1],
      "history": history_points,
      "forecast": forecast_points,
      "next_week_total": round(sum(point["prediction"] for point in forecast_points), 3),
  }

def select_major_areas(grouped: pd.DataFrame, limit: int) -> list:
  totals = (
      grouped.groupby(["City", "Area"])["count"]
      .sum()
      .sort_values(ascending=False)
      .head(limit)
  )
  return list(totals.index)

def fallback_response(reason: str) -> dict:
  return {
      "generated_at": datetime.utcnow().isoformat() + "Z",
      "areas": [],
      "summary": {
          "reason": reason,
      },
      "warnings": ["Forecast generation failed; ensure Prophet is installed and dataset has sufficient history."],
  }

def main():
  parser = argparse.ArgumentParser(description="Generate crime forecasts per area using Prophet")
  parser.add_argument("--limit", type=int, default=6, help="Number of major areas to forecast")
  parser.add_argument("--horizon", type=int, default=7, help="Forecast horizon in days")
  args = parser.parse_args()

  try:
    raw_df = load_dataset()
    grouped = prepare_area_series(raw_df)
    if grouped.empty:
      print(json.dumps(fallback_response("Dataset has no rows")), end="")
      return

    area_locations = build_area_locations(raw_df)
    target_areas = select_major_areas(grouped, args.limit)

    forecasts = []
    for area_key in target_areas:
      area_df = grouped[(grouped["City"] == area_key[0]) & (grouped["Area"] == area_key[1])]
      if len(area_df) < 10:
        continue
      try:
        area_result = forecast_area(area_key, area_df, args.horizon)
        location_meta = area_locations.get(area_key)
        if location_meta:
          area_result.update(location_meta)
        forecasts.append(area_result)
      except Exception as forecasting_error:  # noqa: BLE001
        forecasts.append({
            "key": f"{area_key[0]}::{area_key[1]}",
            "city": area_key[0],
            "area": area_key[1],
            "history": [],
            "forecast": [],
            "next_week_total": 0,
            "error": str(forecasting_error),
        })

    response = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "areas": forecasts,
        "summary": {
            "total_areas": len(forecasts),
            "horizon_days": args.horizon,
        },
    }
    print(json.dumps(response), end="")
  except Exception as error:  # noqa: BLE001
    print(json.dumps(fallback_response(str(error))), end="")

if __name__ == "__main__":
  main()
