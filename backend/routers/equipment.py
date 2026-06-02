"""
Equipment management router for CFMS
- GET /equipment: Paginated list with filtering
- GET /equipment/{id}: Full equipment detail
- POST /equipment: Create equipment (Admin/Site_Manager)
- PATCH /equipment/{id}: Update equipment
- GET /equipment/{id}/insurance: Insurance policies
- GET /equipment/{id}/attachments: File attachments
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from typing import Optional, List

from database import get_db
from models import Equipment, EquipmentInsurance, Attachment, Site, Vendor
from schemas import (
    EquipmentCreate, EquipmentUpdate, EquipmentResponse,
    EquipmentInsuranceCreate, EquipmentInsuranceUpdate, EquipmentInsuranceResponse,
    AttachmentResponse,
)
from auth_utils import require_roles, get_current_user, get_staff_id

# =====================================================================
# Router Setup
# =====================================================================
router = APIRouter(prefix="/api/v1/equipment", tags=["Equipment"])

# =====================================================================
# Constants
# =====================================================================
VALID_EQUIPMENT_STATUSES = [
    "Available", "In_Use", "Under_Maintenance", "Rented_Out", "Retired", "Stored"
]

VALID_EQUIPMENT_CATEGORIES = [
    "Truck", "Excavator", "Loader", "Bulldozer", "Grader", "Backhoe", "Crane", "Forklift"
]

# =====================================================================
# Equipment Endpoints
# =====================================================================

@router.get("", response_model=List[EquipmentResponse])
async def list_equipment(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Page size"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    site_id: Optional[int] = Query(None, description="Filter by current site"),
):
    """
    List equipment with pagination and filtering.
    
    Query Parameters:
    - skip: Pagination offset (default 0)
    - limit: Page size (default 20, max 100)
    - status: Filter by status (Available, In_Use, etc.)
    - category: Filter by category (Truck, Excavator, etc.)
    - site_id: Filter by current site
    
    Returns:
        List of equipment
    """
    # Build base query
    query = select(Equipment)
    
    # Apply filters
    filters = []
    
    if status:
        if status not in VALID_EQUIPMENT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Valid statuses: {', '.join(VALID_EQUIPMENT_STATUSES)}",
            )
        filters.append(Equipment.status == status)
    
    if category:
        if category not in VALID_EQUIPMENT_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Valid categories: {', '.join(VALID_EQUIPMENT_CATEGORIES)}",
            )
        filters.append(Equipment.equipment_category == category)
    
    if site_id is not None:
        filters.append(Equipment.current_site == site_id)
    
    # Combine filters with AND
    if filters:
        query = query.where(and_(*filters))
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    equipment_list = result.scalars().all()
    
    return equipment_list


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get equipment details.
    
    Args:
        equipment_id: Equipment ID
        
    Returns:
        Equipment details with related data
    """
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    return equipment


@router.post("", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin", "Site_Manager")),
):
    """
    Create new equipment (Admin/Site_Manager only).
    
    Args:
        equipment_data: Equipment creation data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created equipment
        
    Raises:
        HTTPException 400: Duplicate Equipment_Code or Serial_Number
        HTTPException 403: Insufficient permissions
    """
    # Validate equipment_code uniqueness
    existing_code = await db.execute(
        select(Equipment).where(Equipment.equipment_code == equipment_data.equipment_code)
    )
    if existing_code.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment code already exists",
        )
    
    # Validate serial_number uniqueness
    if equipment_data.serial_number:
        existing_serial = await db.execute(
            select(Equipment).where(Equipment.serial_number == equipment_data.serial_number)
        )
        if existing_serial.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Serial number already exists",
            )
    
    # Validate category
    if equipment_data.equipment_category not in VALID_EQUIPMENT_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Valid categories: {', '.join(VALID_EQUIPMENT_CATEGORIES)}",
        )
    
    # Create equipment
    new_equipment = Equipment(
        equipment_code=equipment_data.equipment_code,
        equipment_name=equipment_data.equipment_name,
        equipment_category=equipment_data.equipment_category,
        manufacturer=equipment_data.manufacturer,
        model_year=equipment_data.model_year,
        serial_number=equipment_data.serial_number,
        vendor_id=equipment_data.vendor_id,
        acquisition_cost=equipment_data.acquisition_cost,
        acquisition_date=equipment_data.acquisition_date,
        useful_life_years=equipment_data.useful_life_years,
        salvage_value=equipment_data.salvage_value,
        status="Available",  # Default status
    )
    
    db.add(new_equipment)
    
    try:
        await db.commit()
        await db.refresh(new_equipment)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating equipment",
        ) from e
    
    return new_equipment


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin", "Site_Manager")),
):
    """
    Update equipment (Admin/Site_Manager only).
    
    Validates status transitions and unique constraints.
    
    Args:
        equipment_id: Equipment ID
        equipment_data: Update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Updated equipment
        
    Raises:
        HTTPException 404: Equipment not found
        HTTPException 400: Invalid status or duplicate unique field
        HTTPException 403: Insufficient permissions
    """
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    # Validate equipment_code uniqueness if changing
    if equipment_data.equipment_code and equipment_data.equipment_code != equipment.equipment_code:
        existing = await db.execute(
            select(Equipment).where(Equipment.equipment_code == equipment_data.equipment_code)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Equipment code already exists",
            )
    
    # Validate serial_number uniqueness if changing
    if equipment_data.serial_number and equipment_data.serial_number != equipment.serial_number:
        existing = await db.execute(
            select(Equipment).where(Equipment.serial_number == equipment_data.serial_number)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Serial number already exists",
            )
    
    # Validate category if provided
    if equipment_data.equipment_category and equipment_data.equipment_category not in VALID_EQUIPMENT_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Valid categories: {', '.join(VALID_EQUIPMENT_CATEGORIES)}",
        )
    
    # Validate status if provided
    if equipment_data.status and equipment_data.status not in VALID_EQUIPMENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Valid statuses: {', '.join(VALID_EQUIPMENT_STATUSES)}",
        )
    
    # Update fields
    update_data = equipment_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(equipment, key, value)
    
    try:
        await db.commit()
        await db.refresh(equipment)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error updating equipment",
        ) from e
    
    return equipment


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin")),
):
    """
    Delete equipment (Admin only).
    
    Args:
        equipment_id: Equipment ID
        db: Database session
        current_user: Current authenticated user
        
    Raises:
        HTTPException 404: Equipment not found
        HTTPException 403: Insufficient permissions
    """
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    await db.delete(equipment)
    await db.commit()


# =====================================================================
# Equipment Insurance Endpoints
# =====================================================================

@router.get("/{equipment_id}/insurance", response_model=List[EquipmentInsuranceResponse])
async def list_equipment_insurance(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    List insurance policies for equipment.
    
    Args:
        equipment_id: Equipment ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of insurance policies
    """
    # Verify equipment exists
    equipment_result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    if not equipment_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    result = await db.execute(
        select(EquipmentInsurance).where(
            EquipmentInsurance.equipment_id == equipment_id
        )
    )
    return result.scalars().all()


@router.post("/{equipment_id}/insurance", response_model=EquipmentInsuranceResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment_insurance(
    equipment_id: int,
    insurance_data: EquipmentInsuranceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("Admin", "Accountant")),
):
    """
    Create insurance policy for equipment (Admin/Accountant only).
    
    Args:
        equipment_id: Equipment ID
        insurance_data: Insurance creation data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created insurance policy
    """
    # Verify equipment exists
    equipment_result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    if not equipment_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    # Verify policy_number uniqueness
    existing = await db.execute(
        select(EquipmentInsurance).where(
            EquipmentInsurance.policy_number == insurance_data.policy_number
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Policy number already exists",
        )
    
    new_insurance = EquipmentInsurance(
        equipment_id=equipment_id,
        policy_number=insurance_data.policy_number,
        insurance_provider=insurance_data.insurance_provider,
        coverage_amount=insurance_data.coverage_amount,
        premium_amount=insurance_data.premium_amount,
        deductible=insurance_data.deductible,
        start_date=insurance_data.start_date,
        end_date=insurance_data.end_date,
        status="Active",
    )
    
    db.add(new_insurance)
    
    try:
        await db.commit()
        await db.refresh(new_insurance)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating insurance policy",
        ) from e
    
    return new_insurance


# =====================================================================
# Equipment Attachment Endpoints
# =====================================================================

@router.get("/{equipment_id}/attachments", response_model=List[AttachmentResponse])
async def list_equipment_attachments(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    List attachments for equipment.
    
    Args:
        equipment_id: Equipment ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of attachments
    """
    # Verify equipment exists
    equipment_result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    if not equipment_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    result = await db.execute(
        select(Attachment).where(
            and_(
                Attachment.record_type == "Equipment",
                Attachment.record_id == equipment_id,
            )
        )
    )
    return result.scalars().all()


@router.post("/{equipment_id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment_attachment(
    equipment_id: int,
    attachment_data: EquipmentInsuranceCreate,  # Reusing schema for now
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload attachment for equipment.
    
    Args:
        equipment_id: Equipment ID
        attachment_data: Attachment data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Created attachment
    """
    # Verify equipment exists
    equipment_result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    if not equipment_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found",
        )
    
    staff_id = get_staff_id(current_user)
    
    new_attachment = Attachment(
        record_type="Equipment",
        record_id=equipment_id,
        file_name=attachment_data.file_name,
        file_path=attachment_data.file_path,
        file_size_bytes=getattr(attachment_data, 'file_size_bytes', None),
        file_type=getattr(attachment_data, 'file_type', None),
        uploaded_by=staff_id,
        description=getattr(attachment_data, 'description', None),
    )
    
    db.add(new_attachment)
    
    try:
        await db.commit()
        await db.refresh(new_attachment)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating attachment",
        ) from e
    
    return new_attachment
