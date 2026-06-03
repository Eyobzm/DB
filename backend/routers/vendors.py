"""
Vendor router: List all vendors
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import Vendor
from schemas import VendorResponse
from auth_utils import get_current_user

router = APIRouter(prefix="/api/v1/vendors", tags=["Vendors"])


@router.get("", response_model=List[VendorResponse])
async def list_vendors(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    """List vendor records."""
    result = await db.execute(select(Vendor).offset(skip).limit(limit))
    return result.scalars().all()
