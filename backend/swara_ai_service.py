import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

import models
from llm_provider import get_llm_provider
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# --- Pydantic Schemas for Structured Outputs ---

class SignalExtractionOutput(BaseModel):
    signals: List[Dict[str, Any]] = Field(
        ..., 
        description="List of signals containing domain, observation, direction, timeframe, source, certainty, requires_review"
    )

class SafetyEvaluationOutput(BaseModel):
    is_immediate_concern: bool = Field(..., description="True if there is an immediate safety concern (e.g. self-harm).")
    safety_note: str = Field(..., description="Explanation of the safety concern.")
    recommended_priority: str = Field(..., description="One of: STABLE, CHANGE_DETECTED, SUSTAINED_CONCERN, IMMEDIATE_SAFETY_CONCERN")

class WeeklySummaryOutput(BaseModel):
    summary_text: str = Field(..., description="A structured summary of the week.")
    what_changed: str = Field(..., description="What changed over the week.")
    what_remained_stable: str = Field(..., description="What remained stable.")
    professional_attention_points: List[str] = Field(..., description="Points requiring professional attention.")

class SwaraAIService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = get_llm_provider()

    def chat(self, user_message: str, active_conv: models.AIConversation, case: models.Case, background_tasks=None) -> models.AIMessage:
        # Get history scoped strictly to THIS conversation
        recent_msgs = self.db.query(models.AIMessage).filter(
            models.AIMessage.conversation_id == active_conv.id
        ).order_by(models.AIMessage.timestamp.desc()).limit(10).all()
        
        history = [{"role": m.sender_role, "text": m.message} for m in reversed(recent_msgs)]
        
        # Gather context
        baseline = self.db.query(models.Baseline).filter(models.Baseline.case_id == case.id).first()
        recent_checkin = self.db.query(models.CheckIn).filter(models.CheckIn.case_id == case.id).order_by(models.CheckIn.timestamp.desc()).first()
        
        context = {
            "case_id": case.id,
            "conversation_id": active_conv.id,
            "baseline_status": "ESTABLISHED" if baseline else "BUILDING",
            "recent_priority": recent_checkin.support_priority if recent_checkin else "UNKNOWN",
        }
        
        # Save user message first
        user_msg = models.AIMessage(
            conversation_id=active_conv.id,
            sender_role="user",
            message=user_message
        )
        self.db.add(user_msg)
        self.db.commit()
        self.db.refresh(user_msg)

        # Get AI response
        try:
            ai_response_text = self.provider.chat(user_message, history, context)
        except Exception as e:
            # Log the full error so developers can diagnose the real failure
            logger.error(
                f"[SwaraAIService] AI Chat Error (conv_id={active_conv.id}): {type(e).__name__}: {e}"
            )
            ai_response_text = "I'm having trouble connecting right now. If this is an emergency, please use the SOS button or contact your professional."

        # Save AI message and return the object directly — no secondary query
        ai_msg = models.AIMessage(
            conversation_id=active_conv.id,
            sender_role="assistant",
            message=ai_response_text
        )
        self.db.add(ai_msg)
        self.db.commit()
        self.db.refresh(ai_msg)

        # Offload conversation analysis to background — do NOT block the response
        if background_tasks is not None:
            background_tasks.add_task(self._background_analyze, active_conv.id, case.id)
        
        return ai_msg

    def analyzeCheckIn(self, checkin: models.CheckIn, case: models.Case) -> Dict[str, Any]:
        # Gather context for checkin analysis
        context = {
            "distress_level": checkin.distress_level,
            "sleep_quality": checkin.sleep_quality,
            "activity_level": checkin.activity_level
        }
        
        analysis = self.provider.analyze(context)
        
        # Evaluate support priority based on analysis (if available) or raw metrics
        if analysis and "recommended_attention" in analysis:
            # Map to one of the strict states
            # For prototype, we default to STABLE unless distress is high
            if checkin.distress_level > 70:
                priority = "CHANGE_DETECTED"
            else:
                priority = "STABLE"
        else:
            priority = "STABLE"
            
        checkin.support_priority = priority
        self.db.commit()
        return analysis

    def analyzeConversation(self, active_conv: models.AIConversation, case: models.Case):
        # Extract signals, evaluate safety, update patterns
        signals = self.extractSignals(active_conv)
        safety_eval = self.evaluateSafetySignals(active_conv)
        
        if safety_eval.get('is_immediate_concern'):
            self._trigger_safety_alert(case, safety_eval['safety_note'])
        
        # Update case priority if necessary
        new_priority = safety_eval.get('recommended_priority', 'STABLE')
        
        # If there's an immediate concern, update it
        if new_priority in ['SUSTAINED_CONCERN', 'IMMEDIATE_SAFETY_CONCERN']:
            # create a priority alert
            pass
            
        self.updatePatterns(case, signals)
        
    def extractSignals(self, active_conv: models.AIConversation) -> List[Dict[str, Any]]:
        # In a real implementation, we would query the LLM to extract signals from recent messages
        # For prototype fallback if not using real LLM:
        signals = []
        
        # Save to AIConversationSummary
        summary = models.AIConversationSummary(
            case_id=active_conv.case_id,
            conversation_id=active_conv.id,
            provider="SWARA_AI_SERVICE",
            model="gemini-2.5-flash",
            prompt_version="V1",
            structured_summary=json.dumps({"signals": signals})
        )
        self.db.add(summary)
        self.db.commit()
        
        return signals

    def evaluateSafetySignals(self, active_conv: models.AIConversation) -> Dict[str, Any]:
        return {
            "is_immediate_concern": False,
            "safety_note": "No immediate concern detected.",
            "recommended_priority": "STABLE"
        }

    def updatePatterns(self, case: models.Case, signals: List[Dict[str, Any]]):
        pass

    def generateWeeklySummary(self, case: models.Case) -> Dict[str, Any]:
        return {
            "summary_text": "Weekly summary generated.",
            "what_changed": "Nothing significantly.",
            "what_remained_stable": "Most metrics.",
            "professional_attention_points": []
        }

    def _background_analyze(self, conversation_id: int, case_id: int):
        """Background-safe wrapper that creates its own DB session."""
        from database import SessionLocal
        db = SessionLocal()
        try:
            conv = db.query(models.AIConversation).filter(models.AIConversation.id == conversation_id).first()
            case = db.query(models.Case).filter(models.Case.id == case_id).first()
            if conv and case:
                service = SwaraAIService(db)
                service.analyzeConversation(conv, case)
        except Exception as e:
            logger.error(f"Background analysis error (conv_id={conversation_id}): {e}")
        finally:
            db.close()

    def _trigger_safety_alert(self, case: models.Case, note: str):
        alert = models.Alert(
            case_id=case.id,
            alert_type="SAFETY_CONCERN",
            message=f"Safety concern detected by SWARA AI: {note}"
        )
        self.db.add(alert)
        self.db.commit()
