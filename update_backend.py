import re

# Update models.py
with open('backend/models.py', 'r') as f:
    models_content = f.read()

if 'class SafetyPlan' not in models_content:
    safety_plan_model = """
class SafetyPlan(Base):
    __tablename__ = "safety_plans"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    warning_signs = Column(String, default="[]")  # JSON string
    coping_strategies = Column(String, default="[]") # JSON string
    trusted_contacts = Column(String, default="[]") # JSON string
    safe_places = Column(String, default="[]") # JSON string
    reasons_to_reach_out = Column(String, default="[]") # JSON string
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
"""
    models_content = models_content.replace('class AIAnalysis(Base):', safety_plan_model + '\nclass AIAnalysis(Base):')
    with open('backend/models.py', 'w') as f:
        f.write(models_content)

# Update schemas.py
with open('backend/schemas.py', 'r') as f:
    schemas_content = f.read()

if 'class SafetyPlanBase' not in schemas_content:
    safety_plan_schema = """
class SafetyPlanBase(BaseModel):
    warning_signs: Optional[str] = "[]"
    coping_strategies: Optional[str] = "[]"
    trusted_contacts: Optional[str] = "[]"
    safe_places: Optional[str] = "[]"
    reasons_to_reach_out: Optional[str] = "[]"
    status: Optional[str] = "Active"

class SafetyPlanCreate(SafetyPlanBase):
    pass

class SafetyPlanOut(SafetyPlanBase):
    id: int
    case_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
"""
    schemas_content = schemas_content.replace('class AIAnalysisOut(BaseModel):', safety_plan_schema + '\nclass AIAnalysisOut(BaseModel):')
    with open('backend/schemas.py', 'w') as f:
        f.write(schemas_content)

# Update main.py
with open('backend/main.py', 'r') as f:
    main_content = f.read()

if '@app.get("/safety-plan/{case_id}"' not in main_content:
    safety_plan_api = """
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
"""
    main_content = main_content.replace('# --- AI ANALYSIS ---', safety_plan_api + '\n# --- AI ANALYSIS ---')
    with open('backend/main.py', 'w') as f:
        f.write(main_content)
