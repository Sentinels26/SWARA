import os

content_to_add = """

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

"""

with open("/Users/macbookair/Documents/swara1/backend/main.py", "a") as f:
    f.write(content_to_add)

print("Dashboard routes added to main.py")
