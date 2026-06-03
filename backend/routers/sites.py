"""
Site router: List all construction sites
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import Site
from schemas import SiteResponse
from auth_utils import get_current_user

router = APIRouter(prefix="/api/v1/sites", tags=["Sites"])


@router.get("", response_model=List[SiteResponse])
async def list_sites(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    """List site records."""
    result = await db.execute(select(Site).offset(skip).limit(limit))
    return result.scalars().all()
