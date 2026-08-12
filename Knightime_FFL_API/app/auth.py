from typing import Annotated
import secrets

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


bearer_scheme = HTTPBearer(
    auto_error=False,
    description="Admin API key required for data mutations.",
)
BearerCredentials = Annotated[
    HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
]


def require_admin(
    request: Request,
    credentials: BearerCredentials,
) -> None:
    expected_key: str = request.app.state.admin_api_key
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication is not configured",
        )

    if (
        credentials is None
        or credentials.scheme.lower() != "bearer"
        or not secrets.compare_digest(credentials.credentials, expected_key)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


AdminAuth = Annotated[None, Depends(require_admin)]
