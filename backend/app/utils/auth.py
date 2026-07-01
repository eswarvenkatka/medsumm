from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.firebase_service import verify_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to get and verify the current user via Firebase JWT.
    """
    token = credentials.credentials
    try:
        user = verify_token(token)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to verify the user has admin rights.
    """
    is_admin = (
        current_user.get("admin") is True or 
        current_user.get("email", "").startswith("admin@") or 
        current_user.get("email", "") == "eswar@medsumm.ai"
    )
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have administrative privileges"
        )
    return current_user
