import urllib.request
import urllib.error
import json
import os

BASE = os.environ.get("PINNACLE_BASE_URL", "http://localhost:8000")


def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def sep(title):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)


# ── GET /health ────────────────────────────────────────────────────────
sep("GET /health")
s, b = req("GET", "/health")
print(f"Status : {s}")
print(json.dumps(b, indent=2))

# ── GET /simulate ──────────────────────────────────────────────────────
sep("GET /simulate")
s, b = req("GET", "/simulate")
print(f"Status : {s}")
print(json.dumps(b, indent=2))

# ── POST /analyze — Warning scenario (allergy clash) ──────────────────
sep("POST /analyze  [Warning vitals | lisinopril + aspirin allergy]")
payload_warning = {
    "heart_rate": 102.0,
    "spo2": 93.5,
    "temperature": 38.1,
    "systolic_bp": 140.0,
    "current_meds": ["lisinopril"],
    "allergies": ["aspirin"],
}
s, analyze_w = req("POST", "/analyze", payload_warning)
print(f"Status : {s}")
print(json.dumps(analyze_w, indent=2))

# ── POST /analyze — Critical scenario (drug interaction) ──────────────
sep("POST /analyze  [Critical vitals | warfarin + ibuprofen allergy]")
payload_critical = {
    "heart_rate": 132.0,
    "spo2": 86.0,
    "temperature": 39.5,
    "systolic_bp": 172.0,
    "current_meds": ["warfarin"],
    "allergies": ["ibuprofen"],
}
s, analyze_c = req("POST", "/analyze", payload_critical)
print(f"Status : {s}")
print(json.dumps(analyze_c, indent=2))

# ── POST /decide/approved ─────────────────────────────────────────────
sep("POST /decide/approved  [attach verdict to latest entry]")
s, b = req("POST", "/decide/approved")
print(f"Status : {s}")
print(json.dumps(b, indent=2))

# ── POST /decide/overridden ───────────────────────────────────────────
# First add another analyze call so we can override it
req("POST", "/analyze", payload_warning)
sep("POST /decide/overridden  [physician override]")
s, b = req("POST", "/decide/overridden")
print(f"Status : {s}")
print(json.dumps(b, indent=2))

# ── POST /decide/maybe — invalid choice, expects 422 ─────────────────
sep("POST /decide/maybe  [invalid choice -> expect 422]")
s, b = req("POST", "/decide/maybe")
print(f"Status : {s}  (expected 422)")
print(json.dumps(b, indent=2))

# ── GET /audit ────────────────────────────────────────────────────────
sep("GET /audit  [latest 15 entries, newest first]")
s, entries = req("GET", "/audit")
print(f"Status : {s}  |  Entries returned: {len(entries)}")
for e in entries:
    verdict = e["physician_verdict"] or "pending"
    blocked = "[BLOCKED]" if e["drug_blocked"] else ""
    print(
        f"  [{e['patient_id']}]  risk={e['predicted_risk']:<8}  "
        f"conf={e['confidence']:.2f}  safe={str(e['safe']):<5}  "
        f"verdict={verdict:<12}  {blocked}"
    )

print("\n" + "=" * 65)
print("  Phase 2 — All endpoint verifications COMPLETE.")
print("=" * 65)
