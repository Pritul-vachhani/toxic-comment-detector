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

### 📥 Download Required Model File

The Logistic Regression model file is **not stored directly in the repo** due to size limits.  
To run the backend successfully, you must download it manually.

1. In the root of this repository, open the file **`Google_Drive.txt`**.
2. Click the Google Drive link inside the file.
3. Download the folder named **`Download_these_files`**.
4. Inside that folder, locate:

```
toxic_logreg_cv.joblib
```

5. Move **`toxic_logreg_cv.joblib`** into the **root** of the project:

```
toxic-comment-detector/
│
├── toxic_logreg_cv.joblib   ⬅️ place it here
├── src/
├── frontend/
└── ...
```

This file is required for the FastAPI backend to load the trained model.

## 🐍 Backend Setup (FastAPI)

From the project root, run the following Linux/Unix commands. 

If your computer does not support Linux/Unix you can use WSL: https://learn.microsoft.com/en-us/windows/wsl/install

The installation may take some time if you do not have the relevant libraries preinstalled.

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

Run the API:

    python -m uvicorn src.api:app --reload

Once it states Application Startup Complete, you can prompt the model using the Frontend.

Backend URL: http://127.0.0.1:8000/docs

---

## 🌐 Frontend Setup (React + Vite)

### 🔧 Prerequisite: Node.js + npm
Make sure Node.js and npm are installed before running the frontend.

You can verify by running:

```bash
node -v
npm -v
```

If you see “command not found,” install Node.js (which includes npm):

**macOS:**

1. Download the LTS version from https://nodejs.org  
2. Install normally  
3. Ensure `/usr/local/bin` is in your PATH:

```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

This makes the `npm` command available system-wide.

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

---
## 💡 View and Train Models

In our project, we constructed 3 models total: Logistic Regression, Random Forest, and Convolutional Neural Network.
These models are located in the notebooks folder to view. 

If you would like to train a model, it will prompt you for a data file, which you can download from the Kaggle data base at
https://www.kaggle.com/competitions/jigsaw-toxic-comment-classification-challenge/data (train.csv).

