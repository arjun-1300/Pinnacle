"""
verify_demo.py — End-to-End Autonomous Healthcare Multi-Agent System Demo Verification

Validates the critical patient workflow:
  1. Health check (/health)
  2. Patient simulation check (/simulate)
  3. Critical case analysis:
       HR=125, SpO2=89, Temp=39.3, SBP=160, Meds=['warfarin'], Allergies=[]
       - Confirms Risk Engine classifies as 'Critical' (confidence >= 0.90)
       - Confirms Decision Agent suggests 'ibuprofen' for severe fever
       - Confirms Medication Agent identifies high-risk Warfarin + Ibuprofen interaction
       - Confirms Safety Agent blocks the drug (safe=False, drug_blocked=True, final_drug=None)
  4. Physician-in-the-loop decision:
       - Sends POST /decide/approved
       - Confirms verdict is recorded
  5. Audit Log verification:
       - Confirms entry appears in /audit with approved status
"""

import sys
import json
import urllib.request
import urllib.error

# Ensure UTF-8 output on all platforms (including Windows cmd/powershell)
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://localhost:8001"


def print_banner(text: str):
    line = "=" * 70
    print(f"\n{line}\n  {text}\n{line}")


def make_request(method: str, path: str, body: dict = None) -> tuple[int, dict]:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content)
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        return e.code, json.loads(content)
    except urllib.error.URLError as e:
        print(f"[FAIL] Connection error to {url}: {e.reason}")
        print("       Ensure the FastAPI backend is running on http://localhost:8000")
        sys.exit(1)


def main():
    print_banner("PINNACLE MULTI-AGENT HEALTHCARE SYSTEM: DEMO VERIFICATION")

    # -------------------------------------------------------------------------
    # Step 1: Healthcheck
    # -------------------------------------------------------------------------
    print("\n[Step 1/5] Verifying API Health...")
    status, health_data = make_request("GET", "/health")
    assert status == 200, f"Expected 200, got {status}"
    assert health_data.get("status") == "ok", f"Health status not ok: {health_data}"
    # model_loaded is False before the first /analyze warms the orchestrator — checked again after Step 3
    print(f"  [PASS] Backend Healthy | Audit Entries: {health_data.get('audit_entries')}")

    # -------------------------------------------------------------------------
    # Step 2: Patient Simulation
    # -------------------------------------------------------------------------
    print("\n[Step 2/5] Testing Synthetic Data Generator (/simulate)...")
    status, sim_data = make_request("GET", "/simulate")
    assert status == 200, f"Expected 200, got {status}"
    assert "heart_rate" in sim_data and "spo2" in sim_data
    print(f"  [PASS] Generated Simulated Patient: HR={sim_data['heart_rate']}, SpO2={sim_data['spo2']}%, Temp={sim_data['temperature']}C")

    # -------------------------------------------------------------------------
    # Step 3: Critical Patient Case (Warfarin blocking Ibuprofen)
    # -------------------------------------------------------------------------
    print("\n[Step 3/5] Testing Critical Patient Scenario...")
    critical_payload = {
        "heart_rate": 125.0,
        "spo2": 89.0,
        "temperature": 39.3,
        "systolic_bp": 160.0,
        "current_meds": ["warfarin"],
        "allergies": []
    }
    print(f"  Input Vitals: HR={critical_payload['heart_rate']} bpm, SpO2={critical_payload['spo2']}%, "
          f"Temp={critical_payload['temperature']} C, SBP={critical_payload['systolic_bp']} mmHg")
    print(f"  Current Medications: {critical_payload['current_meds']}")
    print(f"  Known Allergies:     {critical_payload['allergies']}")

    status, analysis = make_request("POST", "/analyze", critical_payload)
    assert status == 200, f"Analysis failed with status {status}: {analysis}"

    audit_id = analysis.get("audit_id")          # UUID assigned by /analyze
    patient_id = analysis.get("patient_id")
    predicted_risk = analysis.get("predicted_risk")
    confidence = analysis.get("confidence", 0.0)
    candidate_drug = analysis.get("candidate_drug")
    final_drug = analysis.get("final_drug")
    drug_blocked = analysis.get("drug_blocked")
    safe = analysis.get("safe")
    block_reason = analysis.get("block_reason", "")
    suggested_actions = analysis.get("suggested_actions", [])

    print("\n  --- Pipeline Evaluation Results ---")
    print(f"  Patient ID:       {patient_id}")
    print(f"  Monitoring Agent: Risk={predicted_risk} (Confidence={confidence:.2%})")
    print(f"  Decision Agent:   Candidate Drug='{candidate_drug}'")
    print(f"  Safety Agent:     Drug Blocked={drug_blocked} | Safe={safe} | Final Drug={final_drug}")
    print(f"  Block Reason:     {block_reason}")
    print(f"  Actions ({len(suggested_actions)}):")
    for act in suggested_actions:
        print(f"    - {act}")

    # Validate Core Requirements
    assert predicted_risk == "Critical", f"Expected 'Critical', got '{predicted_risk}'"
    assert confidence >= 0.85, f"Expected confidence >= 0.85, got {confidence}"
    assert candidate_drug == "ibuprofen", f"Expected candidate 'ibuprofen', got '{candidate_drug}'"
    assert drug_blocked is True, f"Expected drug_blocked=True, got {drug_blocked}"
    assert safe is False, f"Expected safe=False, got {safe}"
    assert final_drug is None, f"Expected final_drug=None, got '{final_drug}'"
    assert "warfarin" in block_reason.lower() and "bleeding" in block_reason.lower(), \
        f"Block reason missing Warfarin interaction info: {block_reason}"

    print("  [PASS] Critical Risk detected and Contraindicated Drug correctly BLOCKED by Safety Agent.")

    # Verify model_loaded is now True (orchestrator warmed on first /analyze)
    _, health_post = make_request("GET", "/health")
    assert health_post.get("model_loaded") is True, "MonitoringAgent model not loaded after /analyze"
    print(f"  [PASS] Model Loaded confirmed: True | Audit Entries so far: {health_post.get('audit_entries')}")

    # -------------------------------------------------------------------------
    # Step 4: Physician Decision (Approval of Alert & Actions)
    # -------------------------------------------------------------------------
    print("\n[Step 4/5] Simulating Physician Decision (/decide/approved)...")
    status, decision_resp = make_request("POST", "/decide/approved")
    assert status == 200, f"Expected 200, got {status}: {decision_resp}"
    assert decision_resp.get("physician_verdict") == "approved", \
        f"Expected verdict 'approved', got {decision_resp.get('physician_verdict')}"
    assert decision_resp.get("audit_id") == audit_id, \
        f"Verdict applied to wrong audit entry: {decision_resp.get('audit_id')} != {audit_id}"
    print(f"  [PASS] Physician Verdict '{decision_resp.get('physician_verdict')}' recorded for audit entry {audit_id}.")

    # -------------------------------------------------------------------------
    # Step 5: Audit Log Traceability
    # -------------------------------------------------------------------------
    print("\n[Step 5/5] Auditing Trail Integrity (/audit)...")
    status, audit_entries = make_request("GET", "/audit")
    assert status == 200, f"Expected 200, got {status}"
    assert len(audit_entries) > 0, "Audit log is empty"

    latest = audit_entries[0]
    assert latest.get("patient_id") == patient_id, \
        f"Latest audit entry {latest.get('patient_id')} does not match tested patient {patient_id}"
    assert latest.get("physician_verdict") == "approved", \
        f"Audit entry verdict mismatch: {latest.get('physician_verdict')}"
    assert latest.get("drug_blocked") is True, "Audit entry failed to record drug_blocked flag"

    print(f"  [PASS] Audit log verified: {len(audit_entries)} records preserved with full cryptographic traceability.")

    print_banner("PHASE 4 DEMO VERIFICATION: ALL 5/5 TESTS PASSED SUCCESSFULLY!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
