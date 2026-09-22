import time
import json
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
try:
    import google.generativeai as genai
    from google.generativeai.types import generation_types
    from google.api_core.exceptions import GoogleAPIError
    HAVE_GEMINI = True
except ImportError:
    genai = None
    generation_types = None
    GoogleAPIError = Exception
    HAVE_GEMINI = False

from app.integrations.ai.provider import AIProvider, AIResponse

class GeminiProvider(AIProvider):
    provider_name = "gemini"

    def __init__(self, api_key: str):
        if not HAVE_GEMINI:
            raise ImportError("google-generativeai is not installed")
        genai.configure(api_key=api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((GoogleAPIError, Exception))
    )
    async def complete(self, messages: list[dict], model: str | None = None, temperature: float = 0.3, max_tokens: int = 2000) -> AIResponse:
        start_time = time.time()
        model_name = model or "gemini-1.5-flash"
        
        genai_model = genai.GenerativeModel(model_name)
        
        prompt = ""
        for msg in messages:
            prompt += f"{msg['role'].upper()}: {msg['content']}\n"
            
        response = await genai_model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        usage_metadata = getattr(response, "usage_metadata", None)
        tokens_input = getattr(usage_metadata, "prompt_token_count", 0) if usage_metadata else 0
        tokens_output = getattr(usage_metadata, "candidates_token_count", 0) if usage_metadata else 0
        
        return AIResponse(
            content=response.text,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            model=model_name,
            provider=self.provider_name,
            latency_ms=latency_ms
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((GoogleAPIError, Exception))
    )
    async def structured_output(self, messages: list[dict], schema: dict, model: str | None = None) -> AIResponse:
        start_time = time.time()
        model_name = model or "gemini-1.5-flash"
        
        genai_model = genai.GenerativeModel(model_name)
        
        prompt = ""
        for msg in messages:
            prompt += f"{msg['role'].upper()}: {msg['content']}\n"
            
        prompt += f"\nReturn ONLY valid JSON that matches this schema: {json.dumps(schema)}"
            
        response = await genai_model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                response_mime_type="application/json",
            )
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        usage_metadata = getattr(response, "usage_metadata", None)
        tokens_input = getattr(usage_metadata, "prompt_token_count", 0) if usage_metadata else 0
        tokens_output = getattr(usage_metadata, "candidates_token_count", 0) if usage_metadata else 0
        
        return AIResponse(
            content=response.text,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            model=model_name,
            provider=self.provider_name,
            latency_ms=latency_ms
        )
        
    async def close(self) -> None:
        pass
