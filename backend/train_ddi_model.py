"""
train_ddi_model.py — Train Drug-Drug Interaction (DDI) ML Classifier
Multi-Agent Healthcare Monitoring System (Pinnacle)

Builds and evaluates a Machine Learning Model for Agent 3 (MedicationAgent)
to classify pharmacological interaction severity:
  - HIGH (severe adverse interaction e.g. Warfarin + Ibuprofen)
  - MODERATE (attenuation / renal caution e.g. Lisinopril + NSAID)
  - NONE / LOW (safe co-administration e.g. Metformin + Lisinopril)
"""

import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, f1_score

# ---------------------------------------------------------------------------
# Pharmacological Classes & Feature Definitions
# ---------------------------------------------------------------------------

DRUG_CLASSES = {
    "anticoagulant": ["warfarin", "heparin", "apixaban"],
    "antiplatelet":  ["aspirin", "clopidogrel"],
    "nsaid":         ["ibuprofen", "naproxen", "ketorolac", "diclofenac"],
    "ace_inhibitor": ["lisinopril", "ramipril", "enalapril"],
    "arb":           ["losartan", "valsartan"],
    "biguanide":     ["metformin"],
    "statin":        ["atorvastatin", "simvastatin"],
    "beta_blocker":  ["metoprolol", "atenolol"],
    "analgesic":     ["acetaminophen"],
    "antibiotic":    ["amoxicillin", "azithromycin"],
    "ppi":           ["omeprazole", "pantoprazole"],
}

CLASS_LIST = sorted(DRUG_CLASSES.keys())

def get_drug_category(drug_name: str) -> str:
    drug_lower = drug_name.strip().lower()
    for category, drugs in DRUG_CLASSES.items():
        if drug_lower in drugs:
            return category
    return "other"

# Known pharmacological interaction matrices
INTERACTION_SEVERITY_MAP = {
    ("anticoagulant", "nsaid"): ("HIGH", "Elevated hemorrhage and gastrointestinal bleeding risk"),
    ("anticoagulant", "antiplatelet"): ("HIGH", "Additive bleeding and anticoagulant toxicity"),
    ("antiplatelet", "nsaid"): ("MODERATE", "Increased mucosal ulceration and platelet dysfunction"),
    ("ace_inhibitor", "nsaid"): ("MODERATE", "Renal hemodynamic compromise and blunted antihypertensive effect"),
    ("arb", "nsaid"): ("MODERATE", "Impaired renal perfusion and reduced blood pressure control"),
    ("ace_inhibitor", "arb"): ("HIGH", "Dual renin-angiotensin blockade -> severe hyperkalemia & hypotension"),
    ("anticoagulant", "statin"): ("MODERATE", "Potential CYP competition altering INR clearance"),
}

def extract_ddi_features(drug_a: str, drug_b: str) -> np.ndarray:
    """Extracts symmetric one-hot class vectors and synergy indicators."""
    cat_a = get_drug_category(drug_a)
    cat_b = get_drug_category(drug_b)
    
    # Symmetric class representation
    vec_a = [1 if cat_a == c else 0 for c in CLASS_LIST]
    vec_b = [1 if cat_b == c else 0 for c in CLASS_LIST]
    combined_classes = [a + b for a, b in zip(vec_a, vec_b)]
    
    pair = tuple(sorted([cat_a, cat_b]))
    
    # Mechanism flags
    bleeding_flag = 1 if (pair in [("anticoagulant", "nsaid"), ("anticoagulant", "antiplatelet"), ("antiplatelet", "nsaid")]) else 0
    renal_flag = 1 if (pair in [("ace_inhibitor", "nsaid"), ("arb", "nsaid"), ("ace_inhibitor", "arb")]) else 0
    cyp_flag = 1 if (pair in [("anticoagulant", "statin")]) else 0
    
    return np.array(combined_classes + [bleeding_flag, renal_flag, cyp_flag], dtype=float)

# ---------------------------------------------------------------------------
# Dataset Generation for DDI Model Training
# ---------------------------------------------------------------------------

def build_ddi_dataset(n_samples: int = 1500, seed: int = 42) -> tuple[np.ndarray, np.ndarray, list[str]]:
    rng = np.random.default_rng(seed)
    all_drugs = []
    for drugs in DRUG_CLASSES.values():
        all_drugs.extend(drugs)
    
    X_rows = []
    y_labels = []
    
    feature_names = [f"class_{c}" for c in CLASS_LIST] + ["bleeding_synergy", "renal_synergy", "cyp_competition"]
    
    for _ in range(n_samples):
        # Sample two drugs (can be same or different)
        d1, d2 = rng.choice(all_drugs, size=2, replace=False)
        cat1 = get_drug_category(d1)
        cat2 = get_drug_category(d2)
        pair = tuple(sorted([cat1, cat2]))
        
        if pair in INTERACTION_SEVERITY_MAP:
            severity = INTERACTION_SEVERITY_MAP[pair][0]
        else:
            severity = "NONE"
            
        # Add slight noise to simulate pharmacological variance
        feat = extract_ddi_features(d1, d2)
        noise = rng.normal(0, 0.02, size=feat.shape)
        X_rows.append(feat + noise)
        y_labels.append(severity)
        
    return np.array(X_rows), np.array(y_labels), feature_names

# ---------------------------------------------------------------------------
# Model Training & Evaluation
# ---------------------------------------------------------------------------

def train_and_evaluate_ddi():
    print("=" * 70)
    print(" TRAINING DDI ML MODEL (MEDICATION AGENT)")
    print("=" * 70)
    
    X, y, feature_names = build_ddi_dataset(n_samples=2500, seed=42)
    print(f"Dataset generated: {len(X)} drug-pair interaction records.")
    unique, counts = np.unique(y, return_counts=True)
    print("Class distribution:")
    for u, c in zip(unique, counts):
        print(f"  - {u:<10}: {c:>5} samples ({round(c / len(y) * 100, 1)}%)")
        
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X_train, y_train)
    
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring="f1_macro")
    print(f"\n5-Fold Cross-Validation Macro-F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    y_pred = clf.predict(X_test)
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    print(f"Test Set Macro-F1 Score: {macro_f1:.4f}\n")
    
    print("Detailed Classification Report:")
    print(classification_report(y_test, y_pred, digits=4))
    
    print("Confusion Matrix:")
    labels = sorted(list(np.unique(y)))
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=labels, columns=labels)
    print(cm_df.to_string())
    
    # Save model artifact
    save_payload = {
        "model": clf,
        "classes": list(clf.classes_),
        "feature_names": feature_names,
        "metrics": {
            "macro_f1": float(macro_f1),
            "cv_f1_mean": float(cv_scores.mean()),
        },
        "interaction_map": INTERACTION_SEVERITY_MAP,
    }
    joblib.dump(save_payload, "ddi_model.joblib")
    print(f"\nSaved Medication DDI ML model to 'ddi_model.joblib' successfully.")
    print("=" * 70)

if __name__ == "__main__":
    train_and_evaluate_ddi()
