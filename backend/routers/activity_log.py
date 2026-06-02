"""
Activity Log router (UC-01)
- POST /activity-logs: create activity log (Supervisor or Heavy/Light Operator)
- GET /activity-logs: list with filters
- PATCH /activity-logs/{id}/verify: Supervisor only
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, or_
from datetime import date, datetime
from typing import Optional, List

from database import get_db
from models import ActivityLog, Equipment, OperatorCertification
from schemas import ActivityLogCreate, ActivityLogResponse
from auth_utils import get_current_user, require_roles, get_staff_id

router = APIRouter(prefix="/api/v1/activity-logs", tags=["ActivityLogs"])


def _format_transaction_number(dt: date, seq: int) -> str:
    return f"ACT-{dt.strftime('%Y%m%d')}-{seq:04d}"


@router.post("", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
async def create_activity_log(
    payload: ActivityLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create an activity log. Operator is taken from current user."""
    staff_id = get_staff_id(current_user)

    # Only certain roles allowed to create (Supervisor or Operators)
    role = current_user.get("role")
    if role not in ("Supervisor", "Heavy_Operator", "Light_Driver"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to submit activity log")

    # Check operator certification validity
    # operator is the current user (staff_id)
    today = date.today()
    cert_q = await db.execute(
        select(OperatorCertification).where(
            OperatorCertification.staff_id == staff_id,
            OperatorCertification.is_active == True,
            or_(OperatorCertification.expiry_date == None, OperatorCertification.expiry_date >= today)
        )
    )
    valid_cert = cert_q.scalar_one_or_none()
    if not valid_cert:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Operator certification expired or inactive")

    # Generate transaction number: count existing for that date + 1
    seq_q = await db.execute(
        select(func.count()).select_from(ActivityLog).where(ActivityLog.activity_date == payload.activity_date)
    )
    cnt = seq_q.scalar() or 0
    seq = cnt + 1
    txn_number = _format_transaction_number(payload.activity_date, seq)

    # Create ActivityLog
    activity = ActivityLog(
        transaction_number=txn_number,
        equipment_id=payload.equipment_id,
        activity_date=payload.activity_date,
        activity_type=payload.activity_type,
        operator_id=staff_id,
        assistant_id=payload.assistant_id,
        hours_used=payload.hours_used,
        engine_hours_start=payload.engine_hours_start,
        engine_hours_end=payload.engine_hours_end,
        odometer_start=payload.odometer_start,
        odometer_end=payload.odometer_end,
        fuel_consumed=payload.fuel_consumed,
        material_type=payload.material_type,
        description=payload.description,
        is_verified=False,
        status='Pending_Verification',
    )

    db.add(activity)
    try:
        await db.commit()
        await db.refresh(activity)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error saving activity log") from e

    # After save, update equipment engine_hours and odometer_reading if end values provided
    try:
        equip_q = await db.execute(select(Equipment).where(Equipment.equipment_id == payload.equipment_id))
        equipment = equip_q.scalar_one_or_none()
        if equipment:
            changed = False
            if payload.engine_hours_end is not None:
                equipment.engine_hours = payload.engine_hours_end
                changed = True
            if payload.odometer_end is not None:
                equipment.odometer_reading = payload.odometer_end
                changed = True
            if changed:
                db.add(equipment)
                await db.commit()
    except Exception:
        # Non-fatal: log client may handle
        await db.rollback()

    return activity


@router.get("", response_model=List[ActivityLogResponse])
async def list_activity_logs(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    site_id: Optional[int] = Query(None),
    equipment_id: Optional[int] = Query(None),
    operator_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    q = select(ActivityLog)

    filters = []
    if start_date:
        filters.append(ActivityLog.activity_date >= start_date)
    if end_date:
        filters.append(ActivityLog.activity_date <= end_date)
    if equipment_id:
        filters.append(ActivityLog.equipment_id == equipment_id)
    if operator_id:
        filters.append(ActivityLog.operator_id == operator_id)
    if site_id:
        # join via equipment current_site
        q = q.join(Equipment, ActivityLog.equipment_id == Equipment.equipment_id)
        filters.append(Equipment.current_site == site_id)

    if filters:
        q = q.where(and_(*filters))

    q = q.offset(skip).limit(limit)
    res = await db.execute(q)
    return res.scalars().all()


@router.patch("/{activity_id}/verify", response_model=ActivityLogResponse)
async def verify_activity_log(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Supervisor")),
):
    verifier_staff_id = get_staff_id(current_user)

    res = await db.execute(select(ActivityLog).where(ActivityLog.activity_id == activity_id))
    activity = res.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity log not found")

    activity.is_verified = True
    activity.verified_by_staffid = verifier_staff_id
    activity.verifier_id = verifier_staff_id
    activity.status = 'Verified'

    db.add(activity)
    try:
        await db.commit()
        await db.refresh(activity)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error verifying activity log")

    return activity
