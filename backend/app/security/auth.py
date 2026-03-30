"""
Autenticación y autorización con Better Auth (JWT + JWKS)
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt as pyjwt
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError

from app.config.settings import settings

security = HTTPBearer(auto_error=True)
jwks_client: PyJWKClient | None = None


def get_jwks_client() -> PyJWKClient:
    """Crea (lazy) un cliente JWKS para verificar JWT emitidos por Better Auth."""
    global jwks_client

    if jwks_client is None:
        if not settings.BETTER_AUTH_BASE_URL:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Falta BETTER_AUTH_BASE_URL para validar JWT",
            )
        jwks_url = settings.BETTER_AUTH_BASE_URL.rstrip("/") + "/api/auth/jwks"
        jwks_client = PyJWKClient(jwks_url)

    return jwks_client


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verifica el JWT emitido por Better Auth usando JWKS.
    El frontend debe enviar: Authorization: Bearer <jwt_token>
    """
    token = credentials.credentials
    client = get_jwks_client()

    try:
        signing_key = client.get_signing_key_from_jwt(token)
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "RS256", "ES256", "PS256"],
            audience=settings.BETTER_AUTH_AUDIENCE,
            issuer=settings.BETTER_AUTH_ISSUER,
        )

        user_id = payload.get("sub") or payload.get("id") or payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT inválido: sin identificador de usuario",
            )

        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "name": payload.get("name"),
            "jwt_payload": payload,
        }
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT inválido o expirado: {str(e)}",
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el JWT",
        )
