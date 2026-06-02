"""
SQLAlchemy ORM models for CFMS - all 17 tables
Async SQLAlchemy 2.0 with InnoDB, utf8mb4
"""

from datetime import datetime
from sqlalchemy import (
    Integer, String, Text, Numeric, Date, DateTime, Boolean, Enum,
    ForeignKey, UniqueConstraint, Index, text, CheckConstraint, Computed
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from typing import Optional, List


class Base(DeclarativeBase):
    """Base class for all ORM models"""
    pass


# =====================================================================
# TABLE: STAFF
# =====================================================================
class Staff(Base):
    __tablename__ = "staff"
    
    staff_id: Mapped[int] = mapped_column("StaffID", Integer, primary_key=True)
    employee_number: Mapped[str] = mapped_column("Employee_Number", String(50), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column("First_Name", String(100), nullable=False)
    last_name: Mapped[str] = mapped_column("Last_Name", String(100), nullable=False)
    email: Mapped[str] = mapped_column("Email", String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column("Phone", String(20))
    password_hash: Mapped[str] = mapped_column("Password_Hash", String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        "Role",
        Enum('Admin', 'Accountant', 'Site_Manager', 'Supervisor', 
             'Mechanic', 'Heavy_Operator', 'Light_Driver'),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Active', 'Inactive', 'On_Leave', 'Suspended'),
        nullable=False,
        default='Active'
    )
    department: Mapped[Optional[str]] = mapped_column("Department", String(100))
    date_hired: Mapped[Optional[datetime]] = mapped_column("Date_Hired", Date)
    assigned_site: Mapped[Optional[int]] = mapped_column("Assigned_Site", Integer, ForeignKey("site.SiteID"))
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_staff_role", "Role"),
        Index("idx_staff_status", "Status"),
        Index("idx_staff_assigned_site", "Assigned_Site"),
    )
    
    # Relationships
    site: Mapped[Optional["Site"]] = relationship("Site", foreign_keys=[assigned_site])
    certifications: Mapped[List["OperatorCertification"]] = relationship("OperatorCertification", back_populates="staff")


# =====================================================================
# TABLE: VENDOR
# =====================================================================
class Vendor(Base):
    __tablename__ = "vendor"
    
    vendor_id: Mapped[int] = mapped_column("VendorID", Integer, primary_key=True)
    vendor_name: Mapped[str] = mapped_column("Vendor_Name", String(255), unique=True, nullable=False)
    contact_person: Mapped[str] = mapped_column("Contact_Person", String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column("Phone", String(20))
    email: Mapped[str] = mapped_column("Email", String(255), unique=True, nullable=False)
    address: Mapped[Optional[str]] = mapped_column("Address", String(500))
    city: Mapped[Optional[str]] = mapped_column("City", String(100))
    state_province: Mapped[Optional[str]] = mapped_column("State_Province", String(100))
    country: Mapped[Optional[str]] = mapped_column("Country", String(100))
    postal_code: Mapped[Optional[str]] = mapped_column("Postal_Code", String(20))
    tax_id: Mapped[Optional[str]] = mapped_column("Tax_ID", String(50), unique=True)
    payment_terms: Mapped[Optional[str]] = mapped_column("Payment_Terms", String(100))
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Active', 'Inactive', 'Blacklisted', 'Pending_Verification'),
        nullable=False,
        default='Pending_Verification'
    )
    outstanding_balance: Mapped[float] = mapped_column("Outstanding_Balance", Numeric(14, 2), default=0.0)
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_vendor_status", "Status"),
        Index("idx_vendor_email", "Email"),
    )


# =====================================================================
# TABLE: SITE
# =====================================================================
class Site(Base):
    __tablename__ = "site"
    
    site_id: Mapped[int] = mapped_column("SiteID", Integer, primary_key=True)
    site_code: Mapped[str] = mapped_column("Site_Code", String(50), unique=True, nullable=False)
    site_name: Mapped[str] = mapped_column("Site_Name", String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column("Location", String(500))
    city: Mapped[Optional[str]] = mapped_column("City", String(100))
    state_province: Mapped[Optional[str]] = mapped_column("State_Province", String(100))
    country: Mapped[Optional[str]] = mapped_column("Country", String(100))
    postal_code: Mapped[Optional[str]] = mapped_column("Postal_Code", String(20))
    site_manager: Mapped[int] = mapped_column("Site_Manager", Integer, ForeignKey("staff.StaffID"), nullable=False)
    client_name: Mapped[Optional[str]] = mapped_column("Client_Name", String(255))
    project_description: Mapped[Optional[str]] = mapped_column("Project_Description", Text)
    start_date: Mapped[Optional[datetime]] = mapped_column("Start_Date", Date)
    estimated_end_date: Mapped[Optional[datetime]] = mapped_column("Estimated_End_Date", Date)
    actual_end_date: Mapped[Optional[datetime]] = mapped_column("Actual_End_Date", Date)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Active', 'Completed', 'On_Hold', 'Cancelled'),
        nullable=False,
        default='Active'
    )
    budget: Mapped[Optional[float]] = mapped_column("Budget", Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_site_manager", "Site_Manager"),
        Index("idx_site_status", "Status"),
    )
    
    # Relationships
    manager: Mapped["Staff"] = relationship("Staff", foreign_keys=[site_manager])


# =====================================================================
# TABLE: EQUIPMENT
# =====================================================================
class Equipment(Base):
    __tablename__ = "equipment"
    
    equipment_id: Mapped[int] = mapped_column("EquipmentID", Integer, primary_key=True)
    equipment_code: Mapped[str] = mapped_column("Equipment_Code", String(50), unique=True, nullable=False)
    equipment_name: Mapped[str] = mapped_column("Equipment_Name", String(255), nullable=False)
    equipment_category: Mapped[str] = mapped_column("Equipment_Category", String(100), nullable=False)
    manufacturer: Mapped[Optional[str]] = mapped_column("Manufacturer", String(150))
    model_year: Mapped[Optional[int]] = mapped_column("Model_Year", Integer)
    serial_number: Mapped[Optional[str]] = mapped_column("Serial_Number", String(100), unique=True)
    vendor_id: Mapped[Optional[int]] = mapped_column("VendorID", Integer, ForeignKey("vendor.VendorID"))
    acquisition_cost: Mapped[Optional[float]] = mapped_column("Acquisition_Cost", Numeric(12, 2))
    acquisition_date: Mapped[Optional[datetime]] = mapped_column("Acquisition_Date", Date)
    useful_life_years: Mapped[Optional[int]] = mapped_column("Useful_Life_Years", Integer)
    salvage_value: Mapped[Optional[float]] = mapped_column("Salvage_Value", Numeric(12, 2))
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Active', 'Inactive', 'In_Maintenance', 'Retired', 'For_Sale'),
        nullable=False,
        default='Active'
    )
    current_site: Mapped[Optional[int]] = mapped_column("Current_Site", Integer, ForeignKey("site.SiteID"))
    operator_id: Mapped[Optional[int]] = mapped_column("Operator_ID", Integer, ForeignKey("staff.StaffID"))
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_equipment_category", "Equipment_Category"),
        Index("idx_equipment_status", "Status"),
        Index("idx_equipment_current_site", "Current_Site"),
        Index("idx_equipment_operator", "Operator_ID"),
    )
    
    # Relationships
    vendor: Mapped[Optional["Vendor"]] = relationship("Vendor", foreign_keys=[vendor_id])
    current_site_ref: Mapped[Optional["Site"]] = relationship("Site", foreign_keys=[current_site])
    operator: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[operator_id])
    insurance_policies: Mapped[List["EquipmentInsurance"]] = relationship("EquipmentInsurance", back_populates="equipment")


# =====================================================================
# TABLE: OPERATOR_CERTIFICATION
# =====================================================================
class OperatorCertification(Base):
    __tablename__ = "operator_certification"
    
    certification_id: Mapped[int] = mapped_column("CertificationID", Integer, primary_key=True)
    staff_id: Mapped[int] = mapped_column("StaffID", Integer, ForeignKey("staff.StaffID"), nullable=False)
    certification_type: Mapped[str] = mapped_column("Certification_Type", String(255), nullable=False)
    certification_number: Mapped[str] = mapped_column("Certification_Number", String(100), unique=True, nullable=False)
    issuing_authority: Mapped[Optional[str]] = mapped_column("Issuing_Authority", String(255))
    issue_date: Mapped[datetime] = mapped_column("Issue_Date", Date, nullable=False)
    expiry_date: Mapped[Optional[datetime]] = mapped_column("Expiry_Date", Date)
    is_active: Mapped[bool] = mapped_column("Is_Active", Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_cert_staff", "StaffID"),
        Index("idx_cert_expiry", "Expiry_Date"),
    )
    
    # Relationships
    staff: Mapped["Staff"] = relationship("Staff", foreign_keys=[staff_id], back_populates="certifications")


# =====================================================================
# TABLE: ACTIVITY_LOG
# =====================================================================
class ActivityLog(Base):
    __tablename__ = "activity_log"

    activity_id: Mapped[int] = mapped_column("ActivityID", Integer, primary_key=True)
    equipment_id: Mapped[int] = mapped_column("EquipmentID", Integer, ForeignKey("equipment.EquipmentID"), nullable=False)
    activity_date: Mapped[datetime] = mapped_column("Activity_Date", Date, nullable=False)
    activity_type: Mapped[Optional[str]] = mapped_column("Activity_Type", String(100))
    operator_id: Mapped[int] = mapped_column("OperatorID", Integer, ForeignKey("staff.StaffID"), nullable=False)
    assistant_id: Mapped[Optional[int]] = mapped_column("AssistantID", Integer, ForeignKey("staff.StaffID"))
    verifier_id: Mapped[Optional[int]] = mapped_column("VerifierID", Integer, ForeignKey("staff.StaffID"))
    hours_used: Mapped[Optional[float]] = mapped_column("Hours_Used", Numeric(8,2))
    description: Mapped[Optional[str]] = mapped_column("Description", Text)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Completed', 'Pending_Verification', 'Rejected', 'Verified'),
        nullable=False,
        default='Pending_Verification'
    )
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_actlog_equip_date", "EquipmentID", "Activity_Date"),
        Index("idx_actlog_status", "Status"),
        Index("idx_actlog_operator", "OperatorID"),
    )

    # Relationships
    equipment: Mapped["Equipment"] = relationship("Equipment", foreign_keys=[equipment_id])
    operator: Mapped["Staff"] = relationship("Staff", foreign_keys=[operator_id])
    assistant: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[assistant_id])
    verifier: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[verifier_id])


# =====================================================================
# TABLE: MAINTENANCE_SCHEDULE
# =====================================================================
class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedule"

    maintenance_schedule_id: Mapped[int] = mapped_column("Maintenance_ScheduleID", Integer, primary_key=True)
    schedule_number: Mapped[str] = mapped_column("Schedule_Number", String(50), unique=True, nullable=False)
    equipment_id: Mapped[int] = mapped_column("EquipmentID", Integer, ForeignKey("equipment.EquipmentID"), nullable=False)
    maintenance_type: Mapped[str] = mapped_column(
        "Maintenance_Type",
        Enum('Preventive', 'Predictive', 'Corrective', 'Emergency', 'Inspection'),
        nullable=False,
    )
    priority_level: Mapped[str] = mapped_column(
        "Priority_Level",
        Enum('Low', 'Medium', 'High', 'Critical'),
        nullable=False,
        default='Low'
    )
    scheduled_date: Mapped[datetime] = mapped_column("Scheduled_Date", Date, nullable=False)
    actual_completion_date: Mapped[Optional[datetime]] = mapped_column("Actual_Completion_Date", Date)
    scheduled_by: Mapped[Optional[int]] = mapped_column("Scheduled_By", Integer, ForeignKey("staff.StaffID"))
    performed_by: Mapped[Optional[int]] = mapped_column("Performed_By", Integer, ForeignKey("staff.StaffID"))
    cost_estimate: Mapped[Optional[float]] = mapped_column("Cost_Estimate", Numeric(12, 2))
    actual_cost: Mapped[Optional[float]] = mapped_column("Actual_Cost", Numeric(12, 2))
    notes: Mapped[Optional[str]] = mapped_column("Notes", Text)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Scheduled', 'In_Progress', 'Completed', 'Cancelled', 'Overdue'),
        nullable=False,
        default='Scheduled'
    )
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_maint_status", "Status"),
        Index("idx_maint_equipment", "EquipmentID"),
        Index("idx_maint_scheduled_date", "Scheduled_Date"),
    )

    equipment: Mapped["Equipment"] = relationship("Equipment", foreign_keys=[equipment_id])
    scheduled_by_staff: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[scheduled_by])
    performed_by_staff: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[performed_by])


# =====================================================================
# TABLE: CLIENT_PAYMENT
# =====================================================================
class ClientPayment(Base):
    __tablename__ = "client_payment"

    client_payment_id: Mapped[int] = mapped_column("Payment_ID", Integer, primary_key=True)
    payment_date: Mapped[datetime] = mapped_column("Payment_Date", Date, nullable=False)
    site_id: Mapped[int] = mapped_column("SiteID", Integer, ForeignKey("site.SiteID"), nullable=False)
    amount: Mapped[float] = mapped_column("Amount", Numeric(14, 2), nullable=False)
    payment_method: Mapped[Optional[str]] = mapped_column("Payment_Method", String(100))
    reference_number: Mapped[Optional[str]] = mapped_column("Reference_Number", String(100))
    invoice_number: Mapped[Optional[str]] = mapped_column("Invoice_Number", String(100))
    description: Mapped[Optional[str]] = mapped_column("Description", Text)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Pending', 'Received', 'Cancelled', 'Failed'),
        nullable=False,
        default='Pending'
    )
    received_by: Mapped[Optional[int]] = mapped_column("Received_By", Integer, ForeignKey("staff.StaffID"))
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    site: Mapped["Site"] = relationship("Site", foreign_keys=[site_id])


# =====================================================================
# TABLE: VENDOR_PAYMENT
# =====================================================================
class VendorPayment(Base):
    __tablename__ = "vendor_payment"

    vendor_payment_id: Mapped[int] = mapped_column("Vendor_PaymentID", Integer, primary_key=True)
    payment_date: Mapped[datetime] = mapped_column("Payment_Date", Date, nullable=False)
    vendor_id: Mapped[int] = mapped_column("VendorID", Integer, ForeignKey("vendor.VendorID"), nullable=False)
    amount: Mapped[float] = mapped_column("Amount", Numeric(14, 2), nullable=False)
    payment_method: Mapped[Optional[str]] = mapped_column("Payment_Method", String(100))
    reference_number: Mapped[Optional[str]] = mapped_column("Reference_Number", String(100))
    invoice_number: Mapped[Optional[str]] = mapped_column("Invoice_Number", String(100))
    description: Mapped[Optional[str]] = mapped_column("Description", Text)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Pending', 'Approved', 'Rejected', 'Paid'),
        nullable=False,
        default='Pending'
    )
    processed_by: Mapped[Optional[int]] = mapped_column("Approved_By", Integer, ForeignKey("staff.StaffID"))
    paid_date: Mapped[Optional[datetime]] = mapped_column("Paid_Date", Date)
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor: Mapped["Vendor"] = relationship("Vendor", foreign_keys=[vendor_id])


# =====================================================================
# TABLE: OPERATIONAL_FUND
# =====================================================================
class OperationalFund(Base):
    __tablename__ = "operational_fund"

    operational_fund_id: Mapped[int] = mapped_column("Fund_ID", Integer, primary_key=True)
    fund_name: Mapped[str] = mapped_column("Fund_Name", String(255), nullable=False)
    fund_category: Mapped[str] = mapped_column("Fund_Category", String(100), nullable=False)
    initial_balance: Mapped[float] = mapped_column("Initial_Balance", Numeric(14, 2), nullable=False)
    current_balance: Mapped[float] = mapped_column("Current_Balance", Numeric(14, 2), nullable=False, default=0.0)
    fiscal_year_start: Mapped[datetime] = mapped_column("Fiscal_Year_Start", Date, nullable=False)
    fiscal_year_end: Mapped[datetime] = mapped_column("Fiscal_Year_End", Date, nullable=False)
    description: Mapped[Optional[str]] = mapped_column("Description", Text)
    managed_by: Mapped[Optional[int]] = mapped_column("Managed_By", Integer, ForeignKey("staff.StaffID"))
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Draft', 'Pending_Approval', 'Approved', 'Rejected', 'Disbursed'),
        nullable=False,
        default='Draft'
    )
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    manager: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[managed_by])


# =====================================================================
# TABLE: SITE_BUDGET
# =====================================================================
class SiteBudget(Base):
    __tablename__ = "site_budget"

    site_budget_id: Mapped[int] = mapped_column("Budget_ID", Integer, primary_key=True)
    site_id: Mapped[int] = mapped_column("SiteID", Integer, ForeignKey("site.SiteID"), nullable=False)
    budget_category: Mapped[str] = mapped_column("Budget_Category", String(100), nullable=False)
    allocated_amount: Mapped[float] = mapped_column("Allocated_Amount", Numeric(14, 2), nullable=False)
    spent_to_date: Mapped[float] = mapped_column("Spent_To_Date", Numeric(14, 2), nullable=False, default=0.0)
    committed_amount: Mapped[float] = mapped_column("Committed_Amount", Numeric(14, 2), nullable=False, default=0.0)
    remaining_balance: Mapped[float] = mapped_column("Remaining_Balance", Numeric(14, 2), Computed("Allocated_Amount - Spent_To_Date - Committed_Amount", persisted=True))
    fiscal_year_start: Mapped[datetime] = mapped_column("Budget_Period_Start", Date, nullable=False)
    fiscal_year_end: Mapped[datetime] = mapped_column("Budget_Period_End", Date, nullable=False)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Active', 'Inactive', 'Finalized'),
        nullable=False,
        default='Active'
    )
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    site: Mapped["Site"] = relationship("Site", foreign_keys=[site_id])


# =====================================================================
# TABLE: INVENTORY
# =====================================================================
class Inventory(Base):
    __tablename__ = "inventory"

    inventory_id: Mapped[int] = mapped_column("InventoryID", Integer, primary_key=True)
    equipment_id: Mapped[int] = mapped_column("EquipmentID", Integer, ForeignKey("equipment.EquipmentID"), nullable=False)
    site_id: Mapped[int] = mapped_column("SiteID", Integer, ForeignKey("site.SiteID"), nullable=False)
    quantity_available: Mapped[int] = mapped_column("Quantity_Available", Integer, nullable=False, default=0)
    quantity_in_use: Mapped[int] = mapped_column("Quantity_In_Use", Integer, nullable=False, default=0)
    quantity_reserved: Mapped[int] = mapped_column("Quantity_Reserved", Integer, nullable=False, default=0)
    quantity_under_maintenance: Mapped[int] = mapped_column("Quantity_Under_Maintenance", Integer, nullable=False, default=0)
    last_count_date: Mapped[Optional[datetime]] = mapped_column("Last_Count_Date", DateTime)
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_inventory_equipment", "EquipmentID"),
        Index("idx_inventory_site", "SiteID"),
    )

    equipment: Mapped["Equipment"] = relationship("Equipment", foreign_keys=[equipment_id])
    site: Mapped["Site"] = relationship("Site", foreign_keys=[site_id])


# =====================================================================
# TABLE: EQUIPMENT_INSURANCE
# =====================================================================
class EquipmentInsurance(Base):
    __tablename__ = "equipment_insurance"

    insurance_policy_id: Mapped[int] = mapped_column("Insurance_PolicyID", Integer, primary_key=True)
    equipment_id: Mapped[int] = mapped_column("EquipmentID", Integer, ForeignKey("equipment.EquipmentID"), nullable=False)
    policy_number: Mapped[str] = mapped_column("Policy_Number", String(100), unique=True, nullable=False)
    insurance_provider: Mapped[str] = mapped_column("Insurance_Provider", String(255), nullable=False)
    coverage_amount: Mapped[float] = mapped_column("Coverage_Amount", Numeric(12, 2), nullable=False)
    premium_amount: Mapped[Optional[float]] = mapped_column("Premium_Amount", Numeric(12, 2))
    deductible: Mapped[Optional[float]] = mapped_column("Deductible", Numeric(12, 2))
    start_date: Mapped[datetime] = mapped_column("Start_Date", Date, nullable=False)
    end_date: Mapped[datetime] = mapped_column("End_Date", Date, nullable=False)
    status: Mapped[str] = mapped_column(
        "Status",
        Enum('Active', 'Inactive', 'Expired', 'Pending_Renewal'),
        nullable=False,
        default='Active'
    )
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_insurance_equipment", "EquipmentID"),
        Index("idx_insurance_status", "Status"),
    )
    
    # Relationships
    equipment: Mapped["Equipment"] = relationship("Equipment", foreign_keys=[equipment_id], back_populates="insurance_policies")


# =====================================================================
# TABLE: ATTACHMENT
# =====================================================================
class Attachment(Base):
    __tablename__ = "attachment"

    attachment_id: Mapped[int] = mapped_column("AttachmentID", Integer, primary_key=True)
    record_type: Mapped[str] = mapped_column(
        "Record_Type",
        Enum('Equipment', 'Maintenance', 'Expense', 'Insurance', 'Certification', 'Payment', 'Activity'),
        nullable=False
    )
    record_id: Mapped[int] = mapped_column("Record_ID", Integer, nullable=False)
    file_name: Mapped[str] = mapped_column("File_Name", String(500), nullable=False)
    file_path: Mapped[str] = mapped_column("File_Path", String(1000), nullable=False)
    file_size_bytes: Mapped[Optional[int]] = mapped_column("File_Size_Bytes", Integer)
    file_type: Mapped[Optional[str]] = mapped_column("File_Type", String(50))
    uploaded_by: Mapped[Optional[int]] = mapped_column("Uploaded_By", Integer, ForeignKey("staff.StaffID"))
    description: Mapped[Optional[str]] = mapped_column("Description", Text)
    created_at: Mapped[datetime] = mapped_column("Created_At", DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column("Updated_At", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_attachment_record", "Record_Type", "Record_ID"),
        Index("idx_attachment_uploaded_by", "Uploaded_By"),
    )
    
    # Relationships
    uploaded_by_staff: Mapped[Optional["Staff"]] = relationship("Staff", foreign_keys=[uploaded_by])
    
    @property
    def equipment_id(self):
        """Computed property for attachments linked to equipment"""
        if self.record_type == "Equipment":
            return self.record_id
        return None
    
    @property
    def equipment(self):
        """Lazy relationship property"""
        if self.equipment_id:
            from sqlalchemy import select
            # This would need async handling in actual usage
            return None
        return None
