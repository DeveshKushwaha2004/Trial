from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class CognitiveDataCreate(BaseModel):
    typing_speed: float
    speed_variance: float
    backspace_rate: float
    mouse_distance: float
    mouse_jitter: float
    tab_switch_count: float


class CognitiveDataResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    typing_speed: float
    speed_variance: float
    backspace_rate: float
    mouse_distance: float
    mouse_jitter: float
    tab_switch_count: float
    predicted_load: str

    model_config = {"from_attributes": True}


class PredictionResponse(BaseModel):
    predicted_load: str
    confidence: float
    load_percentage: float


class WebSocketMessage(BaseModel):
    typing_speed: float = 0.0
    speed_variance: float = 0.0
    backspace_rate: float = 0.0
    mouse_distance: float = 0.0
    mouse_jitter: float = 0.0
    tab_switch_count: float = 0.0
