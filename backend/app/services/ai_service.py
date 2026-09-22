import json
import re
import logging
from uuid import UUID
from decimal import Decimal
from typing import List, Dict, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.ai.router import AIRouter, AIOperation
from app.integrations.ai.cache import AICache
from app.integrations.ai.rate_limiter import AIRateLimiter
from app.integrations.ai import prompts
from app.integrations.ai.schemas import (
    ParseItemsResult,
    ShoppingPlanResult,
    CategorizeResult,
    BudgetSuggestionsResult,
    ReminderParseResult,
    InsightsResult
)

logger = logging.getLogger(__name__)

class RateLimitExceeded(Exception):
    pass

class AIService:
    def __init__(self, session: AsyncSession, ai_router: AIRouter, cache: AICache, rate_limiter: AIRateLimiter):
        self.session = session
        self.ai_router = ai_router
        self.cache = cache
        self.rate_limiter = rate_limiter

    async def _check_rate_limit(self, user_id: UUID) -> None:
        if not await self.rate_limiter.check(str(user_id)):
            raise RateLimitExceeded("AI rate limit exceeded")

    def _parse_json_response(self, content: str) -> dict:
        content = content.strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                pass
                
        start_idx = content.find('{')
        if start_idx == -1:
            start_idx = content.find('[')
            
        if start_idx != -1:
            end_idx = content.rfind('}')
            if end_idx == -1 or content.rfind(']') > end_idx:
                end_idx = content.rfind(']')
            if end_idx != -1:
                try:
                    return json.loads(content[start_idx:end_idx+1])
                except json.JSONDecodeError:
                    pass
                    
        raise ValueError("Could not parse JSON from AI response")

    async def parse_items(self, user_id: UUID, text: str) -> ParseItemsResult:
        await self._check_rate_limit(user_id)
        
        input_hash = self.cache.hash_input(text)
        cached = await self.cache.get(AIOperation.PARSE_ITEMS, input_hash)
        if cached:
            return ParseItemsResult.model_validate_json(cached)
            
        messages = [
            {"role": "system", "content": prompts.PARSE_ITEMS_PROMPT.format(COMMON_ANTI_INJECTION=prompts.COMMON_ANTI_INJECTION)},
            {"role": "user", "content": text}
        ]
        
        schema = ParseItemsResult.model_json_schema()
        response = await self.ai_router.execute(AIOperation.PARSE_ITEMS, messages, schema)
        
        parsed_dict = self._parse_json_response(response.content)
        result = ParseItemsResult(**parsed_dict)
        
        await self.cache.set(AIOperation.PARSE_ITEMS, input_hash, result.model_dump_json())
        return result

    async def create_shopping_plan(self, user_id: UUID, people: int, budget: Decimal | None, days: int, preferences: str | None) -> ShoppingPlanResult:
        await self._check_rate_limit(user_id)
        
        context_str = f"people: {people}, budget: {budget}, days: {days}, preferences: {preferences}"
        input_hash = self.cache.hash_input(context_str)
        
        cached = await self.cache.get(AIOperation.CREATE_PLAN, input_hash)
        if cached:
            return ShoppingPlanResult.model_validate_json(cached)
            
        system_prompt = prompts.CREATE_PLAN_PROMPT.format(
            people=people, days=days, budget=budget or "unlimited", currency="UZS", preferences=preferences or "None",
            COMMON_ANTI_INJECTION=prompts.COMMON_ANTI_INJECTION
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Please generate the shopping plan."}
        ]
        
        schema = ShoppingPlanResult.model_json_schema()
        response = await self.ai_router.execute(AIOperation.CREATE_PLAN, messages, schema)
        
        parsed_dict = self._parse_json_response(response.content)
        result = ShoppingPlanResult(**parsed_dict)
        
        await self.cache.set(AIOperation.CREATE_PLAN, input_hash, result.model_dump_json(), ttl=86400)
        return result

    async def categorize_product(self, user_id: UUID, name: str) -> CategorizeResult:
        await self._check_rate_limit(user_id)
        
        input_hash = self.cache.hash_input(name)
        cached = await self.cache.get(AIOperation.CATEGORIZE, input_hash)
        if cached:
            return CategorizeResult.model_validate_json(cached)
            
        categories = "Овощи и фрукты, Мясо и птица, Молочные продукты, Хлеб и выпечка, Крупы и макароны, Напитки, Сладости, Рыба и морепродукты, Масла и соусы, Замороженные продукты, Бытовая химия, Личная гигиена, Другое"
        system_prompt = prompts.CATEGORIZE_PROMPT.format(categories=categories, COMMON_ANTI_INJECTION=prompts.COMMON_ANTI_INJECTION)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": name}
        ]
        
        schema = CategorizeResult.model_json_schema()
        response = await self.ai_router.execute(AIOperation.CATEGORIZE, messages, schema)
        
        parsed_dict = self._parse_json_response(response.content)
        result = CategorizeResult(**parsed_dict)
        
        await self.cache.set(AIOperation.CATEGORIZE, input_hash, result.model_dump_json(), ttl=86400 * 7)
        return result

    async def suggest_budget_savings(self, user_id: UUID, items: List[Dict[str, Any]], budget: Decimal, currency: str) -> BudgetSuggestionsResult:
        await self._check_rate_limit(user_id)
        
        items_str = json.dumps(items, ensure_ascii=False)
        input_hash = self.cache.hash_input(f"{items_str}_{budget}_{currency}")
        
        cached = await self.cache.get(AIOperation.BUDGET_SUGGESTIONS, input_hash)
        if cached:
            return BudgetSuggestionsResult.model_validate_json(cached)
            
        system_prompt = prompts.BUDGET_SUGGESTIONS_PROMPT.format(items=items_str, budget=budget, currency=currency, COMMON_ANTI_INJECTION=prompts.COMMON_ANTI_INJECTION)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Suggest budget savings"}
        ]
        
        schema = BudgetSuggestionsResult.model_json_schema()
        response = await self.ai_router.execute(AIOperation.BUDGET_SUGGESTIONS, messages, schema)
        
        parsed_dict = self._parse_json_response(response.content)
        result = BudgetSuggestionsResult(**parsed_dict)
        
        await self.cache.set(AIOperation.BUDGET_SUGGESTIONS, input_hash, result.model_dump_json())
        return result

    async def parse_reminder(self, user_id: UUID, text: str) -> ReminderParseResult:
        await self._check_rate_limit(user_id)
        
        messages = [
            {"role": "system", "content": prompts.PARSE_REMINDER_PROMPT.format(COMMON_ANTI_INJECTION=prompts.COMMON_ANTI_INJECTION)},
            {"role": "user", "content": text}
        ]
        
        schema = ReminderParseResult.model_json_schema()
        response = await self.ai_router.execute(AIOperation.PARSE_REMINDER, messages, schema)
        
        parsed_dict = self._parse_json_response(response.content)
        return ReminderParseResult(**parsed_dict)

    async def generate_insights(self, user_id: UUID, analytics_data: dict) -> InsightsResult:
        await self._check_rate_limit(user_id)
        
        data_str = json.dumps(analytics_data, ensure_ascii=False)
        input_hash = self.cache.hash_input(data_str)
        
        cached = await self.cache.get(AIOperation.GENERATE_INSIGHTS, input_hash)
        if cached:
            return InsightsResult.model_validate_json(cached)
            
        system_prompt = prompts.INSIGHTS_PROMPT.format(analytics_data=data_str, COMMON_ANTI_INJECTION=prompts.COMMON_ANTI_INJECTION)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Generate insights"}
        ]
        
        schema = InsightsResult.model_json_schema()
        response = await self.ai_router.execute(AIOperation.GENERATE_INSIGHTS, messages, schema)
        
        parsed_dict = self._parse_json_response(response.content)
        result = InsightsResult(**parsed_dict)
        
        await self.cache.set(AIOperation.GENERATE_INSIGHTS, input_hash, result.model_dump_json(), ttl=86400)
        return result
