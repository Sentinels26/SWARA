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
        # Perform analysis synchronously (Vercel safe)
        self.analyzeConversation(active_conv, case)
        
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
        """Extract structured signals from the recent conversation using the LLM.
        Returns a list of signal dicts matching the SignalExtractionOutput schema.
        """
        # Fetch recent messages (up to 10) for context
        recent_msgs = self.db.query(models.AIMessage).filter(
            models.AIMessage.conversation_id == active_conv.id
        ).order_by(models.AIMessage.timestamp.desc()).limit(10).all()
        history = [{"role": m.sender_role, "text": m.message} for m in reversed(recent_msgs)]
        
        # Prompt for signal extraction
        user_prompt = (
            "Extract a list of wellbeing signals from the recent conversation. "
            "Each signal should be a JSON object with the following fields: "
            "domain (e.g., 'Emotion', 'Sleep'), observation (brief description), "
            "direction ('improved', 'worsened', or 'stable'), timeframe (e.g., 'last week'), "
            "source ('user'), certainty (e.g., 'high'), requires_review (boolean). "
            "Return ONLY a JSON array of these signal objects."
        )
        try:
            response_text = self.provider.chat(user_prompt, history, {"conversation_id": active_conv.id})
            # Attempt to parse JSON; the LLM may include stray markup
            signals = json.loads(response_text)
        except Exception as e:
            logger.error(f"[SwaraAIService] Signal extraction failed: {e}")
            signals = []
        
        # Persist summary
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
        """Safer structured safety evaluation using LLM context instead of naive keywords."""
        recent_user_msgs = self.db.query(models.AIMessage).filter(
            models.AIMessage.conversation_id == active_conv.id,
            models.AIMessage.sender_role == "user"
        ).order_by(models.AIMessage.timestamp.desc()).limit(3).all()
        
        if not recent_user_msgs:
            return {"is_immediate_concern": False, "safety_note": "No user messages", "recommended_priority": "STABLE", "requires_review": False}
        
        history = [{"role": m.sender_role, "text": m.message} for m in reversed(recent_user_msgs)]
        
        # Use LLM provider to evaluate safety
        prompt = (
            "Evaluate the safety context of the recent user statements. "
            "Distinguish between: explicit personal immediate safety concern (e.g. active self-harm plan), "
            "general discussion, third-person discussion, historical mention, or ambiguous statement. "
            "Return a JSON object with: 'is_immediate_concern' (boolean, ONLY true if explicit personal immediate safety concern), "
            "'safety_note' (string explanation), 'requires_review' (boolean, true for ambiguous or concerning non-immediate statements). "
        )
        
        try:
            response_text = self.provider.chat(prompt, history, {"task": "safety_evaluation"})
            eval_result = json.loads(response_text)
            
            is_immediate = eval_result.get("is_immediate_concern", False)
            return {
                "is_immediate_concern": is_immediate,
                "safety_note": eval_result.get("safety_note", "No immediate concern detected."),
                "recommended_priority": "IMMEDIATE_SAFETY_CONCERN" if is_immediate else "STABLE",
                "requires_review": eval_result.get("requires_review", False)
            }
        except Exception as e:
            logger.error(f"[SwaraAIService] Safety evaluation failed: {e}")
            return {
                "is_immediate_concern": False,
                "safety_note": "Safety evaluation failed to parse. Review recommended.",
                "recommended_priority": "STABLE",
                "requires_review": True
            }

    def updatePatterns(self, case: models.Case, signals: List[Dict[str, Any]]):
        """Longitudinal aggregation of signals. Store patterns in CaseEvent."""
        logger.info(f"[SwaraAIService] Updating patterns for case {case.id} with {len(signals)} signals")
        if not signals:
            return
            
        recent_summaries = self.db.query(models.AIConversationSummary).filter(
            models.AIConversationSummary.case_id == case.id
        ).order_by(models.AIConversationSummary.created_at.desc()).limit(10).all()
        
        all_past_signals = []
        for s in recent_summaries:
            try:
                parsed = json.loads(s.structured_summary)
                if "signals" in parsed and parsed["signals"]:
                    all_past_signals.extend(parsed["signals"])
            except Exception:
                continue
                
        from collections import defaultdict
        pattern_tally = defaultdict(int)
        for sig in all_past_signals:
            domain = sig.get("domain", "")
            direction = sig.get("direction", "")
            if domain and direction:
                pattern_tally[(domain, direction)] += 1
                
        for sig in signals:
            domain = sig.get("domain", "")
            direction = sig.get("direction", "")
            if domain and direction:
                count = pattern_tally.get((domain, direction), 0)
                if count >= 2:
                    pattern_desc = f"Repeated/Sustained signal pattern: {domain} ({direction})"
                    
                    # Check if already logged recently
                    recent_event = self.db.query(models.CaseEvent).filter(
                        models.CaseEvent.case_id == case.id,
                        models.CaseEvent.category == "LONGITUDINAL_PATTERN",
                        models.CaseEvent.description.like(f"%{domain}%")
                    ).first()
                    
                    if not recent_event:
                        event = models.CaseEvent(
                            case_id=case.id,
                            category="LONGITUDINAL_PATTERN",
                            description=json.dumps({
                                "pattern": pattern_desc,
                                "domain": domain,
                                "direction": direction,
                                "occurrence_count": count,
                                "timeframe": "Recent conversations",
                                "requires_review": sig.get("requires_review", False)
                            }),
                            is_relevant=True
                        )
                        self.db.add(event)
                    else:
                        try:
                            desc = json.loads(recent_event.description)
                            desc["occurrence_count"] = count
                            desc["requires_review"] = sig.get("requires_review", False) or desc.get("requires_review", False)
                            recent_event.description = json.dumps(desc)
                            recent_event.timestamp = datetime.utcnow()
                        except Exception:
                            pass
                            
                    self.db.commit()

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
