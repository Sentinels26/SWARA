from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'SURVIVOR', 'PROFESSIONAL', 'ADMIN'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

    # Relationships
    professional_profile = relationship("ProfessionalProfile", back_populates="user", uselist=False)
    survivor_profile = relationship("SurvivorProfile", back_populates="user", uselist=False)

class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    specialization = Column(String)
    organization = Column(String)
    notification_preferences = Column(String, default="{}")
    
    user = relationship("User", back_populates="professional_profile")

class SurvivorProfile(Base):
    __tablename__ = "survivor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    nickname = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    voice_language = Column(String, default="en")
    profile_picture_url = Column(String, nullable=True)
    notification_preferences = Column(String, default="{}")
    
    # Onboarding State
    onboarding_completed = Column(Boolean, default=False)
    consent_completed = Column(Boolean, default=False)
    permissions_reviewed = Column(Boolean, default=False)
    profile_completed = Column(Boolean, default=False)
    
    # Streak & Journey State
    check_in_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_check_ins = Column(Integer, default=0)
    last_check_in_date = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="survivor_profile")

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    status = Column(String, default="PENDING") # 'PENDING', 'ACCEPTED', 'EXPIRED'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    survivor_id = Column(Integer, ForeignKey("users.id"))
    professional_id = Column(Integer, ForeignKey("users.id"))
    
    survivor_alias = Column(String)
    status = Column(String, default="ACTIVE") # 'ACTIVE', 'CLOSED'
    support_context = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

class Baseline(Base):
    __tablename__ = "baselines"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    
    avg_distress = Column(Float)
    avg_sleep = Column(Float)
    activity_level = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

class CheckIn(Base):
    __tablename__ = "check_ins"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    
    distress_level = Column(Integer)
    sleep_quality = Column(Integer)
    activity_level = Column(Integer)
    
    support_priority = Column(String) # 'STABLE', 'OBSERVE', 'ELEVATED', 'HIGH PRIORITY'
    why_explanation = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

class ActionLog(Base):
    __tablename__ = "action_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    professional_id = Column(Integer, ForeignKey("users.id"))
    
    action_type = Column(String)
    notes = Column(Text)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

class Consent(Base):
    __tablename__ = "consents"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    
    consent_type = Column(String) # e.g. 'DATA_PROCESSING', 'AI_ANALYSIS'
    status = Column(String, default="GRANTED") # 'GRANTED', 'REVOKED'
    
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    alert_type = Column(String) # MISSED_CHECKIN, PRIORITY_CHANGE, PROFESSIONAL_REVIEW, SAFETY_CONCERN, FOLLOW_UP_DUE, SYSTEM
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)


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

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String) # 'CHECK_IN', 'APPOINTMENT', 'MESSAGE', 'SAFETY', 'SYSTEM'
    title = Column(String)
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    checkin_id = Column(Integer, ForeignKey("check_ins.id"))
    
    provider = Column(String)
    model = Column(String)
    prompt_version = Column(String)
    
    status = Column(String) # PENDING, PROCESSING, COMPLETED, FAILED
    
    structured_analysis = Column(Text, nullable=True) # JSON string
    evidence = Column(Text, nullable=True) # JSON string
    uncertainty = Column(Text, nullable=True) # JSON string
    error_info = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)
    status = Column(String, default="ACTIVE") # ACTIVE, CLOSED

class AIMessage(Base):
    __tablename__ = "ai_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"))
    
    sender_role = Column(String) # 'user', 'assistant'
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    language = Column(String, default="en")

class AIConversationSummary(Base):
    __tablename__ = "ai_conversation_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"))
    
    provider = Column(String)
    model = Column(String)
    prompt_version = Column(String)
    
    structured_summary = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    professional_id = Column(Integer, ForeignKey("users.id"))
    survivor_id = Column(Integer, ForeignKey("users.id"))
    
    scheduled_time = Column(DateTime)
    duration_minutes = Column(Integer, default=45)
    title = Column(String)
    status = Column(String, default="SCHEDULED") # SCHEDULED, COMPLETED, CANCELLED
    type = Column(String, default="VIDEO") # VIDEO, IN_PERSON, CALL
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String)

class CaseEvent(Base):
    __tablename__ = "case_events"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    category = Column(String)
    description = Column(Text)
    is_relevant = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))

class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    type = Column(String)
    status = Column(String, default="Recommended")
    notes = Column(Text)
    outcome = Column(Text, nullable=True)
    next_follow_up = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
