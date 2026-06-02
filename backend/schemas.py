"""
Pydantic v2 request/response schemas for CFMS
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime, date


# =====================================================================
# AUTH SCHEMAS
# =====================================================================
class LoginRequest(BaseModel):
    """Login request with employee number and password"""
    employee_number: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "employee_number": "EMP001",
                "password": "SecurePassword123!"
            }
        }
    }


class LoginResponse(BaseModel):
    """Successful login response with JWT token"""
    access_token: str
    token_type: str = "bearer"
    staff_id: int
    employee_number: str
    first_name: str
    last_name: str
    role: str
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "staff_id": 1,
                "employee_number": "EMP001",
                "first_name": "John",
                "last_name": "Doe",
                "role": "Admin"
            }
        }
    }


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Invalid employee number or password"
            }
        }
    }


# =====================================================================
# STAFF SCHEMAS
# =====================================================================
class StaffBase(BaseModel):
    """Base staff fields"""
    employee_number: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    status: str = "Active"
    department: Optional[str] = None
    date_hired: Optional[date] = None


class StaffCreate(StaffBase):
    """Staff creation (includes password)"""
    password: str = Field(..., min_length=8, max_length=255)


class StaffUpdate(BaseModel):
    """Staff update (optional fields)"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None


class StaffResponse(StaffBase):
    """Staff response (no password)"""
    staff_id: int
    assigned_site: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# VENDOR SCHEMAS
# =====================================================================
class VendorBase(BaseModel):
    """Base vendor fields"""
    vendor_name: str
    contact_person: str
    phone: Optional[str] = None
    email: EmailStr
    address: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None


class VendorCreate(VendorBase):
    """Vendor creation"""
    pass


class VendorUpdate(BaseModel):
    """Vendor update (optional fields)"""
    vendor_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    status: Optional[str] = None


class VendorResponse(VendorBase):
    """Vendor response"""
    vendor_id: int
    status: str
    outstanding_balance: float
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# SITE SCHEMAS
# =====================================================================
class SiteBase(BaseModel):
    """Base site fields"""
    site_code: str
    site_name: str
    location: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    site_manager: int
    client_name: Optional[str] = None
    project_description: Optional[str] = None
    start_date: Optional[date] = None
    estimated_end_date: Optional[date] = None
    budget: Optional[float] = None


class SiteCreate(SiteBase):
    """Site creation"""
    pass


class SiteUpdate(BaseModel):
    """Site update (optional fields)"""
    site_name: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    site_manager: Optional[int] = None
    client_name: Optional[str] = None
    project_description: Optional[str] = None
    start_date: Optional[date] = None
    estimated_end_date: Optional[date] = None
    status: Optional[str] = None
    budget: Optional[float] = None


class SiteResponse(SiteBase):
    """Site response"""
    site_id: int
    status: str
    actual_end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# OPERATOR CERTIFICATION SCHEMAS
# =====================================================================
class OperatorCertificationBase(BaseModel):
    """Base certification fields"""
    staff_id: int
    certification_type: str
    certification_number: str
    issuing_authority: Optional[str] = None
    issue_date: date
    expiry_date: Optional[date] = None


class OperatorCertificationCreate(OperatorCertificationBase):
    """Certification creation"""
    pass


class OperatorCertificationUpdate(BaseModel):
    """Certification update"""
    certification_type: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    is_active: Optional[bool] = None


class OperatorCertificationResponse(OperatorCertificationBase):
    """Certification response"""
    certification_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# EQUIPMENT SCHEMAS
# =====================================================================
class EquipmentBase(BaseModel):
    """Base equipment fields"""
    equipment_code: str
    equipment_name: str
    equipment_category: str
    manufacturer: Optional[str] = None
    model_year: Optional[int] = None
    serial_number: Optional[str] = None
    vendor_id: Optional[int] = None
    acquisition_cost: Optional[float] = None
    acquisition_date: Optional[date] = None
    useful_life_years: Optional[int] = None
    salvage_value: Optional[float] = None


class EquipmentCreate(EquipmentBase):
    """Equipment creation"""
    pass


class EquipmentUpdate(BaseModel):
    """Equipment update (optional fields)"""
    equipment_name: Optional[str] = None
    equipment_category: Optional[str] = None
    manufacturer: Optional[str] = None
    model_year: Optional[int] = None
    serial_number: Optional[str] = None
    vendor_id: Optional[int] = None
    acquisition_cost: Optional[float] = None
    acquisition_date: Optional[date] = None
    useful_life_years: Optional[int] = None
    salvage_value: Optional[float] = None
    status: Optional[str] = None
    current_site: Optional[int] = None
    operator_id: Optional[int] = None


class EquipmentResponse(EquipmentBase):
    """Equipment response"""
    equipment_id: int
    status: str
    current_site: Optional[int] = None
    operator_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# EQUIPMENT INSURANCE SCHEMAS
# =====================================================================
class EquipmentInsuranceBase(BaseModel):
    """Base insurance fields"""
    equipment_id: int
    policy_number: str
    insurance_provider: str
    coverage_amount: float
    premium_amount: Optional[float] = None
    deductible: Optional[float] = None
    start_date: date
    end_date: date


class EquipmentInsuranceCreate(EquipmentInsuranceBase):
    """Insurance creation"""
    pass


class EquipmentInsuranceUpdate(BaseModel):
    """Insurance update (optional fields)"""
    policy_number: Optional[str] = None
    insurance_provider: Optional[str] = None
    coverage_amount: Optional[float] = None
    premium_amount: Optional[float] = None
    deductible: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None


class EquipmentInsuranceResponse(EquipmentInsuranceBase):
    """Insurance response"""
    insurance_policy_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# MAINTENANCE SCHEDULE SCHEMAS
# =====================================================================
class MaintenanceScheduleCreate(BaseModel):
    equipment_id: int
    maintenance_type: str
    priority_level: str
    scheduled_date: date
    assigned_mechanic_id: Optional[int] = None
    cost_estimate: Optional[float] = None
    notes: Optional[str] = None


class MaintenanceScheduleUpdate(BaseModel):
    actual_cost: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class MaintenanceScheduleResponse(BaseModel):
    maintenance_schedule_id: int
    schedule_number: str
    equipment_id: int
    maintenance_type: str
    priority_level: str
    scheduled_date: date
    actual_completion_date: Optional[date] = None
    scheduled_by: Optional[int] = None
    performed_by: Optional[int] = None
    cost_estimate: Optional[float] = None
    actual_cost: Optional[float] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# =====================================================================
# ATTACHMENT SCHEMAS
# =====================================================================
class AttachmentBase(BaseModel):
    """Base attachment fields"""
    record_type: str
    record_id: int
    file_name: str
    file_path: str
    description: Optional[str] = None


class AttachmentCreate(BaseModel):
    """Attachment creation (uploaded_by set from context)"""
    record_type: str
    record_id: int
    file_name: str
    file_path: str
    file_size_bytes: Optional[int] = None
    file_type: Optional[str] = None
    description: Optional[str] = None


class AttachmentResponse(AttachmentBase):
    """Attachment response"""
    attachment_id: int
    file_size_bytes: Optional[int] = None
    file_type: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# =====================================================================
# FINANCIAL MANAGEMENT SCHEMAS
# =====================================================================
class ClientPaymentBase(BaseModel):
    payment_date: date
    site_id: int
    amount: float
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Pending"


class ClientPaymentCreate(ClientPaymentBase):
    pass


class ClientPaymentResponse(ClientPaymentBase):
    client_payment_id: int
    received_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VendorPaymentBase(BaseModel):
    payment_date: date
    vendor_id: int
    amount: float
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Pending"


class VendorPaymentCreate(VendorPaymentBase):
    pass


class VendorPaymentResponse(VendorPaymentBase):
    vendor_payment_id: int
    processed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OperationalFundBase(BaseModel):
    fund_name: str
    fund_category: str
    initial_balance: float
    current_balance: Optional[float] = None
    fiscal_year_start: date
    fiscal_year_end: date
    description: Optional[str] = None
    managed_by: Optional[int] = None
    status: Optional[str] = "Draft"


class OperationalFundCreate(OperationalFundBase):
    current_balance: Optional[float] = None


class OperationalFundUpdate(BaseModel):
    fund_name: Optional[str] = None
    fund_category: Optional[str] = None
    initial_balance: Optional[float] = None
    current_balance: Optional[float] = None
    fiscal_year_start: Optional[date] = None
    fiscal_year_end: Optional[date] = None
    description: Optional[str] = None
    managed_by: Optional[int] = None
    status: Optional[str] = None


class OperationalFundResponse(OperationalFundBase):
    operational_fund_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SiteBudgetBase(BaseModel):
    site_id: int
    allocated_amount: float
    spent_to_date: Optional[float] = 0.0
    committed_amount: Optional[float] = 0.0
    fiscal_year_start: date
    fiscal_year_end: date
    status: Optional[str] = "Active"


class SiteBudgetCreate(SiteBudgetBase):
    pass


class SiteBudgetUpdate(BaseModel):
    allocated_amount: Optional[float] = None
    spent_to_date: Optional[float] = None
    committed_amount: Optional[float] = None
    fiscal_year_start: Optional[date] = None
    fiscal_year_end: Optional[date] = None
    status: Optional[str] = None


class SiteBudgetResponse(SiteBudgetBase):
    site_budget_id: int
    remaining_balance: float
    variance_alert: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# =====================================================================
# INVENTORY SCHEMAS
# =====================================================================
class InventoryBase(BaseModel):
    part_number: str
    part_name: str
    category: str
    current_stock: int = 0
    minimum_level: int = 0
    unit_price: Optional[float] = None
    supplier_vendor_id: Optional[int] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    part_name: Optional[str] = None
    category: Optional[str] = None
    current_stock: Optional[int] = None
    minimum_level: Optional[int] = None
    unit_price: Optional[float] = None
    supplier_vendor_id: Optional[int] = None


class InventoryAdjust(BaseModel):
    quantity: int
    reason: Optional[str] = None
    operation: Literal["add", "subtract"]


class InventoryResponse(InventoryBase):
    part_id: int
    supplier_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# =====================================================================
# ACTIVITY LOG SCHEMAS
# =====================================================================
class ActivityLogCreate(BaseModel):
    equipment_id: int
    activity_date: date
    activity_type: Optional[str] = None
    assistant_id: Optional[int] = None
    hours_used: Optional[float] = None
    engine_hours_start: Optional[float] = None
    engine_hours_end: Optional[float] = None
    odometer_start: Optional[float] = None
    odometer_end: Optional[float] = None
    fuel_consumed: Optional[float] = None
    material_type: Optional[str] = None
    description: Optional[str] = None


class ActivityLogResponse(BaseModel):
    activity_id: int
    transaction_number: str
    equipment_id: int
    activity_date: date
    activity_type: Optional[str] = None
    operator_id: int
    assistant_id: Optional[int] = None
    verifier_id: Optional[int] = None
    hours_used: Optional[float] = None
    engine_hours_start: Optional[float] = None
    engine_hours_end: Optional[float] = None
    odometer_start: Optional[float] = None
    odometer_end: Optional[float] = None
    fuel_consumed: Optional[float] = None
    material_type: Optional[str] = None
    description: Optional[str] = None
    is_verified: bool
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
