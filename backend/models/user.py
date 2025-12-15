# models/user.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class User(BaseModel):
    id: Optional[str] = None
    full_name: str
    username: str
    email: EmailStr
    password_hash: str
    role: RoleEnum = RoleEnum.user
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True
        use_enum_values = True