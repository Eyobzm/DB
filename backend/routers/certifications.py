"""
Operator certifications router
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from datetime import date

from database import get_db
from models import OperatorCertification
from schemas import OperatorCertificationCreate, OperatorCertificationUpdate, OperatorCertificationResponse
from auth_utils import require_roles, get_current_user

router = APIRouter(prefix="/api/v1/certifications", tags=["Certifications"])


@router.get("", response_model=List[OperatorCertificationResponse])
async def list_certifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    expiring_within_days: Optional[int] = Query(None, description="Filter certs expiring within N days"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    q = select(OperatorCertification)
    if expiring_within_days is not None:
        today = date.today()
        from datetime import timedelta
        upper = today + timedelta(days=expiring_within_days)
        q = q.where(OperatorCertification.expiry_date != None, OperatorCertification.expiry_date <= upper)
    q = q.offset(skip).limit(limit)
    res = await db.execute(q)
    return res.scalars().all()


@router.post("", response_model=OperatorCertificationResponse, status_code=status.HTTP_201_CREATED)
async def create_certification(payload: OperatorCertificationCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(require_roles("Admin","Supervisor"))):
    cert = OperatorCertification(
        staff_id=payload.staff_id,
        certification_type=payload.certification_type,
        certification_number=payload.certification_number,
        issuing_authority=payload.issuing_authority,
        issue_date=payload.issue_date,
        expiry_date=payload.expiry_date,
        is_active=True,
    )
    db.add(cert)
    try:
        await db.commit()
        await db.refresh(cert)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating certification")
    return cert


@router.get("/{cert_id}", response_model=OperatorCertificationResponse)
async def get_cert(cert_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    res = await db.execute(select(OperatorCertification).where(OperatorCertification.certification_id == cert_id))
    cert = res.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certification not found")
    return cert


@router.patch("/{cert_id}", response_model=OperatorCertificationResponse)
async def update_cert(cert_id: int, payload: OperatorCertificationUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(require_roles("Admin","Supervisor"))):
    res = await db.execute(select(OperatorCertification).where(OperatorCertification.certification_id == cert_id))
    cert = res.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certification not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cert, k, v)
    db.add(cert)
    try:
        await db.commit()
        await db.refresh(cert)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating certification")
    return cert
