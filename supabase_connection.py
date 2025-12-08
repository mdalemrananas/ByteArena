from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("REACT_APP_SUPABASE_URL")
SUPABASE_KEY = os.getenv("REACT_APP_SUPABASE_ANON_KEY")

def create_supabase_client():
    """Create and return a Supabase client"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client created successfully!")
        return supabase
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
        return None

def test_supabase_connection():
    """Test Supabase connection and perform basic operations"""
    supabase = create_supabase_client()
    
    if not supabase:
        return False
    
    try:
        # Test 1: Check if we can access the database
        print("\n=== Testing Supabase Connection ===")
        
        # Test 2: Try to get the current time (this tests the connection)
        try:
            # This is a simple test query that should work
            result = supabase.table('users').select('count').execute()
            print("✓ Database connection successful!")
        except Exception as e:
            # If users table doesn't exist, that's okay - we just tested the connection
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print("✓ Database connection successful! (Users table doesn't exist yet)")
            else:
                raise e
        
        # Test 3: List all tables (if possible)
        print("\n=== Available Tables ===")
        try:
            # Try to get table information
            result = supabase.rpc('get_tables').execute()
            if result.data:
                print("Tables found:")
                for table in result.data:
                    print(f"- {table}")
            else:
                print("Could not retrieve table list (this is normal with anon key)")
        except Exception as e:
            print(f"Could not list tables: {e}")
            print("This is normal with limited permissions")
        
        # Test 4: Check if users table exists and show structure
        print("\n=== Users Table Check ===")
        try:
            # Try to select from users table
            result = supabase.table('users').select('*').limit(1).execute()
            if result.data:
                print("✓ Users table exists!")
                print("Sample user data structure:")
                for key in result.data[0].keys():
                    print(f"  - {key}")
            else:
                print("✓ Users table exists but is empty")
        except Exception as e:
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print("⚠ Users table does not exist. Run the SQL from SETUP_INSTRUCTIONS.md")
            else:
                print(f"Error checking users table: {e}")
        
        # Test 5: Try to create a test record (if users table exists)
        print("\n=== Write Test ===")
        try:
            test_data = {
                'firebase_uid': 'test_uid_12345',
                'email': 'test@example.com',
                'display_name': 'Test User',
                'auth_provider': 'email'
            }
            
            result = supabase.table('users').insert(test_data).execute()
            print("✓ Successfully created test record!")
            
            # Clean up - delete the test record
            supabase.table('users').delete().eq('firebase_uid', 'test_uid_12345').execute()
            print("✓ Test record cleaned up")
            
        except Exception as e:
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print("⚠ Cannot test write - users table doesn't exist")
            else:
                print(f"Write test failed: {e}")
        
        print("\n=== Connection Test Complete ===")
        return True
        
    except Exception as e:
        print(f"Error during connection test: {e}")
        return False

def get_user_by_firebase_uid(firebase_uid):
    """Get user by Firebase UID"""
    supabase = create_supabase_client()
    if not supabase:
        return None
    
    try:
        result = supabase.table('users').select('*').eq('firebase_uid', firebase_uid).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def create_user(user_data):
    """Create a new user in Supabase"""
    supabase = create_supabase_client()
    if not supabase:
        return False
    
    try:
        result = supabase.table('users').insert(user_data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

if __name__ == "__main__":
    test_supabase_connection()
