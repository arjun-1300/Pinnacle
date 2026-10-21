"""
main.py — Phase 2: FastAPI Backend
Multi-Agent Healthcare Monitoring System

Endpoints
---------
POST /analyze          Run a patient vitals snapshot through the full agent pipeline
POST /decide/{choice}  Attach physician verdict (approved | overridden) to latest audit entry
GET  /simulate         Return a random synthetic patient record from core.py distributions
GET  /audit            Return the latest 15 audit-log entries
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core import (
    RISK_LABELS,
    VITAL_PARAMS,
    MEDICATION_POOL,
    ALLERGY_POOL,
    PatientRecord,
    MonitoringAgent,
    MedicationAgent,
    DecisionAgent,
    SafetyAgent,
    Orchestrator,
    SyntheticDataGenerator,
)

# ──────────────────────────────────────────────────────────────────────────────
# App Initialisation
# ──────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Pinnacle — Multi-Agent Healthcare Monitoring API",
    description=(
        "Phase 2 REST backend for the Multi-Agent Healthcare Monitoring System. "
        "Receives patient vitals, runs them through a sequential agent pipeline "
        "(Monitoring → Medication → Decision → Safety), and exposes audit/simulation utilities."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────────
# Shared State
# ──────────────────────────────────────────────────────────────────────────────

# Lazy-loaded orchestrator (loads model.joblib once on first request)
_orchestrator: Optional[Orchestrator] = None

def get_orchestrator() -> Orchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator(
            model_path="model.joblib",
            safety_on=True,
            gemini_model=os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview"),
        )
    return _orchestrator


# In-memory audit log  — list of dicts, newest appended at the end
audit_log: list[dict] = []

# RNG for simulation endpoint
_sim_rng = np.random.default_rng(seed=None)   # unseeded → different each call


# ──────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────────────────────────────────────

class VitalsRequest(BaseModel):
    """Patient vitals snapshot sent by the client."""
    heart_rate:   float = Field(..., ge=20,  le=250,  description="Heart rate (bpm)")
    spo2:         float = Field(..., ge=50,  le=100,  description="Blood-oxygen saturation (%)")
    temperature:  float = Field(..., ge=34,  le=43,   description="Body temperature (°C)")
    systolic_bp:  float = Field(..., ge=60,  le=250,  description="Systolic blood pressure (mmHg)")
    current_meds: list[str] = Field(default_factory=list, description="Active medications")
    allergies:    list[str] = Field(default_factory=list, description="Documented drug allergies")

    model_config = {"json_schema_extra": {
        "example": {
            "heart_rate": 102,
            "spo2": 93.5,
            "temperature": 38.1,
            "systolic_bp": 140,
            "current_meds": ["lisinopril"],
            "allergies": ["aspirin"],
        }
    }}


class AnalyzeResponse(BaseModel):
    """Full pipeline result returned to the client."""
    audit_id:             str
    timestamp:            str
    patient_id:           str
    vitals:               dict
    current_medications:  list[str]
    known_allergies:      list[str]
    predicted_risk:       str
    confidence:           float
    avoid_list:           list[str]
    interaction_warnings: list[str]
    suggested_actions:    list[str]
    candidate_drug:       Optional[str]
    final_drug:           Optional[str]
    drug_blocked:         bool
    block_reason:         str
    physician_notes:      list[str]
    safe:                 bool
    physician_verdict:    Optional[str]   # set later via /decide
    clinical_rationale:   Optional[str] = None
    monitoring_reasoning: Optional[str] = None
    medication_reasoning: Optional[str] = None
    safety_reasoning:     Optional[str] = None
    agent_llm_status:     dict[str, bool] = Field(default_factory=dict)
    llm_powered:          bool = False
    llm_model:            Optional[str] = None


class DecideResponse(BaseModel):
    audit_id:          str
    choice:            str
    physician_verdict: str
    updated_at:        str
    message:           str


class SimulateResponse(BaseModel):
    """Random synthetic patient record for UI demo / testing."""
    patient_id:   str
    heart_rate:   float
    spo2:         float
    temperature:  float
    systolic_bp:  float
    current_meds: list[str]
    allergies:    list[str]
    true_label:   str


class AuditEntry(BaseModel):
    audit_id:             str
    timestamp:            str
    patient_id:           str
    predicted_risk:       str
    confidence:           float
    suggested_actions:    list[str]
    candidate_drug:       Optional[str]
    final_drug:           Optional[str]
    drug_blocked:         bool
    safe:                 bool
    physician_verdict:    Optional[str]
    clinical_rationale:   Optional[str] = None
    monitoring_reasoning: Optional[str] = None
    medication_reasoning: Optional[str] = None
    safety_reasoning:     Optional[str] = None
    agent_llm_status:     dict[str, bool] = Field(default_factory=dict)
    llm_powered:          bool = False
    llm_model:            Optional[str] = None


# ──────────────────────────────────────────────────────────────────────────────
# Helper
# ──────────────────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_audit_entry(audit_id: str, patient_id: str, result, request: VitalsRequest) -> dict:
    """Convert a PipelineResult + request into a storable audit dict."""
    return {
        "audit_id":             audit_id,
        "timestamp":            _now_iso(),
        "patient_id":           patient_id,
        # raw vitals from request (preserves original client values)
        "vitals": {
            "heart_rate":  request.heart_rate,
            "spo2":        request.spo2,
            "temperature": request.temperature,
            "systolic_bp": request.systolic_bp,
        },
        "current_medications":  result.current_medications,
        "known_allergies":      result.known_allergies,
        "predicted_risk":       result.predicted_risk,
        "confidence":           round(result.confidence, 4),
        "avoid_list":           result.avoid_list,
        "interaction_warnings": result.interaction_warnings,
        "suggested_actions":    result.suggested_actions,
        "candidate_drug":       result.candidate_drug,
        "final_drug":           result.final_drug,
        "drug_blocked":         result.drug_blocked,
        "block_reason":         result.block_reason,
        "physician_notes":      result.physician_notes,
        "safe":                 result.safe,
        "clinical_rationale":   result.clinical_rationale,
        "monitoring_reasoning": result.monitoring_reasoning,
        "medication_reasoning": result.medication_reasoning,
        "safety_reasoning":     result.safety_reasoning,
        "agent_llm_status":     result.agent_llm_status,
        "llm_powered":          result.llm_powered,
        "llm_model":            result.llm_model,
        "physician_verdict":    None,   # filled by /decide
        "updated_at":           None,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze patient vitals through the full agent pipeline",
    tags=["Pipeline"],
)
async def analyze(request: VitalsRequest) -> AnalyzeResponse:
    """
    Accepts patient vitals + medications/allergies, runs the complete
    four-agent pipeline (Monitoring → Medication → Decision → Safety),
    stores the result in the audit log, and returns the full analysis.
    """
    orchestrator = get_orchestrator()

    # Build a PatientRecord for core.py
    patient_id = f"API-{uuid.uuid4().hex[:8].upper()}"
    record = PatientRecord(
        patient_id=patient_id,
        heart_rate=request.heart_rate,
        spo2=request.spo2,
        temperature=request.temperature,
        systolic_bp=request.systolic_bp,
        medications=[m.strip().lower() for m in request.current_meds],
        allergies=[a.strip().lower() for a in request.allergies],
    )

    # Run pipeline
    result = orchestrator.run(record)

    # Persist to audit log
    audit_id = str(uuid.uuid4())
    entry = _build_audit_entry(audit_id, patient_id, result, request)
    audit_log.append(entry)

    return AnalyzeResponse(
        audit_id=audit_id,
        timestamp=entry["timestamp"],
        patient_id=patient_id,
        vitals=entry["vitals"],
        current_medications=result.current_medications,
        known_allergies=result.known_allergies,
        predicted_risk=result.predicted_risk,
        confidence=round(result.confidence, 4),
        avoid_list=result.avoid_list,
        interaction_warnings=result.interaction_warnings,
        suggested_actions=result.suggested_actions,
        candidate_drug=result.candidate_drug,
        final_drug=result.final_drug,
        drug_blocked=result.drug_blocked,
        block_reason=result.block_reason,
        physician_notes=result.physician_notes,
        safe=result.safe,
        physician_verdict=None,
        clinical_rationale=result.clinical_rationale,
        monitoring_reasoning=result.monitoring_reasoning,
        medication_reasoning=result.medication_reasoning,
        safety_reasoning=result.safety_reasoning,
        agent_llm_status=result.agent_llm_status,
        llm_powered=result.llm_powered,
        llm_model=result.llm_model,
    )


@app.post(
    "/decide/{choice}",
    response_model=DecideResponse,
    summary="Attach physician verdict to the latest audit entry",
    tags=["Pipeline"],
)
async def decide(choice: str) -> DecideResponse:
    """
    Attaches a physician's verdict (`approved` or `overridden`) to the
    **most recent** entry in the audit log. Useful for closing the
    human-in-the-loop decision loop.
    """
    choice_lower = choice.strip().lower()
    if choice_lower not in ("approved", "overridden"):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid choice '{choice}'. Must be 'approved' or 'overridden'.",
        )

    if not audit_log:
        raise HTTPException(
            status_code=404,
            detail="Audit log is empty. Run /analyze first.",
        )

    latest = audit_log[-1]
    updated_at = _now_iso()
    latest["physician_verdict"] = choice_lower
    latest["updated_at"] = updated_at

    verdict_msg = (
        "Physician approved the pipeline recommendation."
        if choice_lower == "approved"
        else "Physician overrode the pipeline recommendation — manual intervention logged."
    )

    return DecideResponse(
        audit_id=latest["audit_id"],
        choice=choice_lower,
        physician_verdict=choice_lower,
        updated_at=updated_at,
        message=verdict_msg,
    )


@app.get(
    "/simulate",
    response_model=SimulateResponse,
    summary="Generate a random synthetic patient record",
    tags=["Utilities"],
)
async def simulate() -> SimulateResponse:
    """
    Draws a random patient record from the class-conditional Gaussian
    distributions defined in core.py. Useful for front-end demos and
    integration testing.
    """
    # Pick a random class with equal probability
    label = _sim_rng.choice(RISK_LABELS)
    params = VITAL_PARAMS[label]

    hr  = float(_sim_rng.normal(params[0][0], params[0][1]))
    spo = float(min(100.0, _sim_rng.normal(params[1][0], params[1][1])))
    tmp = float(_sim_rng.normal(params[2][0], params[2][1]))
    sbp = float(_sim_rng.normal(params[3][0], params[3][1]))

    meds = [m for m in MEDICATION_POOL if _sim_rng.random() < 0.3]
    alrg = [a for a in ALLERGY_POOL   if _sim_rng.random() < 0.2]

    patient_id = f"SIM-{uuid.uuid4().hex[:6].upper()}"

    return SimulateResponse(
        patient_id=patient_id,
        heart_rate=round(hr, 1),
        spo2=round(spo, 1),
        temperature=round(tmp, 2),
        systolic_bp=round(sbp, 1),
        current_meds=meds,
        allergies=alrg,
        true_label=label,
    )


@app.get(
    "/audit",
    response_model=list[AuditEntry],
    summary="Return the latest 15 audit-log entries",
    tags=["Audit"],
)
async def audit() -> list[AuditEntry]:
    """
    Returns the 15 most recent finalized pipeline audit entries in reverse-chronological
    order (newest first). Only returns entries where a physician verdict has been submitted.
    """
    finalized = [e for e in audit_log if e.get("physician_verdict") in ("approved", "overridden")]
    latest_15 = finalized[-15:][::-1]   # newest first
    return [
        AuditEntry(
            audit_id=e["audit_id"],
            timestamp=e["timestamp"],
            patient_id=e["patient_id"],
            predicted_risk=e["predicted_risk"],
            confidence=e["confidence"],
            suggested_actions=e["suggested_actions"],
            candidate_drug=e["candidate_drug"],
            final_drug=e["final_drug"],
            drug_blocked=e["drug_blocked"],
            safe=e["safe"],
            physician_verdict=e["physician_verdict"],
            clinical_rationale=e.get("clinical_rationale"),
            llm_powered=e.get("llm_powered", False),
            llm_model=e.get("llm_model"),
        )
        for e in latest_15
    ]


# ──────────────────────────────────────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Meta"], summary="Health check")
async def health():
    import core
    orch = get_orchestrator()
    return {
        "status": "ok",
        "has_google_genai": core.HAS_GOOGLE_GENAI,
        "llm_enabled": orch.decision_agent.llm_enabled if orch else False,
        "llm_model": orch.decision_agent.model_name if orch else None,
    }
