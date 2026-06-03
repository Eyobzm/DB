SET FOREIGN_KEY_CHECKS=0;

DELETE FROM site_budget;
DELETE FROM operational_fund;
DELETE FROM vendor_payment;
DELETE FROM client_payment;
DELETE FROM equipment_expense;
DELETE FROM fuel_purchase;
DELETE FROM activity_log;
DELETE FROM maintenance_schedule;
DELETE FROM equipment_rate;
DELETE FROM operator_certification;
DELETE FROM attachment;
DELETE FROM equipment_insurance;
DELETE FROM inventory;
DELETE FROM equipment;
DELETE FROM site;
DELETE FROM vendor;

-- =====================================================================
-- 1. VENDOR TABLE - 5 Ethiopian suppliers
-- =====================================================================
INSERT INTO VENDOR (Vendor_Name, Contact_Person, Phone, Email, Address, City, Country, Status, Outstanding_Balance, Payment_Terms) VALUES
('Addis Heavy Equipment Ltd', 'Abebe Tesfaye', '+251911234567', 'contact@addisheavy.et', 'Bole Road, Addis Ababa', 'Addis Ababa', 'Ethiopia', 'Active', 0.00, '30 days'),
('Hawassa Construction Supplies', 'Almaz Hailu', '+251912345678', 'sales@hawassasupply.et', 'Shalom Tower, Hawassa', 'Hawassa', 'Ethiopia', 'Active', 0.00, '45 days'),
('Bahir Dar Engineering Traders', 'Getachew Bekele', '+251913456789', 'support@bdareng.et', 'Kebele 15, Bahir Dar', 'Bahir Dar', 'Ethiopia', 'Active', 0.00, '30 days'),
('Mekelle Industrial Services', 'Tigist Gebremedhin', '+251914567890', 'orders@mekelleindus.et', 'Aksum Road, Mekelle', 'Mekelle', 'Ethiopia', 'Pending_Verification', 0.00, '60 days'),
('Dire Dawa Equipment Rental', 'Kedir Mohammed', '+251915678901', 'info@diredawaequip.et', 'Harrar Road, Dire Dawa', 'Dire Dawa', 'Ethiopia', 'Inactive', 0.00, '30 days');

-- =====================================================================
-- 2. SITE TABLE - 5 Ethiopian construction sites
-- =====================================================================
INSERT INTO SITE (Site_Code, Site_Name, Location, City, Country, Site_Manager, Client_Name, Project_Description, Start_Date, Estimated_End_Date, Status, Budget) VALUES
('SITE-AA-001', 'Addis Industrial Park Expansion', 'Bole District', 'Addis Ababa', 'Ethiopia', 3, 'Addis Ababa City Government', 'Expansion of industrial park infrastructure.', '2025-01-10', '2026-11-30', 'Active', 140000000.00),
('SITE-HAW-002', 'Hawassa Lakefront Development', 'Lake Side District', 'Hawassa', 'Ethiopia', 3, 'Southern Region Development Bureau', 'Mixed-use waterfront development.', '2024-10-05', '2026-05-20', 'On_Hold', 92000000.00),
('SITE-BD-003', 'Bahir Dar Road Rehabilitation', 'Tis Abay Road', 'Bahir Dar', 'Ethiopia', 3, 'Amhara Regional Government', 'Major road rehabilitation and drainage works.', '2024-12-01', '2025-12-15', 'Completed', 78000000.00),
('SITE-MK-004', 'Mekelle Commercial Complex', 'Industrial Zone', 'Mekelle', 'Ethiopia', 3, 'Tigray Regional Development', 'Construction of commercial office buildings.', '2025-02-15', '2026-08-30', 'Active', 68000000.00),
('SITE-DD-005', 'Dire Dawa Railway Station Upgrade', 'Railway Quarter', 'Dire Dawa', 'Ethiopia', 3, 'Ethiopian Railway Corporation', 'Station renovation and passenger facility upgrade.', '2025-03-01', '2026-01-31', 'Cancelled', 126000000.00);

-- =====================================================================
-- 3. EQUIPMENT TABLE - 8 pieces of heavy equipment
-- =====================================================================
INSERT INTO EQUIPMENT (Equipment_Code, Equipment_Name, Equipment_Category, Manufacturer, Model_Year, Serial_Number, VendorID, Acquisition_Cost, Acquisition_Date, Useful_Life_Years, Salvage_Value, Status, Current_Site, Operator_ID) VALUES
('EQP-CAT-001', 'CAT 320 Excavator', 'Excavator', 'Caterpillar', 2022, 'CAT320ET-2022-001', 1, 4100000.00, '2024-01-15', 8, 500000.00, 'Active', 1, 6),
('EQP-KOM-002', 'Komatsu PC200 Excavator', 'Excavator', 'Komatsu', 2023, 'KOMPC200-2023-002', 2, 3900000.00, '2024-05-10', 8, 470000.00, 'Active', 2, 6),
('EQP-CAT-003', 'CAT D6 Bulldozer', 'Bulldozer', 'Caterpillar', 2021, 'CATD6-2021-003', 1, 5200000.00, '2024-02-20', 10, 630000.00, 'In_Maintenance', 3, 7),
('EQP-VOL-004', 'Volvo EC220 Excavator', 'Excavator', 'Volvo', 2022, 'VOLEC220-2022-004', 3, 3750000.00, '2024-03-18', 8, 450000.00, 'Active', 4, 6),
('EQP-KOM-005', 'Komatsu D65 Bulldozer', 'Bulldozer', 'Komatsu', 2023, 'KOMD65-2023-005', 2, 4850000.00, '2025-01-08', 10, 590000.00, 'For_Sale', 5, 7),
('EQP-CAT-006', 'CAT 950 Wheel Loader', 'Loader', 'Caterpillar', 2022, 'CAT950-2022-006', 1, 4100000.00, '2024-07-12', 9, 520000.00, 'Active', 1, 6),
('EQP-VOL-007', 'Volvo FMX 460 Truck', 'Truck', 'Volvo', 2022, 'VOLFMX460-2022-007', 3, 2250000.00, '2024-11-05', 7, 270000.00, 'Active', 2, 7),
('EQP-KOM-008', 'Komatsu GD555 Grader', 'Grader', 'Komatsu', 2021, 'KOMGDA555-2021-008', 2, 3950000.00, '2024-06-25', 9, 480000.00, 'Inactive', 3, 7);

-- =====================================================================
-- 4. OPERATOR_CERTIFICATION TABLE - 3 certifications
-- =====================================================================
INSERT INTO OPERATOR_CERTIFICATION (StaffID, Certification_Type, Certification_Number, Issuing_Authority, Issue_Date, Expiry_Date, Is_Active) VALUES
(6, 'Heavy Equipment Operator - Excavator', 'CERT-HOP-001', 'Ethiopian Construction Authority', '2023-05-10', '2026-05-10', TRUE),
(7, 'Heavy Equipment Operator - Truck', 'CERT-LDR-002', 'Ethiopian Construction Authority', '2024-01-20', '2027-01-20', TRUE),
(6, 'Heavy Equipment Operator - Loader', 'CERT-HOP-003', 'Ethiopian Construction Authority', '2023-09-15', '2026-09-15', TRUE);

-- =====================================================================
-- 5. EQUIPMENT_RATE TABLE - 5 rates
-- =====================================================================
INSERT INTO EQUIPMENT_RATE (SiteID, Equipment_Category, Hourly_Rate, Daily_Rate, Weekly_Rate, Monthly_Rate, Effective_From) VALUES
(1, 'Excavator', 2600.00, 20800.00, 145600.00, 582400.00, '2025-01-10'),
(2, 'Truck', 1950.00, 15600.00, 109200.00, 436800.00, '2024-10-05'),
(3, 'Bulldozer', 3100.00, 24800.00, 173600.00, 694400.00, '2024-12-01'),
(4, 'Loader', 2300.00, 18400.00, 128800.00, 515200.00, '2025-02-15'),
(5, 'Grader', 2850.00, 22800.00, 159600.00, 638400.00, '2025-03-01');

-- =====================================================================
-- 6. ACTIVITY_LOG TABLE - 5 records
-- =====================================================================
INSERT INTO ACTIVITY_LOG (EquipmentID, Activity_Date, Activity_Type, OperatorID, AssistantID, VerifierID, Hours_Used, Description, Status) VALUES
(1, '2025-02-10', 'Excavation', 6, 7, 4, 18.5, 'Excavation for foundation trenching at Addis site.', 'Completed'),
(2, '2025-02-11', 'Material Haulage', 7, 6, 4, 16.0, 'Transported aggregate to Hawassa lakefront site.', 'Verified'),
(3, '2025-02-12', 'Bulldozing', 7, NULL, 4, 14.5, 'Bulldozing and leveling at Bahir Dar road project.', 'Completed'),
(4, '2025-02-13', 'Site Clearing', 6, 7, 3, 17.0, 'Cleared ground at Mekelle commercial complex.', 'Completed'),
(6, '2025-02-14', 'Loader Operations', 6, NULL, 4, 15.0, 'Loading materials at Addis industrial park.', 'Pending_Verification');

-- =====================================================================
-- 7. MAINTENANCE_SCHEDULE TABLE - 5 records
-- =====================================================================
INSERT INTO MAINTENANCE_SCHEDULE (Schedule_Number, EquipmentID, Maintenance_Type, Priority_Level, Scheduled_Date, Scheduled_By, Performed_By, Cost_Estimate, Status) VALUES
('MNT-20250310-0001', 1, 'Preventive', 'Medium', '2025-03-10', 4, 5, 18500.00, 'Scheduled'),
('MNT-20250225-0001', 2, 'Corrective', 'High', '2025-02-25', 4, 5, 24000.00, 'In_Progress'),
('MNT-20250315-0001', 3, 'Inspection', 'Medium', '2025-03-15', 4, 5, 12000.00, 'Scheduled'),
('MNT-20250320-0001', 4, 'Emergency', 'Critical', '2025-03-20', 4, 5, 52000.00, 'Scheduled'),
('MNT-20250228-0001', 6, 'Preventive', 'High', '2025-02-28', 4, 5, 13500.00, 'Scheduled');

-- =====================================================================
-- 8. FUEL_PURCHASE TABLE - 5 records
-- =====================================================================
INSERT INTO FUEL_PURCHASE (EquipmentID, Purchase_Date, Quantity_Liters, Unit_Price, Total_Amount, Fuel_Type, VendorID, Invoice_Number, Status, Approved_By) VALUES
(1, '2025-02-08', 520.00, 29.50, 15340.00, 'Diesel', 1, 'FUEL-AA-001', 'Received', 2),
(2, '2025-02-09', 470.00, 29.00, 13630.00, 'Diesel', 2, 'FUEL-HAW-002', 'Received', 2),
(3, '2025-02-10', 610.00, 30.00, 18300.00, 'Diesel', 3, 'FUEL-BD-003', 'Received', 2),
(4, '2025-02-11', 560.00, 29.20, 16352.00, 'Diesel', 4, 'FUEL-MK-004', 'Received', 2),
(6, '2025-02-12', 495.00, 29.50, 14602.50, 'Diesel', 1, 'FUEL-AA-005', 'Received', 2);

-- =====================================================================
-- 9. EQUIPMENT_EXPENSE TABLE - 5 records
-- =====================================================================
INSERT INTO EQUIPMENT_EXPENSE (EquipmentID, SiteID, Expense_Date, Expense_Category, Amount, Description, VendorID, Receipt_Number, Status, Approved_By, Approval_Date) VALUES
(1, 1, '2025-02-05', 'Parts', 17850.00, 'Hydraulic hose replacement for CAT 320.', 1, 'RCPT-AA-001', 'Paid', 1, '2025-02-06 10:30:00'),
(2, 2, '2025-02-06', 'Repair', 41200.00, 'Turbocharger maintenance for Komatsu PC200.', 2, 'RCPT-HAW-002', 'Paid', 1, '2025-02-07 11:15:00'),
(3, 3, '2025-02-07', 'Parts', 9200.00, 'Track shoe replacement for CAT D6.', 1, 'RCPT-BD-003', 'Approved', 1, '2025-02-08 09:45:00'),
(4, 4, '2025-02-08', 'Service', 36200.00, 'Hydraulic pump inspection for Volvo EC220.', 3, 'RCPT-MK-004', 'Approved', 1, '2025-02-09 13:20:00'),
(6, 1, '2025-02-09', 'Maintenance', 13250.00, 'Brake system servicing for CAT 950.', 1, 'RCPT-AA-005', 'Paid', 1, '2025-02-10 12:00:00');

-- =====================================================================
-- 10. CLIENT_PAYMENT TABLE - 5 records
-- =====================================================================
INSERT INTO CLIENT_PAYMENT (SiteID, Payment_Date, Amount, Payment_Method, Reference_Number, Invoice_Number, Description, Status, Received_By) VALUES
(1, '2025-02-14', 24800000.00, 'Bank Transfer', 'CLPAY-AA-001', 'INV-AA-2025-001', 'First milestone payment for Addis project.', 'Received', 3),
(2, '2025-02-15', 18200000.00, 'Bank Transfer', 'CLPAY-HAW-002', 'INV-HAW-2025-002', 'Progress payment for Hawassa development.', 'Received', 3),
(3, '2025-02-16', 21500000.00, 'Bank Transfer', 'CLPAY-BD-003', 'INV-BD-2025-003', 'Road rehabilitation payment from Amhara region.', 'Received', 3),
(4, '2025-02-17', 16500000.00, 'Bank Transfer', 'CLPAY-MK-004', 'INV-MK-2025-004', 'Commercial complex payment from Tigray dev bureau.', 'Received', 3),
(5, '2025-02-18', 34100000.00, 'Bank Transfer', 'CLPAY-DD-005', 'INV-DD-2025-005', 'Railway station upgrade advance payment.', 'Received', 3);

-- =====================================================================
-- 11. VENDOR_PAYMENT TABLE - 5 records
-- =====================================================================
INSERT INTO VENDOR_PAYMENT (VendorID, Payment_Date, Amount, Payment_Method, Reference_Number, Invoice_Number, Description, Status, Approved_By, Paid_Date) VALUES
(1, '2025-02-12', 3250000.00, 'Bank Transfer', 'VNPAY-AA-001', 'VINV-AA-001', 'Payment to Addis Heavy Equipment for parts.', 'Paid', 1, '2025-02-13'),
(2, '2025-02-12', 2875000.00, 'Bank Transfer', 'VNPAY-HAW-002', 'VINV-HAW-002', 'Payment to Hawassa Construction Supplies.', 'Paid', 1, '2025-02-13'),
(3, '2025-02-13', 2120000.00, 'Bank Transfer', 'VNPAY-BD-003', 'VINV-BD-003', 'Payment to Bahir Dar Engineering Traders.', 'Paid', 1, '2025-02-14'),
(4, '2025-02-14', 1950000.00, 'Bank Transfer', 'VNPAY-MK-004', 'VINV-MK-004', 'Payment to Mekelle Industrial Services.', 'Paid', 1, '2025-02-15'),
(5, '2025-02-15', 1690000.00, 'Bank Transfer', 'VNPAY-DD-005', 'VINV-DD-005', 'Payment to Dire Dawa Equipment Rental.', 'Paid', 1, '2025-02-16');

-- =====================================================================
-- 12. OPERATIONAL_FUND TABLE - 5 records
-- =====================================================================
INSERT INTO OPERATIONAL_FUND (Fund_Name, Fund_Category, Initial_Balance, Current_Balance, Fiscal_Year_Start, Fiscal_Year_End, Status, Managed_By, Description) VALUES
('Addis Emergency Fuel Fund', 'Fuel', 900000.00, 650000.00, '2025-01-01', '2025-12-31', 'Approved', 3, 'Emergency fuel and maintenance support for Addis site.'),
('Hawassa Repair Fund', 'Repairs', 720000.00, 420000.00, '2025-01-01', '2025-12-31', 'Approved', 3, 'Funds for equipment repairs at Hawassa site.'),
('Bahir Dar Logistics Fund', 'Logistics', 560000.00, 310000.00, '2025-01-01', '2025-12-31', 'Approved', 3, 'Logistics and transport expenses for Bahir Dar road works.'),
('Mekelle Safety Fund', 'Safety', 480000.00, 280000.00, '2025-01-01', '2025-12-31', 'Approved', 3, 'Safety equipment and site protection at Mekelle site.'),
('Dire Dawa Materials Fund', 'Materials', 980000.00, 610000.00, '2025-01-01', '2025-12-31', 'Approved', 3, 'Material purchase and storage costs for Dire Dawa upgrade.');

-- =====================================================================
-- 13. SITE_BUDGET TABLE - 5 records
-- =====================================================================
INSERT INTO SITE_BUDGET (SiteID, Budget_Category, Allocated_Amount, Spent_To_Date, Committed_Amount, Budget_Period_Start, Budget_Period_End, Status) VALUES
(1, 'Equipment Rental', 45000000.00, 12800000.00, 3000000.00, '2025-01-01', '2025-12-31', 'Active'),
(2, 'Fuel & Maintenance', 28000000.00, 8600000.00, 1500000.00, '2025-01-01', '2025-12-31', 'Active'),
(3, 'Road Materials', 32000000.00, 12500000.00, 2200000.00, '2025-01-01', '2025-12-31', 'Active'),
(4, 'Labor & Wages', 26000000.00, 9800000.00, 1800000.00, '2025-01-01', '2025-12-31', 'Active'),
(5, 'Station Upgrade', 52000000.00, 17500000.00, 4200000.00, '2025-01-01', '2025-12-31', 'Active');

-- =====================================================================
-- 14. INVENTORY TABLE - 8 spare part records
-- =====================================================================
INSERT INTO INVENTORY (EquipmentID, SiteID, Quantity_Available, Quantity_In_Use, Quantity_Reserved, Quantity_Under_Maintenance, Last_Count_Date) VALUES
(1, 1, 28, 5, 3, 0, '2025-02-01 08:00:00'),
(2, 2, 22, 4, 2, 1, '2025-02-01 08:00:00'),
(3, 3, 12, 1, 1, 0, '2025-02-01 08:00:00'),
(4, 4, 18, 2, 0, 1, '2025-02-01 08:00:00'),
(5, 5, 10, 0, 0, 0, '2025-02-01 08:00:00'),
(6, 1, 20, 3, 1, 0, '2025-02-01 08:00:00'),
(7, 2, 14, 2, 0, 0, '2025-02-01 08:00:00'),
(8, 3, 16, 1, 1, 0, '2025-02-01 08:00:00');

SET FOREIGN_KEY_CHECKS=1;
