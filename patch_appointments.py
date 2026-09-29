import re

with open('backend/main.py', 'r') as f:
    content = f.read()

appointments_section = """
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
"""

import re
pattern = re.compile(r'# --- APPOINTMENTS ---.*?@app\.get\("/appointments/", response_model=List\[schemas\.AppointmentOut\]\)', re.DOTALL)
new_content = pattern.sub(appointments_section, content)

with open('backend/main.py', 'w') as f:
    f.write(new_content)
