# Construction Fleet Management System (CFMS)

A full-stack web application for managing construction equipment, staff, maintenance, and finances.

## Tech Stack

### Backend
- **Framework**: FastAPI 0.111+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0 async
- **Database Driver**: aiomysql
- **Auth**: JWT (HS256, 8-hour expiry), RBAC
- **Password Hashing**: bcrypt (cost factor 12)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Data Fetching**: TanStack Query v5, Axios
- **Forms**: react-hook-form v7
- **Validation**: Zod v3
- **Tables**: TanStack Table v8
- **Styling**: Tailwind CSS 3+

### Database
- **Engine**: MySQL 8.0+
- **Storage**: InnoDB
- **Character Set**: utf8mb4
- **Schema**: 17 normalized tables (3NF)

## Project Structure

```
cfms/
├── database/
│   └── schema.sql          # MySQL DDL for all 17 tables
├── backend/
│   ├── main.py             # FastAPI app entry point
│   ├── database.py         # Async SQLAlchemy config
│   ├── models.py           # ORM models
│   ├── schemas.py          # Pydantic v2 schemas
│   ├── auth_utils.py       # JWT + RBAC utilities
│   ├── routers/
│   │   └── auth.py         # Authentication endpoints
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   ├── apiClient.js       # Axios instance with JWT injection
│   │   │   └── auth.js            # Auth API functions
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # JWT memory storage
│   │   ├── hooks/
│   │   │   └── useAuth.js         # TanStack Query auth hooks
│   │   ├── pages/
│   │   │   └── LoginPage.jsx      # Login UI
│   │   └── components/
│   └── .env.example
└── schema.sql
```

## Setup Instructions

### 1. Database Setup

Create MySQL database and import schema:

```bash
mysql -u root -p < schema.sql
```

Or create user with permissions:

```sql
CREATE USER 'cfms_user'@'localhost' IDENTIFIED BY 'cfms_password';
GRANT ALL PRIVILEGES ON CFMS.* TO 'cfms_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Create Python virtual environment:

```bash
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DB_USER=cfms_user
DB_PASSWORD=cfms_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CFMS
SECRET_KEY=your-super-secret-key-change-in-production
```

Start backend server:

```bash
uvicorn main:app --reload
```

API will be available at `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup

Navigate to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with backend URL:

```
VITE_API_URL=http://localhost:8000
```

Start development server:

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Authentication Flow

### Login Process

1. **User submits credentials** (Employee_Number + password) via `/login`
2. **Backend validates**:
   - Staff.Status is 'Active'
   - Password matches bcrypt hash
3. **JWT token created** with payload:
   - `sub`: StaffID
   - `role`: User role
   - `employee_number`: Employee number
   - `exp`: 8-hour expiry
4. **Frontend stores token** in React context (memory, not localStorage)
5. **Axios interceptor** injects `Authorization: Bearer <token>` on all requests
6. **401 response** redirects to `/login`

### Protected Routes

All endpoints except `/auth/login` require valid JWT in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### RBAC (Role-Based Access Control)

Use dependency factory in routers:

```python
from backend.auth_utils import require_roles

@router.get("/admin-only", dependencies=[Depends(require_roles("Admin"))])
async def admin_endpoint():
    pass
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Login with credentials | ❌ |
| POST | `/api/v1/auth/logout` | Logout (client-side) | ✅ |

### Example Login Request

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_number": "EMP001",
    "password": "password123"
  }'
```

### Example Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "staff_id": 1,
  "employee_number": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "role": "Admin"
}
```

## Frontend Usage

### Using Auth Context

```jsx
import { useAuthContext } from './context/AuthContext';

function MyComponent() {
  const { token, user, login, logout, isAuthenticated } = useAuthContext();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome {user.first_name}</p>}
    </div>
  );
}
```

### Using Login Hook

```jsx
import { useLogin } from './hooks/useAuth';

function LoginForm() {
  const loginMutation = useLogin();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginMutation.mutateAsync({
      employeeNumber: 'EMP001',
      password: 'password123'
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {loginMutation.isPending && <p>Loading...</p>}
      {loginMutation.isError && <p>{loginMutation.error.message}</p>}
    </form>
  );
}
```

### Using API Client

```jsx
import { useApiClient } from './api/apiClient';

function StaffList() {
  const api = useApiClient();
  const [staff, setStaff] = useState([]);
  
  useEffect(() => {
    (async () => {
      const { data } = await api.get('/api/v1/staff');
      setStaff(data);
    })();
  }, [api]);
  
  return <div>{/* render staff list */}</div>;
}
```

## Roles (RBAC)

- **Admin**: Full system access
- **Accountant**: Financial operations
- **Site_Manager**: Site management
- **Supervisor**: Equipment supervision
- **Mechanic**: Maintenance operations
- **Heavy_Operator**: Heavy equipment operation
- **Light_Driver**: Light vehicle operation

## Database Schema

### 17 Tables

1. **VENDOR** - Equipment suppliers
2. **STAFF** - Users with roles and authentication
3. **SITE** - Construction sites/projects
4. **EQUIPMENT** - Fleet assets
5. **INVENTORY** - Equipment availability by site
6. **EQUIPMENT_RATE** - Hourly/daily/weekly rates
7. **OPERATOR_CERTIFICATION** - Staff certifications
8. **ATTACHMENT** - File attachments
9. **EQUIPMENT_INSURANCE** - Equipment insurance policies
10. **ACTIVITY_LOG** - Equipment usage logs
11. **EQUIPMENT_EXPENSE** - Equipment expenses
12. **FUEL_PURCHASE** - Fuel transactions
13. **MAINTENANCE_SCHEDULE** - Maintenance plans
14. **CLIENT_PAYMENT** - Income from clients
15. **VENDOR_PAYMENT** - Payments to vendors
16. **OPERATIONAL_FUND** - Fund management
17. **SITE_BUDGET** - Budget allocation and tracking

## Key Features

### Authentication & Security
- JWT-based stateless authentication
- RBAC enforced server-side
- Bcrypt password hashing (cost factor 12)
- 8-hour token expiry

### Data Management
- Async SQLAlchemy ORM
- 3NF normalized schema
- Foreign key constraints
- Business key constraints (Equipment_Code, Employee_Number, etc.)
- Composite unique constraints (EQUIPMENT_RATE, SITE_BUDGET)
- Generated columns (SITE_BUDGET.Remaining_Balance)

### Frontend
- React context for state management
- Memory-based JWT storage (no localStorage)
- TanStack Query for server state
- Automatic 401 redirect
- Tailwind CSS responsive design
- Form validation with react-hook-form + Zod

## Development

### Backend Development

Add new router:

```python
# backend/routers/equipment.py
from fastapi import APIRouter, Depends
from backend.auth_utils import require_roles, get_current_user

router = APIRouter(prefix="/api/v1/equipment", tags=["Equipment"])

@router.get("/", dependencies=[Depends(require_roles("Admin", "Site_Manager"))])
async def list_equipment(current_user: dict = Depends(get_current_user)):
    pass
```

Register in `main.py`:

```python
from backend.routers import equipment
app.include_router(equipment.router)
```

### Frontend Development

Create query hook:

```jsx
// frontend/src/hooks/useEquipment.js
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

export function useEquipmentList() {
  const api = useApiClient();
  
  return useQuery({
    queryKey: ['equipment'],
    queryFn: () => api.get('/api/v1/equipment').then(r => r.data),
  });
}
```

## Environment Variables

### Backend (.env)

| Variable | Example | Description |
|----------|---------|-------------|
| HOST | 0.0.0.0 | FastAPI host |
| PORT | 8000 | FastAPI port |
| DB_USER | cfms_user | Database user |
| DB_PASSWORD | cfms_password | Database password |
| DB_HOST | localhost | Database host |
| DB_PORT | 3306 | Database port |
| DB_NAME | CFMS | Database name |
| SECRET_KEY | your-secret | JWT secret (change in production) |
| FRONTEND_URL | http://localhost:5173 | CORS origin |
| SQL_ECHO | False | Log SQL queries |

### Frontend (.env.local)

| Variable | Example | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8000 | Backend API URL |

## Testing

### Manual API Testing with cURL

```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"employee_number":"EMP001","password":"password123"}'

# Protected endpoint (replace TOKEN)
curl -X GET "http://localhost:8000/api/v1/staff" \
  -H "Authorization: Bearer TOKEN"
```

### Postman Collection

Import the following into Postman:

```json
{
  "info": {"name": "CFMS API", "version": "1.0.0"},
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/v1/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"employee_number\":\"EMP001\",\"password\":\"password\"}"
        }
      }
    }
  ]
}
```

## Troubleshooting

### Backend Connection Issues

- Verify MySQL is running: `mysql -u root -p -e "SELECT 1;"`
- Check `.env` database credentials
- Ensure firewall allows port 3306

### Frontend 401 Errors

- Check JWT expiry (8 hours)
- Verify Authorization header is sent
- Check CORS configuration in backend

### CORS Errors

- Ensure `FRONTEND_URL` matches frontend origin in backend `.env`
- Frontend URL should be `http://localhost:5173` (not `localhost:5173`)

## Future Modules

- Equipment management (CRUD, tracking, depreciation)
- Staff management (hiring, certifications, schedules)
- Site management (budgets, payroll, reports)
- Maintenance scheduling and tracking
- Financial reporting (expenses, payments, budgets)
- Real-time activity logging
- File attachments and document management

## License

Proprietary - All rights reserved
