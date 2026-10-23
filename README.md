# Pinnacle (CareAgent)
## Autonomous Multi-Agent Healthcare Monitoring & Clinical Decision Support System

Pinnacle is architected as a clean, decoupled multi-service project separated into independent **Frontend** and **Backend** applications.

---

## 📁 Repository Structure

```
Pinnacle/
├── backend/                  # Dedicated Python FastAPI Backend Service
│   ├── core.py               # 5-Agent Multi-Agent Engine & Orchestrator
│   ├── main.py               # REST API endpoints (/analyze, /decide, /simulate, /audit, /health)
│   ├── model.joblib          # Trained Random Forest ML Classifier (99.02% F1)
│   ├── ddi_model.joblib      # Trained DDI Pharmacological Classifier (100% F1)
│   ├── train_eval.py         # Monitoring Agent ML training & safety ablation benchmark
│   ├── train_ddi_model.py    # Medication Agent DDI ML training script
│   ├── verify_demo.py        # 5-step automated end-to-end demo verification test
│   ├── verify_api.py         # API schema and health verification test
│   ├── requirements.txt      # Python dependencies (FastAPI, scikit-learn, joblib, etc.)
│   ├── Dockerfile            # Multi-stage production container for backend
│   ├── .env                  # Environment configuration & Gemini API keys
│   └── README.md             # Dedicated backend documentation
│
├── frontend/                 # Dedicated React 18 + Vite Frontend Application
│   ├── src/                  # React source code (components, styles, api.js)
│   │   ├── components/       # Clinical UI components (Vitals, Agents, Safety Banner, Audit)
│   │   ├── styles/           # Global and component CSS design system
│   │   ├── App.jsx           # Main application view & routing
│   │   └── api.js            # Axios client communicating with backend
│   ├── public/               # Static icons and assets
│   ├── vite.config.js        # Vite dev server configuration & backend proxy
│   ├── nginx.conf            # Production Nginx reverse-proxy configuration
│   ├── Dockerfile            # Multi-stage production container for frontend
│   ├── package.json          # Node dependencies & npm scripts
│   └── README.md             # Dedicated frontend documentation
│
├── docker-compose.yml        # Orchestrates both backend & frontend containers
├── PROJECT_DOCUMENTATION.md  # Comprehensive technical manual & clinical workflow
├── ML_MODEL_DOCUMENTATION.md # Machine Learning training, architectures & benchmarks
├── DEPLOYMENT_GUIDE.md       # Production deployment architecture & release runbook
└── COMPLETE_DEMO_AND_ACCESS_GUIDE.md # Step-by-step presentation script & evaluator guide
```

---

## 🚀 Quick Start: Running Locally

### 1. Start the Backend Service
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

### 2. Start the Frontend Service
```bash
cd frontend
npm install
npm run dev
```
- Clinical Dashboard: `http://localhost:5173`

---

## 🐳 Running via Docker Compose

Both services can be built and launched simultaneously:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173` (or `http://localhost:80`)
- Backend: `http://localhost:8000`

---

## 🧪 Running Verification Tests

```bash
cd backend

# Run Automated End-to-End Demo Verification Suite (100% Pass)
python verify_demo.py

# Run Core ML Training & Safety Ablation Benchmark
python train_eval.py

# Run Medication DDI ML Model Training
python train_ddi_model.py
```

---

## 📚 Complete Documentation
- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)**: Full architecture and clinical workflow.
- **[ML_MODEL_DOCUMENTATION.md](ML_MODEL_DOCUMENTATION.md)**: Machine learning models, feature importances, and benchmarks.
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**: Production deployment architecture and Kubernetes manifests.
- **[COMPLETE_DEMO_AND_ACCESS_GUIDE.md](COMPLETE_DEMO_AND_ACCESS_GUIDE.md)**: Step-by-step presentation script.
