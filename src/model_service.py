# src/model_service.py
from pathlib import Path
import joblib
import numpy as np

# path to model at repo root: ECS_171_Fall-25/toxic_logreg_cv.joblib
MODEL_PATH = Path(__file__).resolve().parents[1] / "toxic_logreg_cv.joblib"

# load once at startup
model = joblib.load(MODEL_PATH)

def predict_toxic(texts):
    """
    texts: list[str]
    returns:
      labels: list[int] (1 = toxic, 0 = non-toxic)
      probs: list[float] (probability of toxic)
    """
    probs = model.predict_proba(texts)[:, 1]   # P(toxic)
    labels = (probs >= 0.5).astype(int)
    return labels.tolist(), probs.tolist()
