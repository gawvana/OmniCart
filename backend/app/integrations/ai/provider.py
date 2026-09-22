from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel

class AIResponse(BaseModel):
    content: str
    tokens_input: int = 0
    tokens_output: int = 0
    model: str = ""
    provider: str = ""
    latency_ms: int = 0

class AIProvider(ABC):
    provider_name: str
    
    @abstractmethod
    async def complete(self, messages: list[dict], model: str | None = None, temperature: float = 0.3, max_tokens: int = 2000) -> AIResponse: ...
    
    @abstractmethod
    async def structured_output(self, messages: list[dict], schema: dict, model: str | None = None) -> AIResponse: ...
    
    @abstractmethod
    async def close(self) -> None: ...
