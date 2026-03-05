from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.config import SECRET_KEY, ALGORITHM
from app.database import SessionLocal
from app.models import User, CognitiveData
from app.schemas import WebSocketMessage
from app.ml.predict import predict_load, PredictionResponse
from app.schemas import CognitiveDataCreate
import json

router = APIRouter()


@router.websocket("/ws/predict")
async def websocket_predict(websocket: WebSocket):
    await websocket.accept()

    # Authenticate via query param token
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            await websocket.close(code=4001, reason="Invalid token")
            return
        user_id = int(sub)
    except JWTError:
        await websocket.close(code=4001, reason="Invalid token")
        return

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            data = CognitiveDataCreate(
                typing_speed=msg.get("typing_speed", 0),
                speed_variance=msg.get("speed_variance", 0),
                backspace_rate=msg.get("backspace_rate", 0),
                mouse_distance=msg.get("mouse_distance", 0),
                mouse_jitter=msg.get("mouse_jitter", 0),
                tab_switch_count=msg.get("tab_switch_count", 0),
            )

            prediction = predict_load(data)

            # Save to database
            db = SessionLocal()
            try:
                record = CognitiveData(
                    user_id=user_id,
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
            finally:
                db.close()

            await websocket.send_json({
                "predicted_load": prediction.predicted_load,
                "confidence": prediction.confidence,
                "load_percentage": prediction.load_percentage,
            })

    except WebSocketDisconnect:
        pass
    except Exception:
        await websocket.close(code=1011, reason="Internal error")
