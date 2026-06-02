"""
Authentication utilities for CFMS
- JWT creation with HS256 and 8-hour expiry
- JWT decoding and validation
- RBAC role-based dependency factory
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# =====================================================================
# Configuration
# =====================================================================
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

# =====================================================================
# JWT Token Creation
# =====================================================================
def create_access_token(
    staff_id: int,
    role: str,
    employee_number: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        staff_id: StaffID from database
        role: User role (Admin, Accountant, Site_Manager, Supervisor, Mechanic, Heavy_Operator, Light_Driver)
        employee_number: Employee_Number from database
        expires_delta: Custom expiration time, defaults to 8 hours
        
    Returns:
        JWT token as string
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = {
        "sub": str(staff_id),  # Subject (StaffID)
        "role": role,
        "employee_number": employee_number,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# =====================================================================
# JWT Token Decoding & Validation
# =====================================================================
def decode_token(token: str) -> dict:
    """
    Decode and validate JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException 401: Invalid or expired token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


# =====================================================================
# FastAPI Security Dependency
# =====================================================================
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    FastAPI dependency to extract and validate JWT from Authorization header.
    
    Extracts Bearer token, validates JWT, and returns decoded payload.
    
    Args:
        credentials: HTTP Bearer credentials from Authorization header
        
    Returns:
        Decoded token payload with keys:
            - sub: StaffID (string)
            - role: User role
            - employee_number: Employee number
            - exp: Token expiration timestamp
            
    Raises:
        HTTPException 401: Missing, invalid, or expired token
    """
    token = credentials.credentials
    payload = decode_token(token)
    return payload


# =====================================================================
# RBAC Role-Based Access Control
# =====================================================================
def require_roles(*allowed_roles: str):
    """
    FastAPI dependency factory for role-based access control.
    
    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles("Admin"))])
        async def admin_endpoint():
            ...
            
        @router.get("/supervisors-only", dependencies=[Depends(require_roles("Site_Manager", "Supervisor"))])
        async def supervisor_endpoint():
            ...
    
    Args:
        allowed_roles: One or more role strings to allow
        
    Returns:
        Dependency function that validates user role
        
    Raises:
        HTTPException 403: User role not in allowed_roles
    """
    async def check_role(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}",
            )
        
        return current_user
    
    return check_role


# =====================================================================
# Helper to extract StaffID from JWT
# =====================================================================
def get_staff_id(current_user: dict) -> int:
    """
    Extract StaffID from decoded JWT payload.
    
    Args:
        current_user: Decoded JWT payload from get_current_user()
        
    Returns:
        StaffID as integer
    """
    return int(current_user.get("sub"))
