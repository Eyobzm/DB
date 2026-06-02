"""
Site budget management router
- POST /site-budget: create site budget records
- GET /site-budget: list budgets with optional variance alerts
- GET /site-budget/{id}: retrieve a budget record
- PATCH /site-budget/{id}: update budget details
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import SiteBudget, Site
from schemas import SiteBudgetCreate, SiteBudgetResponse, SiteBudgetUpdate
from auth_utils import get_current_user, require_roles

router = APIRouter(prefix="/api/v1/site-budget", tags=["Finance"])


def _variance_alert(budget: SiteBudget, threshold: float) -> bool:
    if threshold < 0:
        return False
    if budget.allocated_amount <= 0:
        return budget.remaining_balance < 0
    return (budget.remaining_balance / budget.allocated_amount) < threshold


@router.post("", response_model=SiteBudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_site_budget(
    payload: SiteBudgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin", "Site_Manager")),
):
    site_query = await db.execute(select(Site).where(Site.site_id == payload.site_id))
    site = site_query.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    budget = SiteBudget(
        site_id=payload.site_id,
        allocated_amount=payload.allocated_amount,
        spent_to_date=payload.spent_to_date or 0.0,
        committed_amount=payload.committed_amount or 0.0,
        fiscal_year_start=payload.fiscal_year_start,
        fiscal_year_end=payload.fiscal_year_end,
        status=payload.status or "Active",
    )
    db.add(budget)
    try:
        await db.commit()
        await db.refresh(budget)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create site budget") from exc

    response = SiteBudgetResponse.model_validate(budget)
    return response.model_copy(update={"variance_alert": _variance_alert(budget, 0.2)})


@router.get("", response_model=List[SiteBudgetResponse])
async def list_site_budgets(
    site_id: Optional[int] = Query(None, description="Filter by site"),
    threshold: float = Query(0.2, ge=0.0, le=1.0, description="Variance threshold for alert flag"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin", "Site_Manager")),
):
    query = select(SiteBudget)
    if site_id is not None:
        query = query.where(SiteBudget.site_id == site_id)

    result = await db.execute(query.offset(skip).limit(limit))
    budgets = result.scalars().all()
    response_items = []
    for budget in budgets:
        response_items.append(
            SiteBudgetResponse.model_validate(budget).model_copy(
                update={"variance_alert": _variance_alert(budget, threshold)}
            )
        )
    return response_items


@router.get("/{site_budget_id}", response_model=SiteBudgetResponse)
async def get_site_budget(
    site_budget_id: int,
    threshold: float = Query(0.2, ge=0.0, le=1.0),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin", "Site_Manager")),
):
    query = await db.execute(select(SiteBudget).where(SiteBudget.site_budget_id == site_budget_id))
    budget = query.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site budget record not found")

    response = SiteBudgetResponse.model_validate(budget)
    return response.model_copy(update={"variance_alert": _variance_alert(budget, threshold)})


@router.patch("/{site_budget_id}", response_model=SiteBudgetResponse)
async def update_site_budget(
    site_budget_id: int,
    payload: SiteBudgetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin", "Site_Manager")),
):
    query = await db.execute(select(SiteBudget).where(SiteBudget.site_budget_id == site_budget_id))
    budget = query.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site budget record not found")

    if payload.allocated_amount is not None:
        budget.allocated_amount = payload.allocated_amount
    if payload.spent_to_date is not None:
        budget.spent_to_date = payload.spent_to_date
    if payload.committed_amount is not None:
        budget.committed_amount = payload.committed_amount
    if payload.fiscal_year_start is not None:
        budget.fiscal_year_start = payload.fiscal_year_start
    if payload.fiscal_year_end is not None:
        budget.fiscal_year_end = payload.fiscal_year_end
    if payload.status is not None:
        budget.status = payload.status

    db.add(budget)
    try:
        await db.commit()
        await db.refresh(budget)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update site budget") from exc

    response = SiteBudgetResponse.model_validate(budget)
    return response.model_copy(update={"variance_alert": _variance_alert(budget, 0.2)})
