"""
Vendor payment management router
- POST /vendor-payments: create vendor payment requests and record paid invoices
- GET /vendor-payments: list vendor payments with optional vendor filter
- GET /vendors: retrieve vendor details and balances
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Vendor, VendorPayment
from schemas import VendorPaymentCreate, VendorPaymentResponse, VendorResponse
from auth_utils import get_current_user, require_roles, get_staff_id

router = APIRouter(prefix="/api/v1/vendor-payments", tags=["Finance"])


@router.post("", response_model=VendorPaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor_payment(
    payload: VendorPaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin")),
):
    staff_id = get_staff_id(current_user)

    vendor_query = await db.execute(select(Vendor).where(Vendor.vendor_id == payload.vendor_id))
    vendor = vendor_query.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    payment = VendorPayment(
        payment_date=payload.payment_date,
        vendor_id=payload.vendor_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        reference_number=payload.reference_number,
        invoice_number=payload.invoice_number,
        description=payload.description,
        status=payload.status or "Pending",
        processed_by=staff_id if payload.status == "Paid" else None,
        paid_date=payload.payment_date if payload.status == "Paid" else None,
    )

    if payload.status == "Paid":
        vendor.outstanding_balance = max(0.0, float(vendor.outstanding_balance or 0.0) - payload.amount)
        db.add(vendor)

    db.add(payment)
    try:
        await db.commit()
        await db.refresh(payment)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to record vendor payment") from exc

    return payment


@router.get("", response_model=List[VendorPaymentResponse])
async def list_vendor_payments(
    vendor_id: Optional[int] = Query(None, description="Filter by vendor"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin")),
):
    query = select(VendorPayment)
    if vendor_id is not None:
        query = query.where(VendorPayment.vendor_id == vendor_id)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/vendors", response_model=List[VendorResponse])
async def list_vendors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Accountant", "Admin")),
):
    result = await db.execute(select(Vendor).offset(skip).limit(limit))
    return result.scalars().all()
