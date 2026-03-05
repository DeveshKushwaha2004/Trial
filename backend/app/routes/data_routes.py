from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.database import get_db
from app.models import User, CognitiveData
from app.schemas import CognitiveDataCreate, CognitiveDataResponse, PredictionResponse
from app.auth import get_current_user
from app.ml.predict import predict_load

router = APIRouter(prefix="/api/data", tags=["Cognitive Data"])


@router.post("/log", response_model=CognitiveDataResponse)
def log_data(
    data: CognitiveDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prediction = predict_load(data)

    record = CognitiveData(
        user_id=current_user.id,
        typing_speed=data.typing_speed,
        speed_variance=data.speed_variance,
        backspace_rate=data.backspace_rate,
        mouse_distance=data.mouse_distance,
        mouse_jitter=data.mouse_jitter,
        tab_switch_count=data.tab_switch_count,
        predicted_load=prediction.predicted_load,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/history", response_model=list[CognitiveDataResponse])
def get_history(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    records = (
        db.query(CognitiveData)
        .filter(
            CognitiveData.user_id == current_user.id,
            CognitiveData.timestamp >= since,
        )
        .order_by(CognitiveData.timestamp.asc())
        .all()
    )
    return records


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=7)
    records = (
        db.query(CognitiveData)
        .filter(
            CognitiveData.user_id == current_user.id,
            CognitiveData.timestamp >= since,
        )
        .order_by(CognitiveData.timestamp.desc())
        .all()
    )
    if not records:
        return {
            "total_records": 0,
            "latest_load": "Low",
            "load_percentage": 0,
            "avg_typing_speed": 0,
            "avg_backspace_rate": 0,
            "avg_mouse_jitter": 0,
            "high_load_minutes": 0,
        }

    load_map = {"Low": 0, "Medium": 50, "High": 100}
    high_count = sum(1 for r in records if r.predicted_load == "High")
    high_load_minutes = high_count * 5 / 60  # each record ~5 seconds

    return {
        "total_records": len(records),
        "latest_load": records[0].predicted_load,
        "load_percentage": load_map.get(records[0].predicted_load, 0),
        "avg_typing_speed": round(sum(r.typing_speed for r in records) / len(records), 2),
        "avg_backspace_rate": round(sum(r.backspace_rate for r in records) / len(records), 2),
        "avg_mouse_jitter": round(sum(r.mouse_jitter for r in records) / len(records), 2),
        "high_load_minutes": round(high_load_minutes, 1),
    }
