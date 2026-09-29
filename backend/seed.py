from database import SessionLocal
import models
import auth
from datetime import datetime, timedelta

def seed():
    db = SessionLocal()
    
    # 1. Create Professional
    prof_email = "professional@gmail.com"
    prof_user = db.query(models.User).filter(models.User.email == prof_email).first()
    if not prof_user:
        hashed = auth.get_password_hash("password")
        prof_user = models.User(email=prof_email, hashed_password=hashed, role="PROFESSIONAL")
        db.add(prof_user)
        db.commit()
        db.refresh(prof_user)
        
        prof_profile = models.ProfessionalProfile(user_id=prof_user.id, full_name="Dr. Sarah Jenkins", specialization="Trauma Specialist")
        db.add(prof_profile)
        
        # Create an active referral
        ref = models.Referral(professional_id=prof_user.id, token="SEED-TOKEN-123", status="PENDING")
        db.add(ref)
        db.commit()
        db.refresh(ref)
        print("Created Professional User and Referral")
    
    # 2. Create Survivor
    surv_email = "survivor@gmail.com"
    surv_user = db.query(models.User).filter(models.User.email == surv_email).first()
    if not surv_user:
        hashed = auth.get_password_hash("password")
        surv_user = models.User(email=surv_email, hashed_password=hashed, role="SURVIVOR")
        db.add(surv_user)
        db.commit()
        db.refresh(surv_user)
        
        surv_profile = models.SurvivorProfile(user_id=surv_user.id, full_name="Jane Doe", preferred_language="en")
        db.add(surv_profile)
        
        # Accept referral & create case
        ref = db.query(models.Referral).filter(models.Referral.token == "SEED-TOKEN-123").first()
        ref.status = "ACCEPTED"
        
        case = models.Case(
            survivor_id=surv_user.id,
            professional_id=prof_user.id,
            survivor_alias="Jane Doe",
            support_context="Recent trauma, anxiety"
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        print("Created Survivor User and Case")
        
        # 3. Create Consents
        consent = models.Consent(case_id=case.id, consent_type="DATA_PROCESSING")
        db.add(consent)
        
        # 4. Create Baseline
        baseline = models.Baseline(case_id=case.id, avg_distress=3.0, avg_sleep=7.0, activity_level=7)
        db.add(baseline)
        db.commit()
        
        # 5. Create Check-ins (5 days, worsening)
        now = datetime.utcnow()
        checkins = [
            models.CheckIn(case_id=case.id, distress_level=3, sleep_quality=7, activity_level=7, support_priority="STABLE", timestamp=now - timedelta(days=4), why_explanation="Signals are consistent with baseline."),
            models.CheckIn(case_id=case.id, distress_level=4, sleep_quality=6, activity_level=6, support_priority="STABLE", timestamp=now - timedelta(days=3), why_explanation="Signals are consistent with baseline."),
            models.CheckIn(case_id=case.id, distress_level=6, sleep_quality=5, activity_level=4, support_priority="ELEVATED", timestamp=now - timedelta(days=2), why_explanation="Distress is elevated (+3.0 from baseline)."),
            models.CheckIn(case_id=case.id, distress_level=8, sleep_quality=4, activity_level=3, support_priority="HIGH PRIORITY", timestamp=now - timedelta(days=1), why_explanation="Distress is critical (Level 8)."),
            models.CheckIn(case_id=case.id, distress_level=9, sleep_quality=2, activity_level=1, support_priority="HIGH PRIORITY", timestamp=now, why_explanation="Distress is critical (Level 9). Sleep is severely disrupted (2 hrs).")
        ]
        db.add_all(checkins)
        
        # 6. Create Action Log
        action = models.ActionLog(case_id=case.id, professional_id=prof_user.id, action_type="Psychological First Aid Call", notes="Patient reached out. Scheduled immediate zoom session.", timestamp=now)
        db.add(action)
        db.commit()
        print("Seeded check-ins and action logs.")

    db.close()

if __name__ == "__main__":
    seed()
