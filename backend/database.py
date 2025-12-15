from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "lms_db")

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    is_connected: bool = False

mongodb = MongoDB()

async def get_database():
    """Get database connection with lazy initialization."""
    if mongodb.client is None:
        print(f"🔗 Connecting to MongoDB...")
        
        try:
            mongodb.client = AsyncIOMotorClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=15000,
                connectTimeoutMS=15000,
                maxPoolSize=10,
                retryWrites=True
            )
            
            # Test connection
            await mongodb.client.admin.command('ping')
            mongodb.is_connected = True
            print("✅ Successfully connected to MongoDB!")
            
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            mongodb.is_connected = False
            # Still create the client for fallback operations
            mongodb.client = AsyncIOMotorClient(MONGODB_URL)
    
    return mongodb.client[DATABASE_NAME]

async def close_mongo_connection():
    """Close MongoDB connection."""
    if mongodb.client:
        mongodb.client.close()
        print("🔌 MongoDB connection closed")

async def create_essential_indexes():
    """
    Create only ESSENTIAL indexes that are critical for data integrity.
    
    Start with minimal indexes and add more based on actual query patterns.
    """
    try:
        db = await get_database()
        
        # Test connection first
        await db.command('ping')
        print("📊 Creating essential indexes...")
        
        # ONLY critical indexes for data integrity
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        
        print("✅ Essential indexes created successfully")
        
    except Exception as e:
        print(f"⚠️  Could not create indexes: {e}")