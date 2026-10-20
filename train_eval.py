"""
train_eval.py — Phase 1 Training & Evaluation
Multi-Agent Healthcare Monitoring System

Workflow
--------
1. Generate 3,000 synthetic training samples → fit RandomForest → save model.joblib
2. Generate 1,000 synthetic test samples
3. Experiment 1 — Macro-F1 and Critical Recall:
     Baseline: Threshold rule  (SpO2 < 90 OR HR > 130 OR Temp > 39.5 → Critical)
     Model:    MonitoringAgent (RandomForest)
4. Experiment 2 — Safety Ablation:
     Count unsafe drug proposals with SafetyAgent ON vs OFF
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    classification_report,
    f1_score,
    recall_score,
    confusion_matrix,
)

from core import (
    SyntheticDataGenerator,
    MonitoringAgent,
    Orchestrator,
    RISK_LABELS,
    FEATURE_COLS,
)

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

LABEL_ORDER = ["Normal", "Warning", "Critical"]
LABEL_TO_INT = {l: i for i, l in enumerate(LABEL_ORDER)}


def _encode(labels):
    return [LABEL_TO_INT[l] for l in labels]


def separator(title: str = "", width: int = 70) -> None:
    if title:
        pad = (width - len(title) - 2) // 2
        print("=" * pad + f" {title} " + "=" * (width - pad - len(title) - 2))
    else:
        print("=" * width)


def print_table(headers: list, rows: list, col_width: int = 22) -> None:
    fmt = "".join(f"{{:<{col_width}}}" for _ in headers)
    print(fmt.format(*headers))
    print("-" * (col_width * len(headers)))
    for row in rows:
        print(fmt.format(*[str(v) for v in row]))


# ──────────────────────────────────────────────────────────────────────────────
# Step 1 — Train
# ──────────────────────────────────────────────────────────────────────────────

separator("TRAINING")
print("Generating 3,000 synthetic training samples …")

gen = SyntheticDataGenerator(seed=42)
train_df = gen.to_dataframe(3000)

print(f"  Class distribution (train):\n{train_df['label'].value_counts().to_string()}\n")

agent = MonitoringAgent(n_estimators=100, random_state=42)
agent.fit(train_df)
agent.save("model.joblib")
print()

# ──────────────────────────────────────────────────────────────────────────────
# Step 2 — Generate test set
# ──────────────────────────────────────────────────────────────────────────────

separator("TEST SET GENERATION")
print("Generating 1,000 synthetic test samples …")

test_gen = SyntheticDataGenerator(seed=99)   # different seed → unseen data
test_records = test_gen.generate(1000)

test_df = pd.DataFrame(
    [
        {
            "heart_rate":  r.heart_rate,
            "spo2":        r.spo2,
            "temperature": r.temperature,
            "systolic_bp": r.systolic_bp,
            "label":       r.true_label,
        }
        for r in test_records
    ]
)

y_true = test_df["label"].tolist()
print(f"  Class distribution (test):\n{test_df['label'].value_counts().to_string()}\n")


# ──────────────────────────────────────────────────────────────────────────────
# Experiment 1 — Macro-F1 & Critical Recall
# ──────────────────────────────────────────────────────────────────────────────

separator("EXPERIMENT 1 — Classification Performance")

# ── Baseline: threshold rule ─────────────────────────────────────────────────
def baseline_predict(row: pd.Series) -> str:
    """Deterministic threshold classifier."""
    if row["spo2"] < 90 or row["heart_rate"] > 130 or row["temperature"] > 39.5:
        return "Critical"
    if row["spo2"] < 95 or row["heart_rate"] > 95 or row["temperature"] > 37.5 or row["systolic_bp"] > 130:
        return "Warning"
    return "Normal"


y_baseline = test_df.apply(baseline_predict, axis=1).tolist()

# ── RandomForest predictions ──────────────────────────────────────────────────
loaded_agent = MonitoringAgent.load("model.joblib")
X_test = test_df[FEATURE_COLS].values

rf_preds_raw = loaded_agent.clf.predict(X_test)
y_rf = list(rf_preds_raw)

# ── Metrics ──────────────────────────────────────────────────────────────────
def compute_metrics(y_t, y_p, label_order=LABEL_ORDER):
    f1_macro   = f1_score(y_t, y_p, labels=label_order, average="macro", zero_division=0)
    recall_crit = recall_score(
        y_t, y_p,
        labels=["Critical"],
        average="macro",
        zero_division=0,
    )
    return round(f1_macro, 4), round(recall_crit, 4)


bl_f1, bl_recall = compute_metrics(y_true, y_baseline)
rf_f1, rf_recall = compute_metrics(y_true, y_rf)

print("\nComparison Table:")
print_table(
    ["Method", "Macro-F1", "Critical Recall"],
    [
        ["Baseline (Threshold Rule)", bl_f1, bl_recall],
        ["RandomForest (MonitoringAgent)", rf_f1, rf_recall],
    ],
    col_width=34,
)

# Per-class breakdown
print("\n── Baseline Detailed Report ──")
print(classification_report(y_true, y_baseline, labels=LABEL_ORDER, zero_division=0))

print("── RandomForest Detailed Report ──")
print(classification_report(y_true, y_rf, labels=LABEL_ORDER, zero_division=0))

# Confusion matrices
print("── Baseline Confusion Matrix (rows=true, cols=pred) ──")
cm_bl = confusion_matrix(y_true, y_baseline, labels=LABEL_ORDER)
cm_df_bl = pd.DataFrame(cm_bl, index=LABEL_ORDER, columns=LABEL_ORDER)
print(cm_df_bl.to_string())

print("\n── RandomForest Confusion Matrix ──")
cm_rf = confusion_matrix(y_true, y_rf, labels=LABEL_ORDER)
cm_df_rf = pd.DataFrame(cm_rf, index=LABEL_ORDER, columns=LABEL_ORDER)
print(cm_df_rf.to_string())
print()


# ──────────────────────────────────────────────────────────────────────────────
# Experiment 2 — Safety Ablation
# ──────────────────────────────────────────────────────────────────────────────

separator("EXPERIMENT 2 — Safety Agent Ablation")

print("Running pipeline on 1,000 test records with Safety ON and OFF …\n")

orchestrator_on  = Orchestrator(model_path="model.joblib", safety_on=True)
orchestrator_off = Orchestrator(model_path="model.joblib", safety_on=False)

results_on  = orchestrator_on.run_batch(test_records)
results_off = orchestrator_off.run_batch(test_records)


def count_unsafe(results) -> tuple[int, int, int]:
    """
    Returns:
      proposals   — how many records had a candidate_drug suggested
      unsafe      — how many proposed drugs were on the avoid_list
      blocked     — how many were actually blocked (only >0 when safety ON)
    """
    proposals = sum(1 for r in results if r.candidate_drug is not None)
    unsafe    = sum(
        1 for r in results
        if r.candidate_drug is not None and r.candidate_drug in r.avoid_list
    )
    blocked   = sum(1 for r in results if r.drug_blocked)
    return proposals, unsafe, blocked


proposals_on,  unsafe_on,  blocked_on  = count_unsafe(results_on)
proposals_off, unsafe_off, blocked_off = count_unsafe(results_off)

print("Ablation Results Table:")
print_table(
    ["Safety Agent", "Drug Proposals", "Unsafe Proposals", "Actually Blocked", "Unsafe Passed"],
    [
        [
            "OFF (no interception)",
            proposals_off,
            unsafe_off,
            blocked_off,
            unsafe_off,           # all unsafe proposals pass through
        ],
        [
            "ON  (with interception)",
            proposals_on,
            unsafe_on,
            blocked_on,
            unsafe_on - blocked_on,  # residual unsafe (should be 0)
        ],
    ],
    col_width=26,
)

# Breakdown of blocked drugs
blocked_details: dict[str, int] = {}
for r in results_on:
    if r.drug_blocked and r.candidate_drug:
        key = r.candidate_drug
        blocked_details[key] = blocked_details.get(key, 0) + 1

print("\nBlocked Drug Breakdown (Safety ON):")
for drug, count in sorted(blocked_details.items(), key=lambda x: -x[1]):
    print(f"  {drug:<20} blocked {count:>4} times")

# Sample physician note
sample_notes = [r for r in results_on if r.physician_notes]
if sample_notes:
    print("\nSample Physician Warning Note:")
    print(f"  [{sample_notes[0].patient_id}] {sample_notes[0].physician_notes[0]}")

print()
separator()
print("Phase 1 verification complete ✓")
separator()
