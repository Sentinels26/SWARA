import requests
import time

BASE_URL = "http://localhost:8001"

def print_step(msg):
    print(f"\n[{msg}]")

# 1. Professional Register
print_step("PROFESSIONAL REGISTER")
res = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": "prof_test@gmail.com",
    "password": "password",
    "role": "PROFESSIONAL",
    "full_name": "Dr. Test Pro"
})
print(res.status_code, res.text)
# if exists, ignore
if res.status_code == 400 and "Email already registered" in res.text:
    print("User already exists, continuing...")

# 2. Professional Login
print_step("PROFESSIONAL LOGIN")
res = requests.post(f"{BASE_URL}/api/auth/login", data={
    "username": "prof_test@gmail.com",
    "password": "password"
})
print(res.status_code, res.json())
prof_token = res.json()["access_token"]
prof_headers = {"Authorization": f"Bearer {prof_token}"}

# 3. Create Referral
print_step("CREATE REFERRAL")
res = requests.post(f"{BASE_URL}/api/referrals/", headers=prof_headers)
print(res.status_code, res.json())
referral_token = res.json()["token"]

# 4. Survivor Register (Accept Referral)
print_step("SURVIVOR REGISTER (Accepts Referral)")
res = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": f"survivor_{referral_token}@gmail.com",
    "password": "password",
    "role": "SURVIVOR",
    "full_name": "Jane Survivor",
    "referral_token": referral_token
})
print(res.status_code, res.json())

# 5. Survivor Login
print_step("SURVIVOR LOGIN")
res = requests.post(f"{BASE_URL}/api/auth/login", data={
    "username": f"survivor_{referral_token}@gmail.com",
    "password": "password"
})
surv_token = res.json()["access_token"]
surv_headers = {"Authorization": f"Bearer {surv_token}"}

# Get Survivor Case ID
res = requests.get(f"{BASE_URL}/cases/", headers=surv_headers)
case_id = res.json()[0]["id"]
print("Survivor Case ID:", case_id)

# 6. Consent
print_step("CONSENT")
res = requests.post(f"{BASE_URL}/consents/?case_id={case_id}", json={
    "consent_type": "DATA_PROCESSING",
    "status": "GRANTED"
}, headers=surv_headers)
print(res.status_code, res.json())

# 7. Assessment & Baseline Created
print_step("ASSESSMENT -> BASELINE")
res = requests.post(f"{BASE_URL}/baselines/?case_id={case_id}", json={
    "avg_distress": 5.0,
    "avg_sleep": 7.0,
    "activity_level": "Moderate"
}, headers=surv_headers)
print(res.status_code, res.json())

# 8. Survivor Check-In
print_step("SURVIVOR CHECK-IN")
res = requests.post(f"{BASE_URL}/checkins/", json={
    "distress_level": 9,
    "sleep_quality": 2,
    "activity_level": 3
}, headers=surv_headers)
print(res.status_code, res.json())
print("Support Priority:", res.json()["support_priority"])
print("Why:", res.json()["why_explanation"])

# 9. Professional Dashboard
print_step("PROFESSIONAL DASHBOARD")
res = requests.get(f"{BASE_URL}/cases/", headers=prof_headers)
print("Professional Cases:", res.json())
res = requests.get(f"{BASE_URL}/checkins/{case_id}", headers=prof_headers)
print("Case Checkins:", res.json())

# 10. Professional Action
print_step("PROFESSIONAL ACTION")
res = requests.post(f"{BASE_URL}/actions/?case_id={case_id}", json={
    "action_type": "CONTACT",
    "notes": "Called survivor to check in due to high distress."
}, headers=prof_headers)
print(res.status_code, res.json())

# 11. Alerts Check
print_step("ALERTS")
res = requests.get(f"{BASE_URL}/alerts/", headers=prof_headers)
print(res.status_code, res.json())

# 12. Auth Test (Survivor tries to access another case or prof endpoints)
print_step("AUTH NEGATIVE TESTING")
# Try to access a different case (e.g. case 1) as this survivor
res = requests.get(f"{BASE_URL}/cases/detail/1", headers=surv_headers)
print("Survivor accessing Case 1:", res.status_code, res.json())

# Try to post action as survivor
res = requests.post(f"{BASE_URL}/actions/?case_id={case_id}", json={
    "action_type": "CONTACT",
    "notes": "test"
}, headers=surv_headers)
print("Survivor calling Prof Action endpoint:", res.status_code, res.json())

# Unauthenticated
res = requests.get(f"{BASE_URL}/cases/detail/{case_id}")
print("Unauthenticated access:", res.status_code, res.json())

print_step("TEST COMPLETE")
