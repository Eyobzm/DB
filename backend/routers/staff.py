"""
Staff router: CRUD and deactivate endpoint
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List

from database import get_db
from models import Staff
from schemas import StaffCreate, StaffUpdate, StaffResponse
from auth_utils import require_roles, get_current_user

router = APIRouter(prefix="/api/v1/staff", tags=["Staff"])


@router.get("", response_model=List[StaffResponse])
async def list_staff(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    res = await db.execute(select(Staff).offset(skip).limit(limit))
    return res.scalars().all()


@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff(staff_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    res = await db.execute(select(Staff).where(Staff.staff_id == staff_id))
    staff = res.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")
    return staff


@router.post("", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(staff_in: StaffCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(require_roles("Admin"))):
    # Basic uniqueness checks
    existing = await db.execute(select(Staff).where(Staff.employee_number == staff_in.employee_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Employee number already exists")

    new_staff = Staff(
        employee_number=staff_in.employee_number,
        first_name=staff_in.first_name,
        last_name=staff_in.last_name,
        email=staff_in.email,
        phone=staff_in.phone,
        role=staff_in.role,
        status=staff_in.status,
        department=staff_in.department,
    )
    # Note: password handling omitted here; expect separate user management
    db.add(new_staff)
    try:
        await db.commit()
        await db.refresh(new_staff)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating staff")
    return new_staff


@router.patch("/{staff_id}", response_model=StaffResponse)
async def update_staff(staff_id: int, payload: StaffUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(require_roles("Admin"))):
    res = await db.execute(select(Staff).where(Staff.staff_id == staff_id))
    staff = res.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(staff, k, v)
    db.add(staff)
    try:
        await db.commit()
        await db.refresh(staff)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating staff")
    return staff


@router.patch("/{staff_id}/deactivate", response_model=StaffResponse)
async def deactivate_staff(staff_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(require_roles("Admin"))):
    res = await db.execute(select(Staff).where(Staff.staff_id == staff_id))
    staff = res.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")
    staff.status = 'Inactive'
    db.add(staff)
    try:
        await db.commit()
        await db.refresh(staff)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deactivating staff")
    return staff
