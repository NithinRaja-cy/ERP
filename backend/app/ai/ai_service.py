from typing import Dict, Any, List
from app.analytics.analytics_service import AnalyticsService
from app.rules.rules_engine import RulesEngine
from sqlalchemy.orm import Session

class AIService:
    """
    Modular AI Integration Layer.
    Currently utilizes rule-based heuristics. Designed to be easily 
    swappable with LLM API calls (e.g., OpenAI, Gemini) in the future.
    """
    
    @staticmethod
    def generate_executive_insights(db: Session) -> List[str]:
        """
        Generates human-readable business insights. 
        Future: Pass business metrics to an LLM to generate a rich narrative.
        """
        health = AnalyticsService.get_business_health_score(db)
        insights = []
        
        if health["overall_health_score"] > 85:
            insights.append("Business is operating efficiently. Manufacturing and Deliveries are on track.")
        else:
            insights.append("Attention required. Overall business health has dropped below optimal levels.")
            
        if health["delivery_success_rate"] < 90:
            insights.append("Delivery success rate is below 90%. Investigate dispatch bottlenecks.")
            
        return insights

    @staticmethod
    def predict_inventory_risks(db: Session, location_id: int) -> List[Dict[str, Any]]:
        """
        Predicts inventory risks.
        Future: Use machine learning models to forecast demand and detect anomalies.
        Currently wraps the RulesEngine low-stock alerts.
        """
        # Wrapping rule-based alerts with "AI" context for MVP
        alerts = RulesEngine.evaluate_inventory_health(db, location_id)
        
        risks = []
        for alert in alerts:
            risks.append({
                "type": "STOCKOUT_RISK",
                "product_id": alert["product_id"],
                "recommendation": f"Expedite purchase orders for {alert['product_name']} immediately."
            })
            
        return risks
        
    @staticmethod
    def _query_llm(prompt: str) -> str:
        """
        Placeholder for future LLM integration.
        """
        # Example:
        # response = openai.ChatCompletion.create(model="gpt-4", messages=[{"role": "user", "content": prompt}])
        # return response.choices[0].message.content
        raise NotImplementedError("LLM integration is planned for future phases.")
