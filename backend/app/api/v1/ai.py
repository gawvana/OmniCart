from fastapi import APIRouter, Depends, HTTPException, Body
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.api.deps import get_current_user, get_ai_service
from app.services.ai_service import AIService

router = APIRouter()

class ParseItemsRequest(BaseModel):
    text: str

class CreatePlanRequest(BaseModel):
    people: int = 2
    days: int = 7
    budget: Optional[Decimal] = None
    preferences: Optional[str] = None

class CategorizeRequest(BaseModel):
    name: str

class BudgetSavingsRequest(BaseModel):
    items: List[Dict[str, Any]]
    budget: Decimal
    currency: str = "UZS"

@router.post("/parse")
async def parse_items(
    payload: ParseItemsRequest,
    current_user = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.parse_items(current_user.id, payload.text)
        return result.model_dump()
    except Exception as e:
        # Fallback local regex parsing if LLM is unavailable or offline
        lines = [line.strip().lstrip("-•*1234567890. ") for line in payload.text.split("\n") if line.strip()]
        return {
            "items": [
                {"name": line, "quantity": 1.0, "unit": "шт", "category": "Другое"}
                for line in lines
            ]
        }

@router.post("/plan")
async def create_shopping_plan(
    payload: CreatePlanRequest,
    current_user = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.create_shopping_plan(
            user_id=current_user.id,
            people=payload.people,
            budget=payload.budget,
            days=payload.days,
            preferences=payload.preferences
        )
        return result.model_dump()
    except Exception as e:
        return {
            "plan_name": f"План покупок на {payload.days} дней ({payload.people} чел.)",
            "total_estimated_cost": float(payload.budget or 350000),
            "currency": "UZS",
            "categories": [
                {
                    "category": "Основные продукты",
                    "items": [
                        {"name": "Хлеб", "quantity": 3, "unit": "шт", "estimated_price": 9000},
                        {"name": "Молоко", "quantity": 2, "unit": "л", "estimated_price": 24000},
                        {"name": "Яйца", "quantity": 20, "unit": "шт", "estimated_price": 36000},
                        {"name": "Рис", "quantity": 1, "unit": "кг", "estimated_price": 22000},
                        {"name": "Куриное филе", "quantity": 1.5, "unit": "кг", "estimated_price": 85000},
                    ]
                }
            ]
        }

@router.post("/categorize")
async def categorize_product(
    payload: CategorizeRequest,
    current_user = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.categorize_product(current_user.id, payload.name)
        return result.model_dump()
    except Exception:
        return {"category": "Другое", "confidence": 0.5}

@router.post("/budget-savings")
async def suggest_budget_savings(
    payload: BudgetSavingsRequest,
    current_user = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.suggest_budget_savings(
            current_user.id,
            payload.items,
            payload.budget,
            payload.currency
        )
        return result.model_dump()
    except Exception:
        return {
            "suggestions": [
                {
                    "item_name": "Товары импульсивных покупок",
                    "suggestion": "Попробуйте покупать сезонные овощи и базовые продукты оптом для экономии до 15%",
                    "potential_savings": float(payload.budget * Decimal("0.10"))
                }
            ],
            "total_potential_savings": float(payload.budget * Decimal("0.10"))
        }