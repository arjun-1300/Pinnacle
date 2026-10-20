"""
core.py — Multi-Agent Healthcare Monitoring System
Phase 1: Core Agent Engine

Agents:
  1. SyntheticDataGenerator  — Produces labelled patient vitals records
  2. MonitoringAgent         — RandomForest risk classifier
  3. MedicationAgent         — Interaction / allergy checker
  4. DecisionAgent           — Clinical-heuristic action planner
  5. SafetyAgent             — Intercepts unsafe drug suggestions
  6. Orchestrator            — Sequential pipeline runner
"""

from __future__ import annotations

import json
import logging
import os
import random
from dataclasses import dataclass, field
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Load local .env if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import Google GenAI SDK if installed
try:
    # pyrefly: ignore[missing-import]
    from google import genai
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except (ImportError, Exception):
    HAS_GOOGLE_GENAI = False

logger = logging.getLogger("pinnacle.core")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

RISK_LABELS = ["Normal", "Warning", "Critical"]

# Gaussian parameters: (mean, std) for each vital per class
# Order: HeartRate, SpO2, Temperature, SystolicBP
VITAL_PARAMS: dict[str, list[tuple[float, float]]] = {
    "Normal":   [(75, 8),   (97, 1),   (36.8, 0.3), (120, 8)],
    "Warning":  [(100, 10), (94, 1.5), (37.9, 0.4), (138, 10)],
    "Critical": [(128, 14), (88, 3),   (39.2, 0.6), (165, 15)],
}

MEDICATION_POOL = ["warfarin", "lisinopril", "metformin"]
ALLERGY_POOL    = ["aspirin", "ibuprofen"]

# Known drug–drug and drug–allergy interactions
# Format: frozenset({med, candidate}) -> (risk_level, description)
INTERACTION_RULES: dict[frozenset, tuple[str, str]] = {
    frozenset({"warfarin", "ibuprofen"}): (
        "HIGH",
        "Warfarin + Ibuprofen -> significantly elevated bleeding risk",
    ),
    frozenset({"warfarin", "aspirin"}): (
        "HIGH",
        "Warfarin + Aspirin -> additive anticoagulant / bleeding risk",
    ),
    frozenset({"lisinopril", "ibuprofen"}): (
        "MODERATE",
        "Lisinopril + Ibuprofen -> reduced antihypertensive efficacy, potential renal impairment",
    ),
}


# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

@dataclass
class PatientRecord:
    """Raw patient snapshot passed through the pipeline."""
    patient_id: str
    heart_rate: float
    spo2: float
    temperature: float
    systolic_bp: float
    medications: list[str] = field(default_factory=list)
    allergies: list[str]   = field(default_factory=list)
    true_label: Optional[str] = None  # ground-truth for evaluation


@dataclass
class PipelineResult:
    """Accumulated result after all agents have processed a record."""
    patient_id: str
    vitals: dict
    # Agent 2: MonitoringAgent outputs
    predicted_risk: str = ""
    confidence: float   = 0.0
    monitoring_reasoning: Optional[str] = None

    # Agent 3: MedicationAgent outputs
    current_medications: list[str]    = field(default_factory=list)
    known_allergies: list[str]        = field(default_factory=list)
    avoid_list: list[str]             = field(default_factory=list)
    interaction_warnings: list[str]   = field(default_factory=list)
    medication_reasoning: Optional[str] = None

    # Agent 4: DecisionAgent outputs
    clinical_rationale: Optional[str] = None
    suggested_actions: list[str]      = field(default_factory=list)
    candidate_drug: Optional[str]     = None

    # Agent 5: SafetyAgent outputs
    final_drug: Optional[str]         = None
    drug_blocked: bool                = False
    block_reason: str                 = ""
    physician_notes: list[str]        = field(default_factory=list)
    safe: bool                        = True
    safety_reasoning: Optional[str]   = None

    # LLM telemetry across all agents
    llm_powered: bool                 = False
    llm_model: Optional[str]          = None
    agent_llm_status: dict[str, bool] = field(default_factory=dict)

    # Human-in-the-loop verdict
    physician_verdict: Optional[str]  = None


# ---------------------------------------------------------------------------
# Agent 1 — Synthetic Data Generator
# ---------------------------------------------------------------------------

class SyntheticDataGenerator:
    """
    Generates patient vitals records from class-conditional Gaussians.

    Parameters
    ----------
    seed : int | None
        Random seed for reproducibility.
    """

    def __init__(self, seed: int | None = 42) -> None:
        self.rng = np.random.default_rng(seed)

    def generate(
        self,
        n_samples: int,
        class_weights: Optional[dict[str, float]] = None,
    ) -> list[PatientRecord]:
        """
        Generate *n_samples* patient records.

        Parameters
        ----------
        n_samples     : total records to produce
        class_weights : proportion per class; defaults to equal thirds
        """
        if class_weights is None:
            class_weights = {k: 1 / 3 for k in RISK_LABELS}

        # Normalise weights
        total = sum(class_weights.values())
        probs = [class_weights[k] / total for k in RISK_LABELS]

        records: list[PatientRecord] = []
        for i in range(n_samples):
            label = self.rng.choice(RISK_LABELS, p=probs)
            params = VITAL_PARAMS[label]

            hr  = float(self.rng.normal(params[0][0], params[0][1]))
            spo = float(self.rng.normal(params[1][0], params[1][1]))
            tmp = float(self.rng.normal(params[2][0], params[2][1]))
            sbp = float(self.rng.normal(params[3][0], params[3][1]))

            # Random subset of medications and allergies
            meds = [m for m in MEDICATION_POOL if self.rng.random() < 0.3]
            alrg = [a for a in ALLERGY_POOL   if self.rng.random() < 0.2]

            records.append(
                PatientRecord(
                    patient_id=f"P{i:05d}",
                    heart_rate=round(hr, 1),
                    spo2=round(min(100.0, spo), 1),
                    temperature=round(tmp, 2),
                    systolic_bp=round(sbp, 1),
                    medications=meds,
                    allergies=alrg,
                    true_label=label,
                )
            )
        return records

    # Convenience: return as DataFrame (features + label)
    def to_dataframe(
        self,
        n_samples: int,
        class_weights: Optional[dict[str, float]] = None,
    ) -> pd.DataFrame:
        records = self.generate(n_samples, class_weights)
        rows = []
        for r in records:
            rows.append(
                {
                    "heart_rate": r.heart_rate,
                    "spo2": r.spo2,
                    "temperature": r.temperature,
                    "systolic_bp": r.systolic_bp,
                    "label": r.true_label,
                }
            )
        return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# Agent 2 — Monitoring Agent (Gemini LLM Triage + RandomForest ML Fallback)
# ---------------------------------------------------------------------------

FEATURE_COLS = ["heart_rate", "spo2", "temperature", "systolic_bp"]


class MonitoringAgent:
    """
    Agent 2 — Physiological Monitoring & Risk Triage Agent

    1. LLM Mode (Active when GEMINI_API_KEY is available):
       Uses Google Gemini to analyze patient vital signs, detect organ system
       decompensation, and assign a clinically reasoned triage category
       (Normal / Warning / Critical) with confidence and physiological assessment.

    2. ML Fallback Mode (When offline or no API key):
       Trained RandomForestClassifier predicting risk class probabilities on 4 vitals.
    """

    def __init__(
        self,
        n_estimators: int = 100,
        random_state: int = 42,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> None:
        self.clf = RandomForestClassifier(
            n_estimators=n_estimators,
            random_state=random_state,
            class_weight="balanced",
        )
        self._classes: list[str] = RISK_LABELS
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.model_name = model_name or os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
        self.llm_enabled = bool(self.api_key and HAS_GOOGLE_GENAI)
        self._client = None
        if self.llm_enabled:
            try:
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"[MonitoringAgent] Live Gemini LLM triage active ({self.model_name})")
            except Exception as e:
                logger.warning(f"[MonitoringAgent] Gemini Client init failed: {e}")
                self.llm_enabled = False

    # ------------------------------------------------------------------
    # Training helpers
    # ------------------------------------------------------------------

    def fit(self, df: pd.DataFrame) -> "MonitoringAgent":
        """Train on a DataFrame with columns in FEATURE_COLS + 'label'."""
        X = df[FEATURE_COLS].values
        y = df["label"].values
        self.clf.fit(X, y)
        self._classes = list(self.clf.classes_)
        return self

    def save(self, path: str = "model.joblib") -> None:
        joblib.dump({"clf": self.clf, "classes": self._classes}, path)
        print(f"[MonitoringAgent] Model saved -> {path}")

    @classmethod
    def load(
        cls,
        path: str = "model.joblib",
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> "MonitoringAgent":
        obj = cls.__new__(cls)
        data = joblib.load(path)
        obj.clf = data["clf"]
        obj._classes = data["classes"]
        obj.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        obj.model_name = model_name or os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
        obj.llm_enabled = bool(obj.api_key and HAS_GOOGLE_GENAI)
        obj._client = None
        if obj.llm_enabled:
            try:
                obj._client = genai.Client(api_key=obj.api_key)
                logger.info(f"[MonitoringAgent] Live Gemini LLM triage active ({obj.model_name})")
            except Exception as e:
                logger.warning(f"[MonitoringAgent] Gemini Client init failed: {e}")
                obj.llm_enabled = False
        return obj

    # ------------------------------------------------------------------
    # LLM Inference
    # ------------------------------------------------------------------

    def _call_gemini_llm(self, record: PatientRecord) -> Optional[dict]:
        """Queries Google Gemini to evaluate vital signs and triage patient risk."""
        if not self._client:
            return None
        prompt = f"""You are the Triage & Physiological Monitoring Agent in an Autonomous Healthcare Monitoring System (Pinnacle).
Analyze these patient vital signs:
- Patient ID: {record.patient_id}
- Heart Rate: {record.heart_rate} bpm (Normal: 60–100 bpm)
- Blood-Oxygen Saturation (SpO2): {record.spo2}% (Normal: >=95%)
- Body Temperature: {record.temperature}°C (Normal: 36.5–37.5°C)
- Systolic Blood Pressure: {record.systolic_bp} mmHg (Normal: 90–120 mmHg)

Triage Rules:
- "Critical": Life-threatening instability (HR > 120 or < 45, SpO2 < 90%, Temp > 39°C or < 35°C, SBP > 160 or < 80).
- "Warning": Moderate clinical derangement requiring close observation (HR 100-120, SpO2 90-94%, Temp 37.6-38.9°C, SBP 135-159).
- "Normal": Stable hemodynamics within standard physiological ranges.

Respond STRICTLY with a valid JSON object matching this schema:
{{
  "predicted_risk": "Normal | Warning | Critical",
  "confidence": 0.95,
  "physiological_assessment": "concise 2-sentence clinical assessment of vital signs"
}}"""
        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            if response and response.text:
                data = json.loads(response.text)
                if data.get("predicted_risk") in RISK_LABELS:
                    return data
        except Exception as e:
            logger.warning(f"[MonitoringAgent] Gemini API error: {e}")
        return None

    # ------------------------------------------------------------------
    # ML Inference
    # ------------------------------------------------------------------

    def predict(self, record: PatientRecord) -> tuple[str, float]:
        """Returns (predicted_risk_label, confidence) from RandomForest."""
        x = np.array(
            [[record.heart_rate, record.spo2, record.temperature, record.systolic_bp]]
        )
        proba = self.clf.predict_proba(x)[0]
        idx   = int(np.argmax(proba))
        label = self._classes[idx]
        return label, float(proba[idx])

    def process(self, result: PipelineResult, record: PatientRecord) -> PipelineResult:
        if self.llm_enabled and self._client:
            llm_data = self._call_gemini_llm(record)
            if llm_data:
                result.predicted_risk = str(llm_data["predicted_risk"])
                result.confidence = float(llm_data.get("confidence", 0.95))
                result.monitoring_reasoning = str(llm_data.get("physiological_assessment", ""))
                result.agent_llm_status["monitoring_agent"] = True
                return result

        # ML Random Forest fallback
        label, conf = self.predict(record)
        result.predicted_risk = label
        result.confidence     = conf
        result.monitoring_reasoning = f"Random Forest ML Classifier: {label} (confidence: {round(conf*100, 1)}%)"
        result.agent_llm_status["monitoring_agent"] = False
        return result


# ---------------------------------------------------------------------------
# Agent 3 — Medication Agent (Gemini LLM DDI Reasoner + Rule Fallback)
# ---------------------------------------------------------------------------

class MedicationAgent:
    """
    Agent 3 — Medication & Pharmacovigilance Agent

    1. LLM Mode (Active when GEMINI_API_KEY is available):
       Uses Google Gemini as a specialized clinical pharmacologist to analyze active
       medications, documented allergies, deduce dangerous drug-drug interactions (DDI),
       and build an evidence-based contraindication avoid_list with detailed warnings.

    2. Rule Engine Fallback (When offline or no API key):
       Deterministic scan across INTERACTION_RULES and documented allergies.
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> None:
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.model_name = model_name or os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
        self.llm_enabled = bool(self.api_key and HAS_GOOGLE_GENAI)
        self._client = None
        if self.llm_enabled:
            try:
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"[MedicationAgent] Live Gemini LLM pharmacovigilance active ({self.model_name})")
            except Exception as e:
                logger.warning(f"[MedicationAgent] Gemini Client init failed: {e}")
                self.llm_enabled = False

    def _call_gemini_llm(self, record: PatientRecord) -> Optional[dict]:
        """Queries Google Gemini to evaluate drug-drug interactions and allergies."""
        if not self._client:
            return None
        prompt = f"""You are the Clinical Pharmacologist & Drug-Drug Interaction (DDI) Agent in an Autonomous Healthcare Monitoring System (Pinnacle).
Patient Medical Profile:
- Active Current Medications: {record.medications or 'None reported'}
- Documented Allergies: {record.allergies or 'None documented'}

Clinical Objectives:
1. Compile a comprehensive 'avoid_list' of drugs (lowercase medication names) strictly contraindicated for this patient.
   - Include all documented allergies (e.g. aspirin, ibuprofen).
   - Include drugs that interact severely with active medications. Specifically: If patient takes Warfarin, NSAIDs like 'ibuprofen' and 'aspirin' MUST be added to avoid_list due to elevated bleeding risk. If patient takes Lisinopril, 'ibuprofen' must be added to avoid_list due to renal and antihypertensive antagonism.
2. List interaction warnings with severity: e.g. '[HIGH] Warfarin + Ibuprofen -> significantly elevated bleeding risk'.
3. Formulate a 2-sentence pharmacological rationale explaining pharmacokinetic/pharmacodynamic clash.

Respond STRICTLY with a valid JSON object matching this schema:
{{
  "avoid_list": ["ibuprofen", "aspirin"],
  "interaction_warnings": [
    "[HIGH] Warfarin + Ibuprofen -> significantly elevated bleeding risk",
    "Allergy documented: aspirin -> added to avoid list"
  ],
  "pharmacological_rationale": "2-sentence clinical pharmacology explanation"
}}"""
        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            if response and response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.warning(f"[MedicationAgent] Gemini API error: {e}")
        return None

    def process(self, result: PipelineResult, record: PatientRecord) -> PipelineResult:
        result.current_medications = list(record.medications)
        result.known_allergies     = list(record.allergies)

        if self.llm_enabled and self._client:
            llm_data = self._call_gemini_llm(record)
            if llm_data and isinstance(llm_data, dict):
                avoid = set()
                for d in llm_data.get("avoid_list", []):
                    if d:
                        avoid.add(str(d).strip().lower())
                # Ensure all documented allergies are in avoid_list
                for a in record.allergies:
                    avoid.add(a.strip().lower())
                result.avoid_list = sorted(avoid)
                result.interaction_warnings = [str(w) for w in llm_data.get("interaction_warnings", [])]
                result.medication_reasoning = str(llm_data.get("pharmacological_rationale", ""))
                result.agent_llm_status["medication_agent"] = True
                return result

        # Rule engine fallback
        avoid: set[str] = set()
        warnings: list[str] = []

        # Allergy-based contraindications
        for allergy in record.allergies:
            avoid.add(allergy)
            warnings.append(f"Allergy documented: {allergy} -> added to avoid list")

        # Drug-interaction scanning
        for pair, (severity, description) in INTERACTION_RULES.items():
            drugs = list(pair)
            for current_med in record.medications:
                if current_med in pair:
                    other = [d for d in drugs if d != current_med]
                    for d in other:
                        avoid.add(d)
                        warnings.append(f"[{severity}] {description}")

        result.avoid_list = sorted(avoid)
        result.interaction_warnings = list(dict.fromkeys(warnings))
        result.medication_reasoning = "Rule-based DDI scan across known interaction pairs."
        result.agent_llm_status["medication_agent"] = False
        return result


# ---------------------------------------------------------------------------
# Agent 4 — Decision Agent (Gemini LLM Clinical Reasoner with Heuristic Fallback)
# ---------------------------------------------------------------------------

class DecisionAgent:
    """
    Agent 4 — Clinical Decision Agent
    
    Hybrid Architecture:
    1. LLM Mode (Active when GEMINI_API_KEY / GOOGLE_API_KEY is available):
       Calls Google Gemini (gemini-2.5-flash / gemini-1.5-flash) to evaluate
       the patient's real-time state, synthesize physiological abnormalities,
       and recommend evidence-based actions + candidate pharmacotherapy.
    2. Heuristic Mode (Deterministic fallback):
       Clinical threshold heuristics ensuring 100% test reproducibility, zero-latency
       operation, and offline capability.
    """

    _THRESHOLDS = {
        "low_spo2":   lambda r: r.spo2 < 92,
        "high_hr":    lambda r: r.heart_rate > 120,
        "fever":      lambda r: r.temperature > 38.5,
        "high_bp":    lambda r: r.systolic_bp > 160,
    }

    def __init__(
        self,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> None:
        self.api_key = (
            api_key
            or os.environ.get("GEMINI_API_KEY")
            or os.environ.get("GOOGLE_API_KEY")
        )
        self.model_name = model_name or os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
        self.llm_enabled = bool(self.api_key and HAS_GOOGLE_GENAI)
        self._client = None

        if self.llm_enabled:
            try:
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"[DecisionAgent] Real Google Gemini LLM initialized ({self.model_name})")
            except Exception as e:
                logger.warning(f"[DecisionAgent] Gemini Client init failed ({e}); falling back to heuristic engine.")
                self.llm_enabled = False
        else:
            logger.info("[DecisionAgent] Running in deterministic clinical heuristic mode (set GEMINI_API_KEY to activate real LLM)")

    def _call_gemini_llm(self, result: PipelineResult, record: PatientRecord) -> Optional[dict]:
        """Queries Google Gemini for structured clinical reasoning and interventions."""
        if not self._client:
            return None

        prompt = f"""You are an expert Clinical Decision Support AI Agent in an intensive care / hospital monitoring setting.
Analyze this patient's real-time vital signs, ML risk score, current medications, and known allergies.

Patient Information:
- Patient ID: {record.patient_id}
- Vital Signs:
  * Heart Rate: {record.heart_rate} bpm (Normal range: 60–100 bpm)
  * Oxygen Saturation (SpO2): {record.spo2}% (Normal range: >=95%)
  * Body Temperature: {record.temperature}°C (Normal range: 36.5–37.5°C)
  * Systolic Blood Pressure: {record.systolic_bp} mmHg (Normal range: 90–120 mmHg)
- Triage Risk Classification (from Monitoring ML Agent): {result.predicted_risk}
- Current Active Medications: {record.medications or 'None reported'}
- Known Drug Allergies: {record.allergies or 'None documented'}

Clinical Objectives:
1. Synthesize the dominant physiological abnormalities (e.g., severe hyperthermia, hypoxemia, tachycardia, hypertensive crisis).
2. If acute symptomatic intervention is needed (e.g. fever > 38.5°C), propose an initial candidate drug (lowercase string, e.g., 'ibuprofen' or antipyretic/antihypertensive, or null if no medication is warranted). Note: An independent downstream Safety Agent will verify all drug interactions.
3. List 3 to 5 prioritized, actionable clinical steps for immediate patient stabilization.
4. Provide a 2-3 sentence clinical rationale for the attending physician summarizing pathophysiology and strategy.

You MUST respond strictly with a valid JSON object matching this schema:
{{
  "clinical_rationale": "2-3 sentence clinical synthesis of patient condition and medical plan",
  "candidate_drug": "medication_name_in_lowercase_or_null",
  "suggested_actions": [
    "action 1",
    "action 2",
    "action 3"
  ],
  "physician_notes": [
    "optional brief clinical observation"
  ]
}}"""

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            if response and response.text:
                data = json.loads(response.text)
                return data
        except Exception as e:
            logger.warning(f"[DecisionAgent] Gemini API generation error: {e}")
        return None

    def _process_heuristic(self, result: PipelineResult, record: PatientRecord) -> PipelineResult:
        """Deterministic clinical heuristic rule engine fallback."""
        actions: list[str] = []
        candidate_drug: Optional[str] = None
        risk = result.predicted_risk

        if risk == "Normal":
            actions = ["Continue routine monitoring"]
            rationale = "Patient vital signs are within stable physiological limits. No immediate pharmacological intervention required."

        elif risk == "Warning":
            actions = ["Increase monitoring frequency (every 15 min)"]
            if record.spo2 < 96:
                actions.append("Administer supplemental oxygen if SpO2 < 94%")
            if record.temperature > 37.5:
                actions.append("Monitor temperature trend; antipyretic if escalating")
                candidate_drug = "ibuprofen"
            if record.systolic_bp > 135:
                actions.append("Review antihypertensive regimen")
            if record.heart_rate > 95:
                actions.append("12-lead ECG recommended")
            rationale = "Moderate vital sign deviation detected. Increased surveillance and supportive care recommended."

        elif risk == "Critical":
            actions = [
                "ALERT: Immediate physician notification",
                "Activate rapid response protocol",
                "Continuous vital sign monitoring",
            ]
            if record.spo2 < 90:
                actions.append("High-flow oxygen or ventilatory support")
            if record.temperature > 39.0:
                actions.append("Urgent antipyretic therapy required")
                candidate_drug = "ibuprofen"
            if record.systolic_bp > 160:
                actions.append("IV antihypertensive therapy — contact pharmacy")
            if record.heart_rate > 125:
                actions.append("Cardiac arrhythmia workup; consider rate control")
            rationale = "Critical patient deterioration. Immediate multi-system intervention and rapid response protocol initiated."
        else:
            rationale = "Awaiting clinical risk evaluation."

        result.clinical_rationale = rationale
        result.suggested_actions = actions
        result.candidate_drug    = candidate_drug
        result.llm_powered       = False
        result.llm_model         = "Calibrated Clinical Heuristic Engine"
        return result

    def process(self, result: PipelineResult, record: PatientRecord) -> PipelineResult:
        if self.llm_enabled and self._client:
            llm_output = self._call_gemini_llm(result, record)
            if llm_output and isinstance(llm_output, dict):
                result.clinical_rationale = llm_output.get("clinical_rationale")
                raw_drug = llm_output.get("candidate_drug")
                if raw_drug and str(raw_drug).strip().lower() not in ("none", "null", ""):
                    result.candidate_drug = str(raw_drug).strip().lower()
                else:
                    result.candidate_drug = None

                actions = llm_output.get("suggested_actions")
                if isinstance(actions, list) and len(actions) > 0:
                    result.suggested_actions = [str(a) for a in actions]
                else:
                    result.suggested_actions = ["Continuous vital sign monitoring"]

                p_notes = llm_output.get("physician_notes")
                if isinstance(p_notes, list):
                    result.physician_notes.extend([str(n) for n in p_notes])

                result.llm_powered = True
                result.llm_model = self.model_name
                result.agent_llm_status["decision_agent"] = True
                return result

        # Fallback to deterministic heuristic
        result = self._process_heuristic(result, record)
        result.agent_llm_status["decision_agent"] = False
        return result


# ---------------------------------------------------------------------------
# Agent 5 — Safety Agent (Deterministic Gatekeeper + Real Gemini Pharmacovigilance)
# ---------------------------------------------------------------------------

class SafetyAgent:
    """
    Agent 5 — Autonomous Safety & Pharmacovigilance Interceptor Agent

    Dual Verification Architecture:
    1. Real Gemini LLM Interceptor:
       Independently audits proposed clinical decisions against known drug-drug
       interactions, allergy contraindications, and patient vitals to generate
       clinical safety rationales and safer alternatives.

    2. Deterministic Hard Gate Invariant:
       Guarantees a 100% block-rate for any candidate drug present in avoid_list or
       matching known allergies. An LLM hallucination or risky proposal can NEVER
       bypass this programmatic hard barrier.
    """

    def __init__(
        self,
        enabled: bool = True,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> None:
        self.enabled = enabled
        self.api_key = (
            api_key
            or os.environ.get("GEMINI_API_KEY")
            or os.environ.get("GOOGLE_API_KEY")
        )
        self.model_name = model_name or os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
        self.llm_enabled = bool(self.api_key and HAS_GOOGLE_GENAI)
        self._client = None
        if self.llm_enabled:
            try:
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"[SafetyAgent] Live Gemini LLM safety interceptor active ({self.model_name})")
            except Exception as e:
                logger.warning(f"[SafetyAgent] Gemini Client init failed: {e}")
                self.llm_enabled = False

    def _call_gemini_safety_audit(
        self, result: PipelineResult, record: Optional[PatientRecord] = None
    ) -> Optional[dict]:
        """Queries Google Gemini to independently audit the candidate drug and clinical steps."""
        if not self._client:
            return None

        prompt = f"""You are the Clinical Safety & Pharmacovigilance Interceptor Agent in an Autonomous Healthcare Monitoring System (Pinnacle).
Your job is to independently verify candidate interventions against contraindications, active medications, allergies, and patient stability.

Patient & Clinical Context:
- Patient ID: {result.patient_id}
- Triage Classification: {result.predicted_risk}
- Vital Signs: {result.vitals}
- Current Active Medications: {result.current_medications or 'None reported'}
- Known Documented Allergies: {result.known_allergies or 'None documented'}
- Contraindicated Avoid List: {result.avoid_list or 'None'}
- Proposed Candidate Drug: {result.candidate_drug or 'None'}
- Proposed Clinical Actions: {result.suggested_actions}

Audit Instructions:
1. Determine if the Proposed Candidate Drug or clinical interventions violate any safety rule:
   - Check against known allergies.
   - Check against avoid_list.
   - Check severe drug-drug interactions (e.g. Warfarin + Ibuprofen/Aspirin increases hemorrhage risk; Lisinopril + NSAID compromises renal perfusion).
2. Assign a 'safety_verdict': 'APPROVE' (if no candidate drug is proposed or candidate drug is clinically safe) or 'BLOCK' (if contraindicated or unsafe).
3. Provide a concise 2-sentence 'safety_reasoning' explaining the pharmacological mechanism.
4. If BLOCKED, specify a 'suggested_alternative' (e.g., 'acetaminophen' or supportive physical cooling instead of ibuprofen).

Respond STRICTLY with a valid JSON object matching this schema:
{{
  "safety_verdict": "APPROVE | BLOCK",
  "safety_reasoning": "2-sentence clinical safety rationale",
  "contraindication_flag": false,
  "suggested_alternative": "safer drug or action, or null if approved"
}}"""

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            if response and response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.warning(f"[SafetyAgent] Gemini safety audit error: {e}")
        return None

    def process(
        self, result: PipelineResult, record: Optional[PatientRecord] = None
    ) -> PipelineResult:
        if not self.enabled:
            # Safety OFF: pass candidate drug through unchecked (for ablation studies)
            result.final_drug = result.candidate_drug
            result.safe = True
            result.safety_reasoning = "Safety Agent disabled (ablation mode)."
            result.agent_llm_status["safety_agent"] = False
            return result

        drug = result.candidate_drug

        # Optional LLM Safety Interceptor Audit
        llm_audit = None
        if self.llm_enabled and self._client:
            llm_audit = self._call_gemini_safety_audit(result, record)
            if llm_audit and isinstance(llm_audit, dict):
                result.agent_llm_status["safety_agent"] = True
                result.safety_reasoning = str(
                    llm_audit.get("safety_reasoning", "")
                )
                alt = llm_audit.get("suggested_alternative")
                if alt and str(alt).lower() not in ("null", "none"):
                    result.physician_notes.append(f"[Safety Recommendation] Suggested alternative: {alt}")
            else:
                result.agent_llm_status["safety_agent"] = False
        else:
            result.agent_llm_status["safety_agent"] = False

        if drug is None:
            result.final_drug = None
            result.safe       = True
            if not result.safety_reasoning:
                result.safety_reasoning = "No candidate pharmacological agent proposed. Non-pharmacological stabilization approved."
            return result

        # Check deterministic hard-barrier contraindications
        is_hard_blocked = drug in result.avoid_list
        is_llm_blocked = bool(llm_audit and str(llm_audit.get("safety_verdict", "")).upper() == "BLOCK")

        if is_hard_blocked or is_llm_blocked:
            # ── DETERMINISTIC HARD BLOCK ────────────────────────────────────
            result.final_drug   = None
            result.drug_blocked = True
            result.safe         = False

            # Compile comprehensive clinical reasons
            reasons: list[str] = []
            if drug in result.known_allergies:
                reasons.append(f"patient has documented allergy to {drug}")
            for warning in result.interaction_warnings:
                if drug.lower() in warning.lower():
                    reasons.append(warning)

            if not reasons:
                if is_hard_blocked:
                    reasons.append(f"{drug} is on the patient's contraindication list")
                elif is_llm_blocked and result.safety_reasoning:
                    reasons.append(result.safety_reasoning)

            result.block_reason = "; ".join(reasons)

            result.physician_notes.append(
                f"[!] SAFETY BLOCK: '{drug}' was proposed but is CONTRAINDICATED. "
                f"Reason: {result.block_reason}. "
                "Please select an alternative therapy and review medication chart."
            )

            if not result.safety_reasoning:
                result.safety_reasoning = (
                    f"Safety interceptor blocked '{drug}' due to high-risk interaction: {result.block_reason}."
                )
        else:
            # ── APPROVE ────────────────────────────────────────────────────
            result.final_drug = drug
            result.safe       = True
            if not result.safety_reasoning:
                result.safety_reasoning = (
                    f"Candidate drug '{drug}' verified against allergies and active interactions. Clear for administration."
                )

        return result


# ---------------------------------------------------------------------------
# Orchestrator — Sequential Pipeline
# ---------------------------------------------------------------------------

class Orchestrator:
    """
    Runs the four-agent pipeline in sequence:
      MonitoringAgent → MedicationAgent → DecisionAgent → SafetyAgent

    Parameters
    ----------
    model_path      : path to the saved RandomForest model
    safety_on       : toggle SafetyAgent (for ablation experiments)
    gemini_api_key  : optional API key for Gemini LLM integration
    gemini_model    : optional model name (defaults to gemini-2.5-flash)
    """

    def __init__(
        self,
        model_path: str = "model.joblib",
        safety_on: bool = True,
        gemini_api_key: Optional[str] = None,
        gemini_model: Optional[str] = None,
    ) -> None:
        self.gemini_model = (
            gemini_model
            or os.environ.get("GEMINI_MODEL")
            or "gemini-3-flash-preview"
        )
        self.gemini_api_key = (
            gemini_api_key
            or os.environ.get("GEMINI_API_KEY")
            or os.environ.get("GOOGLE_API_KEY")
        )
        self.monitoring_agent = MonitoringAgent.load(
            path=model_path,
            model_name=self.gemini_model,
            api_key=self.gemini_api_key,
        )
        self.medication_agent = MedicationAgent(
            model_name=self.gemini_model,
            api_key=self.gemini_api_key,
        )
        self.decision_agent   = DecisionAgent(
            model_name=self.gemini_model,
            api_key=self.gemini_api_key,
        )
        self.safety_agent     = SafetyAgent(
            enabled=safety_on,
            model_name=self.gemini_model,
            api_key=self.gemini_api_key,
        )

    def run(self, record: PatientRecord) -> PipelineResult:
        """Process a single patient record through the full multi-agent pipeline."""
        result = PipelineResult(
            patient_id=record.patient_id,
            vitals={
                "heart_rate":   record.heart_rate,
                "spo2":         record.spo2,
                "temperature":  record.temperature,
                "systolic_bp":  record.systolic_bp,
            },
        )

        # Stage 1: Risk Classification (Agent 2 - Monitoring Agent)
        result = self.monitoring_agent.process(result, record)

        # Stage 2: Medication Safety Profiling (Agent 3 - Medication Agent)
        result = self.medication_agent.process(result, record)

        # Stage 3: Clinical Decision Support (Agent 4 - Decision Agent)
        result = self.decision_agent.process(result, record)

        # Stage 4: Safety Interception (Agent 5 - Safety Agent)
        result = self.safety_agent.process(result, record)

        # Aggregate overall LLM status
        result.llm_powered = any(result.agent_llm_status.values())
        if result.llm_powered:
            result.llm_model = self.gemini_model

        return result

    def run_batch(self, records: list[PatientRecord]) -> list[PipelineResult]:
        """Process a list of records and return all results."""
        return [self.run(r) for r in records]

