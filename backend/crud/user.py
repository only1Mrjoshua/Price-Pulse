from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from models.user import User, RoleEnum
from schemas.user import UserCreate, AdminUserCreate
from utils.security import hash_password

class UserCRUD:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _is_connected(self):
        try:
            await self.db.command('ping')
            return True
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            return False

    def _convert_objectids_to_strings(self, data: dict) -> dict:
        if not data:
            return data
            
        converted = data.copy()
        
        if '_id' in converted and converted['_id']:
            converted['id'] = str(converted['_id'])
            del converted['_id']
        
        return converted

    async def get_user_by_email(self, email: str) -> Optional[User]:
        if not await self._is_connected():
            return None
            
        try:
            user_data = await self.db.users.find_one({"email": email.lower()})
            if user_data:
                user_data = self._convert_objectids_to_strings(user_data)
                return User(**user_data)
            return None
        except Exception as e:
            print(f"❌ Error getting user by email: {e}")
            return None

    async def get_user_by_username(self, username: str) -> Optional[User]:
        if not await self._is_connected():
            return None
            
        try:
            user_data = await self.db.users.find_one({"username": username})
            if user_data:
                user_data = self._convert_objectids_to_strings(user_data)
                return User(**user_data)
            return None
        except Exception as e:
            print(f"❌ Error getting user by username: {e}")
            return None

    async def get_user_by_identifier(self, identifier: str) -> Optional[User]:
        user = await self.get_user_by_email(identifier)
        if not user:
            user = await self.get_user_by_username(identifier)
        return user

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        if not await self._is_connected():
            return None
            
        try:
            user_data = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if user_data:
                user_data = self._convert_objectids_to_strings(user_data)
                return User(**user_data)
            return None
        except Exception as e:
            print(f"❌ Error getting user by ID: {e}")
            return None

    async def create_user(self, user_data: UserCreate, avatar_url: str = None) -> Optional[User]:
        """
        Create a new user.
        First user becomes admin, subsequent users get the role from user_data.
        """
        if not await self._is_connected():
            return None
            
        try:
            # Check if user already exists
            existing_email = await self.get_user_by_email(user_data.email)
            existing_username = await self.get_user_by_username(user_data.username)
            
            if existing_email:
                return None
            if existing_username:
                return None

            # Determine role (first user becomes admin)
            user_count = await self.db.users.count_documents({})
            role = RoleEnum.admin if user_count == 0 else user_data.role

            # Prepare user document
            user_dict = {
                "full_name": user_data.full_name,
                "username": user_data.username,
                "email": user_data.email.lower(),
                "password_hash": hash_password(user_data.password),
                "role": role,
                "avatar_url": avatar_url,
                "created_at": datetime.utcnow(),
                "last_login": None,
                "is_active": True
            }

            # Add is_active for AdminUserCreate
            if isinstance(user_data, AdminUserCreate):
                user_dict["is_active"] = user_data.is_active

            result = await self.db.users.insert_one(user_dict)
            
            created_user = await self.db.users.find_one({"_id": result.inserted_id})
            
            if created_user:
                created_user = self._convert_objectids_to_strings(created_user)
                return User(**created_user)
            
            return None
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None

    async def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        if not await self._is_connected():
            return None
            
        try:
            # Check username uniqueness if updating username
            if "username" in update_data:
                existing = await self.get_user_by_username(update_data["username"])
                if existing and str(existing.id) != user_id:
                    return None

            # Check email uniqueness if updating email
            if "email" in update_data:
                existing = await self.get_user_by_email(update_data["email"])
                if existing and str(existing.id) != user_id:
                    return None

            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.db.users.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                result = self._convert_objectids_to_strings(result)
                return User(**result)
            return None
        except Exception as e:
            print(f"❌ Error updating user: {e}")
            return None

    async def update_last_login(self, user_id: str) -> bool:
        if not await self._is_connected():
            return False
            
        try:
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error updating last login: {e}")
            return False

    async def get_users(self, skip: int = 0, limit: int = 100, 
                       role: Optional[RoleEnum] = None,
                       is_active: Optional[bool] = None) -> List[User]:
        if not await self._is_connected():
            return []
            
        try:
            query = {}
            if role:
                query["role"] = role
            if is_active is not None:
                query["is_active"] = is_active
            
            cursor = self.db.users.find(query).skip(skip).limit(limit)
            users_data = await cursor.to_list(length=limit)
            
            users = []
            for user_data in users_data:
                user_data = self._convert_objectids_to_strings(user_data)
                users.append(User(**user_data))
            
            return users
        except Exception as e:
            print(f"❌ Error getting users: {e}")
            return []

    async def count_users(self, role: Optional[RoleEnum] = None, 
                         is_active: Optional[bool] = None) -> int:
        if not await self._is_connected():
            return 0
            
        try:
            query = {}
            if role:
                query["role"] = role
            if is_active is not None:
                query["is_active"] = is_active
            
            return await self.db.users.count_documents(query)
        except Exception as e:
            print(f"❌ Error counting users: {e}")
            return 0

    async def deactivate_user(self, user_id: str) -> bool:
        if not await self._is_connected():
            return False
            
        try:
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error deactivating user: {e}")
            return False

    async def activate_user(self, user_id: str) -> bool:
        if not await self._is_connected():
            return False
            
        try:
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error activating user: {e}")
            return False

    async def delete_user(self, user_id: str) -> bool:
        if not await self._is_connected():
            return False
            
        try:
            result = await self.db.users.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"❌ Error deleting user: {e}")
            return False

    async def change_password(self, user_id: str, new_password_hash: str) -> bool:
        if not await self._is_connected():
            return False
            
        try:
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"password_hash": new_password_hash, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error changing password: {e}")
            return False

    async def search_users(self, search_term: str, skip: int = 0, limit: int = 50) -> List[User]:
        """
        Search users by full_name, username, or email
        """
        if not await self._is_connected():
            return []
            
        try:
            query = {
                "$or": [
                    {"full_name": {"$regex": search_term, "$options": "i"}},
                    {"username": {"$regex": search_term, "$options": "i"}},
                    {"email": {"$regex": search_term, "$options": "i"}}
                ]
            }
            
            cursor = self.db.users.find(query).skip(skip).limit(limit)
            users_data = await cursor.to_list(length=limit)
            
            users = []
            for user_data in users_data:
                user_data = self._convert_objectids_to_strings(user_data)
                users.append(User(**user_data))
            
            return users
        except Exception as e:
            print(f"❌ Error searching users: {e}")
            return []