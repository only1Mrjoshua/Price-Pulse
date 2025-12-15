from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

from database import get_database
from utils.security import verify_token
from models.user import User, RoleEnum

# OAuth2 scheme for token endpoint - use this consistently
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db=Depends(get_database)
):
    """
    Get current user from Authorization header only (cookies removed)
    """
    from crud.user import UserCRUD
    crud = UserCRUD(db)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token validity
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    role: str = payload.get("role")
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload - missing email",
        )
    
    # Get user from database
    user = await crud.get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated. Please contact administrator."
        )
    
    return user

async def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def require_user(current_user: User = Depends(get_current_user)):
    """Require regular user role (non-admin)"""
    if current_user.role != RoleEnum.user:
        raise HTTPException(status_code=403, detail="User access required")
    return current_user

async def require_any(current_user: User = Depends(get_current_user)):
    """Allow any authenticated user"""
    return current_user