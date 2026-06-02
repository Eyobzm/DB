"""
Client payment management router
- POST /client-payments: record client payment receipts
- GET /client-payments: list client payments by site
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import ClientPayment, Site
from schemas import ClientPaymentCreate, ClientPaymentResponse
from auth_utils import get_current_user, require_roles, get_staff_id

router = APIRouter(prefix="/api/v1/client-payments", tags=["Finance"])


@router.post("", response_model=ClientPaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_client_payment(
    payload: ClientPaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin")),
):
    staff_id = get_staff_id(current_user)

    site_query = await db.execute(select(Site).where(Site.site_id == payload.site_id))
    site = site_query.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    payment = ClientPayment(
        payment_date=payload.payment_date,
        site_id=payload.site_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        reference_number=payload.reference_number,
        invoice_number=payload.invoice_number,
        description=payload.description,
        status=payload.status or "Pending",
        received_by=staff_id if payload.status == "Received" else None,
    )
    db.add(payment)
    try:
        await db.commit()
        await db.refresh(payment)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to record client payment") from exc

    return payment


@router.get("", response_model=List[ClientPaymentResponse])
async def list_client_payments(
    site_id: Optional[int] = Query(None, description="Filter by site"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin")),
):
    query = select(ClientPayment)
    if site_id is not None:
        query = query.where(ClientPayment.site_id == site_id)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()
