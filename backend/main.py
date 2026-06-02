"""
FastAPI application entry point for CFMS
- CORS configuration
- Router registration
- Startup/shutdown events
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import (
    auth,
    equipment,
    activity_log,
    maintenance,
    client_payments,
    vendor_payments,
    operational_funds,
    site_budget,
    dashboard,
    staff,
    certifications,
    inventory,
)
from database import engine, AsyncSessionLocal
from models import Base
from routers.maintenance import mark_overdue_maintenance

# =====================================================================
# FastAPI App Initialization
# =====================================================================
app = FastAPI(
    title="Construction Fleet Management System (CFMS)",
    description="Full-stack fleet and equipment management API",
    version="1.0.0",
)

# =====================================================================
# CORS Configuration
# =====================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# Router Registration
# =====================================================================
app.include_router(auth.router)
app.include_router(equipment.router)
app.include_router(activity_log.router)
app.include_router(maintenance.router)
app.include_router(client_payments.router)
app.include_router(vendor_payments.router)
app.include_router(operational_funds.router)
app.include_router(site_budget.router)
app.include_router(dashboard.router)
app.include_router(staff.router)
app.include_router(certifications.router)
app.include_router(inventory.router)

# =====================================================================
# Startup & Shutdown Events
# =====================================================================
@app.on_event("startup")
async def startup():
    """Initialize database tables on startup and update overdue maintenance."""
    async with engine.begin() as conn:
        # Uncomment to auto-create tables (development only)
        # await conn.run_sync(Base.metadata.create_all)
        pass

    async with AsyncSessionLocal() as session:
        await mark_overdue_maintenance(session)


@app.on_event("shutdown")
async def shutdown():
    """Clean up database connection on shutdown"""
    await engine.dispose()


# =====================================================================
# Health Check Endpoint
# =====================================================================
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "CFMS API"}


# =====================================================================
# Root Endpoint
# =====================================================================
@app.get("/", tags=["Info"])
async def root():
    """API root information"""
    return {
        "message": "Construction Fleet Management System (CFMS) API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
    )
