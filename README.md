# Toxic Comment Classifier (ECS 171 Fall 2025 — Team 6)

##  Overview
This project builds a **Toxic Comment Classifier** that automatically detects and flags toxic or harmful comments using NLP.  
It uses Kaggle’s **Jigsaw Toxic Comment Classification** dataset and explores both traditional ML (TF-IDF + Logistic Regression) and Transformer-based models (DistilBERT).

---
### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/ecs171-toxic-comment-classifier.git
cd ecs171-toxic-comment-classifier
```

### 2. Create and Activate Environment
```bash
python -m venv venv
source venv/bin/activate       # macOS/Linux
# or
venv\Scripts\activate          # Windows

pip install -r requirements.txt

```

### 3. Download the dataset
This requires kaggle login, and you have to join the competition and select accept to T&C and make sure your phone number is verified with kaggle to be able to acces the dataset
```bash
mkdir -p data/raw
kaggle competitions download -c jigsaw-toxic-comment-classification-challenge
unzip jigsaw-toxic-comment-classification-challenge.zip -d data/raw/
```

### 4. Verify Installation in your active envirnoment
```bash
python -c "import torch, transformers, sklearn, pandas; print('Environment setup successful!')"
You should see
Environment setup successful!






