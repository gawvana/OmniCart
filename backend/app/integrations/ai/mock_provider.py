import time
import json
from app.integrations.ai.provider import AIProvider, AIResponse

class MockProvider(AIProvider):
    provider_name = "mock"

    async def complete(self, messages: list[dict], model: str | None = None, temperature: float = 0.3, max_tokens: int = 2000) -> AIResponse:
        return AIResponse(
            content="Mock response",
            tokens_input=10,
            tokens_output=10,
            model=model or "mock-model",
            provider=self.provider_name,
            latency_ms=50
        )

    async def structured_output(self, messages: list[dict], schema: dict, model: str | None = None) -> AIResponse:
        content = "{}"
        
        if any("shopping list parser" in m.get("content", "") for m in messages):
            content = json.dumps({
                "items": [
                    {"name": "Apple", "quantity": 2, "unit": "kg", "category": "Овощи и фрукты", "confidence": 0.95}
                ]
            })
        elif any("shopping planner" in m.get("content", "") for m in messages):
            content = json.dumps({
                "categories": [
                    {
                        "category": "Fruit",
                        "emoji": "🍎",
                        "items": [
                            {"name": "Apple", "quantity": 1, "unit": "kg", "estimated_price": 10000}
                        ]
                    }
                ],
                "estimated_total": 10000,
                "currency": "UZS"
            })
            
        return AIResponse(
            content=content,
            tokens_input=10,
            tokens_output=10,
            model=model or "mock-model",
            provider=self.provider_name,
            latency_ms=50
        )
        
    async def close(self) -> None:
        pass
