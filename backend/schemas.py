from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str # SURVIVOR or PROFESSIONAL
    full_name: str
    referral_token: Optional[str] = None # required if SURVIVOR

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Professional & Survivor Profiles ---
class ProfessionalProfileOut(BaseModel):
    full_name: str
    specialization: Optional[str]
    organization: Optional[str]
    class Config:
        orm_mode = True

class SurvivorProfileOut(BaseModel):
    full_name: str
    nickname: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = "en"
    voice_language: Optional[str] = "en"
    profile_picture_url: Optional[str] = None
    
    onboarding_completed: Optional[bool] = False
    consent_completed: Optional[bool] = False
    permissions_reviewed: Optional[bool] = False
    profile_completed: Optional[bool] = False
    
    check_in_streak: Optional[int] = 0
    longest_streak: Optional[int] = 0
    total_check_ins: Optional[int] = 0
    last_check_in_date: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class SurvivorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    voice_language: Optional[str] = None
    profile_picture_url: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    consent_completed: Optional[bool] = None
    permissions_reviewed: Optional[bool] = None
    profile_completed: Optional[bool] = None

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    professional_profile: Optional[ProfessionalProfileOut]
    survivor_profile: Optional[SurvivorProfileOut]
    class Config:
        orm_mode = True

# --- Referral ---
class ReferralCreate(BaseModel):
    pass # Currently generates token on backend

class ReferralOut(BaseModel):
    id: int
    token: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    class Config:
        orm_mode = True

# --- Case & Check-In ---
class CaseOut(BaseModel):
    id: int
    survivor_id: int
    professional_id: int
    survivor_alias: Optional[str]
    status: str
    support_context: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    class Config:
        orm_mode = True

class CheckInCreate(BaseModel):
    distress_level: int
    sleep_quality: int
    activity_level: int
    support_priority: Optional[str] = "STABLE"

class CheckInOut(BaseModel):
    id: int
    case_id: int
    distress_level: int
    sleep_quality: int
    activity_level: int
    support_priority: str
    why_explanation: Optional[str]
    timestamp: datetime
    class Config:
        orm_mode = True

class BaselineOut(BaseModel):
    id: int
    case_id: int
    avg_distress: float
    avg_sleep: float
    activity_level: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    class Config:
        orm_mode = True

class ActionLogCreate(BaseModel):
    action_type: str
    notes: str

class ActionLogOut(BaseModel):
    id: int
    case_id: int
    professional_id: int
    action_type: str
    notes: str
    timestamp: datetime
    class Config:
        orm_mode = True

class ConsentOut(BaseModel):
    id: int
    consent_type: str
    status: str
    timestamp: datetime
    class Config:
        orm_mode = True

class ConsentCreate(BaseModel):
    consent_type: str
    status: str

class BaselineCreate(BaseModel):
    avg_distress: float
    avg_sleep: float
    activity_level: str

class AlertOut(BaseModel):
    id: int
    case_id: int
    alert_type: str
    message: str
    is_read: bool
    timestamp: datetime
    class Config:
        orm_mode = True

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    details: str
    timestamp: datetime
    class Config:
        orm_mode = True


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

class AIAnalysisOut(BaseModel):
    id: int
    case_id: int
    checkin_id: int
    provider: Optional[str] = None
    model: Optional[str] = None
    prompt_version: Optional[str] = None
    status: str
    structured_analysis: Optional[str] = None
    evidence: Optional[str] = None
    uncertainty: Optional[str] = None
    error_info: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        orm_mode = True

class JourneyAnalysisOut(BaseModel):
    baselineStatus: str
    dimensions: List[str]
    sustainedChanges: List[str]
    whatChanged: List[str]
    whatRemainedStable: List[str]
    supportingObservations: List[str]

class AIMessageCreate(BaseModel):
    conversation_id: int
    message: str
    client_request_id: Optional[str] = None  # Idempotency key from frontend

class AIMessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_role: str
    message: str
    timestamp: datetime
    language: str
    class Config:
        orm_mode = True

class AIConversationOut(BaseModel):
    id: int
    case_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    status: str
    class Config:
        orm_mode = True

# --- Appointment ---
class AppointmentCreate(BaseModel):
    case_id: int
    scheduled_time: datetime
    duration_minutes: Optional[int] = 45
    title: str
    type: Optional[str] = "VIDEO"

class AppointmentOut(BaseModel):
    id: int
    case_id: int
    professional_id: int
    survivor_id: int
    scheduled_time: datetime
    duration_minutes: int
    title: str
    status: str
    type: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    class Config:
        orm_mode = True

class AlertOut(BaseModel):
    id: int
    case_id: int
    alert_type: str
    message: str
    is_read: bool
    timestamp: datetime
    class Config:
        orm_mode = True

class CaseEventBase(BaseModel):
    category: str
    description: str
    is_relevant: bool = True

class CaseEventCreate(CaseEventBase):
    pass

class CaseEventOut(CaseEventBase):
    id: int
    case_id: int
    timestamp: datetime
    created_by: int
    class Config:
        orm_mode = True

class InterventionBase(BaseModel):
    type: str
    status: str = "Recommended"
    notes: str
    outcome: Optional[str] = None
    next_follow_up: Optional[datetime] = None

class InterventionCreate(InterventionBase):
    pass

class InterventionOut(InterventionBase):
    id: int
    case_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    class Config:
        orm_mode = True

class ProfessionalDashboardOut(BaseModel):
    activeCases: int
    casesNeedingAttention: int
    todayAppointments: int
    totalCasesHandled: int
    recentAlerts: List[AlertOut]
    upcomingAppointments: List[AppointmentOut]
    recentActivity: List[ActionLogOut]

class SurvivorDashboardOut(BaseModel):
    totalCases: int
    currentSupportState: str
    recentAlerts: List[AlertOut]
    upcomingAppointments: List[AppointmentOut]
    recentActivity: List[CheckInOut]
