from supabase import create_client
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("REACT_APP_SUPABASE_URL")
SUPABASE_KEY = os.getenv("REACT_APP_SUPABASE_ANON_KEY")

def test_with_service_role():
    """Test using service role key (bypasses RLS)"""
    print("=== Testing with Service Role ===")
    
    # You need to get your service_role key from Supabase dashboard
    # Settings > API > service_role (secret)
    service_role_key = "YOUR_SERVICE_ROLE_KEY_HERE"  # Replace with actual key
    
    if service_role_key == "YOUR_SERVICE_ROLE_KEY_HERE":
        print("⚠️ Please update service_role_key in this script")
        print("Get it from: Supabase Dashboard > Settings > API > service_role")
        return
    
    try:
        supabase = create_client(SUPABASE_URL, service_role_key)
        
        # Test insert with service role
        test_user = {
            'firebase_uid': 'test_service_123',
            'email': 'service_test@example.com',
            'display_name': 'Service Test User',
            'auth_provider': 'email'
        }
        
        result = supabase.table('users').insert(test_user).execute()
        print("✅ Service role insert successful!")
        print(f"Created user: {result.data[0]['id']}")
        
        # Clean up
        supabase.table('users').delete().eq('firebase_uid', 'test_service_123').execute()
        print("✅ Test user cleaned up")
        
    except Exception as e:
        print(f"❌ Service role test failed: {e}")

def test_anon_key():
    """Test with anon key (should respect RLS)"""
    print("\n=== Testing with Anon Key ===")
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # This should fail due to RLS without proper auth context
        test_user = {
            'firebase_uid': 'test_anon_123',
            'email': 'anon_test@example.com',
            'display_name': 'Anon Test User',
            'auth_provider': 'email'
        }
        
        result = supabase.table('users').insert(test_user).execute()
        print("✅ Anon key insert successful!")
        
        # Clean up
        supabase.table('users').delete().eq('firebase_uid', 'test_anon_123').execute()
        print("✅ Test user cleaned up")
        
    except Exception as e:
        print(f"❌ Anon key test failed (expected): {e}")
        print("This is normal - anon key needs proper auth context")

def check_current_policies():
    """Check current RLS policies"""
    print("\n=== Current RLS Policies ===")
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Try to get policy info (this might not work with anon key)
        try:
            result = supabase.rpc('get_rls_policies').execute()
            if result.data:
                print("Current policies:")
                for policy in result.data:
                    print(f"- {policy}")
            else:
                print("Could not retrieve policies (normal with anon key)")
        except Exception as e:
            print(f"Could not check policies: {e}")
            print("Run the SQL from fix_rls_policies.sql in Supabase SQL Editor")
        
    except Exception as e:
        print(f"Error checking policies: {e}")

if __name__ == "__main__":
    check_current_policies()
    test_anon_key()
    test_with_service_role()
    
    print("\n=== Recommendations ===")
    print("1. Run fix_rls_policies.sql in Supabase SQL Editor")
    print("2. Update service_role_key in this script to test admin operations")
    print("3. Test with actual Firebase authentication in frontend")
