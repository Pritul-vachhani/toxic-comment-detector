# 🧪 Toxic Comment Detector

A full-stack machine learning system that detects toxic comments using a custom-trained Logistic Regression NLP model, a FastAPI backend, and a modern React + Vite frontend.  
Supports **single comment analysis**, **highlighting toxic words**, **adjustable strictness**, and **CSV batch auditing**.

---

## 🚀 Features

### ✔️ Machine Learning
- TF-IDF + Logistic Regression classifier  
- Returns: `label`, `confidence score`, `toxic triggers`, highlighted text  
- Custom cleaned dataset  
- Model stored as `.joblib`

### ✔️ Backend (FastAPI)
- Endpoint: `POST /predict`  
- Accepts a comment and returns toxicity analysis  
- Handles CORS for frontend integration  

### ✔️ Frontend (React + TypeScript + Vite)
- Clean UI for comment analysis  
- Toxic phrase highlighting  
- Strictness slider (-2 to +2)  
- CSV upload → CSV toxic analysis download  
- Real-time results from FastAPI backend  

---

## 📂 Project Structure

    toxic-comment-detector/
    │
    ├── frontend/               # React + Vite UI
    │   └── src/App.tsx         # Main UI logic
    │
    ├── src/                    # FastAPI backend
    │   ├── api.py
    │   └── model_service.py
    │
    ├── notebooks/              # Model training notebooks
    ├── reports/                # Presentation materials
    ├── requirements.txt
    ├── environment.yml
    └── README.md

---

## 🐍 Backend Setup (FastAPI)

From the project root:

    cd toxic-comment-detector
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

Run the API:

    python -m uvicorn src.api:app --reload

Backend URL:

    http://127.0.0.1:8000

---

## 🌐 Frontend Setup (React + Vite)

Open a **second terminal**, then:

    cd frontend
    npm install
    npm run dev

Frontend URL:

    http://localhost:5173

---

## 📡 API Usage

### POST `/predict`

Request body:

    {
      "text": "I hate you"
    }

Example response:

    {
      "label": "toxic",
      "prob": 0.9823,
      "triggers": ["hate"],
      "highlighted_text": "I <mark>hate</mark> you"
    }

---

## 📊 CSV Batch Moderation

Upload a `.csv` with a column named:

- `comment` **or**
- `text`

The output CSV includes:

- verdict  
- risk score  
- toxic triggers  
- highlighted text  

Processed client-side for speed.

---

## 🔧 Strictness Levels

| Level | Meaning           |
|-------|-------------------|
| -2    | Very sensitive    |
| -1    | Sensitive         |
| 0     | Balanced (default)|
| +1    | Tolerant          |
| +2    | Very tolerant     |

---

## 🧠 Model Details

- TF-IDF vectorizer  
- Logistic Regression classifier  

Preprocessing steps:

- Lowercasing  
- URL removal  
- Username removal  
- Punctuation stripping  

