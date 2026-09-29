import secrets
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import logging

import models
import schemas
import auth
from database import engine, get_db, SessionLocal
import llm_provider
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Configure logging so Gemini/AI diagnostics are visible in the uvicorn console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


app = FastAPI(title="SWARA API - Secure Foundation")

# ── CORS ─────────────────────────────────────────────────────────────────────
# In production set CORS_ORIGINS to your Vercel frontend URL, e.g.:
#   CORS_ORIGINS=https://your-app.vercel.app
# Multiple origins can be comma-separated.
_raw_origins = os.getenv("CORS_ORIGINS", "*")
if _raw_origins == "*":
    _allowed_origins = ["*"]
else:
    _allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def log_audit(db: Session, action: str, details: str, user_id: int = None):
    audit = models.AuditLog(user_id=user_id, action=action, details=details)
    db.add(audit)
    db.commit()

@app.get("/")
def read_root():
    return {"message": "SWARA Backend Secure Foundation is running"}

@app.get("/health")
def health_check():
    """Lightweight health check — confirms API is alive and DB is reachable."""
    from database import health_check_db
    db_ok = health_check_db()
    return {
        "status": "ok" if db_ok else "degraded",
        "api": True,
        "database": db_ok,
    }

# --- AUTHENTICATION ---

@app.post("/api/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if user.role == "PROFESSIONAL":
        prof = models.ProfessionalProfile(user_id=new_user.id, full_name=user.full_name)
        db.add(prof)
    elif user.role == "SURVIVOR":
        surv = models.SurvivorProfile(user_id=new_user.id, full_name=user.full_name)
        db.add(surv)
        if user.referral_token:
            ref = db.query(models.Referral).filter(models.Referral.token == user.referral_token).first()
            if ref and ref.status == "PENDING":
                ref.status = "ACCEPTED"
                new_case = models.Case(
                    survivor_id=new_user.id,
                    professional_id=ref.professional_id,
                    survivor_alias=user.full_name
                )
                db.add(new_case)
                db.commit()
                log_audit(db, "REFERRAL_ACCEPTED", f"Case {new_case.id} created", new_user.id)
            else:
                raise HTTPException(status_code=400, detail="Invalid or expired referral token")
    
    db.commit()
    db.refresh(new_user)
    log_audit(db, "USER_REGISTERED", f"Role: {user.role}", new_user.id)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role}
    )
    log_audit(db, "USER_LOGIN", "Successful login", user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/logout")
def logout(token_data: dict = Depends(auth.get_current_user_token)):
    # In a fully stateless JWT setup without a blacklist, the client destroys the token.
    # This endpoint confirms the backend received the logout event (useful for audit logging).
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def read_users_me(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == token_data["user_id"]).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/auth/me/profile", response_model=schemas.SurvivorProfileOut)
def update_user_profile(profile: schemas.SurvivorProfileUpdate, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Only survivors can update their survivor profile via this endpoint")
        
    user = db.query(models.User).filter(models.User.id == token_data["user_id"]).first()
    if user is None or user.survivor_profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    surv_profile = user.survivor_profile
    if profile.full_name is not None:
        surv_profile.full_name = profile.full_name
    if profile.nickname is not None:
        surv_profile.nickname = profile.nickname
    if profile.phone is not None:
        surv_profile.phone = profile.phone
    if profile.preferred_language is not None:
        surv_profile.preferred_language = profile.preferred_language
    if profile.voice_language is not None:
        surv_profile.voice_language = profile.voice_language
    if profile.profile_picture_url is not None:
        surv_profile.profile_picture_url = profile.profile_picture_url
    if profile.onboarding_completed is not None:
        surv_profile.onboarding_completed = profile.onboarding_completed
    if profile.consent_completed is not None:
        surv_profile.consent_completed = profile.consent_completed
    if profile.permissions_reviewed is not None:
        surv_profile.permissions_reviewed = profile.permissions_reviewed
    if profile.profile_completed is not None:
        surv_profile.profile_completed = profile.profile_completed
        
    db.commit()
    db.refresh(surv_profile)
    log_audit(db, "PROFILE_UPDATED", "Survivor profile updated", user.id)
    return surv_profile

# --- REFERRALS ---
@app.post("/api/referrals/", response_model=schemas.ReferralOut)
def create_referral(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "PROFESSIONAL":
        raise HTTPException(status_code=403, detail="Only professionals can create referrals")
    
    token = secrets.token_urlsafe(16)
    ref = models.Referral(professional_id=token_data["user_id"], token=token)
    db.add(ref)
    db.commit()
    db.refresh(ref)
    
    log_audit(db, "REFERRAL_CREATED", f"Referral ID: {ref.id}", token_data["user_id"])
    return ref

# --- CASES ---

@app.get("/cases/", response_model=List[schemas.CaseOut])
def read_cases(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] == "PROFESSIONAL":
        return db.query(models.Case).filter(models.Case.professional_id == token_data["user_id"]).all()
    elif token_data["role"] == "SURVIVOR":
        return db.query(models.Case).filter(models.Case.survivor_id == token_data["user_id"]).all()
    return []

@app.get("/cases/detail/{case_id}")
def get_case_detail(case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this case")
    
    baseline = db.query(models.Baseline).filter(models.Baseline.case_id == case.id).first()
    checkins = db.query(models.CheckIn).filter(models.CheckIn.case_id == case.id).order_by(models.CheckIn.timestamp.desc()).all()
    actions = db.query(models.ActionLog).filter(models.ActionLog.case_id == case.id).order_by(models.ActionLog.timestamp.desc()).all()
    consents = db.query(models.Consent).filter(models.Consent.case_id == case.id).all()
    alerts = db.query(models.Alert).filter(models.Alert.case_id == case.id).order_by(models.Alert.timestamp.desc()).all()

    return {
        "case": case,
        "baseline": baseline,
        "checkins": checkins,
        "actions": actions,
        "consents": consents,
        "alerts": alerts
    }

# --- CONSENT ---
@app.post("/consents/", response_model=schemas.ConsentOut)
def update_consent(consent: schemas.ConsentCreate, case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Only survivors can set consent")
        
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case or case.survivor_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db_consent = db.query(models.Consent).filter(models.Consent.case_id == case_id, models.Consent.consent_type == consent.consent_type).first()
    if db_consent:
        db_consent.status = consent.status
    else:
        db_consent = models.Consent(case_id=case_id, consent_type=consent.consent_type, status=consent.status)
        db.add(db_consent)
        
    db.commit()
    db.refresh(db_consent)
    log_audit(db, "CONSENT_UPDATED", f"{consent.consent_type}: {consent.status}", token_data["user_id"])
    return db_consent

# --- ASSESSMENT & BASELINE ---
@app.post("/baselines/", response_model=schemas.BaselineOut)
def create_baseline(baseline: schemas.BaselineCreate, case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Only survivors can set baseline")
        
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case or case.survivor_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db_baseline = db.query(models.Baseline).filter(models.Baseline.case_id == case_id).first()
    if db_baseline:
        db_baseline.avg_distress = baseline.avg_distress
        db_baseline.avg_sleep = baseline.avg_sleep
        db_baseline.activity_level = baseline.activity_level
    else:
        db_baseline = models.Baseline(case_id=case_id, avg_distress=baseline.avg_distress, avg_sleep=baseline.avg_sleep, activity_level=baseline.activity_level)
        db.add(db_baseline)
        
    db.commit()
    db.refresh(db_baseline)
    log_audit(db, "ASSESSMENT_SUBMITTED", f"Baseline updated for case {case_id}", token_data["user_id"])
    return db_baseline

# --- THE WHY ENGINE (CHECK-INS) ---
def calculate_priority_and_why(distress: int, sleep: int, baseline: models.Baseline):
    if not baseline:
        return "STABLE", "No baseline set. Defaulting to STABLE."

    distress_diff = distress - baseline.avg_distress
    sleep_diff = baseline.avg_sleep - sleep

    why = []
    priority = "STABLE"

    if distress_diff >= 4 or distress >= 8:
        priority = "HIGH PRIORITY"
        why.append(f"Distress is critical (Level {distress}).")
    elif distress_diff >= 2:
        priority = "ELEVATED"
        why.append(f"Distress is elevated (+{distress_diff} from baseline).")

    if sleep_diff >= 3 or sleep <= 3:
        if priority == "STABLE":
            priority = "OBSERVE"
        why.append(f"Sleep is severely disrupted ({sleep} hrs).")

    if not why:
        why.append("Signals are consistent with baseline.")
        
    return priority, " ".join(why)

def process_ai_analysis(case_id: int, checkin_id: int, checkin_data: dict, baseline_data: dict, recent_checkins: list, priority: str, why: str):
    db = SessionLocal()
    try:
        analysis = models.AIAnalysis(
            case_id=case_id,
            checkin_id=checkin_id,
            provider=os.getenv("LLM_PROVIDER", "MOCK"),
            model=os.getenv("LLM_MODEL", "gemini-2.5-flash"),
            prompt_version="SWARA_ANALYSIS_V1",
            status="PROCESSING"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # We fetch the actual checkin and case so the service can use them
        case = db.query(models.Case).filter(models.Case.id == case_id).first()
        checkin = db.query(models.CheckIn).filter(models.CheckIn.id == checkin_id).first()
        
        try:
            from swara_ai_service import SwaraAIService
            ai_service = SwaraAIService(db)
            result = ai_service.analyzeCheckIn(checkin, case)
            
            if result:
                analysis.structured_analysis = json.dumps(result)
                analysis.evidence = json.dumps(result.get("supporting_evidence", []))
                analysis.uncertainty = json.dumps(result.get("uncertainty", []))
            analysis.status = "COMPLETED"
        except Exception as e:
            analysis.status = "FAILED"
            analysis.error_info = str(e)
            
        db.commit()
    finally:
        db.close()

@app.post("/checkins/", response_model=schemas.CheckInOut)
def create_checkin(checkin: schemas.CheckInCreate, background_tasks: BackgroundTasks, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Only survivors can check in")
        
    case = db.query(models.Case).filter(models.Case.survivor_id == token_data["user_id"]).first()
    if not case:
        raise HTTPException(status_code=404, detail="No active case found for survivor")
        
    baseline = db.query(models.Baseline).filter(models.Baseline.case_id == case.id).first()
    priority, why = calculate_priority_and_why(checkin.distress_level, checkin.sleep_quality, baseline)
    
    db_checkin = models.CheckIn(
        case_id=case.id,
        distress_level=checkin.distress_level,
        sleep_quality=checkin.sleep_quality,
        activity_level=checkin.activity_level,
        support_priority=priority,
        why_explanation=why
    )
    db.add(db_checkin)
    
    # Priority change alert
    if priority in ["ELEVATED", "HIGH PRIORITY"]:
        alert = models.Alert(case_id=case.id, alert_type="PRIORITY_CHANGE", message=f"Priority changed to {priority}")
        db.add(alert)
        log_audit(db, "SAFETY_EVENT", f"Priority escalated to {priority}", token_data["user_id"])
        
    # Update Survivor Profile streak
    surv_profile = db.query(models.SurvivorProfile).filter(models.SurvivorProfile.user_id == token_data["user_id"]).first()
    if surv_profile:
        surv_profile.total_check_ins = (surv_profile.total_check_ins or 0) + 1
        now = datetime.utcnow()
        if surv_profile.last_check_in_date:
            last_date = surv_profile.last_check_in_date.date()
            now_date = now.date()
            delta_days = (now_date - last_date).days
            if delta_days == 1:
                surv_profile.check_in_streak = (surv_profile.check_in_streak or 0) + 1
            elif delta_days > 1:
                surv_profile.check_in_streak = 1
        else:
            surv_profile.check_in_streak = 1
            
        if (surv_profile.check_in_streak or 0) > (surv_profile.longest_streak or 0):
            surv_profile.longest_streak = surv_profile.check_in_streak
            
        surv_profile.last_check_in_date = now

    db.commit()
    db.refresh(db_checkin)
    
    # Extract data for AI
    checkin_data = {"distress": checkin.distress_level, "sleep": checkin.sleep_quality, "activity": checkin.activity_level}
    baseline_data = {"avg_distress": baseline.avg_distress, "avg_sleep": baseline.avg_sleep} if baseline else {}
    recent_qs = db.query(models.CheckIn).filter(models.CheckIn.case_id == case.id).order_by(models.CheckIn.timestamp.desc()).limit(5).all()
    recent_checkins = [{"distress": r.distress_level, "sleep": r.sleep_quality} for r in recent_qs]
    
    background_tasks.add_task(process_ai_analysis, case.id, db_checkin.id, checkin_data, baseline_data, recent_checkins, priority, why)
    
    log_audit(db, "CHECKIN_SUBMITTED", f"Checkin ID {db_checkin.id} (Priority: {priority})", token_data["user_id"])
    return db_checkin

@app.get("/checkins/{case_id}", response_model=List[schemas.CheckInOut])
def read_checkins(case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return db.query(models.CheckIn).filter(models.CheckIn.case_id == case.id).order_by(models.CheckIn.timestamp.desc()).all()


# --- SAFETY PLAN ---
@app.get("/safety-plan/{case_id}", response_model=schemas.SafetyPlanOut)
def get_safety_plan(case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    plan = db.query(models.SafetyPlan).filter(models.SafetyPlan.case_id == case_id).first()
    if not plan:
        # Return empty plan object if not found
        plan = models.SafetyPlan(case_id=case_id)
        db.add(plan)
        db.commit()
        db.refresh(plan)
    return plan

@app.put("/safety-plan/{case_id}", response_model=schemas.SafetyPlanOut)
def update_safety_plan(case_id: int, plan_update: schemas.SafetyPlanCreate, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    plan = db.query(models.SafetyPlan).filter(models.SafetyPlan.case_id == case_id).first()
    if not plan:
        plan = models.SafetyPlan(case_id=case_id)
        db.add(plan)
        
    plan.warning_signs = plan_update.warning_signs
    plan.coping_strategies = plan_update.coping_strategies
    plan.trusted_contacts = plan_update.trusted_contacts
    plan.safe_places = plan_update.safe_places
    plan.reasons_to_reach_out = plan_update.reasons_to_reach_out
    plan.status = plan_update.status
    
    db.commit()
    db.refresh(plan)
    log_audit(db, "SAFETY_PLAN_UPDATE", f"Safety Plan updated for case {case_id}", user_id)
    return plan

# --- AI ANALYSIS ---
@app.get("/analysis/{case_id}", response_model=List[schemas.AIAnalysisOut])
def read_ai_analysis(case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return db.query(models.AIAnalysis).filter(models.AIAnalysis.case_id == case_id).order_by(models.AIAnalysis.created_at.desc()).all()

@app.get("/journey/{case_id}/analysis", response_model=schemas.JourneyAnalysisOut)
def get_journey_analysis(case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    baseline = db.query(models.Baseline).filter(models.Baseline.case_id == case_id).first()
    recent_qs = db.query(models.CheckIn).filter(models.CheckIn.case_id == case_id).order_by(models.CheckIn.timestamp.desc()).limit(14).all()
    
    # Conversations
    convs = db.query(models.AIConversation).filter(models.AIConversation.case_id == case_id).all()
    # (Simplified context collection)
    
    context = {
        "has_baseline": baseline is not None,
        "recent_checkins": [{"distress": r.distress_level, "sleep": r.sleep_quality, "activity": r.activity_level} for r in recent_qs]
    }
    
    try:
        from swara_ai_service import SwaraAIService
        ai_service = SwaraAIService(db)
        result = ai_service.provider.analyze_journey(context)
        return result
    except Exception as e:
        # Fallback if error
        return {
            "baselineStatus": "Established" if baseline else "Building",
            "dimensions": ["Sleep", "Distress", "Energy"],
            "sustainedChanges": ["Unable to fetch AI analysis."],
            "whatChanged": ["Please try again later."],
            "whatRemainedStable": ["System stable."],
            "supportingObservations": ["SWARA provides supportive pattern insights, not a clinical diagnosis."]
        }

# --- PROFESSIONAL ACTIONS ---

@app.post("/actions/", response_model=schemas.ActionLogOut)
def log_action(action: schemas.ActionLogCreate, case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "PROFESSIONAL":
        raise HTTPException(status_code=403, detail="Only professionals can log actions")
        
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case or case.professional_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    db_action = models.ActionLog(
        case_id=case_id,
        professional_id=token_data["user_id"],
        action_type=action.action_type,
        notes=action.notes
    )
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    log_audit(db, "PROFESSIONAL_ACTION", f"{action.action_type} on case {case_id}", token_data["user_id"])
    return db_action

@app.get("/actions/{case_id}", response_model=List[schemas.ActionLogOut])
def read_actions(case_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return db.query(models.ActionLog).filter(models.ActionLog.case_id == case_id).all()

# --- ALERTS & WORKFLOWS ---
@app.get("/alerts/", response_model=List[schemas.AlertOut])
def get_alerts(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] == "PROFESSIONAL":
        cases = db.query(models.Case).filter(models.Case.professional_id == token_data["user_id"]).all()
    elif token_data["role"] == "SURVIVOR":
        cases = db.query(models.Case).filter(models.Case.survivor_id == token_data["user_id"]).all()
    else:
        return []
        
    case_ids = [c.id for c in cases]
    return db.query(models.Alert).filter(models.Alert.case_id.in_(case_ids)).order_by(models.Alert.timestamp.desc()).all()

@app.post("/alerts/trigger_missed_checkin/{case_id}")
def trigger_missed_checkin(case_id: int, db: Session = Depends(get_db)):
    # This simulates a background cron job detecting a missed checkin
    alert = models.Alert(case_id=case_id, alert_type="MISSED_CHECKIN", message="Scheduled check-in missed")
    db.add(alert)
    db.commit()
    log_audit(db, "ALERT_TRIGGERED", f"Missed check-in for case {case_id}", None)
    return {"message": "Missed check-in alert created"}

@app.post("/alerts/trigger_sos/")
def trigger_sos(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Unauthorized")
    case = db.query(models.Case).filter(models.Case.survivor_id == token_data["user_id"]).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    alert = models.Alert(case_id=case.id, alert_type="SAFETY_CONCERN", message="Survivor triggered SOS")
    db.add(alert)
    db.commit()
    log_audit(db, "SAFETY_EVENT", f"SOS Triggered for case {case.id}", token_data["user_id"])
    return {"message": "Emergency protocol activated"}

# --- AI CHAT SYSTEM ---
@app.post("/chat/conversation", response_model=schemas.AIConversationOut)
def start_or_get_conversation(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Only survivors can chat with SWARA")
    
    case = db.query(models.Case).filter(models.Case.survivor_id == token_data["user_id"]).first()
    if not case:
        raise HTTPException(status_code=404, detail="No active case found")
        
    active_conv = db.query(models.AIConversation).filter(
        models.AIConversation.case_id == case.id, 
        models.AIConversation.status == "ACTIVE"
    ).first()
    
    if not active_conv:
        active_conv = models.AIConversation(case_id=case.id)
        db.add(active_conv)
        db.commit()
        db.refresh(active_conv)
        
    return active_conv

@app.get("/chat/conversation/{conversation_id}/messages", response_model=List[schemas.AIMessageOut])
def get_chat_history(conversation_id: int, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    conv = db.query(models.AIConversation).filter(models.AIConversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    case = db.query(models.Case).filter(models.Case.id == conv.case_id).first()
    user_id = token_data["user_id"]
    if case.survivor_id != user_id and case.professional_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return db.query(models.AIMessage).filter(models.AIMessage.conversation_id == conversation_id).order_by(models.AIMessage.timestamp.asc()).all()

@app.post("/chat/message", response_model=schemas.AIMessageOut)
def send_chat_message(message: schemas.AIMessageCreate, background_tasks: BackgroundTasks, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Only survivors can chat with SWARA")
        
    # Verify conversation exists and belongs to this user's case
    conv = db.query(models.AIConversation).filter(
        models.AIConversation.id == message.conversation_id,
        models.AIConversation.status == "ACTIVE"
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or not active")
    
    # Verify ownership: the conversation's case must belong to this survivor
    case = db.query(models.Case).filter(
        models.Case.id == conv.case_id,
        models.Case.survivor_id == token_data["user_id"]
    ).first()
    if not case:
        raise HTTPException(status_code=403, detail="Unauthorized: This conversation does not belong to you")
        
    # Delegate to SwaraAIService with the verified conversation object
    from swara_ai_service import SwaraAIService
    ai_service = SwaraAIService(db)
    # chat() now returns the saved AIMessage ORM object directly
    ai_msg = ai_service.chat(message.message, conv, case, background_tasks=background_tasks)

    return ai_msg


# --- APPOINTMENTS ---
@app.post("/appointments/", response_model=schemas.AppointmentOut)
def create_appointment(appt: schemas.AppointmentCreate, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    # Both SURVIVOR and PROFESSIONAL can create appointments
    if token_data["role"] == "PROFESSIONAL":
        case = db.query(models.Case).filter(models.Case.id == appt.case_id, models.Case.professional_id == token_data["user_id"]).first()
    else:
        case = db.query(models.Case).filter(models.Case.id == appt.case_id, models.Case.survivor_id == token_data["user_id"]).first()
        
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")
        
    # Check double booking for the professional or survivor
    conflict = db.query(models.Appointment).filter(
        models.Appointment.status.in_(["SCHEDULED"]),
        models.Appointment.scheduled_time == appt.scheduled_time,
        (models.Appointment.professional_id == case.professional_id) | (models.Appointment.survivor_id == case.survivor_id)
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="That time is no longer available.")
        
    db_appt = models.Appointment(
        case_id=case.id,
        professional_id=case.professional_id,
        survivor_id=case.survivor_id,
        scheduled_time=appt.scheduled_time,
        duration_minutes=appt.duration_minutes,
        title=appt.title,
        type=appt.type,
        created_by=token_data["role"]
    )
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    
    # Create notification
    creator = "Your professional" if token_data["role"] == "PROFESSIONAL" else "The survivor"
    alert = models.Alert(
        case_id=case.id,
        alert_type="SYSTEM",
        message=f"{creator} scheduled a new appointment: {appt.title} on {appt.scheduled_time.strftime('%b %d, %Y %H:%M')}"
    )
    db.add(alert)
    
    log_audit(db, "APPOINTMENT_CREATED", f"Appointment {db_appt.id} for case {case.id}", token_data["user_id"])
    db.commit()
    return db_appt

@app.put("/appointments/{appt_id}", response_model=schemas.AppointmentOut)
def update_appointment(appt_id: int, appt_update: schemas.AppointmentCreate, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    db_appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Verify auth
    if token_data["role"] == "PROFESSIONAL" and db_appt.professional_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if token_data["role"] == "SURVIVOR" and db_appt.survivor_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # Check double booking if time changed
    if db_appt.scheduled_time != appt_update.scheduled_time:
        conflict = db.query(models.Appointment).filter(
            models.Appointment.id != appt_id,
            models.Appointment.status.in_(["SCHEDULED"]),
            models.Appointment.scheduled_time == appt_update.scheduled_time,
            (models.Appointment.professional_id == db_appt.professional_id) | (models.Appointment.survivor_id == db_appt.survivor_id)
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="That time is no longer available.")
            
    db_appt.scheduled_time = appt_update.scheduled_time
    db_appt.duration_minutes = appt_update.duration_minutes
    db_appt.title = appt_update.title
    db_appt.type = appt_update.type
    from datetime import datetime
    db_appt.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_appt)
    return db_appt

@app.patch("/appointments/{appt_id}/status", response_model=schemas.AppointmentOut)
def update_appointment_status(appt_id: int, status: str, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    db_appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if token_data["role"] == "PROFESSIONAL" and db_appt.professional_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if token_data["role"] == "SURVIVOR" and db_appt.survivor_id != token_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if status not in ["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    db_appt.status = status
    from datetime import datetime
    db_appt.updated_at = datetime.utcnow()
    
    # Notify
    updater = "Professional" if token_data["role"] == "PROFESSIONAL" else "Survivor"
    alert = models.Alert(
        case_id=db_appt.case_id,
        alert_type="SYSTEM",
        message=f"{updater} marked appointment {db_appt.title} as {status}"
    )
    db.add(alert)
    
    db.commit()
    db.refresh(db_appt)
    return db_appt

@app.get("/appointments/", response_model=List[schemas.AppointmentOut])

def get_appointments(token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
    if token_data["role"] == "PROFESSIONAL":
        return db.query(models.Appointment).filter(models.Appointment.professional_id == token_data["user_id"]).order_by(models.Appointment.scheduled_time.asc()).all()
    elif token_data["role"] == "SURVIVOR":
        return db.query(models.Appointment).filter(models.Appointment.survivor_id == token_data["user_id"]).order_by(models.Appointment.scheduled_time.asc()).all()
    return []

# NOTE: /alerts/ is defined earlier in the file (line ~516). The duplicate is removed here.


# ================= NOTIFICATIONS ================= #
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationOut(BaseModel):
    id: int
    category: str
    title: str
    content: str
    is_read: bool
    timestamp: datetime
    class Config:
        orm_mode = True

@app.get('/api/notifications', response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    return db.query(models.Notification).filter(models.Notification.user_id == token_data['user_id']).order_by(models.Notification.timestamp.desc()).all()

@app.put('/api/notifications/{notification_id}/read')
def mark_notification_read(notification_id: int, db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id, models.Notification.user_id == token_data['user_id']).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {'status': 'success'}

@app.put('/api/notifications/read-all')
def mark_all_notifications_read(db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    db.query(models.Notification).filter(models.Notification.user_id == token_data['user_id']).update({'is_read': True})
    db.commit()
    return {'status': 'success'}

# ================= AUDIT LOGS ================= #
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    details: str
    timestamp: datetime
    class Config:
        orm_mode = True

@app.get('/api/audit-logs', response_model=List[AuditLogOut])
def get_audit_logs(db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    if token_data["role"] != "PROFESSIONAL":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(models.AuditLog).filter(models.AuditLog.user_id == token_data["user_id"]).order_by(models.AuditLog.timestamp.desc()).all()

# ================= CASE EVENTS ================= #
@app.get('/api/cases/{case_id}/events', response_model=List[schemas.CaseEventOut])
def get_case_events(case_id: int, db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(models.CaseEvent).filter(models.CaseEvent.case_id == case_id).order_by(models.CaseEvent.timestamp.desc()).all()

@app.post('/api/cases/{case_id}/events', response_model=schemas.CaseEventOut)
def create_case_event(case_id: int, event: schemas.CaseEventCreate, db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    if token_data["role"] != "PROFESSIONAL":
        raise HTTPException(status_code=403, detail="Only professionals can log case events")
    case = db.query(models.Case).filter(models.Case.id == case_id, models.Case.professional_id == token_data["user_id"]).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")
    
    db_event = models.CaseEvent(
        case_id=case_id,
        category=event.category,
        description=event.description,
        is_relevant=event.is_relevant,
        created_by=token_data["user_id"]
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    log_audit(db, "CASE_EVENT_CREATED", f"Event logged for case {case_id}", token_data["user_id"])
    return db_event

# ================= INTERVENTIONS ================= #
@app.get('/api/cases/{case_id}/interventions', response_model=List[schemas.InterventionOut])
def get_interventions(case_id: int, db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    user_id = token_data["user_id"]
    if case.professional_id != user_id and case.survivor_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(models.Intervention).filter(models.Intervention.case_id == case_id).order_by(models.Intervention.created_at.desc()).all()

@app.post('/api/cases/{case_id}/interventions', response_model=schemas.InterventionOut)
def create_intervention(case_id: int, intervention: schemas.InterventionCreate, db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    if token_data["role"] != "PROFESSIONAL":
        raise HTTPException(status_code=403, detail="Only professionals can add interventions")
    case = db.query(models.Case).filter(models.Case.id == case_id, models.Case.professional_id == token_data["user_id"]).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")
    
    db_intervention = models.Intervention(
        case_id=case_id,
        type=intervention.type,
        status=intervention.status,
        notes=intervention.notes,
        outcome=intervention.outcome,
        next_follow_up=intervention.next_follow_up,
        created_by=token_data["user_id"]
    )
    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)
    log_audit(db, "INTERVENTION_CREATED", f"Intervention added to case {case_id}", token_data["user_id"])
    return db_intervention


# ================= DASHBOARDS ================= #

@app.get('/api/dashboard/professional', response_model=schemas.ProfessionalDashboardOut)
def get_professional_dashboard(db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    if token_data["role"] != "PROFESSIONAL":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    user_id = token_data["user_id"]
    
    # Active Cases
    active_cases = db.query(models.Case).filter(models.Case.professional_id == user_id, models.Case.status == "ACTIVE").count()
    
    # Total Cases Handled
    total_cases = db.query(models.Case).filter(models.Case.professional_id == user_id).count()
    
    # Cases Needing Attention (Assuming support_priority ELEVATED or HIGH PRIORITY)
    case_ids_qs = db.query(models.Case.id).filter(models.Case.professional_id == user_id, models.Case.status == "ACTIVE").all()
    case_ids = [c[0] for c in case_ids_qs]
    
    attention_cases = 0
    if case_ids:
        # Get latest checkin for each active case
        # (simplified: we count cases that have an alert or checkin indicating priority)
        # We can just count cases where the most recent checkin has high priority
        for cid in case_ids:
            latest_checkin = db.query(models.CheckIn).filter(models.CheckIn.case_id == cid).order_by(models.CheckIn.timestamp.desc()).first()
            if latest_checkin and latest_checkin.support_priority in ["ELEVATED", "HIGH PRIORITY", "Sustained Concern", "Immediate Safety Concern"]:
                attention_cases += 1
                
    # Appointments Today
    from datetime import datetime, date
    today = date.today()
    today_appointments = db.query(models.Appointment).filter(
        models.Appointment.professional_id == user_id,
        models.Appointment.status.in_(["SCHEDULED", "CONFIRMED", "REQUESTED", "RESCHEDULED"])
    ).filter(
        models.Appointment.scheduled_time >= datetime.combine(today, datetime.min.time()),
        models.Appointment.scheduled_time <= datetime.combine(today, datetime.max.time())
    ).count()
    
    # Upcoming Appointments
    upcoming_appointments = db.query(models.Appointment).filter(
        models.Appointment.professional_id == user_id,
        models.Appointment.status.in_(["SCHEDULED", "CONFIRMED", "REQUESTED", "RESCHEDULED"]),
        models.Appointment.scheduled_time >= datetime.utcnow()
    ).order_by(models.Appointment.scheduled_time.asc()).limit(5).all()
    
    # Recent Alerts
    recent_alerts = []
    if case_ids:
        recent_alerts = db.query(models.Alert).filter(models.Alert.case_id.in_(case_ids)).order_by(models.Alert.timestamp.desc()).limit(5).all()
        
    # Recent Activity
    recent_activity = db.query(models.ActionLog).filter(models.ActionLog.professional_id == user_id).order_by(models.ActionLog.timestamp.desc()).limit(5).all()

    return {
        "activeCases": active_cases,
        "casesNeedingAttention": attention_cases,
        "todayAppointments": today_appointments,
        "totalCasesHandled": total_cases,
        "recentAlerts": recent_alerts,
        "upcomingAppointments": upcoming_appointments,
        "recentActivity": recent_activity
    }

@app.get('/api/dashboard/survivor', response_model=schemas.SurvivorDashboardOut)
def get_survivor_dashboard(db: Session = Depends(get_db), token_data: dict = Depends(auth.get_current_user_token)):
    if token_data["role"] != "SURVIVOR":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    user_id = token_data["user_id"]
    
    cases = db.query(models.Case).filter(models.Case.survivor_id == user_id).all()
    total_cases = len(cases)
    case_ids = [c.id for c in cases]
    
    current_state = "Stable"
    recent_checkins = []
    
    if case_ids:
        active_case = cases[0] # assume one active case usually
        latest_checkin = db.query(models.CheckIn).filter(models.CheckIn.case_id == active_case.id).order_by(models.CheckIn.timestamp.desc()).first()
        if latest_checkin:
            current_state = latest_checkin.support_priority
            
        recent_checkins = db.query(models.CheckIn).filter(models.CheckIn.case_id == active_case.id).order_by(models.CheckIn.timestamp.desc()).limit(5).all()
            
    recent_alerts = []
    if case_ids:
        recent_alerts = db.query(models.Alert).filter(models.Alert.case_id.in_(case_ids)).order_by(models.Alert.timestamp.desc()).limit(5).all()
        
    from datetime import datetime
    upcoming_appointments = db.query(models.Appointment).filter(
        models.Appointment.survivor_id == user_id,
        models.Appointment.status.in_(["SCHEDULED", "CONFIRMED", "REQUESTED", "RESCHEDULED"]),
        models.Appointment.scheduled_time >= datetime.utcnow()
    ).order_by(models.Appointment.scheduled_time.asc()).limit(5).all()
    
    return {
        "totalCases": total_cases,
        "currentSupportState": current_state,
        "recentAlerts": recent_alerts,
        "upcomingAppointments": upcoming_appointments,
        "recentActivity": recent_checkins
    }

