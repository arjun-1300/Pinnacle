# Pinnacle — Demo Guide
## Multi-Agent Autonomous Healthcare Monitoring System
### 3-Minute Presentation Script

---

> **Pre-flight checklist (complete before the demo room fills up)**
> - [ ] Backend running: `uvicorn main:app --reload` in the Pinnacle root
> - [ ] Frontend running: `npm run dev` inside `frontend/`
> - [ ] Browser open at `http://localhost:5173` (or Vite port shown in terminal)
> - [ ] `verify_demo.py` passes: `python verify_demo.py` -> "ALL 5/5 TESTS PASSED"
> - [ ] Browser window maximised; DevTools closed
> - [ ] Swagger open in a second tab: `http://localhost:8000/docs`

---

## 3-Minute Demo Script

### ⏱ 0:00 – 0:30 | Opening Hook

> "Every day, nurses manually review dozens of vitals.
>  Pinnacle replaces that reactive workflow with a proactive, AI-driven multi-agent pipeline
>  that classifies risk, checks drug interactions, suggests treatment, and enforces safety —
>  all in under 200 ms, with a full audit trail."

Point to the Navbar — highlight the three sections: Analyze, Audit Log, and the live status badge.

---

### ⏱ 0:30 – 1:00 | Run 1 — Normal Patient (Baseline)

**Action sequence:**

1. Click **"Load Simulated Patient"** button (top-right of the form).
   - The form auto-fills with a synthetic patient (e.g., HR ≈ 75, SpO2 ≈ 97%, Temp ≈ 36.8 °C).
2. Click **"Analyze Patient"**.
3. The Result Panel appears — observe:
   - Risk badge: 🟢 **NORMAL**
   - Suggested action: "Continue routine monitoring"
   - No drug suggested / no safety block
4. **Say:** "A normal patient gets routed directly to routine monitoring — zero unnecessary alerts."

📸 **Screenshot 1:** Result panel showing green NORMAL badge with `Continue routine monitoring` action.

---

### ⏱ 1:00 – 1:50 | Run 2 — Critical Case (Warfarin + Ibuprofen Interaction)

**Manually enter the critical case:**

| Field | Value |
|-------|-------|
| Heart Rate | **125** bpm |
| SpO2 | **89** % |
| Temperature | **39.3** °C |
| Systolic BP | **160** mmHg |
| Current Medications | **warfarin** |
| Known Allergies | (leave blank) |

5. Clear the form fields and type in the values above.
6. Click **"Analyze Patient"**.
7. The Result Panel now shows:
   - Risk badge: 🔴 **CRITICAL** (confidence ≥ 85%)
   - Decision Agent -> Candidate Drug: `ibuprofen` (NSAID for severe fever)
   - Safety Agent -> ⛔ Drug BLOCKED: `ibuprofen` is contraindicated
   - Block Reason: "[HIGH] Warfarin + Ibuprofen → significantly elevated bleeding risk"
   - Final Drug: null — physician must choose alternative
   - 4 suggested actions: immediate alert, rapid response, cardiac workup, IV antihypertensive
8. **Say:** "The Safety Agent intercepted the Decision Agent's NSAID recommendation — the patient is on Warfarin, creating a life-threatening bleeding risk. The drug is blocked before it ever reaches the prescription stage."

📸 **Screenshot 2:** Result panel with red CRITICAL badge, ibuprofen blocked, Warfarin interaction warning.

---

### ⏱ 1:50 – 2:20 | Run 3 — Doctor Approval (Physician-in-the-Loop)

9. Below the Result Panel, locate the **Physician Decision** section.
10. Click **"Approve"** (green button).
11. A confirmation toast appears: "Physician verdict 'approved' recorded."
12. **Say:** "The attending physician reviews the recommendation and logs their decision. Every verdict is cryptographically timestamped and immutable."

📸 **Screenshot 3:** Physician Decision section showing "approved" verdict with audit_id and timestamp.

---

### ⏱ 2:20 – 2:50 | Run 4 — Audit Log Verification

13. Click the **"Audit Log"** tab in the Navbar.
14. The Audit Log table loads (newest first).
15. Locate the critical-case entry: red CRITICAL, drug_blocked: true, physician_verdict: approved.
16. **Say:** "Every pipeline execution is stored — patient ID, risk score, confidence, the blocked drug, the reason, and the physician verdict. This is the complete accountability chain."

📸 **Screenshot 4:** Audit Log table row: drug_blocked: true, physician_verdict: approved, timestamp.

---

### ⏱ 2:50 – 3:00 | Close

> "Pinnacle demonstrates that a four-agent pipeline — Monitoring, Medication, Decision, Safety —
>  with physician oversight provides safer, faster, and fully auditable clinical decision support.
>  Questions?"

---

## Required Review Screenshots

| # | What to Capture | Key Elements Visible |
|---|-----------------|---------------------|
| **SS-1** | Normal patient result | Green NORMAL badge, Continue routine monitoring, zero alerts |
| **SS-2** | Critical case result panel | Red CRITICAL badge, ibuprofen BLOCKED, Warfarin interaction warning, null final_drug |
| **SS-3** | Physician decision submitted | approved verdict, audit_id UUID, timestamp |
| **SS-4** | Audit Log table row | drug_blocked: true, physician_verdict: approved, patient_id, confidence score |

Save screenshots as: SS1_normal.png, SS2_critical.png, SS3_doctor.png, SS4_audit.png

---

## Automated Verification

Run before every presentation:

  python verify_demo.py

Expected final line: "PHASE 4 DEMO VERIFICATION: ALL 5/5 TESTS PASSED SUCCESSFULLY!"
