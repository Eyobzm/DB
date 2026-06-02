"""
Operational fund request and approval router
- POST /operational-funds: submit fund requests
- GET /operational-funds: list requests
- GET /operational-funds/{id}: retrieve single request
- PATCH /operational-funds/{id}: transition workflow statuses
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import OperationalFund
from schemas import (
    OperationalFundCreate,
    OperationalFundResponse,
    OperationalFundUpdate,
)
from auth_utils import get_current_user, require_roles, get_staff_id

router = APIRouter(prefix="/api/v1/operational-funds", tags=["Finance"])


@router.post("", response_model=OperationalFundResponse, status_code=status.HTTP_201_CREATED)
async def create_operational_fund(
    payload: OperationalFundCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    initial_balance = payload.initial_balance
    current_balance = payload.current_balance if payload.current_balance is not None else initial_balance
    fund = OperationalFund(
        fund_name=payload.fund_name,
        fund_category=payload.fund_category,
        initial_balance=initial_balance,
        current_balance=current_balance,
        fiscal_year_start=payload.fiscal_year_start,
        fiscal_year_end=payload.fiscal_year_end,
        description=payload.description,
        managed_by=payload.managed_by,
        status=payload.status or "Draft",
    )

    db.add(fund)
    try:
        await db.commit()
        await db.refresh(fund)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create operational fund request") from exc

    return fund


@router.get("", response_model=List[OperationalFundResponse])
async def list_operational_funds(
    status: Optional[str] = Query(None, description="Filter by workflow status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in ("Accountant", "Admin", "Site_Manager", "Supervisor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to view operational funds")

    query = select(OperationalFund)
    if status:
        query = query.where(OperationalFund.status == status)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{operational_fund_id}", response_model=OperationalFundResponse)
async def get_operational_fund(
    operational_fund_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = await db.execute(select(OperationalFund).where(OperationalFund.operational_fund_id == operational_fund_id))
    fund = query.scalar_one_or_none()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operational fund request not found")

    if current_user.get("role") not in ("Accountant", "Admin", "Site_Manager", "Supervisor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to view operational fund request")

    return fund


@router.patch("/{operational_fund_id}", response_model=OperationalFundResponse)
async def update_operational_fund(
    operational_fund_id: int,
    payload: OperationalFundUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = await db.execute(select(OperationalFund).where(OperationalFund.operational_fund_id == operational_fund_id))
    fund = query.scalar_one_or_none()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operational fund request not found")

    user_role = current_user.get("role")
    staff_id = get_staff_id(current_user)

    if payload.fund_name is not None:
        fund.fund_name = payload.fund_name
    if payload.fund_category is not None:
        fund.fund_category = payload.fund_category
    if payload.initial_balance is not None:
        fund.initial_balance = payload.initial_balance
        if fund.status in ("Draft", "Pending_Approval"):
            fund.current_balance = payload.initial_balance
    if payload.current_balance is not None:
        fund.current_balance = payload.current_balance
    if payload.fiscal_year_start is not None:
        fund.fiscal_year_start = payload.fiscal_year_start
    if payload.fiscal_year_end is not None:
        fund.fiscal_year_end = payload.fiscal_year_end
    if payload.description is not None:
        fund.description = payload.description
    if payload.managed_by is not None:
        fund.managed_by = payload.managed_by

    if payload.status is not None:
        if payload.status == "Pending_Approval":
            fund.status = "Pending_Approval"
        elif payload.status in ("Approved", "Rejected"):
            if user_role not in ("Accountant", "Admin"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Accountant or Admin can approve or reject fund requests")
            fund.status = payload.status
            fund.managed_by = staff_id
            if payload.status == "Approved" and fund.current_balance == 0:
                fund.current_balance = fund.initial_balance
        elif payload.status == "Disbursed":
            if user_role not in ("Accountant", "Admin"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Accountant or Admin can disburse funds")
            if fund.status != "Approved":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fund request must be approved before disbursement")
            fund.status = "Disbursed"
            if payload.current_balance is not None:
                fund.current_balance = payload.current_balance
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid operational fund status")

    db.add(fund)
    try:
        await db.commit()
        await db.refresh(fund)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update operational fund request") from exc

    return fund
