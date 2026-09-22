import time
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.integrations.ai.provider import AIProvider, AIResponse

class GroqProvider(AIProvider):
    provider_name = "groq"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            base_url="https://api.groq.com/openai/v1",
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=30.0
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError))
    )
    async def complete(self, messages: list[dict], model: str | None = None, temperature: float = 0.3, max_tokens: int = 2000) -> AIResponse:
        start_time = time.time()
        
        payload = {
            "model": model or "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        response = await self.client.post("/chat/completions", json=payload)
        response.raise_for_status()
        
        data = response.json()
        latency_ms = int((time.time() - start_time) * 1000)
        
        usage = data.get("usage", {})
        
        return AIResponse(
            content=data["choices"][0]["message"]["content"],
            tokens_input=usage.get("prompt_tokens", 0),
            tokens_output=usage.get("completion_tokens", 0),
            model=model or "llama-3.1-8b-instant",
            provider=self.provider_name,
            latency_ms=latency_ms
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError))
    )
    async def structured_output(self, messages: list[dict], schema: dict, model: str | None = None) -> AIResponse:
        start_time = time.time()
        
        payload = {
            "model": model or "llama-3.1-8b-instant",
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }
        
        response = await self.client.post("/chat/completions", json=payload)
        response.raise_for_status()
        
        data = response.json()
        latency_ms = int((time.time() - start_time) * 1000)
        
        usage = data.get("usage", {})
        
        return AIResponse(
            content=data["choices"][0]["message"]["content"],
            tokens_input=usage.get("prompt_tokens", 0),
            tokens_output=usage.get("completion_tokens", 0),
            model=model or "llama-3.1-8b-instant",
            provider=self.provider_name,
            latency_ms=latency_ms
        )
        
    async def close(self) -> None:
        await self.client.aclose()
