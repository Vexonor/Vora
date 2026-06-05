from datetime import datetime, timedelta
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

TARGETS = ["gross_revenue", "net_profit", "total_transaction", "total_items_sold"]

FEATURE_COLS = [
    "day_of_week",
    "day_of_month",
    "month",
    "year",
    "day_of_year",
    "days_since_start",
    "gross_revenue_r3",
    "gross_revenue_r7",
    "net_profit_r3",
    "net_profit_r7",
    "total_transaction_r3",
    "total_transaction_r7",
]


def _build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_month"] = df["date"].dt.day
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year
    df["day_of_year"] = df["date"].dt.dayofyear
    df["days_since_start"] = (df["date"] - df["date"].min()).dt.days

    for col in ["gross_revenue", "net_profit", "total_transaction"]:
        df[f"{col}_r3"] = df[col].rolling(3, min_periods=1).mean()
        df[f"{col}_r7"] = df[col].rolling(7, min_periods=1).mean()

    return df


def _train_models(
    X: pd.DataFrame, y_dict: dict[str, pd.Series]
) -> dict[str, RandomForestRegressor]:
    models: dict[str, RandomForestRegressor] = {}
    for target, y in y_dict.items():
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X, y)
        models[target] = model
    return models


class SalesTrendPredictor:
    def __init__(self) -> None:
        self._models: dict[str, RandomForestRegressor] = {}
        self._min_date: pd.Timestamp | None = None
        self._rolling: dict[str, list[float]] = {}
        self.evaluation: dict[str, Any] = {}

    def fit(self, history: list[dict[str, Any]]) -> None:
        df = pd.DataFrame(history)
        for col in TARGETS:
            if col not in df.columns:
                df[col] = 0.0
            df[col] = df[col].astype(float).fillna(0)

        df = _build_features(df)
        self._min_date = df["date"].min()

        # Chronological train/test split 80/20
        split_idx = max(1, int(len(df) * 0.8))
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]

        X_train = train_df[FEATURE_COLS]
        y_train = {t: train_df[t] for t in TARGETS}

        # Evaluate on held-out test set
        eval_models = _train_models(X_train, y_train)

        metrics: dict[str, Any] = {
            "train_size": len(train_df),
            "test_size": len(test_df),
        }

        if len(test_df) > 0:
            X_test = test_df[FEATURE_COLS]
            for target, model in eval_models.items():
                y_true = test_df[target].values
                y_pred = model.predict(X_test)
                rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
                mae = float(mean_absolute_error(y_true, y_pred))
                # r2 bisa negatif jika model sangat buruk — clamp ke -1
                r2 = float(max(-1.0, r2_score(y_true, y_pred)))
                metrics[target] = {
                    "rmse": round(rmse, 4),
                    "mae": round(mae, 4),
                    "r2": round(r2, 4),
                }

        self.evaluation = metrics

        # Retrain pada seluruh data agar prediksi semaksimal mungkin
        X_full = df[FEATURE_COLS]
        y_full = {t: df[t] for t in TARGETS}
        self._models = _train_models(X_full, y_full)

        tail = min(7, len(df))
        for col in ["gross_revenue", "net_profit", "total_transaction"]:
            self._rolling[col] = list(df[col].tail(tail))

    def predict(
        self, last_date: pd.Timestamp, days: int = 30
    ) -> list[dict[str, Any]]:
        results = []

        def rolling_mean(vals: list[float], n: int) -> float:
            tail = vals[-n:] if vals else [0.0]
            return float(np.mean(tail)) if tail else 0.0

        rolling = {k: list(v) for k, v in self._rolling.items()}

        for i in range(1, days + 1):
            pred_date: datetime = last_date + timedelta(days=i)
            days_since_start = (pred_date - self._min_date.to_pydatetime()).days

            row = {
                "day_of_week": pred_date.weekday(),
                "day_of_month": pred_date.day,
                "month": pred_date.month,
                "year": pred_date.year,
                "day_of_year": pred_date.timetuple().tm_yday,
                "days_since_start": days_since_start,
                "gross_revenue_r3": rolling_mean(rolling["gross_revenue"], 3),
                "gross_revenue_r7": rolling_mean(rolling["gross_revenue"], 7),
                "net_profit_r3": rolling_mean(rolling["net_profit"], 3),
                "net_profit_r7": rolling_mean(rolling["net_profit"], 7),
                "total_transaction_r3": rolling_mean(rolling["total_transaction"], 3),
                "total_transaction_r7": rolling_mean(rolling["total_transaction"], 7),
            }

            X = pd.DataFrame([row])
            record: dict[str, Any] = {"date": pred_date.strftime("%Y-%m-%d")}

            for target, model in self._models.items():
                val = max(0.0, float(model.predict(X)[0]))
                record[target] = round(val, 2)

            for col in ["gross_revenue", "net_profit", "total_transaction"]:
                rolling[col].append(record[col])

            results.append(record)

        return results
