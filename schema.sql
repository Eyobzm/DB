-- =====================================================================
-- CONSTRUCTION FLEET MANAGEMENT SYSTEM (CFMS) - MySQL 8.0 Schema
-- =====================================================================
-- Database: CFMS
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- Storage Engine: InnoDB
-- =====================================================================

CREATE DATABASE IF NOT EXISTS CFMS
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE CFMS;

-- =====================================================================
-- TABLE 1: VENDOR
-- =====================================================================
CREATE TABLE VENDOR (
    VendorID INT AUTO_INCREMENT PRIMARY KEY,
    Vendor_Name VARCHAR(255) NOT NULL UNIQUE,
    Contact_Person VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(255) UNIQUE NOT NULL,
    Address VARCHAR(500),
    City VARCHAR(100),
    State_Province VARCHAR(100),
    Country VARCHAR(100),
    Postal_Code VARCHAR(20),
    Tax_ID VARCHAR(50) UNIQUE,
    Payment_Terms VARCHAR(100),
    Outstanding_Balance DECIMAL(14, 2) NOT NULL DEFAULT 0,
    Status ENUM('Active', 'Inactive', 'Blacklisted', 'Pending_Verification') 
        NOT NULL DEFAULT 'Pending_Verification',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendor_status (Status),
    INDEX idx_vendor_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 2: STAFF
-- =====================================================================
CREATE TABLE STAFF (
    StaffID INT AUTO_INCREMENT PRIMARY KEY,
    Employee_Number VARCHAR(50) NOT NULL UNIQUE,
    First_Name VARCHAR(100) NOT NULL,
    Last_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    Password_Hash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Accountant', 'Site_Manager', 'Supervisor', 
             'Mechanic', 'Heavy_Operator', 'Light_Driver') NOT NULL,
    Status ENUM('Active', 'Inactive', 'On_Leave', 'Suspended') 
        NOT NULL DEFAULT 'Active',
    Department VARCHAR(100),
    Date_Hired DATE,
    Assigned_Site INT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_staff_email (Email),
    UNIQUE KEY uk_staff_employee_number (Employee_Number),
    INDEX idx_staff_role (Role),
    INDEX idx_staff_status (Status),
    INDEX idx_staff_assigned_site (Assigned_Site)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 3: SITE
-- =====================================================================
CREATE TABLE SITE (
    SiteID INT AUTO_INCREMENT PRIMARY KEY,
    Site_Code VARCHAR(50) NOT NULL UNIQUE,
    Site_Name VARCHAR(255) NOT NULL,
    Location VARCHAR(500),
    City VARCHAR(100),
    State_Province VARCHAR(100),
    Country VARCHAR(100),
    Postal_Code VARCHAR(20),
    Site_Manager INT NOT NULL,
    Client_Name VARCHAR(255),
    Project_Description TEXT,
    Start_Date DATE,
    Estimated_End_Date DATE,
    Actual_End_Date DATE,
    Status ENUM('Active', 'Completed', 'On_Hold', 'Cancelled') 
        NOT NULL DEFAULT 'Active',
    Budget DECIMAL(12, 2),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_site_code (Site_Code),
    INDEX idx_site_manager (Site_Manager),
    INDEX idx_site_status (Status),
    CONSTRAINT fk_site_manager FOREIGN KEY (Site_Manager) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update STAFF to reference SITE
ALTER TABLE STAFF ADD CONSTRAINT fk_staff_assigned_site 
    FOREIGN KEY (Assigned_Site) REFERENCES SITE(SiteID) 
    ON UPDATE CASCADE ON DELETE SET NULL;

-- =====================================================================
-- TABLE 4: EQUIPMENT
-- =====================================================================
CREATE TABLE EQUIPMENT (
    EquipmentID INT AUTO_INCREMENT PRIMARY KEY,
    Equipment_Code VARCHAR(50) NOT NULL UNIQUE,
    Equipment_Name VARCHAR(255) NOT NULL,
    Equipment_Category VARCHAR(100) NOT NULL,
    Manufacturer VARCHAR(150),
    Model_Year YEAR,
    Serial_Number VARCHAR(100) UNIQUE,
    VendorID INT,
    Acquisition_Cost DECIMAL(12, 2),
    Acquisition_Date DATE,
    Useful_Life_Years INT,
    Salvage_Value DECIMAL(12, 2),
    Status ENUM('Active', 'Inactive', 'In_Maintenance', 'Retired', 'For_Sale') 
        NOT NULL DEFAULT 'Active',
    Current_Site INT,
    Operator_ID INT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_equipment_code (Equipment_Code),
    UNIQUE KEY uk_equipment_serial (Serial_Number),
    INDEX idx_equipment_category (Equipment_Category),
    INDEX idx_equipment_status (Status),
    INDEX idx_equipment_current_site (Current_Site),
    INDEX idx_equipment_operator (Operator_ID),
    CONSTRAINT fk_equipment_vendor FOREIGN KEY (VendorID) 
        REFERENCES VENDOR(VendorID) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_equipment_current_site FOREIGN KEY (Current_Site) 
        REFERENCES SITE(SiteID) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_equipment_operator FOREIGN KEY (Operator_ID) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 5: INVENTORY
-- =====================================================================
CREATE TABLE INVENTORY (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    EquipmentID INT NOT NULL,
    SiteID INT NOT NULL,
    Quantity_Available INT NOT NULL DEFAULT 0,
    Quantity_In_Use INT NOT NULL DEFAULT 0,
    Quantity_Reserved INT NOT NULL DEFAULT 0,
    Quantity_Under_Maintenance INT NOT NULL DEFAULT 0,
    Last_Count_Date DATETIME,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_inventory_equipment_site (EquipmentID, SiteID),
    INDEX idx_inventory_site (SiteID),
    CONSTRAINT fk_inventory_equipment FOREIGN KEY (EquipmentID) 
        REFERENCES EQUIPMENT(EquipmentID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_inventory_site FOREIGN KEY (SiteID) 
        REFERENCES SITE(SiteID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 6: EQUIPMENT_RATE
-- =====================================================================
CREATE TABLE EQUIPMENT_RATE (
    Equipment_RateID INT AUTO_INCREMENT PRIMARY KEY,
    SiteID INT NOT NULL,
    Equipment_Category VARCHAR(100) NOT NULL,
    Hourly_Rate DECIMAL(12, 2),
    Daily_Rate DECIMAL(12, 2),
    Weekly_Rate DECIMAL(12, 2),
    Monthly_Rate DECIMAL(12, 2),
    Effective_From DATE NOT NULL,
    Effective_To DATE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_equipment_rate_composite (SiteID, Equipment_Category, Effective_From),
    INDEX idx_equipment_rate_site (SiteID),
    CONSTRAINT fk_equipment_rate_site FOREIGN KEY (SiteID) 
        REFERENCES SITE(SiteID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 7: OPERATOR_CERTIFICATION
-- =====================================================================
CREATE TABLE OPERATOR_CERTIFICATION (
    CertificationID INT AUTO_INCREMENT PRIMARY KEY,
    StaffID INT NOT NULL,
    Certification_Type VARCHAR(255) NOT NULL,
    Certification_Number VARCHAR(100) UNIQUE NOT NULL,
    Issuing_Authority VARCHAR(255),
    Issue_Date DATE NOT NULL,
    Expiry_Date DATE,
    Is_Active BOOLEAN DEFAULT TRUE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_operator_cert_number (Certification_Number),
    INDEX idx_cert_staff (StaffID),
    INDEX idx_cert_expiry (Expiry_Date),
    CONSTRAINT fk_operator_cert_staff FOREIGN KEY (StaffID) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 8: ATTACHMENT
-- =====================================================================
CREATE TABLE ATTACHMENT (
    AttachmentID INT AUTO_INCREMENT PRIMARY KEY,
    Record_Type ENUM('Equipment', 'Maintenance', 'Expense', 'Insurance', 
                     'Certification', 'Payment', 'Activity') NOT NULL,
    Record_ID INT NOT NULL,
    File_Name VARCHAR(500) NOT NULL,
    File_Path VARCHAR(1000) NOT NULL,
    File_Size_Bytes INT,
    File_Type VARCHAR(50),
    Uploaded_By INT,
    Description TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_attachment_record (Record_Type, Record_ID),
    INDEX idx_attachment_uploaded_by (Uploaded_By),
    CONSTRAINT fk_attachment_uploaded_by FOREIGN KEY (Uploaded_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 9: EQUIPMENT_INSURANCE
-- =====================================================================
CREATE TABLE EQUIPMENT_INSURANCE (
    Insurance_PolicyID INT AUTO_INCREMENT PRIMARY KEY,
    EquipmentID INT NOT NULL,
    Policy_Number VARCHAR(100) NOT NULL UNIQUE,
    Insurance_Provider VARCHAR(255) NOT NULL,
    Coverage_Amount DECIMAL(12, 2) NOT NULL,
    Premium_Amount DECIMAL(12, 2),
    Deductible DECIMAL(12, 2),
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Status ENUM('Active', 'Inactive', 'Expired', 'Pending_Renewal') 
        NOT NULL DEFAULT 'Active',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_insurance_policy (Policy_Number),
    INDEX idx_insurance_equipment (EquipmentID),
    INDEX idx_insurance_status (Status),
    CONSTRAINT fk_equipment_insurance FOREIGN KEY (EquipmentID) 
        REFERENCES EQUIPMENT(EquipmentID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 10: ACTIVITY_LOG
-- =====================================================================
CREATE TABLE ACTIVITY_LOG (
    ActivityID INT AUTO_INCREMENT PRIMARY KEY,
    EquipmentID INT NOT NULL,
    Activity_Date DATE NOT NULL,
    Activity_Type VARCHAR(100) NOT NULL,
    OperatorID INT NOT NULL,
    AssistantID INT,
    VerifierID INT,
    Hours_Used DECIMAL(8, 2),
    Description TEXT,
    Status ENUM('Completed', 'Pending_Verification', 'Rejected', 'Verified') 
        NOT NULL DEFAULT 'Pending_Verification',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_actlog_equip_date (EquipmentID, Activity_Date),
    INDEX idx_actlog_status (Status),
    INDEX idx_actlog_operator (OperatorID),
    CONSTRAINT fk_actlog_equipment FOREIGN KEY (EquipmentID) 
        REFERENCES EQUIPMENT(EquipmentID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_actlog_operator FOREIGN KEY (OperatorID) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_actlog_assistant FOREIGN KEY (AssistantID) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_actlog_verifier FOREIGN KEY (VerifierID) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 11: EQUIPMENT_EXPENSE
-- =====================================================================
CREATE TABLE EQUIPMENT_EXPENSE (
    ExpenseID INT AUTO_INCREMENT PRIMARY KEY,
    EquipmentID INT NOT NULL,
    SiteID INT NOT NULL,
    Expense_Date DATE NOT NULL,
    Expense_Category VARCHAR(100) NOT NULL,
    Amount DECIMAL(12, 2) NOT NULL,
    Description TEXT,
    VendorID INT,
    Receipt_Number VARCHAR(100) UNIQUE,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Paid') 
        NOT NULL DEFAULT 'Pending',
    Approved_By INT,
    Approval_Date DATETIME,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expense_equip (EquipmentID),
    INDEX idx_expense_site (SiteID),
    INDEX idx_expense_date (Expense_Date),
    INDEX idx_expense_status (Status),
    CONSTRAINT fk_expense_equipment FOREIGN KEY (EquipmentID) 
        REFERENCES EQUIPMENT(EquipmentID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_expense_site FOREIGN KEY (SiteID) 
        REFERENCES SITE(SiteID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_expense_vendor FOREIGN KEY (VendorID) 
        REFERENCES VENDOR(VendorID) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_expense_approved_by FOREIGN KEY (Approved_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 12: FUEL_PURCHASE
-- =====================================================================
CREATE TABLE FUEL_PURCHASE (
    Fuel_PurchaseID INT AUTO_INCREMENT PRIMARY KEY,
    EquipmentID INT NOT NULL,
    Purchase_Date DATE NOT NULL,
    Quantity_Liters DECIMAL(10, 2) NOT NULL,
    Unit_Price DECIMAL(8, 2) NOT NULL,
    Total_Amount DECIMAL(12, 2) NOT NULL,
    Fuel_Type VARCHAR(50),
    VendorID INT,
    Invoice_Number VARCHAR(100) UNIQUE,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Received') 
        NOT NULL DEFAULT 'Pending',
    Approved_By INT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fuel_equip (EquipmentID),
    INDEX idx_fuel_date (Purchase_Date),
    INDEX idx_fuel_status (Status),
    CONSTRAINT fk_fuel_equipment FOREIGN KEY (EquipmentID) 
        REFERENCES EQUIPMENT(EquipmentID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_fuel_vendor FOREIGN KEY (VendorID) 
        REFERENCES VENDOR(VendorID) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_fuel_approved_by FOREIGN KEY (Approved_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 13: MAINTENANCE_SCHEDULE
-- =====================================================================
CREATE TABLE MAINTENANCE_SCHEDULE (
    Maintenance_ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    Schedule_Number VARCHAR(50) NOT NULL UNIQUE,
    EquipmentID INT NOT NULL,
    Maintenance_Type ENUM('Preventive', 'Predictive', 'Corrective', 'Emergency', 'Inspection') NOT NULL,
    Priority_Level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Low',
    Scheduled_Date DATE NOT NULL,
    Actual_Completion_Date DATE,
    Scheduled_By INT,
    Performed_By INT,
    Cost_Estimate DECIMAL(12, 2),
    Actual_Cost DECIMAL(12, 2),
    Notes TEXT,
    Status ENUM('Scheduled', 'In_Progress', 'Completed', 'Cancelled', 'Overdue') 
        NOT NULL DEFAULT 'Scheduled',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maint_status (Status),
    INDEX idx_maint_equipment (EquipmentID),
    INDEX idx_maint_scheduled_date (Scheduled_Date),
    CONSTRAINT fk_maint_equipment FOREIGN KEY (EquipmentID) 
        REFERENCES EQUIPMENT(EquipmentID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_maint_scheduled_by FOREIGN KEY (Scheduled_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_maint_performed_by FOREIGN KEY (Performed_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 14: CLIENT_PAYMENT
-- =====================================================================
CREATE TABLE CLIENT_PAYMENT (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    SiteID INT NOT NULL,
    Payment_Date DATE NOT NULL,
    Amount DECIMAL(12, 2) NOT NULL,
    Payment_Method VARCHAR(100),
    Reference_Number VARCHAR(100) UNIQUE,
    Invoice_Number VARCHAR(100),
    Description TEXT,
    Status ENUM('Pending', 'Received', 'Cancelled', 'Failed') 
        NOT NULL DEFAULT 'Pending',
    Received_By INT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_site (SiteID),
    INDEX idx_payment_date (Payment_Date),
    INDEX idx_payment_status (Status),
    CONSTRAINT fk_payment_site FOREIGN KEY (SiteID) 
        REFERENCES SITE(SiteID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_payment_received_by FOREIGN KEY (Received_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 15: VENDOR_PAYMENT
-- =====================================================================
CREATE TABLE VENDOR_PAYMENT (
    Vendor_PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    Payment_Date DATE NOT NULL,
    Amount DECIMAL(12, 2) NOT NULL,
    Payment_Method VARCHAR(100),
    Reference_Number VARCHAR(100) UNIQUE,
    Invoice_Number VARCHAR(100),
    Description TEXT,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Paid') 
        NOT NULL DEFAULT 'Pending',
    Approved_By INT,
    Paid_Date DATE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendor_payment_vendor (VendorID),
    INDEX idx_vendor_payment_date (Payment_Date),
    INDEX idx_vendor_payment_status (Status),
    CONSTRAINT fk_vendor_payment_vendor FOREIGN KEY (VendorID) 
        REFERENCES VENDOR(VendorID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_vendor_payment_approved_by FOREIGN KEY (Approved_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 16: OPERATIONAL_FUND
-- =====================================================================
CREATE TABLE OPERATIONAL_FUND (
    Fund_ID INT AUTO_INCREMENT PRIMARY KEY,
    Fund_Name VARCHAR(255) NOT NULL UNIQUE,
    Fund_Category VARCHAR(100),
    Initial_Balance DECIMAL(12, 2) NOT NULL,
    Current_Balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    Fiscal_Year_Start DATE,
    Fiscal_Year_End DATE,
    Status ENUM('Draft', 'Pending_Approval', 'Approved', 'Rejected', 'Disbursed') 
        NOT NULL DEFAULT 'Draft',
    Managed_By INT,
    Description TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fund_status (Status),
    INDEX idx_fund_managed_by (Managed_By),
    CONSTRAINT fk_fund_managed_by FOREIGN KEY (Managed_By) 
        REFERENCES STAFF(StaffID) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 17: SITE_BUDGET
-- =====================================================================
CREATE TABLE SITE_BUDGET (
    Budget_ID INT AUTO_INCREMENT PRIMARY KEY,
    SiteID INT NOT NULL,
    Budget_Category VARCHAR(100) NOT NULL,
    Allocated_Amount DECIMAL(12, 2) NOT NULL,
    Spent_To_Date DECIMAL(12, 2) NOT NULL DEFAULT 0,
    Committed_Amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    Remaining_Balance DECIMAL(12, 2) GENERATED ALWAYS AS 
        (Allocated_Amount - Spent_To_Date - Committed_Amount) STORED,
    Budget_Period_Start DATE NOT NULL,
    Budget_Period_End DATE,
    Status ENUM('Active', 'Inactive', 'Finalized') 
        NOT NULL DEFAULT 'Active',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_site_budget_composite (SiteID, Budget_Category, Budget_Period_Start),
    INDEX idx_budget_site_cat (SiteID, Budget_Category),
    INDEX idx_budget_status (Status),
    CONSTRAINT fk_site_budget_site FOREIGN KEY (SiteID) 
        REFERENCES SITE(SiteID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- INDEXES SUMMARY
-- =====================================================================
-- idx_actlog_equip_date: Equipment + Activity_Date filtering
-- idx_maint_status: Maintenance status queries
-- idx_cert_staff: Staff certifications lookup
-- idx_budget_site_cat: Site budget category filtering
-- idx_expense_equip: Equipment expense tracking
-- idx_fuel_equip: Equipment fuel purchase history
-- All foreign key columns indexed for JOIN performance
-- Status columns indexed for filtering operations
-- Date columns indexed for range queries

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
