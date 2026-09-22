from enum import Enum
import logging
from app.integrations.ai.provider import AIProvider, AIResponse
from app.integrations.ai.groq_provider import GroqProvider
from app.integrations.ai.gemini_provider import GeminiProvider

logger = logging.getLogger(__name__)

class AIOperation(str, Enum):
    PARSE_ITEMS = "parse_items"
    CATEGORIZE = "categorize"
    CREATE_PLAN = "create_plan"
    BUDGET_SUGGESTIONS = "budget_suggestions"
    PARSE_REMINDER = "parse_reminder"
    GENERATE_INSIGHTS = "generate_insights"

class AIRouter:
    def __init__(self, settings):
        self.settings = settings
        self.primary_provider: AIProvider | None = None
        self.fallback_provider: AIProvider | None = None
        
        # Synchronously initialize providers
        if hasattr(self.settings, 'GROQ_API_KEY') and self.settings.GROQ_API_KEY:
            self.primary_provider = GroqProvider(api_key=self.settings.GROQ_API_KEY)
        
        if hasattr(self.settings, 'GEMINI_API_KEY') and self.settings.GEMINI_API_KEY:
            self.fallback_provider = GeminiProvider(api_key=self.settings.GEMINI_API_KEY)
            
        if not self.primary_provider and self.fallback_provider:
            self.primary_provider = self.fallback_provider
            self.fallback_provider = None
    
    async def initialize(self) -> None:
        pass
    
    def get_model_for_operation(self, operation: AIOperation) -> str:
        simple_ops = {AIOperation.PARSE_ITEMS, AIOperation.CATEGORIZE, AIOperation.PARSE_REMINDER}
        if operation in simple_ops:
            return getattr(self.settings, 'GROQ_FAST_MODEL', 'openai/gpt-oss-20b')
        return getattr(self.settings, 'GROQ_MODEL', 'openai/gpt-oss-20b')
    
    async def execute(self, operation: AIOperation, messages: list[dict], schema: dict | None = None) -> AIResponse:
        model = self.get_model_for_operation(operation)
        
        try:
            if not self.primary_provider:
                raise ValueError("No primary AI provider configured")
                
            logger.info(f"Executing AI operation: {operation} using primary provider {self.primary_provider.provider_name}")
            if schema:
                return await self.primary_provider.structured_output(messages, schema, model)
            return await self.primary_provider.complete(messages, model)
            
        except Exception as e:
            logger.warning(f"Primary provider failed for {operation}: {e}")
            if self.fallback_provider:
                logger.info(f"Falling back to provider {self.fallback_provider.provider_name}")
                try:
                    fallback_model = getattr(self.settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
                    if schema:
                        return await self.fallback_provider.structured_output(messages, schema, fallback_model)
                    return await self.fallback_provider.complete(messages, fallback_model)
                except Exception as fallback_e:
                    logger.error(f"Fallback provider also failed for {operation}: {fallback_e}")
                    raise
            raise
    
    async def close(self) -> None:
        if self.primary_provider:
            await self.primary_provider.close()
        if self.fallback_provider:
            await self.fallback_provider.close()
