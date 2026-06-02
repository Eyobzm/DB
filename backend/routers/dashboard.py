"""
Dashboard summary router - KPIs and trends
- GET /dashboard/summary: All dashboard metrics in single query
"""

from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Equipment, Site, MaintenanceSchedule, OperatorCertification, Staff
from schemas import (
    StaffResponse,
)
from auth_utils import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get comprehensive dashboard summary with KPIs.
    All queries use indexed columns for performance (<1s target).
    
    Returns:
    - equipment_counts: breakdown by status
    - active_sites: count of active sites
    - maintenance: pending and overdue counts
    - certifications_expiring_30d: list with staff name, cert type, expiry
    - fuel_cost_current_month: placeholder
    - equipment_expense_current_month: placeholder
    """
    
    # =========================================================================
    # Equipment Counts by Status (indexed on EQUIPMENT.status)
    # =========================================================================
    equipment_status_query = await db.execute(
        select(Equipment.status, func.count(Equipment.equipment_id).label("count"))
        .group_by(Equipment.status)
    )
    equipment_by_status = equipment_status_query.all()
    
    equipment_counts = {
        "total": 0,
        "available": 0,
        "in_use": 0,
        "under_maintenance": 0,
        "rented_out": 0,
        "retired": 0,
    }
    
    for status_row, count in equipment_by_status:
        equipment_counts["total"] += count
        status_lower = status_row.lower() if status_row else ""
        if status_lower == "active":
            equipment_counts["available"] += count
        elif status_lower == "in_maintenance":
            equipment_counts["under_maintenance"] += count
        elif status_lower == "retired":
            equipment_counts["retired"] += count
    
    # =========================================================================
    # Active Sites Count (indexed on SITE.status)
    # =========================================================================
    active_sites_query = await db.execute(
        select(func.count(Site.site_id)).where(Site.status == "Active")
    )
    active_sites = active_sites_query.scalar() or 0
    
    # =========================================================================
    # Maintenance Summary (indexed on MAINTENANCE_SCHEDULE.status and scheduled_date)
    # =========================================================================
    today = date.today()
    
    pending_maint_query = await db.execute(
        select(func.count(MaintenanceSchedule.maintenance_schedule_id)).where(
            MaintenanceSchedule.status == "Scheduled"
        )
    )
    pending_maintenance = pending_maint_query.scalar() or 0
    
    overdue_maint_query = await db.execute(
        select(func.count(MaintenanceSchedule.maintenance_schedule_id)).where(
            and_(
                MaintenanceSchedule.scheduled_date < today,
                MaintenanceSchedule.status == "Scheduled",
            )
        )
    )
    overdue_maintenance = overdue_maint_query.scalar() or 0
    
    # =========================================================================
    # Certifications Expiring in 30 Days (indexed on OPERATOR_CERTIFICATION.expiry_date)
    # =========================================================================
    expiry_cutoff = today + timedelta(days=30)
    expiring_certs_query = await db.execute(
        select(
            Staff.first_name,
            Staff.last_name,
            OperatorCertification.certification_type,
            OperatorCertification.expiry_date,
        ).join(Staff, Staff.staff_id == OperatorCertification.staff_id)
        .where(
            and_(
                OperatorCertification.expiry_date >= today,
                OperatorCertification.expiry_date <= expiry_cutoff,
                OperatorCertification.is_active == True,
            )
        )
    )
    expiring_certs = [
        {
            "staff_name": f"{row.first_name} {row.last_name}",
            "cert_type": row.certification_type,
            "expiry_date": row.expiry_date.isoformat() if row.expiry_date else None,
        }
        for row in expiring_certs_query.all()
    ]
    
    # =========================================================================
    # Fuel & Equipment Expenses (placeholder - no dedicated expense tables)
    # =========================================================================
    fuel_cost_current_month = 0.0
    equipment_expense_current_month = 0.0
    
    return {
        "equipment_counts": equipment_counts,
        "active_sites": active_sites,
        "maintenance": {
            "pending": pending_maintenance,
            "overdue": overdue_maintenance,
        },
        "certifications_expiring_30d": expiring_certs,
        "fuel_cost_current_month": fuel_cost_current_month,
        "equipment_expense_current_month": equipment_expense_current_month,
    }


@router.get("/overdue-maintenance")
async def get_overdue_maintenance_list(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get list of overdue maintenance schedules for alerts display.
    """
    today = date.today()
    query = await db.execute(
        select(
            MaintenanceSchedule.maintenance_schedule_id,
            MaintenanceSchedule.schedule_number,
            MaintenanceSchedule.equipment_id,
            MaintenanceSchedule.maintenance_type,
            MaintenanceSchedule.priority_level,
            MaintenanceSchedule.scheduled_date,
            MaintenanceSchedule.cost_estimate,
        ).where(
            and_(
                MaintenanceSchedule.scheduled_date < today,
                MaintenanceSchedule.status == "Scheduled",
            )
        )
        .order_by(MaintenanceSchedule.scheduled_date.desc())
        .limit(10)
    )
    
    return [
        {
            "maintenance_schedule_id": row.maintenance_schedule_id,
            "schedule_number": row.schedule_number,
            "equipment_id": row.equipment_id,
            "maintenance_type": row.maintenance_type,
            "priority_level": row.priority_level,
            "scheduled_date": row.scheduled_date.isoformat(),
            "cost_estimate": float(row.cost_estimate or 0),
        }
        for row in query.all()
    ]
