# CFMS Equipment Module

Complete equipment management system with CRUD operations, insurance tracking, and file attachments.

## Database Tables

### EQUIPMENT
- `equipment_id` (PK)
- `equipment_code` (UNIQUE) — E.g., "TR001", "EX002"
- `equipment_name` — E.g., "Truck 1", "Excavator A"
- `equipment_category` (ENUM) — Truck, Excavator, Loader, Bulldozer, Grader, Backhoe, Crane, Forklift
- `manufacturer` — Equipment manufacturer
- `model_year` — Year of manufacture
- `serial_number` (UNIQUE) — Equipment serial number
- `vendor_id` (FK) — Original vendor/supplier
- `acquisition_cost` (DECIMAL 12,2) — Purchase price
- `acquisition_date` — Purchase date
- `useful_life_years` — Depreciation period
- `salvage_value` (DECIMAL 12,2) — Expected residual value
- `status` (ENUM) — Available, In_Use, Under_Maintenance, Rented_Out, Retired, Stored
- `current_site` (FK) — Current assignment
- `operator_id` (FK) — Current operator
- `created_at`, `updated_at` — Timestamps

### EQUIPMENT_INSURANCE
- `insurance_policy_id` (PK)
- `equipment_id` (FK)
- `policy_number` (UNIQUE)
- `insurance_provider` — Provider name
- `coverage_amount` (DECIMAL 12,2)
- `premium_amount` (DECIMAL 12,2)
- `deductible` (DECIMAL 12,2)
- `start_date`, `end_date`
- `status` (ENUM) — Active, Inactive, Expired, Pending_Renewal

### ATTACHMENT
- `attachment_id` (PK)
- `record_type` (ENUM) — Equipment, Maintenance, Expense, Insurance, etc.
- `record_id` — ID of related record
- `file_name`, `file_path`
- `file_size_bytes`, `file_type`
- `uploaded_by` (FK to STAFF)
- `description`

## Backend API Endpoints

### Equipment CRUD

#### List Equipment
```
GET /api/v1/equipment
Query Parameters:
  - skip: int (default 0) — Pagination offset
  - limit: int (default 20, max 100) — Page size
  - status: string — Filter by status
  - category: string — Filter by category
  - site_id: int — Filter by current site

Response: [Equipment]
```

#### Get Equipment Detail
```
GET /api/v1/equipment/{equipment_id}
Response: Equipment
```

#### Create Equipment
```
POST /api/v1/equipment
Authorization: Bearer token
Role Required: Admin, Site_Manager

Request Body:
{
  "equipment_code": "TR001",
  "equipment_name": "Truck 1",
  "equipment_category": "Truck",
  "manufacturer": "Volvo",
  "model_year": 2022,
  "serial_number": "VLV123456",
  "vendor_id": 1,
  "acquisition_cost": 150000.00,
  "acquisition_date": "2022-01-15",
  "useful_life_years": 10,
  "salvage_value": 30000.00
}

Response: Equipment (status defaults to "Available")
```

#### Update Equipment
```
PATCH /api/v1/equipment/{equipment_id}
Authorization: Bearer token
Role Required: Admin, Site_Manager

Request Body:
{
  "status": "In_Use",
  "current_site": 2,
  "operator_id": 5,
  "manufacturer": "Updated Manufacturer"
}

Response: Equipment
```

#### Delete Equipment
```
DELETE /api/v1/equipment/{equipment_id}
Authorization: Bearer token
Role Required: Admin

Response: 204 No Content
```

### Insurance Endpoints

#### List Insurance Policies
```
GET /api/v1/equipment/{equipment_id}/insurance
Response: [EquipmentInsurance]
```

#### Create Insurance Policy
```
POST /api/v1/equipment/{equipment_id}/insurance
Authorization: Bearer token
Role Required: Admin, Accountant

Request Body:
{
  "policy_number": "POL-TR001-2024",
  "insurance_provider": "SafeGuard Insurance",
  "coverage_amount": 150000.00,
  "premium_amount": 2500.00,
  "deductible": 5000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}

Response: EquipmentInsurance (status defaults to "Active")
```

### Attachment Endpoints

#### List Attachments
```
GET /api/v1/equipment/{equipment_id}/attachments
Response: [Attachment]
```

#### Upload Attachment
```
POST /api/v1/equipment/{equipment_id}/attachments
Authorization: Bearer token

Request Body:
{
  "file_name": "maintenance_report.pdf",
  "file_path": "/uploads/equipment/TR001/maintenance_report.pdf",
  "file_size_bytes": 250000,
  "file_type": "application/pdf",
  "description": "Quarterly maintenance report"
}

Response: Attachment
```

## Frontend Routes

### Equipment Management

| Route | Component | Description |
|-------|-----------|-------------|
| `/equipment` | EquipmentList | Equipment listing with filters and pagination |
| `/equipment/new` | EquipmentForm | Create new equipment |
| `/equipment/:id` | EquipmentDetail | Equipment details with tabs |
| `/equipment/:id/edit` | EquipmentForm | Edit equipment |

## Frontend Components

### EquipmentList.jsx

TanStack Table with:
- **Columns**: Code, Name, Category, Status, Manufacturer, Year, Cost, Actions
- **Status Badge Colors**:
  - Available: Green
  - In_Use: Blue
  - Under_Maintenance: Amber
  - Retired: Gray
  - Rented_Out: Purple
  - Stored: Slate
- **Filters**:
  - Status dropdown (All Statuses)
  - Category dropdown (All Categories)
  - Site ID number input
- **Pagination**: Skip/limit controls, items per page selector
- **Actions**: View detail, Edit buttons

### EquipmentForm.jsx

React Hook Form with Zod validation:
- **Fields**:
  - Equipment Code (read-only in edit mode)
  - Equipment Name
  - Category (dropdown)
  - Manufacturer
  - Model Year
  - Serial Number
  - Vendor ID
  - Acquisition Cost
  - Acquisition Date
  - Useful Life (Years)
  - Salvage Value
  - Current Site ID
  - Operator ID
- **Validation**: Required fields, numeric types, positive values
- **Modes**: Create (defaults to "Available") or Edit
- **Actions**: Save, Cancel

### EquipmentDetail.jsx

Read-only detail view with tabs:

**Tab 1: Details**
- All equipment fields displayed
- Created/Updated timestamps
- Status badge with color coding

**Tab 2: Insurance**
- List of insurance policies
- Policy details: Number, Provider, Coverage, Premium, Deductible, Status, Dates
- "Add Insurance Policy" button

**Tab 3: Attachments**
- List of files with name, type, size
- Upload date
- "Upload Attachment" button

## TanStack Query Hooks (useEquipment.js)

### Data Fetching Hooks

#### useEquipmentList(filters)
Fetch paginated equipment with filtering
```javascript
const { data, isLoading, isFetching } = useEquipmentList({
  skip: 0,
  limit: 20,
  status: 'Available',
  category: 'Truck',
  siteId: 1
});
```

#### useEquipmentDetail(equipmentId)
Fetch single equipment detail
```javascript
const { data: equipment } = useEquipmentDetail(1);
```

#### useEquipmentInsurance(equipmentId)
Fetch insurance policies for equipment
```javascript
const { data: insurances } = useEquipmentInsurance(1);
```

#### useEquipmentAttachments(equipmentId)
Fetch attachments for equipment
```javascript
const { data: attachments } = useEquipmentAttachments(1);
```

### Mutation Hooks

#### useCreateEquipment()
Create new equipment
```javascript
const createMutation = useCreateEquipment();
await createMutation.mutateAsync({
  equipment_code: 'TR001',
  equipment_name: 'Truck 1',
  equipment_category: 'Truck'
});
```

#### useUpdateEquipment()
Update equipment
```javascript
const updateMutation = useUpdateEquipment();
await updateMutation.mutateAsync({
  id: 1,
  status: 'In_Use',
  current_site: 2
});
```

#### useDeleteEquipment()
Delete equipment
```javascript
const deleteMutation = useDeleteEquipment();
await deleteMutation.mutateAsync(1);
```

#### useCreateInsurance()
Create insurance policy
```javascript
const insuranceMutation = useCreateInsurance();
await insuranceMutation.mutateAsync({
  equipmentId: 1,
  policy_number: 'POL001',
  insurance_provider: 'SafeGuard',
  coverage_amount: 150000,
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

## Validation Rules

### Equipment Creation/Update
- `equipment_code`: 1-50 chars, UNIQUE
- `equipment_name`: 1-255 chars, required
- `equipment_category`: One of valid categories, required
- `serial_number`: UNIQUE if provided
- `acquisition_cost`: Positive number if provided
- `useful_life_years`: Positive integer if provided
- `salvage_value`: Positive number if provided
- `status`: One of valid statuses if provided

### Insurance Creation/Update
- `policy_number`: UNIQUE, required
- `insurance_provider`: Required
- `coverage_amount`: Positive number, required
- `start_date`: Required
- `end_date`: Required, must be >= start_date
- `premium_amount`: Positive number if provided
- `deductible`: Positive number if provided

## RBAC Rules

| Action | Required Role(s) |
|--------|------------------|
| List Equipment | Any authenticated user |
| View Detail | Any authenticated user |
| Create Equipment | Admin, Site_Manager |
| Update Equipment | Admin, Site_Manager |
| Delete Equipment | Admin |
| Create Insurance | Admin, Accountant |
| Upload Attachment | Any authenticated user |

## Query Invalidation

Mutations automatically invalidate related queries:
- **After equipment create/update/delete**: Invalidates all equipment queries
- **After insurance create**: Invalidates insurance list for that equipment
- **After attachment create**: Invalidates attachment list for that equipment

## Pagination Strategy

- Default page size: 20 items
- Max page size: 100 items
- Supports: skip/limit offset-based pagination
- Frontend controls: "10 per page", "20 per page", "50 per page"

## Status Transitions

Any staff member can transition equipment status via PATCH:
- Available → In_Use, Rented_Out, Stored
- In_Use → Available, Under_Maintenance, Rented_Out, Retired
- Under_Maintenance → Available, Stored, Retired
- Rented_Out → Available, Returned
- Retired → Stored (for disposal)
- Stored → Any status

(Note: Transition validation can be enhanced based on business rules)

## Error Handling

### Backend
- **400 Bad Request**: Duplicate equipment_code/serial_number, invalid status/category, validation errors
- **401 Unauthorized**: Missing or invalid JWT
- **403 Forbidden**: User role insufficient for operation
- **404 Not Found**: Equipment not found
- **500 Internal Server Error**: Database or server error

### Frontend
- Query errors displayed in error state
- Mutation errors shown in form error toast
- 401 errors trigger redirect to /login
- User-friendly error messages

## Caching Strategy

- **List queries**: 5-minute stale time
- **Detail queries**: 5-minute stale time
- **Insurance/Attachments**: 5-minute stale time
- **Mutations**: Invalidate related queries on success

## Future Enhancements

- Equipment maintenance history
- Depreciation calculation
- Real-time equipment location tracking (GPS)
- Equipment utilization analytics
- Scheduled maintenance notifications
- Equipment rental/lease management
- Bulk import/export
- Equipment transfer workflows
- Audit trail for all changes
