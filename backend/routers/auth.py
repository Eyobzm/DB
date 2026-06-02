"""
Authentication router for CFMS
- POST /api/v1/auth/login: Login with Employee_Number + password
- POST /api/v1/auth/logout: Logout (client-side invalidation)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from passlib.context import CryptContext
from datetime import datetime

from database import get_db
from models import Staff
from schemas import LoginRequest, LoginResponse, ErrorResponse
from auth_utils import create_access_token

# =====================================================================
# Router Setup
# =====================================================================
router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

# =====================================================================
# Password Hashing
# =====================================================================
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against bcrypt hash.
    
    Args:
        plain_password: User-provided password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate bcrypt hash for password.
    
    Args:
        password: Plain-text password
        
    Returns:
        Bcrypt hash (cost factor 12)
    """
    return pwd_context.hash(password)


# =====================================================================
# Endpoints
# =====================================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials or account inactive"},
        422: {"description": "Validation error"},
    },
)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> LoginResponse:
    """
    Login endpoint.
    
    Authenticates user by Employee_Number and password. Returns JWT token if successful.
    Rejects login if Staff.Status is not 'Active'.
    
    Args:
        credentials: LoginRequest with employee_number and password
        db: Database session
        
    Returns:
        LoginResponse with JWT access_token
        
    Raises:
        HTTPException 401: Invalid credentials or account not active
    """
    # Query staff by employee_number
    result = await db.execute(
        select(Staff).where(Staff.employee_number == credentials.employee_number)
    )
    staff = result.scalar_one_or_none()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee number or password",
        )
    
    # Check if account is active
    if staff.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is {staff.status.lower()}. Please contact administrator.",
        )
    
    # Verify password
    if not verify_password(credentials.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee number or password",
        )
    
    # Create JWT token
    access_token = create_access_token(
        staff_id=staff.staff_id,
        role=staff.role,
        employee_number=staff.employee_number,
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        staff_id=staff.staff_id,
        employee_number=staff.employee_number,
        first_name=staff.first_name,
        last_name=staff.last_name,
        role=staff.role,
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """
    Logout endpoint.
    
    Client-side invalidation only. JWT is valid until expiration;
    client should remove token from memory.
    
    Returns:
        Success message
    """
    return {"message": "Logout successful. Please clear token from memory."}
