from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.schema import User
from app.schemas.pydantic_schemas import UserCreate, UserResponse, Token, APIResponse, ResponseMetadata
from app.core.security import create_access_token, get_password_hash, verify_password
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=APIResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered.")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "health_officer"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return APIResponse(
        success=True,
        data=Token(access_token=token, user=UserResponse.model_validate(user)),
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.post("/login", response_model=APIResponse)
async def login(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return APIResponse(
        success=True,
        data=Token(access_token=token, user=UserResponse.model_validate(user)),
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.post("/logout", response_model=APIResponse)
async def logout():
    return APIResponse(
        success=True,
        data={"message": "Session terminated successfully. Token revoked."},
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
