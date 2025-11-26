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





