from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from predictor import SalesTrendPredictor

app = FastAPI(title="Vora AI Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schemas 

class HistoryItem(BaseModel):
    date: str
    gross_revenue: float = 0
    net_profit: float = 0
    total_transaction: float = 0
    total_items_sold: float = 0


class PredictRequest(BaseModel):
    history: list[HistoryItem]
    days: Optional[int] = 30


class PredictionItem(BaseModel):
    date: str
    gross_revenue: float
    net_profit: float
    total_transaction: float
    total_items_sold: float


class MetricItem(BaseModel):
    rmse: float
    mae: float
    r2: float


class ModelEvaluation(BaseModel):
    train_size: int
    test_size: int
    gross_revenue: Optional[MetricItem] = None
    net_profit: Optional[MetricItem] = None
    total_transaction: Optional[MetricItem] = None
    total_items_sold: Optional[MetricItem] = None


class PredictResponse(BaseModel):
    predictions: list[PredictionItem]
    trained_on: int
    evaluation: ModelEvaluation


# Endpoints 

@app.get("/health")
def health():
    return {"status": "ok", "service": "vora-ai"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if len(req.history) < 2:
        raise HTTPException(
            status_code=422,
            detail="Minimal 2 data laporan historis diperlukan untuk prediksi",
        )

    days = max(1, min(req.days or 30, 90))

    history_dicts = [item.model_dump() for item in req.history]

    predictor = SalesTrendPredictor()
    predictor.fit(history_dicts)

    last_date = pd.to_datetime(max(h["date"] for h in history_dicts))
    predictions = predictor.predict(last_date, days=days)

    return PredictResponse(
        predictions=predictions,
        trained_on=len(req.history),
        evaluation=ModelEvaluation(**predictor.evaluation),
    )
