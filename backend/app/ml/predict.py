import numpy as np
import pickle
import os
from app.schemas import CognitiveDataCreate, PredictionResponse

try:
    import torch
    from app.ml.model import CognitiveLoadLSTM
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
LABELS = ["Low", "Medium", "High"]

_model = None
_scaler = None


def _load_model():
    global _model, _scaler
    if not TORCH_AVAILABLE:
        return False

    model_path = os.path.join(MODEL_DIR, "saved_model.pth")
    scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")

    if os.path.exists(model_path) and os.path.exists(scaler_path):
        _model = CognitiveLoadLSTM()
        _model.load_state_dict(torch.load(model_path, map_location="cpu"))
        _model.eval()
        with open(scaler_path, "rb") as f:
            _scaler = pickle.load(f)
        return True
    return False


def predict_load(data: CognitiveDataCreate) -> PredictionResponse:
    global _model, _scaler

    features = np.array([[
        data.typing_speed,
        data.speed_variance,
        data.backspace_rate,
        data.mouse_distance,
        data.mouse_jitter,
        data.tab_switch_count,
    ]], dtype=np.float32)

    if _model is None:
        if not _load_model():
            # Fallback: rule-based prediction when model is not trained
            return _rule_based_predict(features[0])

    scaled = _scaler.transform(features)
    # Create a sequence of length 1 (single timestep)
    tensor = torch.FloatTensor(scaled.reshape(1, 1, 6))

    with torch.no_grad():
        output = _model(tensor)
        probs = torch.softmax(output, dim=1)
        confidence, predicted = torch.max(probs, dim=1)

    label = LABELS[predicted.item()]
    load_pct = probs[0][2].item() * 100  # High load probability as percentage

    return PredictionResponse(
        predicted_load=label,
        confidence=round(confidence.item(), 3),
        load_percentage=round(load_pct, 1),
    )


def _rule_based_predict(features: np.ndarray) -> PredictionResponse:
    """Fallback rule-based prediction when ML model is not available."""
    typing_speed, speed_var, backspace, mouse_dist, jitter, tab_switch = features

    score = 0
    score += min(typing_speed / 10.0, 1.0) * 20
    score += min(speed_var / 3.0, 1.0) * 15
    score += min(backspace / 0.5, 1.0) * 20
    score += min(jitter / 40.0, 1.0) * 25
    score += min(tab_switch / 8.0, 1.0) * 20

    if score < 30:
        label, conf = "Low", 0.8
    elif score < 60:
        label, conf = "Medium", 0.7
    else:
        label, conf = "High", 0.75

    return PredictionResponse(
        predicted_load=label,
        confidence=conf,
        load_percentage=round(score, 1),
    )
