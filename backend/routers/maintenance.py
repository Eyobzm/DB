"""
Maintenance scheduling router
- POST /maintenance: create maintenance schedule
- PATCH /maintenance/{id}: update mechanic actual cost, notes, status
- GET /maintenance/overdue: return past-due scheduled records
- PATCH /maintenance/mark-overdue: background overdue marker
"""

from datetime import date
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import MaintenanceSchedule
from schemas import (
    MaintenanceScheduleCreate,
    MaintenanceScheduleUpdate,
    MaintenanceScheduleResponse,
)
from auth_utils import get_current_user, require_roles, get_staff_id

router = APIRouter(prefix="/api/v1/maintenance", tags=["Maintenance"])

ACTIVE_MAINTENANCE_STATUSES = ("Scheduled", "In_Progress", "Overdue")


def _format_schedule_number(scheduled_date: date, seq: int) -> str:
    return f"MS-{scheduled_date.strftime('%Y%m%d')}-{seq:04d}"


async def mark_overdue_maintenance(session: AsyncSession) -> int:
    today = date.today()
    stmt = (
        update(MaintenanceSchedule)
        .where(
            MaintenanceSchedule.scheduled_date < today,
            MaintenanceSchedule.status == 'Scheduled',
        )
        .values(status='Overdue')
    )
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount or 0


@router.post("", response_model=MaintenanceScheduleResponse, status_code=status.HTTP_201_CREATED)
async def schedule_maintenance(
    payload: MaintenanceScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    staff_id = get_staff_id(current_user)
    if current_user.get("role") not in ("Supervisor", "Site_Manager", "Mechanic"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to schedule maintenance")

    active_query = await db.execute(
        select(func.count())
        .select_from(MaintenanceSchedule)
        .where(
            MaintenanceSchedule.equipment_id == payload.equipment_id,
            MaintenanceSchedule.status.in_(ACTIVE_MAINTENANCE_STATUSES),
        )
    )
    existing_count = active_query.scalar() or 0
    if existing_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active maintenance schedule for this equipment already exists.",
        )

    seq_query = await db.execute(
        select(func.count())
        .select_from(MaintenanceSchedule)
        .where(MaintenanceSchedule.scheduled_date == payload.scheduled_date)
    )
    seq = (seq_query.scalar() or 0) + 1
    schedule_number = _format_schedule_number(payload.scheduled_date, seq)

    schedule = MaintenanceSchedule(
        schedule_number=schedule_number,
        equipment_id=payload.equipment_id,
        maintenance_type=payload.maintenance_type,
        priority_level=payload.priority_level,
        scheduled_date=payload.scheduled_date,
        scheduled_by=staff_id,
        performed_by=payload.assigned_mechanic_id,
        cost_estimate=payload.cost_estimate,
        notes=payload.notes,
        status='Scheduled',
    )
    db.add(schedule)
    try:
        await db.commit()
        await db.refresh(schedule)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create maintenance schedule") from exc

    return schedule


@router.get("", response_model=List[MaintenanceScheduleResponse])
async def list_maintenance_schedules(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    equipment_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority_level: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    query = select(MaintenanceSchedule)
    filters = []

    if equipment_id is not None:
        filters.append(MaintenanceSchedule.equipment_id == equipment_id)
    if status:
        filters.append(MaintenanceSchedule.status == status)
    if priority_level:
        filters.append(MaintenanceSchedule.priority_level == priority_level)
    if start_date:
        filters.append(MaintenanceSchedule.scheduled_date >= start_date)
    if end_date:
        filters.append(MaintenanceSchedule.scheduled_date <= end_date)

    if filters:
        query = query.where(and_(*filters))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/overdue", response_model=List[MaintenanceScheduleResponse])
async def overdue_maintenance_schedules(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    today = date.today()
    query = select(MaintenanceSchedule).where(
        MaintenanceSchedule.scheduled_date < today,
        MaintenanceSchedule.status == 'Scheduled',
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{maintenance_id}", response_model=MaintenanceScheduleResponse)
async def update_maintenance_schedule(
    maintenance_id: int,
    payload: MaintenanceScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Mechanic", "Supervisor")),
):
    query = await db.execute(select(MaintenanceSchedule).where(MaintenanceSchedule.maintenance_schedule_id == maintenance_id))
    schedule = query.scalar_one_or_none()

    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance schedule not found")

    if payload.actual_cost is not None:
        schedule.actual_cost = payload.actual_cost
    if payload.notes is not None:
        schedule.notes = payload.notes
    if payload.status is not None:
        if payload.status not in ('Scheduled', 'In_Progress', 'Completed', 'Cancelled', 'Overdue'):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value")
        schedule.status = payload.status
        if payload.status == 'Completed' and schedule.actual_completion_date is None:
            schedule.actual_completion_date = date.today()

    db.add(schedule)
    try:
        await db.commit()
        await db.refresh(schedule)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update maintenance schedule")

    return schedule


@router.patch("/mark-overdue", response_model=dict)
async def mark_overdue_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Supervisor", "Site_Manager")),
):
    count = await mark_overdue_maintenance(db)
    return {"updated": count}
