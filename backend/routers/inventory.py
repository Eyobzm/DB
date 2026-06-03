"""
Inventory router - full implementation using Inventory model
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, update, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from database import get_db
from models import Equipment, Inventory
from schemas import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
    InventoryAdjust,
)
from auth_utils import require_roles, get_current_user

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"]) 


@router.get("", response_model=List[InventoryResponse])
async def list_inventory(
    category: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List inventory parts with optional category filter or low_stock flag. Joins equipment and vendor for derived part/supplier data."""
    query = select(Inventory).options(
        joinedload(Inventory.equipment).joinedload(Equipment.vendor)
    )

    if category:
        query = query.join(Inventory.equipment).where(Equipment.equipment_category == category)
    if low_stock:
        query = query.where(Inventory.quantity_available <= Inventory.quantity_reserved)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    out = []
    for it in items:
        equipment = it.equipment
        out.append({
            "part_id": it.inventory_id,
            "part_number": equipment.equipment_code if equipment is not None else None,
            "part_name": equipment.equipment_name if equipment is not None else None,
            "category": equipment.equipment_category if equipment is not None else None,
            "current_stock": it.quantity_available,
            "minimum_level": it.quantity_reserved,
            "unit_price": float(equipment.acquisition_cost) if equipment is not None and equipment.acquisition_cost is not None else None,
            "supplier_vendor_id": equipment.vendor_id if equipment is not None else None,
            "supplier_name": equipment.vendor.vendor_name if equipment is not None and equipment.vendor is not None else None,
            "created_at": it.created_at,
            "updated_at": it.updated_at,
        })

    return out


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    payload: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin", "Mechanic")),
):
    # ensure unique part_number
    existing = await db.execute(select(Inventory).where(Inventory.part_number == payload.part_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Part number already exists")

    item = Inventory(
        part_number=payload.part_number,
        part_name=payload.part_name,
        category=payload.category,
        current_stock=payload.current_stock or 0,
        minimum_level=payload.minimum_level or 0,
        unit_price=payload.unit_price,
        supplier_vendor_id=payload.supplier_vendor_id,
    )
    db.add(item)
    try:
        await db.commit()
        await db.refresh(item)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create inventory item") from exc

    return {
        "part_id": item.part_id,
        "part_number": item.part_number,
        "part_name": item.part_name,
        "category": item.category,
        "current_stock": item.current_stock,
        "minimum_level": item.minimum_level,
        "unit_price": float(item.unit_price) if item.unit_price is not None else None,
        "supplier_vendor_id": item.supplier_vendor_id,
        "supplier_name": item.supplier.vendor_name if item.supplier is not None else None,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


@router.patch("/{part_id}", response_model=InventoryResponse)
async def update_inventory_item(
    part_id: int,
    payload: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin", "Mechanic")),
):
    query = await db.execute(select(Inventory).where(Inventory.part_id == part_id).options(joinedload(Inventory.supplier)))
    item = query.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found")

    if payload.part_name is not None:
        item.part_name = payload.part_name
    if payload.category is not None:
        item.category = payload.category
    if payload.current_stock is not None:
        if payload.current_stock < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="current_stock cannot be negative")
        item.current_stock = payload.current_stock
    if payload.minimum_level is not None:
        if payload.minimum_level < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="minimum_level cannot be negative")
        item.minimum_level = payload.minimum_level
    if payload.unit_price is not None:
        item.unit_price = payload.unit_price
    if payload.supplier_vendor_id is not None:
        item.supplier_vendor_id = payload.supplier_vendor_id

    db.add(item)
    try:
        await db.commit()
        await db.refresh(item)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update inventory item")

    return {
        "part_id": item.part_id,
        "part_number": item.part_number,
        "part_name": item.part_name,
        "category": item.category,
        "current_stock": item.current_stock,
        "minimum_level": item.minimum_level,
        "unit_price": float(item.unit_price) if item.unit_price is not None else None,
        "supplier_vendor_id": item.supplier_vendor_id,
        "supplier_name": item.supplier.vendor_name if item.supplier is not None else None,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


@router.get("/low-stock", response_model=List[InventoryResponse])
async def low_stock_parts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Inventory).options(
        joinedload(Inventory.equipment).joinedload(Equipment.vendor)
    ).where(Inventory.quantity_available <= Inventory.quantity_reserved)
    # order by available quantity relative to reserved quantity ASC
    query = query.order_by((Inventory.quantity_available - Inventory.quantity_reserved).asc())
    result = await db.execute(query)
    items = result.scalars().all()

    out = []
    for it in items:
        equipment = it.equipment
        out.append({
            "part_id": it.inventory_id,
            "part_number": equipment.equipment_code if equipment is not None else None,
            "part_name": equipment.equipment_name if equipment is not None else None,
            "category": equipment.equipment_category if equipment is not None else None,
            "current_stock": it.quantity_available,
            "minimum_level": it.quantity_reserved,
            "unit_price": float(equipment.acquisition_cost) if equipment is not None and equipment.acquisition_cost is not None else None,
            "supplier_vendor_id": equipment.vendor_id if equipment is not None else None,
            "supplier_name": equipment.vendor.vendor_name if equipment is not None and equipment.vendor is not None else None,
            "created_at": it.created_at,
            "updated_at": it.updated_at,
        })

    return out


@router.patch("/{part_id}/adjust-stock", response_model=InventoryResponse)
async def adjust_stock(
    part_id: int,
    payload: InventoryAdjust,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin", "Mechanic")),
):
    query = await db.execute(select(Inventory).where(Inventory.part_id == part_id).options(joinedload(Inventory.supplier)))
    item = query.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found")

    if payload.quantity < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be positive")

    if payload.operation == "add":
        item.current_stock = (item.current_stock or 0) + payload.quantity
    else:
        # subtract
        if payload.quantity > (item.current_stock or 0):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
        item.current_stock = (item.current_stock or 0) - payload.quantity

    db.add(item)
    try:
        await db.commit()
        await db.refresh(item)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to adjust stock")

    return {
        "part_id": item.part_id,
        "part_number": item.part_number,
        "part_name": item.part_name,
        "category": item.category,
        "current_stock": item.current_stock,
        "minimum_level": item.minimum_level,
        "unit_price": float(item.unit_price) if item.unit_price is not None else None,
        "supplier_vendor_id": item.supplier_vendor_id,
        "supplier_name": item.supplier.vendor_name if item.supplier is not None else None,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }
