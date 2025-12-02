# src/api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .model_service import predict_toxic

app = FastAPI()

# allow frontend dev servers (React)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextIn(BaseModel):
    text: str

class PredictionOut(BaseModel):
    label: int   # 1 = toxic, 0 = non-toxic
    prob: float  # probability toxic

@app.post("/predict", response_model=PredictionOut)
def predict(payload: TextIn):
    labels, probs = predict_toxic([payload.text])
    return {"label": labels[0], "prob": probs[0]}
