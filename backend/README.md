# Pinnacle — Backend Service
## Multi-Agent Healthcare Monitoring & Clinical Decision Support API

This directory contains the complete backend service, multi-agent engine, machine learning pipelines, and test suites for Pinnacle (CareAgent).

---

### Directory Contents

| File | Description |
| :--- | :--- |
| `main.py` | FastAPI application serving `/analyze`, `/decide/{choice}`, `/simulate`, `/audit`, and `/health` endpoints |
| `core.py` | Core multi-agent pipeline engine containing all 5 specialized clinical agents and Orchestrator |
| `model.joblib` | Serialized Random Forest classifier for Agent 01 (Monitoring Agent), achieving **99.02% Macro-F1** |
| `ddi_model.joblib` | Serialized DDI Random Forest classifier for Agent 02 (Medication Agent), achieving **100% Macro-F1** |
| `train_eval.py` | Training and evaluation pipeline for the Monitoring Agent with baseline comparisons and safety ablation |
| `train_ddi_model.py` | Training script for the Medication Agent's Drug-Drug Interaction classifier |
| `verify_api.py` | Automated schema and endpoint verification script |
| `verify_demo.py` | Automated 5-step end-to-end clinical workflow verification suite |
| `requirements.txt` | Python package dependencies (`fastapi`, `uvicorn`, `scikit-learn`, `joblib`, `pandas`, `google-genai`, etc.) |
| `Dockerfile` | Multi-stage Docker container specification for the backend service |
| `.env` | Environment configuration for Google Gemini API and port settings |

---

### Running the Backend Independently

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies (recommended inside a virtualenv)
pip install -r requirements.txt

# 3. Start the FastAPI development server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be accessible at:
- **REST Endpoints**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### Running Tests & Verification

```bash
# In backend directory:

# 1. Run Core ML Training & Evaluation
python train_eval.py

# 2. Run Medication DDI ML Model Training
python train_ddi_model.py

# 3. Run Automated End-to-End Demo Test Suite (requires backend running)
python verify_demo.py
```
